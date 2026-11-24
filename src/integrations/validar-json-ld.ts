/**
 * Integração de build: confere o JSON-LD de todas as páginas do dist/ (regras em
 * src/lib/validar-json-ld.ts) e se cada imagem citada existe no build. Qualquer problema
 * derruba o build. Fica depois de `limpar-arquivos` na lista de integrações, para conferir
 * as imagens que sobraram.
 */
import type { AstroIntegration } from 'astro';

import { extrairJsonLd, problemasJsonLd, urlsDeImagens } from '../lib/validar-json-ld.ts';
import { lerDist } from './paginas-dist.ts';

export default function validarJsonLd(): AstroIntegration {
  let origem = '';
  return {
    name: 'validar-json-ld',
    hooks: {
      'astro:config:done': ({ config }) => {
        origem = config.site ? new URL(config.site).origin : '';
      },
      'astro:build:done': async ({ dir, logger }) => {
        const { arquivos, paginas } = await lerDist(dir);
        const erros: string[] = [];
        let conferidas = 0;
        for (const { caminho, html } of paginas) {
          const problemas = problemasJsonLd(html);
          const [bloco] = extrairJsonLd(html);
          if (bloco !== undefined && problemas.length === 0) {
            conferidas++;
            for (const url of urlsDeImagens(JSON.parse(bloco))) {
              const destino = new URL(url);
              if (destino.origin !== origem) continue;
              if (!arquivos.has(decodeURIComponent(destino.pathname))) {
                problemas.push(`imagem inexistente: ${url}`);
              }
            }
          }
          erros.push(...problemas.map((problema) => `${caminho}: ${problema}`));
        }

        if (erros.length > 0) {
          throw new Error(`JSON-LD com problemas:\n${erros.join('\n')}`);
        }
        logger.info(`JSON-LD conferido em ${conferidas} página(s).`);
      },
    },
  };
}
