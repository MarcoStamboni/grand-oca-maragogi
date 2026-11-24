import { describe, expect, it } from 'vitest';

import { caminhoDaPagina } from './paginas-dist';

describe('caminhoDaPagina', () => {
  it('converte o arquivo do dist/ no caminho público', () => {
    expect(caminhoDaPagina('index.html')).toBe('/');
    expect(caminhoDaPagina('acomodacoes/classic/index.html')).toBe('/acomodacoes/classic/');
    expect(caminhoDaPagina('404.html')).toBe('/404.html');
  });
});
