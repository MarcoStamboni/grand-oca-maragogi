/** Auditoria do build: cada regra acusa o problema que descreve e aceita a página correta. */
import { describe, expect, it } from 'vitest';

import { auditarPaginas, relatorioAuditoria } from './auditoria';
import { resort } from '../site.config.ts';

const resposta = `O ${resort.nomeCurto} Testes fica na Praia Teste, em Cidade Teste, e tem um regime all inclusive que funciona vinte e quatro horas por dia, com quatro restaurantes, sete bares, recreação para todas as idades, piscina grande, academia, quadras e estacionamento gratuito para os hóspedes durante toda a estadia.`;

interface Opcoes {
  titulo?: string;
  descricao?: string;
  resposta?: string;
  conteudo?: string;
  head?: string;
}

function html({
  titulo = 'Página de teste | Resort Testes',
  descricao = 'Descrição de teste com tamanho suficiente para ficar dentro da faixa recomendada pelo buscador.',
  resposta: texto = resposta,
  conteudo = '',
  head = '',
}: Opcoes = {}): string {
  return `<html><head><title>${titulo}</title><meta name="description" content="${descricao}">${head}</head><body><main id="conteudo"><h1>Título</h1><meta property="og:updated_time" content="2026-09-30"><p data-resposta-direta>${texto}</p>${conteudo}</main></body></html>`;
}

const arquivos = new Set(['/_astro/foto.webp']);

describe('auditarPaginas', () => {
  it('aceita páginas corretas e mede os H2', () => {
    const { erros, avisos, metricas } = auditarPaginas(
      [
        {
          caminho: '/a/',
          html: html({ conteudo: '<h2 id="x">Como é?</h2><h2>Galeria</h2><a href="/b/#y">B</a>' }),
        },
        {
          caminho: '/b/',
          html: html({
            titulo: 'Outra página | Resort Testes',
            descricao:
              'Outra descrição de teste com tamanho suficiente para ficar dentro da faixa recomendada.',
            conteudo:
              '<h2 id="y">Onde fica?</h2><a href="#y">Topo</a><a href="/_astro/foto.webp">Foto</a>',
          }),
        },
      ],
      arquivos,
    );
    expect(erros).toEqual([]);
    expect(avisos).toEqual([]);
    expect(metricas[0]).toMatchObject({
      palavrasResposta: resposta.trim().split(/\s+/).length,
      h2: 2,
      h2SemPergunta: ['Galeria'],
    });
  });

  it('acusa problemas de estrutura', () => {
    const { erros } = auditarPaginas(
      [
        {
          caminho: '/a/',
          html: html({
            conteudo:
              '<h1>Outro</h1><h4>Pulou</h4><img src="x.jpg"><p id="d"></p><p id="d"></p><a href="/nada/">x</a><a href="#sem">y</a>',
          }),
        },
      ],
      arquivos,
    );
    expect(erros).toEqual([
      '/a/: esperado 1 H1, encontrados 2',
      '/a/: salto de H1 para H4: "Pulou"',
      '/a/: imagem sem alt: <img src="x.jpg">',
      '/a/: id repetido: d',
      '/a/: link quebrado: /nada/',
      '/a/: âncora inexistente: #sem',
    ]);
  });

  it('acusa título antes do H1 (ex.: "Menu" do painel do celular)', () => {
    const pagina = html().replace('<main', '<header><h2>Menu</h2></header><main');
    const { erros } = auditarPaginas([{ caminho: '/a/', html: pagina }], arquivos);
    expect(erros).toContain('/a/: título antes do H1: H2 "Menu"');
  });

  it('acusa metadados e resposta direta fora das regras', () => {
    const curta = 'Resposta curta demais.';
    const { erros } = auditarPaginas(
      [
        { caminho: '/a/', html: html({ titulo: 'Curto', descricao: 'Curta', resposta: curta }) },
        { caminho: '/b/', html: html({ titulo: 'Curto', descricao: 'Curta', resposta: curta }) },
      ],
      arquivos,
    );
    expect(erros).toEqual(
      expect.arrayContaining([
        '/a/: título com 5 caracteres',
        '/a/: descrição com 5 caracteres',
        '/a/: resposta direta com 3 palavras',
        '/b/: título igual ao de /a/',
        '/b/: descrição igual à de /a/',
      ]),
    );
  });

  it('avisa quando a resposta direta não nomeia o resort, o destino ou o operador', () => {
    const generica = resposta.replace(
      `O ${resort.nomeCurto} Testes fica na Praia Teste,`,
      'Ele fica',
    );
    const pagina = { caminho: '/a/', html: html({ resposta: `${generica} Mais duas palavras.` }) };
    expect(auditarPaginas([pagina], arquivos).avisos).toHaveLength(1);
    expect(auditarPaginas([pagina], arquivos, ['Cidade Teste']).avisos).toEqual([]);
  });

  it('não exige conteúdo de AEO em páginas noindex', () => {
    const noindex = html({
      head: '<meta name="robots" content="noindex, nofollow">',
      resposta: '',
      titulo: 'x',
    });
    const resultado = auditarPaginas([{ caminho: '/404.html', html: noindex }], arquivos);
    expect(resultado.erros).toEqual([]);
    expect(resultado.metricas).toEqual([]);
  });

  it('gera o relatório em Markdown', () => {
    const resultado = auditarPaginas([{ caminho: '/a/', html: html() }], arquivos);
    const palavras = resposta.trim().split(/\s+/).length;
    expect(relatorioAuditoria(resultado)).toContain(`| /a/ | 31 | 95 | ${palavras} | 0 |  |`);
  });
});
