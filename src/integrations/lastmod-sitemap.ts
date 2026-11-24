/**
 * Integração de build: grava no sitemap o `<lastmod>` de cada página com a data de atualização
 * dela (meta og:updated_time). Fica depois do @astrojs/sitemap. Página do sitemap sem data
 * derruba o build.
 *
 * Também grava uma cópia do índice em `/sitemap.xml`: é o endereço que o site anterior (Wix)
 * publicava e que ficou cadastrado no Search Console. Sem ela, a referência antiga passaria a
 * dar 404 depois da troca do site. O robots.txt continua apontando o `/sitemap-index.xml`.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AstroIntegration } from 'astro';

import { atualizadoEm, canonica } from '../lib/html.ts';
import { aplicarLastmod } from '../lib/sitemap.ts';
import { lerDist } from './paginas-dist.ts';

export default function lastmodSitemap(): AstroIntegration {
  return {
    name: 'lastmod-sitemap',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { raiz, arquivos, paginas } = await lerDist(dir);
        const datas = new Map<string, string>();
        for (const { html } of paginas) {
          const url = canonica(html);
          const data = atualizadoEm(html);
          if (url && data) datas.set(url, data);
        }

        const sitemaps = [...arquivos].filter((arquivo) => /^\/sitemap-\d+\.xml$/.test(arquivo));
        const semData: string[] = [];
        for (const sitemap of sitemaps) {
          const arquivo = path.join(raiz, sitemap);
          const resultado = aplicarLastmod(await readFile(arquivo, 'utf8'), datas);
          semData.push(...resultado.semData);
          await writeFile(arquivo, resultado.xml);
        }
        if (semData.length > 0) {
          throw new Error(`Páginas do sitemap sem "Atualizado em":\n${semData.join('\n')}`);
        }

        // Cópia do índice no endereço clássico, para a inscrição antiga do Search Console.
        const indice = path.join(raiz, 'sitemap-index.xml');
        if (arquivos.has('/sitemap-index.xml')) {
          await copyFile(indice, path.join(raiz, 'sitemap.xml'));
        }

        logger.info(
          `lastmod de ${datas.size} página(s) gravado em ${sitemaps.length} sitemap(s); sitemap.xml copiado do índice.`,
        );
      },
    },
  };
}
