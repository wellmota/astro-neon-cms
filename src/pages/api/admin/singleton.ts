export const prerender = false;
import type { APIRoute } from 'astro';
import { getSingletonDef } from '@/lib/cms';
import { setSingleton } from '@/lib/singletons';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/admin/login');

  const form = await request.formData();
  const key = String(form.get('key') ?? '');
  const def = getSingletonDef(key);
  if (!def) return redirect('/admin/paginas');

  const data: Record<string, unknown> = {};
  for (const f of def.fields) {
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

  await setSingleton(key, data, { sub: user.sub });
  return redirect(`/admin/paginas/${key}?ok=1`);
};
