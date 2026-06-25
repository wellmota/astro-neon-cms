export const prerender = false;
import type { APIRoute } from 'astro';
import { authenticate, setSession } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const senha = String(form.get('senha') ?? '');

  if (!email || !senha) return redirect('/admin/login?erro=1');

  const user = await authenticate(email, senha);
  if (!user) return redirect('/admin/login?erro=1');

  await setSession(cookies, user);
  return redirect(user.reset ? '/admin/conta' : '/admin');
};
