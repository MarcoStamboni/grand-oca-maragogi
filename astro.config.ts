import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField, fontProviders } from 'astro/config';

import { caminhosForaDoSitemap } from './src/data/indexacao';
import arquivosServidor, { paginasRedirecionamento } from './src/integrations/arquivos-servidor';
import auditarPaginas from './src/integrations/auditar-paginas';
import gerarLlms from './src/integrations/gerar-llms';
import lastmodSitemap from './src/integrations/lastmod-sitemap';
import limparArquivos from './src/integrations/limpar-arquivos';
import validarJsonLd from './src/integrations/validar-json-ld';
import { site } from './src/site.config';

/** Faixa "latin" do Google Fonts/Fontsource: inclui todos os caracteres do português. */
const UNICODE_LATINO =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

/** Um peso do Poppins (arquivo latino do @fontsource/poppins). */
const variantePoppins = (peso: '300' | '400' | '500' | '600' | '700') => ({
  src: [`@fontsource/poppins/files/poppins-latin-${peso}-normal.woff2`] as [string],
  weight: peso,
  style: 'normal' as const,
  unicodeRange: [UNICODE_LATINO] as [string],
});

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: site.url,
  output: 'static',
  // URLs em minúsculas, sem acento e com barra final (docs/plano.md, seção 2).
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS embutido no HTML: sem pedido bloqueante antes da primeira pintura (performance).
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  // A ordem importa: as integrações de pós-build leem o dist/ deixado pelas anteriores.
  integrations: [
    sitemap({
      filter: (pagina) => !caminhosForaDoSitemap.has(new URL(pagina).pathname),
    }),
    // lastmod de cada URL = data do "Atualizado em" da página.
    lastmodSitemap(),
    arquivosServidor(),
    limparArquivos(),
    // Depois de limpar-arquivos: confere o JSON-LD e as imagens que ficaram no build.
    validarJsonLd(),
    gerarLlms(),
    // Por último: audita páginas, links e arquivos gerados pelas anteriores.
    auditarPaginas(),
    // Depois da auditoria: páginas de redirecionamento do site anterior.
    paginasRedirecionamento(),
  ],
  // Fonte self-hosted (Poppins, escolha do usuário): um woff2 por peso, só o subconjunto latino
  // (cobre todo o português) e só o estilo normal. O Astro gera @font-face, preload e
  // fallback com métricas ajustadas (menos CLS).
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          variantePoppins('300'),
          variantePoppins('400'),
          variantePoppins('500'),
          variantePoppins('600'),
          variantePoppins('700'),
        ],
      },
    },
    // Fonte da marca do resort no cabeçalho: condensada e em negrito, como a da logo Resort All
    // Inclusive. Só o peso 800, só no texto da marca.
    {
      provider: fontProviders.local(),
      name: 'Barlow Semi Condensed',
      cssVariable: '--font-marca',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: [
              '@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-800-normal.woff2',
            ],
            weight: '800',
            style: 'normal',
            unicodeRange: [UNICODE_LATINO],
          },
        ],
      },
    },
  ],
  env: {
    // Nenhuma credencial fica no repositório: valores vêm do ambiente de build (.env).
    schema: {
      // Serviço de automação (Make, Zapier, n8n ou provedor de WhatsApp Business) que recebe o
      // perfil do viajante do motor e repassa aos consultores no WhatsApp, sem abrir o app.
      PUBLIC_LEADS_WEBHOOK: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        url: true,
      }),
      PUBLIC_FORM_ENDPOINT: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        url: true,
      }),
      PUBLIC_ANALYTICS_ENABLED: envField.boolean({
        context: 'client',
        access: 'public',
        default: false,
      }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GTM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
