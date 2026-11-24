/**
 * Regras editoriais das páginas de detalhe (AEO): a resposta direta de cada acomodação,
 * restaurante, página do guia, artigo do blog e landing de data especial tem de 40 a 60 palavras, para
 * poder ser citada isoladamente.
 * (Tamanho do título e da descrição SEO: conferidos pelo schema das coleções.)
 */
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

// O Vite exige as opções do glob como objeto literal em cada chamada.
/** Coleções em que toda página tem resposta direta. */
const obrigatorias = import.meta.glob<string>(
  [
    '/src/content/acomodacoes/*.md',
    '/src/content/restaurantes/*.md',
    '/src/content/guia/*.md',
    '/src/content/blog/*.md',
  ],
  { query: '?raw', import: 'default', eager: true },
);
/** Datas especiais: só as que têm landing publicada trazem resposta direta. */
const datas = import.meta.glob<string>('/src/content/datas-especiais/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function frontmatter(texto: string): { respostaDireta?: string } {
  const [, bloco = ''] = texto.split(/^---\s*$/m);
  return parse(bloco) as { respostaDireta?: string };
}

const palavras = (frase: string) => frase.trim().split(/\s+/).length;

const comResposta = [
  ...Object.entries(obrigatorias),
  ...Object.entries(datas).filter(([, texto]) => frontmatter(texto).respostaDireta),
];

describe('respostas diretas das páginas de detalhe', () => {
  it('lê acomodações, restaurantes, guia, blog e landings de datas especiais', () => {
    const total = Object.keys(obrigatorias).length;
    expect(total).toBeGreaterThanOrEqual(10);
    expect(comResposta.length).toBeGreaterThan(total);
  });

  it.each(comResposta)('%s: 40 a 60 palavras', (_caminho, texto) => {
    const { respostaDireta = '' } = frontmatter(texto);
    const total = palavras(respostaDireta);
    expect(total).toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(60);
  });
});
