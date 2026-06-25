import { defineConfig } from '@/lib/config';

/**
 * 👋 EDITE ESTE ARQUIVO para o seu projeto. É a única coisa que você precisa
 * mexer pra definir o conteúdo do CMS — o painel e a API são gerados a partir
 * daqui. Veja os widgets disponíveis em `src/lib/config.ts`.
 *
 * Abaixo vai um exemplo com um blog ("posts") e uma página única ("home").
 */
export default defineConfig({
  siteName: 'Meu site',
  // siteUrl: 'https://exemplo.com', // habilita os links "Ver no site"

  collections: [
    {
      name: 'posts',
      label: 'Publicações',
      labelSingular: 'Publicação',
      titleField: 'title',
      featurable: true,
      fields: [
        { name: 'title', label: 'Título', widget: 'string', required: true },
        { name: 'excerpt', label: 'Resumo', widget: 'text', hint: 'Aparece no card e na meta description.' },
        { name: 'cover', label: 'Capa', widget: 'image' },
        { name: 'category', label: 'Categoria', widget: 'select', default: 'Geral', options: ['Geral', 'Notícias', 'Guias'] },
        { name: 'date', label: 'Data', widget: 'datetime' },
        { name: 'tags', label: 'Tags', widget: 'list', hint: 'Uma por linha.' },
        {
          name: 'metrics',
          label: 'Métricas em destaque',
          widget: 'list',
          fields: [
            { name: 'value', label: 'Valor', widget: 'string' },
            { name: 'label', label: 'Descrição', widget: 'string' },
          ],
        },
        { name: 'body', label: 'Conteúdo', widget: 'markdown' },
      ],
    },
  ],

  singletons: [
    {
      key: 'home',
      label: 'Home',
      fields: [
        { name: 'title', label: 'Título', widget: 'string' },
        { name: 'intro', label: 'Introdução', widget: 'text' },
      ],
    },
  ],
});
