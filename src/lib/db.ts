/**
 * Cliente do banco (Neon Postgres serverless).
 *
 * Usado SÓ pelas rotas server-side do CMS (`/admin` e `/api/admin/*`) e pelo
 * loader da collection `blog` no build. Nunca importe isto em componente que
 * rode no browser — a connection string é secreta.
 *
 * A env `DATABASE_URL` é injetada pela Vercel em produção e lida do `.env`
 * local em dev (ver apps/web/.env.example).
 */
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Inicialização preguiçosa: o cliente só é criado (e a env exigida) na PRIMEIRA
 * query. Assim importar este módulo nunca estoura — o build estático e o
 * middleware em rotas públicas (que não tocam o banco) passam mesmo sem
 * DATABASE_URL. Só rotas do CMS que realmente consultam o banco em runtime
 * exigem a env.
 */
let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (client) return client;
  const url = process.env.DATABASE_URL ?? import.meta.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL não definida. Configure em apps/web/.env (local) e nas env vars da Vercel.',
    );
  }
  client = neon(url);
  return client;
}

/** Tagged template para queries: sql`SELECT ... ${valor}` (parametrizado, sem SQL injection). */
export const sql = new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
  apply: (_t, _this, args: unknown[]) => (getClient() as (...a: unknown[]) => unknown)(...args),
  get: (_t, prop) => (getClient() as unknown as Record<PropertyKey, unknown>)[prop],
});
