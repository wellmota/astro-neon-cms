export const prerender = false;
import type { APIRoute } from 'astro';
import { getCollection } from '@/lib/cms';
import { create, update, remove, uniqueSlug, type EntryInput } from '@/lib/entries';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/admin/login');
  const editor = { sub: user.sub, name: user.name };

  const form = await request.formData();
  const col = getCollection(String(form.get('collection') ?? ''));
  if (!col) return redirect('/admin');
  const base = `/admin/${col.name}`;
  const id = String(form.get('id') ?? '').trim();
  const acao = String(form.get('acao') ?? 'salvar');

  if (acao === 'excluir') {
    if (id) await remove(col.name, id, editor);
    return redirect(`${base}?ok=excluido`);
  }

  // Monta `data` conforme os widgets declarados no config.
  const data: Record<string, unknown> = {};
  for (const f of col.fields) {
    const raw = form.get(f.name);
    switch (f.widget) {
      case 'boolean':
        data[f.name] = raw === 'on';
        break;
      case 'number': {
        const n = Number(raw);
        data[f.name] = raw === null || raw === '' || Number.isNaN(n) ? null : n;
        break;
      }
      case 'list':
        try {
          const arr = JSON.parse(String(raw ?? '[]'));
          data[f.name] = Array.isArray(arr) ? arr : [];
        } catch {
          data[f.name] = [];
        }
        break;
      default:
        data[f.name] = raw === null ? '' : String(raw);
    }
  }

  // Obrigatórios (campos de texto).
  for (const f of col.fields) {
    if (f.required && ['string', 'text', 'markdown', 'select', 'image'].includes(f.widget)) {
      if (!String(data[f.name] ?? '').trim()) {
        return redirect(id ? `${base}/${id}?erro=obrigatorio` : `${base}/novo?erro=obrigatorio`);
      }
    }
  }

  const titleField = col.titleField ?? 'title';
  const titleVal = String(data[titleField] ?? '').trim() || col.labelSingular || col.label;
  const slugBase = String(form.get('slug') ?? '').trim() || titleVal;
  const slug = await uniqueSlug(col.name, slugBase, id || undefined);

  const input: EntryInput = {
    slug,
    data,
    draft: form.get('draft') === 'on',
    featured: form.get('featured') === 'on',
    ord: Number(form.get('ord') ?? 0) || 0,
  };

  try {
    if (id) await update(col.name, id, input, editor);
    else await create(col.name, input, editor);
  } catch (e) {
    console.error('Erro ao salvar entry:', e);
    return redirect(id ? `${base}/${id}?erro=1` : `${base}/novo?erro=1`);
  }
  return redirect(`${base}?ok=salvo`);
};
