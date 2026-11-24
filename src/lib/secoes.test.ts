import { describe, expect, it } from 'vitest';

import { alternarFundos } from './secoes';

describe('alternarFundos', () => {
  it('alterna a partir do fundo inicial', () => {
    const proximo = alternarFundos();
    expect([proximo(), proximo(), proximo()]).toEqual(['padrao', 'areia', 'padrao']);
  });

  it('aceita começar pela areia', () => {
    const proximo = alternarFundos('areia');
    expect([proximo(), proximo()]).toEqual(['areia', 'padrao']);
  });
});
