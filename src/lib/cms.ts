/** Config resolvido + helpers. Lê `src/config/cms.ts`. */
import userConfig from '@/config/cms';
import type { Collection, Singleton } from './config';

export const config = userConfig;
export const collections = config.collections;
export const siteUrl = (config.siteUrl ?? '').replace(/\/+$/, '');

export const getCollection = (name: string): Collection | undefined =>
  config.collections.find((c) => c.name === name);

export const getSingletonDef = (key: string): Singleton | undefined =>
  config.singletons?.find((s) => s.key === key);

/** Texto-título de uma entrada, a partir do `titleField` (ou 'title'). */
export function titleOf(col: Collection, data: Record<string, unknown>): string {
  const f = col.titleField ?? 'title';
  const v = data?.[f];
  return v ? String(v) : '(sem título)';
}
