/**
 * CRUD genérico das entradas (tabela `entries`, campos do modelo em JSONB).
 * Funciona para qualquer coleção declarada no config.
 */
import { sql } from './db';

export type Entry = {
  id: string;
  collection: string;
  slug: string;
  data: Record<string, any>;
  draft: boolean;
  featured: boolean;
  ord: number;
  created_at: string;
  updated_at: string;
};

export type AdminRow = Entry & { updated_by_name: string | null };

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lista pro painel (inclui quem editou por último). */
export async function listForAdmin(collection: string): Promise<AdminRow[]> {
  return (await sql`
    SELECT e.*, ed.name AS updated_by_name
    FROM entries e
    LEFT JOIN editors ed ON ed.id = e.updated_by
    WHERE e.collection = ${collection}
    ORDER BY e.ord ASC, e.updated_at DESC
  `) as AdminRow[];
}

/** Publicadas (não-rascunho) — consumido pela API pública. */
export async function listPublished(collection: string): Promise<Entry[]> {
  return (await sql`
    SELECT * FROM entries
    WHERE collection = ${collection} AND draft = false
    ORDER BY ord ASC, updated_at DESC
  `) as Entry[];
}

export async function getById(collection: string, id: string): Promise<Entry | null> {
  if (!UUID_RE.test(id)) return null;
  const rows = (await sql`
    SELECT * FROM entries WHERE collection = ${collection} AND id = ${id} LIMIT 1
  `) as Entry[];
  return rows[0] ?? null;
}

export async function getBySlug(collection: string, slug: string): Promise<Entry | null> {
  const rows = (await sql`
    SELECT * FROM entries WHERE collection = ${collection} AND slug = ${slug} AND draft = false LIMIT 1
  `) as Entry[];
  return rows[0] ?? null;
}

async function slugExists(collection: string, slug: string, exceptId?: string): Promise<boolean> {
  const rows = exceptId
    ? ((await sql`SELECT 1 FROM entries WHERE collection = ${collection} AND slug = ${slug} AND id <> ${exceptId} LIMIT 1`) as unknown[])
    : ((await sql`SELECT 1 FROM entries WHERE collection = ${collection} AND slug = ${slug} LIMIT 1`) as unknown[]);
  return rows.length > 0;
}

export async function uniqueSlug(collection: string, base: string, exceptId?: string): Promise<string> {
  let slug = slugify(base) || 'item';
  let n = 2;
  while (await slugExists(collection, slug, exceptId)) slug = `${slugify(base) || 'item'}-${n++}`;
  return slug;
}

async function logRevision(
  collection: string,
  entryId: string,
  editor: { sub: string; name: string },
  action: string,
  snapshot: unknown,
) {
  await sql`
    INSERT INTO revisions (collection, entry_id, editor_id, editor_name, action, snapshot)
    VALUES (${collection}, ${entryId}, ${editor.sub}, ${editor.name}, ${action}, ${JSON.stringify(snapshot)}::jsonb)
  `;
}

export type EntryInput = {
  slug: string;
  data: Record<string, unknown>;
  draft: boolean;
  featured: boolean;
  ord: number;
};

export async function create(collection: string, input: EntryInput, editor: { sub: string; name: string }): Promise<Entry> {
  const rows = (await sql`
    INSERT INTO entries (collection, slug, data, draft, featured, ord, created_by, updated_by)
    VALUES (${collection}, ${input.slug}, ${JSON.stringify(input.data)}::jsonb, ${input.draft}, ${input.featured}, ${input.ord}, ${editor.sub}, ${editor.sub})
    RETURNING *
  `) as Entry[];
  await logRevision(collection, rows[0].id, editor, 'create', rows[0]);
  return rows[0];
}

export async function update(
  collection: string,
  id: string,
  input: EntryInput,
  editor: { sub: string; name: string },
): Promise<Entry | null> {
  if (!UUID_RE.test(id)) return null;
  const rows = (await sql`
    UPDATE entries SET
      slug = ${input.slug}, data = ${JSON.stringify(input.data)}::jsonb,
      draft = ${input.draft}, featured = ${input.featured}, ord = ${input.ord},
      updated_by = ${editor.sub}, updated_at = now()
    WHERE collection = ${collection} AND id = ${id}
    RETURNING *
  `) as Entry[];
  if (!rows[0]) return null;
  await logRevision(collection, id, editor, 'update', rows[0]);
  return rows[0];
}

export async function remove(collection: string, id: string, editor: { sub: string; name: string }): Promise<void> {
  if (!UUID_RE.test(id)) return;
  const e = await getById(collection, id);
  if (e) await logRevision(collection, id, editor, 'delete', e);
  await sql`DELETE FROM entries WHERE collection = ${collection} AND id = ${id}`;
}

export async function listRevisions(collection: string, entryId: string) {
  return (await sql`
    SELECT id, editor_name, action, created_at FROM revisions
    WHERE collection = ${collection} AND entry_id = ${entryId}
    ORDER BY created_at DESC LIMIT 50
  `) as Array<{ id: string; editor_name: string | null; action: string; created_at: string }>;
}
