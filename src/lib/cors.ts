/**
 * Headers da API pública de leitura (/api/content/*). Conteúdo já publicado,
 * sem segredos — liberado para qualquer origem. O site oficial consome no build
 * (server-to-server), mas o CORS permite uso a partir do navegador também.
 */
export const jsonCors = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  // Cache curto na borda: leitura pública, tolera alguns segundos de defasagem.
  'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
};

export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { headers: jsonCors, ...init });
}
