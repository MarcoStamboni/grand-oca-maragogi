/** Web App Manifest (nome, cores e ícones), gerado a partir do site.config. */
import type { APIRoute } from 'astro';

import { resort, site } from '@/site.config';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: site.nome,
        short_name: resort.nomeCurto,
        description: site.descricaoPadrao,
        lang: site.idioma,
        start_url: '/',
        display: 'browser',
        background_color: '#ffffff',
        theme_color: '#00578f',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
