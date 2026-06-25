/** Singletons (páginas de campos fixos), guardados como JSON chave→valor. */
import { sql } from './db';

export async function getSingleton<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const rows = (await sql`SELECT data FROM singletons WHERE key = ${key} LIMIT 1`) as { data: T }[];
  return rows[0]?.data ?? null;
}

export async function setSingleton(
  key: string,
  data: Record<string, unknown>,
  editor: { sub: string },
): Promise<void> {
  await sql`
    INSERT INTO singletons (key, data, updated_by, updated_at)
    VALUES (${key}, ${JSON.stringify(data)}::jsonb, ${editor.sub}, now())
    ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_by = ${editor.sub}, updated_at = now()
  `;
}
