export const prerender = false;
import type { APIRoute } from 'astro';
import { list } from '@vercel/blob';

/**
 * Lista os arquivos do Vercel Blob em JSON, pro seletor de imagem (reuso de
 * mídia nos campos de imagem e no editor de Markdown). Protegido pelo
 * middleware (/api/admin/*).
 */
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response('Não autorizado', { status: 401 });

  const token = process.env.BLOB_READ_WRITE_TOKEN ?? import.meta.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } });

  try {
    const { blobs } = await list({ token, limit: 1000 });
    const items = blobs
      .map((b) => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: String(b.uploadedAt) }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return new Response(JSON.stringify({ items }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ items: [], error: (e as Error).message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
