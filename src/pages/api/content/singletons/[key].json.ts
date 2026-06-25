export const prerender = false;
import type { APIRoute } from 'astro';
import { getSingleton } from '@/lib/singletons';
import { json } from '@/lib/cors';

/** Conteúdo de um singleton por chave (ou null). */
export const GET: APIRoute = async ({ params }) => json(await getSingleton(params.key!));
