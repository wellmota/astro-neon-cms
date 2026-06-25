export const prerender = false;
import type { APIRoute } from 'astro';
import { sql } from '@/lib/db';
import { setSession } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/admin/login');

  const form = await request.formData();
  const atual = String(form.get('atual') ?? '');
  const nova = String(form.get('nova') ?? '');
  const confirmar = String(form.get('confirmar') ?? '');

  if (nova.length < 8) return redirect('/admin/conta?erro=curta');
  if (nova !== confirmar) return redirect('/admin/conta?erro=confere');

  // Confere a senha atual
  const ok = (await sql`
    SELECT 1 FROM editors WHERE id = ${user.sub} AND password_hash = crypt(${atual}, password_hash) LIMIT 1
  `) as unknown[];
  if (ok.length === 0) return redirect('/admin/conta?erro=atual');

  await sql`
    UPDATE editors
    SET password_hash = crypt(${nova}, gen_salt('bf', 10)), must_reset = false
    WHERE id = ${user.sub}
  `;

  // Renova a sessão sem a flag de reset
  await setSession(cookies, { ...user, reset: false });
  return redirect('/admin/conta?ok=1');
};
