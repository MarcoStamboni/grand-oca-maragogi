import { describe, expect, it } from 'vitest';

import { nomesIcones, obterIcone } from './icones';

describe('ícones', () => {
  it('todos os nomes do conjunto existem nos pacotes de ícones', () => {
    for (const nome of nomesIcones) {
      const icone = obterIcone(nome);
      expect(icone.nos.length).toBeGreaterThan(0);
    }
  });
});
