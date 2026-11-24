/**
 * Regras editoriais das FAQs (AEO): pergunta termina com "?" e a resposta é direta,
 * com 40 a 60 palavras, para poder ser citada isoladamente.
 */
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const texto =
  Object.values(
    import.meta.glob<string>('/src/content/faq/faq.yaml', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  )[0] ?? '';

const faq = parse(texto) as Record<string, { pergunta: string; resposta: string }>;
const palavras = (frase: string) => frase.trim().split(/\s+/).length;

describe('FAQ', () => {
  it('tem perguntas', () => {
    expect(Object.keys(faq).length).toBeGreaterThan(10);
  });

  it.each(Object.entries(faq))('%s: resposta com 40 a 60 palavras', (_id, item) => {
    expect(item.pergunta.endsWith('?')).toBe(true);
    const total = palavras(item.resposta);
    expect(total).toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(60);
  });

  it('não repete perguntas', () => {
    const perguntas = Object.values(faq).map((item) => item.pergunta.toLowerCase());
    expect(new Set(perguntas).size).toBe(perguntas.length);
  });
});
