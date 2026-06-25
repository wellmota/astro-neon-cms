/**
 * Autenticação do CMS — "old school": e-mail + senha numa tabela `editors`,
 * sessão num cookie httpOnly assinado (HMAC-SHA256). Sem dependência externa:
 * a verificação de senha roda no próprio Postgres (pgcrypto/bcrypt) e a
 * assinatura do cookie usa Web Crypto (disponível no runtime da Vercel).
 */
import type { AstroCookies } from 'astro';
import { sql } from './db';

const COOKIE = 'cms_session';
const MAX_AGE = 60 * 60 * 12; // 12h

// Lazy: só exige SESSION_SECRET quando o cookie é de fato assinado/verificado
// (rotas do CMS em runtime). Importar este módulo não estoura — o middleware em
// rotas públicas retorna antes de tocar a sessão.
function getSecret(): string {
  const secret = process.env.SESSION_SECRET ?? import.meta.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET não definida. Gere uma string aleatória e configure no .env / Vercel.');
  }
  return secret;
}

export type SessionUser = {
  sub: string; // editor id
  name: string;
  role: 'admin' | 'editor';
  reset: boolean; // precisa trocar a senha
  exp: number; // epoch segundos
};

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToStr(s: string): string {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  return atob(pad + '==='.slice((pad.length + 3) % 4));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

async function sign(payload: SessionUser): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const key = await hmacKey();
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return `${body}.${b64url(mac)}`;
}

function b64urlToBytes(s: string): Uint8Array {
  const bin = b64urlToStr(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verify(token: string): Promise<SessionUser | null> {
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const macStr = token.slice(dot + 1);
  try {
    const key = await hmacKey();
    // subtle.verify faz a comparação do MAC em tempo constante (sem timing oracle).
    const ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(macStr), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(b64urlToStr(body)) as SessionUser;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Valida e-mail+senha contra o banco (bcrypt via pgcrypto). Retorna o editor ou null. */
export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const rows = (await sql`
    SELECT id, name, role, must_reset
    FROM editors
    WHERE lower(email) = lower(${email})
      AND active
      AND password_hash = crypt(${password}, password_hash)
    LIMIT 1
  `) as { id: string; name: string; role: 'admin' | 'editor'; must_reset: boolean }[];

  if (rows.length === 0) return null;
  const e = rows[0];
  await sql`UPDATE editors SET last_login_at = now() WHERE id = ${e.id}`;
  return { sub: e.id, name: e.name, role: e.role, reset: e.must_reset, exp: nowExp() };
}

function nowExp(): number {
  return Math.floor(Date.now() / 1000) + MAX_AGE;
}

export async function setSession(cookies: AstroCookies, user: SessionUser): Promise<void> {
  const token = await sign({ ...user, exp: nowExp() });
  cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function clearSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE, { path: '/' });
}

/** Lê o usuário logado do cookie, ou null. */
export async function getUser(cookies: AstroCookies): Promise<SessionUser | null> {
  const token = cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}
