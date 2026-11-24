/**
 * Integração de build: remove de dist/_astro/ as imagens e os scripts que nenhuma página
 * publicada usa (alcance calculado por src/lib/alcance.ts).
 *
 * Motivos:
 * - o registro de imagens (src/lib/imagens.ts) usa import.meta.glob, e o Vite emite todos os
 *   arquivos do glob; o Astro só apaga o original das imagens que passaram por transformação;
 * - o Vite emite o script de todo componente do projeto, mesmo quando a configuração não o
 *   renderiza (ex.: formulário sem PUBLIC_FORM_ENDPOINT, aviso de cookies sem analytics).
 * Fontes e CSS não são apagados.
 */
import { readdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

import { assetsAlcancados } from '../lib/alcance.ts';

const REMOVIVEIS = /\.(jpe?g|png|webp|avif|gif|svg|js|mjs)$/i;
const TEXTO_ASSET = /\.(js|mjs|css)$/i;
const TEXTO_PUBLICADO = /\.(html|css|js|mjs|xml|json|webmanifest|txt)$/i;

export default function limparArquivos(): AstroIntegration {
  return {
    name: 'limpar-arquivos',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);
        const pastaAssets = path.join(raiz, '_astro');
        const arquivos = (await readdir(raiz, { withFileTypes: true, recursive: true }))
          .filter((entrada) => entrada.isFile())
          .map((entrada) => path.join(entrada.parentPath, entrada.name));
        const relativoAosAssets = (arquivo: string) =>
          path.relative(pastaAssets, arquivo).split(path.sep).join('/');
        const ehAsset = (arquivo: string) => arquivo.startsWith(pastaAssets + path.sep);

        const textosPublicados = await Promise.all(
          arquivos
            .filter((arquivo) => !ehAsset(arquivo) && TEXTO_PUBLICADO.test(arquivo))
            .map((arquivo) => readFile(arquivo, 'utf8')),
        );
        const assets = new Map<string, string | null>();
        for (const arquivo of arquivos.filter(ehAsset)) {
          assets.set(
            relativoAosAssets(arquivo),
            TEXTO_ASSET.test(arquivo) ? await readFile(arquivo, 'utf8') : null,
          );
        }

        const alcancados = assetsAlcancados(textosPublicados, assets);
        let imagens = 0;
        let scripts = 0;
        for (const arquivo of arquivos.filter(ehAsset)) {
          if (!REMOVIVEIS.test(arquivo) || alcancados.has(relativoAosAssets(arquivo))) continue;
          await unlink(arquivo);
          if (/\.m?js$/i.test(arquivo)) scripts++;
          else imagens++;
        }
        logger.info(
          `${imagens} imagem(ns) e ${scripts} script(s) não usados removidos de _astro/.`,
        );
      },
    },
  };
}
