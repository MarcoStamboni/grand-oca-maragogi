import { describe, expect, it } from 'vitest';

import { iconeDoTexto } from './icone-do-texto';
import { nomesIcones } from './icones';

describe('iconeDoTexto', () => {
  it.each([
    ['Ar-condicionado', 'ar'],
    ['Wi-Fi', 'wifi'],
    ['TV a cabo', 'tv'],
    ['Frigobar', 'frigobar'],
    ['Cofre', 'cofre'],
    ['Secador de cabelo', 'secador'],
    ['Acomodação para não fumantes', 'sem-fumo'],
    ['Vista para o mar', 'ondas'],
    ['Varanda com espreguiçadeiras', 'poltrona'],
    ['Piscina infantil com toboágua', 'bebe'],
    ['Piscina privativa', 'piscina'],
    ['Banheira de hidromassagem', 'banheira'],
  ])('%s → %s', (texto, icone) => {
    expect(iconeDoTexto(texto)).toBe(icone);
  });

  it('usa o check quando nada combina', () => {
    expect(iconeDoTexto('Item qualquer')).toBe('check');
  });

  it('só devolve ícones que existem no conjunto', () => {
    for (const texto of ['Ar-condicionado', 'Wi-Fi', 'Cofre', 'Premium', 'Transfer']) {
      expect(nomesIcones).toContain(iconeDoTexto(texto));
    }
  });
});

describe('iconeDoTexto (cardápio, feriados e políticas)', () => {
  it.each([
    ['Água de coco', 'copo'],
    ['Ilha de saladas e frutas da estação', 'salada'],
    ['Ceia de Natal incluída no all inclusive', 'festa'],
    ['Lavanderia: lavagem e passadoria', 'camisa'],
    ['Recreação por faixa etária', 'bebe'],
    ['Maior metragem do resort (60 m²)', 'area'],
  ])('%s → %s', (texto, icone) => {
    expect(iconeDoTexto(texto)).toBe(icone);
  });
});
