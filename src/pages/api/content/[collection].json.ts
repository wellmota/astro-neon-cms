export const prerender = false;
import type { APIRoute } from 'astro';
import { getCollection } from '@/lib/cms';
import { listPublished } from '@/lib/entries';
import { json } from '@/lib/cors';

/** Lista pública das entradas publicadas de uma coleção. */
export const GET: APIRoute = async ({ params }) => {
  const col = getCollection(params.collection!);
  if (!col) return json({ error: 'collection not found' }, { status: 404 });
  const rows = await listPublished(col.name);
  return json(
    rows.map((e) => ({ slug: e.slug, featured: e.featured, ord: e.ord, updatedAt: e.updated_at, ...e.data })),
  );
};
