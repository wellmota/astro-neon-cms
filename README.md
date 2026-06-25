# astro-neon-cms

A small, **config-driven CMS built for Astro** — old-school e-mail/password login, your content in **Postgres (Neon)**, image uploads to **Vercel Blob**, and a **public read API** your site consumes. Inspired by [Sveltia CMS](https://github.com/sveltia/sveltia-cms) / Decap, but **native to Astro** (no Git backend, no OAuth dance): you describe your content model in one config file and the admin UI + API are generated from it.

> Maintained by **[Wellington Mota](https://github.com/wellmota)** — a product/UX designer. Focus is the *human* side of editing: mobile-first, writer-friendly, AI-team-friendly.

## Why

- **Config-driven** — declare collections and fields in `src/config/cms.ts`; the panel and API follow. No need to touch the engine.
- **Real login** — e-mail/password (bcrypt via Postgres `pgcrypto`), signed session cookie. Great for non-dev teams (no GitHub account required).
- **Decoupled** — the CMS is its own deploy. Your Astro site stays a separate project and just reads the public JSON API (build-time or runtime). No secrets needed on the site.
- **Nice UX out of the box** — dashboard with KPIs, rich Markdown editor (live preview), media library with reuse, floating save bar, toasts, search/filter.

## Stack

Astro (SSR) · Neon Postgres (`@neondatabase/serverless`) · Vercel Blob · EasyMDE · Tailwind. Deploys to Vercel.

## Quick start

```bash
pnpm install
cp .env.example .env            # preencha DATABASE_URL, SESSION_SECRET, (BLOB_READ_WRITE_TOKEN)

# crie o schema no seu Postgres (Neon):
psql "$DATABASE_URL" -f schema.sql     # ou cole schema.sql no SQL editor do Neon

# crie o primeiro admin:
pnpm seed voce@exemplo.com SuaSenhaForte "Seu Nome"

pnpm dev                        # http://localhost:4321/admin
```

`SESSION_SECRET`: gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Defina seu conteúdo

Edite **`src/config/cms.ts`** — é o único arquivo que você precisa mexer:

```ts
import { defineConfig } from '@/lib/config';

export default defineConfig({
  siteName: 'Meu site',
  siteUrl: 'https://exemplo.com',   // opcional, habilita "Ver no site"
  collections: [
    {
      name: 'posts', label: 'Publicações', labelSingular: 'Publicação',
      titleField: 'title', featurable: true,
      fields: [
        { name: 'title', label: 'Título', widget: 'string', required: true },
        { name: 'cover', label: 'Capa', widget: 'image' },
        { name: 'category', label: 'Categoria', widget: 'select', options: ['Geral', 'Guias'] },
        { name: 'tags', label: 'Tags', widget: 'list' },
        { name: 'body', label: 'Conteúdo', widget: 'markdown' },
      ],
    },
  ],
  singletons: [
    { key: 'home', label: 'Home', fields: [{ name: 'title', label: 'Título', widget: 'string' }] },
  ],
});
```

**Widgets:** `string`, `text`, `markdown`, `image`, `select`, `boolean`, `number`, `datetime`, `list` (de strings, ou de objetos via `fields`). Sistema: `draft`, `featured` (se `featurable`), `ord` (se `orderable`) e `slug` são automáticos.

## API pública (o que seu site consome)

Conteúdo **publicado** (não-rascunho), JSON, CORS liberado:

| Endpoint | Retorna |
|---|---|
| `GET /api/content/<colecao>.json` | lista de entradas (`{ slug, featured, ord, updatedAt, ...campos }`) |
| `GET /api/content/<colecao>/<slug>.json` | uma entrada, ou `null` (404) |
| `GET /api/content/singletons/<chave>.json` | objeto do singleton, ou `null` |

### Consumindo no seu site Astro

**Build-time (estático):**
```ts
const posts = await fetch('https://SEU-CMS.vercel.app/api/content/posts.json').then(r => r.json());
```

**Runtime (SSR, publica sem rebuild) — com cache de borda:**
```ts
export const prerender = false;
Astro.response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
const posts = await fetch('https://SEU-CMS.vercel.app/api/content/posts.json').then(r => r.json());
```
Para Markdown, renderize o campo `body` com `marked` (ou o pipeline que preferir).

## Deploy (Vercel)

1. Importe este repo num projeto Vercel.
2. Env vars: `DATABASE_URL`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN` (Vercel → Storage → Blob).
3. Deploy. Acesse `/admin`.

Publicar = desmarcar **Rascunho** e salvar — aparece na API na hora (o site reflete conforme o cache que você definir).

## Roadmap

- [ ] Mais widgets (relation/reference, object aninhado, rich list).
- [ ] Preview da página real (iframe do site).
- [ ] Integração MCP (agente edita via [Model Context Protocol](https://modelcontextprotocol.io/), humano aprova).
- [ ] Papéis/permissões mais finos; i18n.

Experimentos pessoais — issues e ideias são bem-vindos.

## License

MIT. Inspirado em [Sveltia CMS](https://github.com/sveltia/sveltia-cms) e Decap CMS.
