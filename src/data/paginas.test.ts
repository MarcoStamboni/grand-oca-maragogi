/**
 * Regras editoriais dos textos das páginas fixas (src/data/paginas.ts) e da home
 * (src/data/home.ts): tamanhos de título e descrição, descrições únicas e resposta direta
 * de 40 a 60 palavras citando o resort ou o destino (AEO).
 */
import { describe, expect, it } from 'vitest';

import { ENTIDADES_RESPOSTA } from '@/lib/auditoria';
import { descricaoComReservas, LIMITES } from '@/lib/seo';
import { resort, site } from '@/site.config';

import { textosHome } from './home';
import { paginas } from './paginas';

const palavras = (frase: string) => frase.trim().split(/\s+/).length;

describe('textos das páginas fixas', () => {
  it.each(Object.entries(paginas))('%s', (_rota, texto) => {
    // Title = H1 + " | Reservas 0800 737 6787".
    const titulo = site.modeloTitulo.replace('%s', texto.h1);
    expect(titulo.length).toBeGreaterThanOrEqual(LIMITES.titulo.min);
    expect(titulo.length).toBeLessThanOrEqual(LIMITES.titulo.max);
    // Description: até 150 caracteres, com o nome do resort e terminando com a central.
    const descricao = descricaoComReservas(texto.descricao, site.fimDescricao);
    expect(descricao.length).toBeGreaterThanOrEqual(LIMITES.descricao.min);
    expect(descricao.length).toBeLessThanOrEqual(LIMITES.descricao.max);
    expect(descricao.endsWith(site.fimDescricao)).toBe(true);
    expect(descricao).toContain(resort.nomeCurto);
    const total = palavras(texto.respostaDireta);
    expect(total).toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(60);
    expect(ENTIDADES_RESPOSTA.some((nome) => texto.respostaDireta.includes(nome))).toBe(true);
  });

  it('não repetem descrições', () => {
    const descricoes = Object.values(paginas).map(({ descricao }) => descricao);
    expect(new Set(descricoes).size).toBe(descricoes.length);
  });

  it('a resposta direta da home segue a mesma regra', () => {
    const total = palavras(textosHome.respostaDireta);
    expect(total).toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(60);
  });
});
