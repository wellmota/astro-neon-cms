/**
 * Protege o CMS. NÃO interfere em nenhuma página pública: só age quando a rota
 * começa com /admin ou /api/admin. O resto do site segue estático e aberto.
 */
import { defineMiddleware } from 'astro:middleware';
import { getUser } from '@/lib/auth';

// Rotas do CMS liberadas sem login
const PUBLIC_ADMIN = new Set(['/admin/login', '/api/admin/login']);
// Liberadas mesmo com a flag "trocar senha" pendente
const RESET_ALLOWED = new Set(['/admin/conta', '/api/admin/senha', '/api/admin/logout']);

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/$/, '') || '/';
  const isAdmin = path === '/admin' || path.startsWith('/admin/') || path.startsWith('/api/admin/');
  if (!isAdmin) return next();

  const isApi = path.startsWith('/api/admin/');

  // CSRF: requisições que mudam estado (POST etc.) só de mesma origem. Bloqueia
  // login-CSRF e POST cross-site mesmo com cookie SameSite=Lax. (GET não muda estado.)
  const method = context.request.method;
  if (isApi && method !== 'GET' && method !== 'HEAD') {
    const origin = context.request.headers.get('origin');
    if (origin && new URL(origin).host !== context.url.host) {
      return new Response('Origem inválida', { status: 403 });
    }
  }

  const user = await getUser(context.cookies);

  // Já logado tentando ver o login → manda pro painel
  if (PUBLIC_ADMIN.has(path)) {
    if (user && !user.reset && path === '/admin/login') return context.redirect('/admin');
    return next();
  }

  // Sem sessão
  if (!user) {
    if (isApi) return new Response('Não autorizado', { status: 401 });
    return context.redirect('/admin/login');
  }

  // Precisa trocar a senha antes de qualquer coisa
  if (user.reset && !RESET_ALLOWED.has(path)) {
    if (isApi) return new Response('Troque a senha primeiro', { status: 403 });
    return context.redirect('/admin/conta');
  }

  context.locals.user = user;
  return next();
});
