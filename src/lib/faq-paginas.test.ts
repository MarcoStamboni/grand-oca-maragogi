/**
 * Regra AEO da rede: cada página indexável mostra EXATAMENTE 15 perguntas frequentes (as do
 * assunto da página + "Onde fazer a sua reserva...", marcada para `todas`), sem repetir pergunta.
 * Ficam de fora: 404, política de privacidade, política de cookies, termos de uso e a FAQ central
 * (que reúne todas as perguntas por tema).
 */
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { chavesRotas } from '@/data/rotas';

const texto =
  Object.values(
    import.meta.glob<string>('/src/content/faq/faq.yaml', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  )[0] ?? '';
const faq = parse(texto) as Record<string, { pergunta: string; paginas: string[] }>;

const SEM_FAQ = new Set(['privacidade', 'cookies', 'termos', 'perguntasFrequentes']);
const ids = (glob: Record<string, unknown>) =>
  Object.keys(glob).map((caminho) => caminho.split('/').pop()?.replace(/\.md$/, '') ?? '');
const detalhes = [
  ...ids(import.meta.glob('/src/content/acomodacoes/*.md')).map((id) => `acomodacao:${id}`),
  ...ids(import.meta.glob('/src/content/restaurantes/*.md')).map((id) => `restaurante:${id}`),
  ...ids(import.meta.glob('/src/content/datas-especiais/*.md')).map((id) => `data-especial:${id}`),
  ...ids(import.meta.glob('/src/content/guia/*.md')).map((id) => `guia:${id}`),
  ...ids(import.meta.glob('/src/content/blog/*.md')).map((id) => `post:${id}`),
];
const paginas = [...chavesRotas.filter((chave) => !SEM_FAQ.has(chave)), ...detalhes];
const daPagina = (chave: string) =>
  Object.values(faq).filter(
    ({ paginas: lista }) => lista.includes(chave) || lista.includes('todas'),
  );

describe('FAQs por página', () => {
  it('encontra as páginas e as perguntas', () => {
    expect(paginas.length).toBeGreaterThan(40);
    expect(Object.keys(faq).length).toBeGreaterThan(100);
  });

  it.each(paginas)('%s: exatamente 15 perguntas, sem repetir', (chave) => {
    const perguntas = daPagina(chave).map(({ pergunta }) => pergunta.toLowerCase());
    expect(perguntas).toHaveLength(15);
    expect(new Set(perguntas).size).toBe(15);
  });

  it('toda página tem a pergunta de onde reservar', () => {
    const reserva = Object.values(faq).find(({ paginas: lista }) => lista.includes('todas'));
    expect(reserva?.pergunta).toMatch(/^Onde fazer a sua reserva para o resort all inclusive /);
  });

  it('só usa chaves de páginas que existem', () => {
    const validas = new Set([...paginas, 'todas', 'perguntasFrequentes']);
    const invalidas = Object.values(faq)
      .flatMap(({ paginas: lista }) => lista)
      .filter((chave) => !validas.has(chave));
    expect(invalidas).toEqual([]);
  });
});
