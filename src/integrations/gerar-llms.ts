/**
 * Integração de build: grava dist/llms.txt e dist/llms-full.txt (src/lib/llms.ts) com o
 * título, a descrição e a resposta direta lidos das páginas geradas, e as perguntas do
 * FAQPage de /perguntas-frequentes/. Ordem: rotas fixas na ordem de src/data/rotas.ts; páginas
 * de detalhe na ordem em que aparecem na página-mãe (a mesma ordem do site).
 * Só existe no build (no `astro dev` não há llms.txt).
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AstroIntegration } from 'astro';

import { chavesRotas, rotas } from '../data/rotas.ts';
import { canonica, indexavel, meta, respostaDireta, tituloDaPagina } from '../lib/html.ts';
import {
  gerarLlmsFullTxt,
  gerarLlmsTxt,
  type PaginaLlms,
  type PerguntaLlms,
  tituloSemSite,
} from '../lib/llms.ts';
import { extrairJsonLd } from '../lib/validar-json-ld.ts';
import { site } from '../site.config.ts';
import { type PaginaDist, lerDist } from './paginas-dist.ts';

const caminhosFixos: string[] = chavesRotas.map((chave) => rotas[chave].caminho);

/**
 * Posição da página: rotas fixas pela ordem do registro; detalhes logo depois da página-mãe,
 * na ordem em que ela os lista (fração entre a mãe e a rota fixa seguinte).
 */
function ordem(caminho: string, porCaminho: ReadonlyMap<string, PaginaDist>): number {
  const fixa = caminhosFixos.indexOf(caminho);
  if (fixa >= 0) return fixa;
  const mae = caminho.replace(/[^/]+\/$/, '');
  const htmlMae = porCaminho.get(mae)?.html ?? '';
  const posicao = htmlMae.indexOf(`href="${caminho}"`);
  const fracao = posicao >= 0 ? (posicao + 1) / (htmlMae.length + 2) : 0.999;
  return Math.max(caminhosFixos.indexOf(mae), 0) + fracao;
}

/** Perguntas do FAQPage (JSON-LD) de uma página, na ordem exibida. */
function perguntasDaFaq(pagina: PaginaDist | undefined): PerguntaLlms[] {
  const [bloco] = pagina ? extrairJsonLd(pagina.html) : [];
  if (!bloco) return [];
  const grafo = (JSON.parse(bloco) as { '@graph': Record<string, unknown>[] })['@graph'];
  const faq = grafo.find((no) => no['@type'] === 'FAQPage');
  const itens = (faq?.['mainEntity'] ?? []) as { name: string; acceptedAnswer: { text: string } }[];
  return itens.map(({ name, acceptedAnswer }) => ({
    pergunta: name,
    resposta: acceptedAnswer.text,
  }));
}

export default function gerarLlms(): AstroIntegration {
  return {
    name: 'gerar-llms',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { raiz, paginas } = await lerDist(dir);
        const indexaveis = paginas.filter(({ html }) => indexavel(html));
        const porCaminho = new Map(indexaveis.map((pagina) => [pagina.caminho, pagina]));

        const resumos: PaginaLlms[] = indexaveis.map(({ caminho, html }) => ({
          url: canonica(html) ?? new URL(caminho, site.url).href,
          caminho,
          titulo: tituloSemSite(tituloDaPagina(html) ?? caminho),
          descricao: meta(html, 'description') ?? '',
          resposta: respostaDireta(html),
          // A FAQ central reúne todas as perguntas, que já aparecem nas páginas de cada assunto.
          perguntas:
            caminho === rotas.perguntasFrequentes.caminho
              ? []
              : perguntasDaFaq(porCaminho.get(caminho)),
          ordem: ordem(caminho, porCaminho),
        }));
        const dados = {
          paginas: resumos,
          perguntas: perguntasDaFaq(porCaminho.get(rotas.perguntasFrequentes.caminho)),
          urlCompleto: new URL('/llms-full.txt', site.url).href,
        };

        await writeFile(path.join(raiz, 'llms.txt'), gerarLlmsTxt(dados));
        await writeFile(path.join(raiz, 'llms-full.txt'), gerarLlmsFullTxt(dados));
        logger.info(
          `llms.txt e llms-full.txt gerados (${resumos.length} páginas, ${dados.perguntas.length} perguntas).`,
        );
      },
    },
  };
}
