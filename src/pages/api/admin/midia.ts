export const prerender = false;
import type { APIRoute } from 'astro';
import { del } from '@vercel/blob';

/**
 * Exclui um arquivo do Vercel Blob (a partir da Biblioteca de mídia).
 * Protegido pelo middleware (/api/admin/*). O upload é feito direto do
 * navegador via /api/admin/upload (client upload do @vercel/blob).
 */
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!locals.user) return redirect('/admin/login');

  const form = await request.formData();
  const url = String(form.get('url') ?? '').trim();
  if (!url) return redirect('/admin/midia');

  const token = process.env.BLOB_READ_WRITE_TOKEN ?? import.meta.env.BLOB_READ_WRITE_TOKEN;
  try {
    await del(url, { token });
  } catch (e) {
    console.error('Erro ao excluir blob:', e);
    return redirect('/admin/midia?ok=erro');
  }
  return redirect('/admin/midia?ok=excluido');
};
