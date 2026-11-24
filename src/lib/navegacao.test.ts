import { describe, expect, it } from 'vitest';

import { chavesRotas, rotas } from '@/data/rotas';

import { gruposRodape, linksInstitucionais, rotaDisponivel, trilha } from './navegacao';

describe('registro de rotas', () => {
  it('usa caminhos em minúsculas, sem acento e com barra final', () => {
    for (const chave of chavesRotas) {
      expect(rotas[chave].caminho).toMatch(/^\/([a-z0-9-]+\/)*$/);
    }
  });

  it('não repete caminhos', () => {
    const caminhos = chavesRotas.map((chave) => rotas[chave].caminho);
    expect(new Set(caminhos).size).toBe(caminhos.length);
  });

  it('todo pai existe e a hierarquia espelha o caminho', () => {
    for (const chave of chavesRotas) {
      const { pai, caminho } = rotas[chave];
      if (!pai) continue;
      expect(caminho.startsWith(rotas[pai].caminho)).toBe(true);
    }
  });
});

describe('trilha', () => {
  it('começa em Início e termina na rota', () => {
    expect(trilha('restaurantes')).toEqual([
      { rotulo: 'Início', href: '/' },
      { rotulo: 'All inclusive', href: '/all-inclusive/' },
      { rotulo: 'Restaurantes', href: '/all-inclusive/restaurantes/' },
    ]);
  });

  it('acrescenta itens de detalhe', () => {
    const itens = trilha('acomodacoes', [{ rotulo: 'Classic', href: '/acomodacoes/classic/' }]);
    expect(itens.at(-1)).toEqual({ rotulo: 'Classic', href: '/acomodacoes/classic/' });
    expect(itens).toHaveLength(3);
  });
});

describe('rotas por operador', () => {
  it('esconde rotas exclusivas da agência no site oficial', () => {
    expect(rotaDisponivel('reservasPacoteComAereo', 'agencia')).toBe(true);
    expect(rotaDisponivel('reservasPacoteComAereo', 'oficial')).toBe(false);
    expect(rotaDisponivel('contato', 'oficial')).toBe(true);
  });

  it('monta os grupos do rodapé e o grupo institucional', () => {
    const grupos = gruposRodape();
    expect(grupos.map((grupo) => grupo.titulo)).toEqual([
      'O resort',
      'Hospedagem',
      'Planeje sua viagem',
    ]);
    expect(linksInstitucionais().map((link) => link.href)).toEqual([
      '/quem-somos/',
      '/fale-conosco/',
      '/politica-de-privacidade/',
      '/politica-de-cookies/',
      '/termos-de-uso/',
    ]);
  });
});
