import { describe, expect, it } from 'vitest';

import { operadores } from '@/site.config';

import { operadorComArtigo, porOperador } from './operador';

describe('nome do operador nas frases', () => {
  it('concorda com o artigo de cada perfil', () => {
    expect(operadorComArtigo(operadores.agencia)).toBe('a Resorts Online');
    expect(porOperador(operadores.agencia)).toBe('pela Resorts Online');
    expect(operadorComArtigo(operadores.oficial)).toBe(`o ${operadores.oficial.nome}`);
    expect(porOperador(operadores.oficial)).toBe(`pelo ${operadores.oficial.nome}`);
  });
});
