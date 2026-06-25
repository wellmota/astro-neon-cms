/**
 * Tipos do config-driven CMS. Você descreve o modelo de conteúdo em
 * `src/config/cms.ts` — coleções e campos — e a UI do painel + a API pública
 * são geradas a partir disso, sem editar o "engine".
 */

export type Widget =
  | 'string' // input de texto curto
  | 'text' // textarea
  | 'markdown' // editor rico (EasyMDE)
  | 'image' // upload/seleção do Vercel Blob
  | 'select' // dropdown (use `options`)
  | 'boolean' // checkbox
  | 'number' // numérico
  | 'datetime' // data (YYYY-MM-DD)
  | 'list'; // repetidor (lista de strings, ou de objetos via `fields`)

export interface Field {
  name: string;
  label: string;
  widget: Widget;
  required?: boolean;
  hint?: string;
  /** Para `select`. */
  options?: string[];
  /** Para `list` de objetos: define os subcampos de cada item. Sem isto, é lista de strings. */
  fields?: Field[];
  /** Valor inicial em itens novos. */
  default?: unknown;
}

export interface Collection {
  /** id interno e nome na URL/banco (slug, sem espaços). */
  name: string;
  label: string; // plural, ex.: "Publicações"
  labelSingular?: string; // ex.: "Publicação"
  /** Campo usado como título nas listagens (default: 'title' se existir). */
  titleField?: string;
  /** Mostra o toggle "Destaque". */
  featurable?: boolean;
  /** Mostra o campo "Ordem" e ordena por ele. */
  orderable?: boolean;
  fields: Field[];
}

export interface Singleton {
  key: string;
  label: string;
  fields: Field[];
}

export interface CmsConfig {
  /** Nome exibido no topo do painel. */
  siteName?: string;
  /** URL pública do site (usada nos links "Ver no site"). Opcional. */
  siteUrl?: string;
  collections: Collection[];
  singletons?: Singleton[];
}

/** Helper de tipagem para `src/config/cms.ts`. */
export function defineConfig(config: CmsConfig): CmsConfig {
  return config;
}
