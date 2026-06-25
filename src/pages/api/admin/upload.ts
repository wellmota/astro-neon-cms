export const prerender = false;
import type { APIRoute } from 'astro';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

/**
 * Emite o token pro upload direto do navegador → Vercel Blob (client upload,
 * sem passar o arquivo pela função, então sem limite de 4.5MB). Protegido: o
 * middleware exige sessão pra /api/admin/*. Requer BLOB_READ_WRITE_TOKEN.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return new Response('Não autorizado', { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  // Em dev o Vite carrega o .env em import.meta.env (não em process.env, que é o
  // que o handleUpload lê por padrão); em produção a Vercel injeta em process.env.
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? import.meta.env.BLOB_READ_WRITE_TOKEN;

  try {
    const json = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'],
        addRandomSuffix: true,
        maximumSizeInBytes: 15 * 1024 * 1024,
      }),
      // Roda como webhook do Blob; em localhost não dispara, mas o upload conclui.
      onUploadCompleted: async () => {},
    });
    return new Response(JSON.stringify(json), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
};
