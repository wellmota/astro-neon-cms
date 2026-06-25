export const prerender = false;
import type { APIRoute } from 'astro';
import { getCollection } from '@/lib/cms';
import { getBySlug } from '@/lib/entries';
import { json } from '@/lib/cors';

/** Uma entrada publicada por slug. */
export const GET: APIRoute = async ({ params }) => {
  const col = getCollection(params.collection!);
  if (!col) return json({ error: 'collection not found' }, { status: 404 });
  const e = await getBySlug(col.name, params.slug!);
  if (!e) return json(null, { status: 404 });
  return json({ slug: e.slug, featured: e.featured, ord: e.ord, updatedAt: e.updated_at, ...e.data });
};
