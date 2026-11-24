import { describe, expect, it } from 'vitest';

import { avisosMetadados, descricaoComReservas, urlCanonica } from './seo';

describe('urlCanonica', () => {
  const base = 'https://exemplo.com.br';

  it('garante barra final e remove query e âncora', () => {
    expect(urlCanonica('/acomodacoes', base)).toBe('https://exemplo.com.br/acomodacoes/');
    expect(urlCanonica('/acomodacoes/?utm=x#topo', base)).toBe(
      'https://exemplo.com.br/acomodacoes/',
    );
    expect(urlCanonica('/', base)).toBe('https://exemplo.com.br/');
  });

  it('não acrescenta barra em arquivos', () => {
    expect(urlCanonica('/404.html', base)).toBe('https://exemplo.com.br/404.html');
  });
});

describe('avisosMetadados', () => {
  it('aceita o padrão de título com a central e a descrição de até 150 caracteres', () => {
    expect(
      avisosMetadados(
        'Comparativo das acomodações do Grand Oca Maragogi | Reservas 0800 737 6787',
        'Compare as acomodações do Grand Oca Maragogi Resort: área, capacidade e vista. Reservas 0800 737 6787',
      ),
    ).toEqual([]);
  });

  it('avisa quando passam dos limites', () => {
    expect(avisosMetadados('x'.repeat(130), 'curta')).toHaveLength(2);
    expect(avisosMetadados('Título válido da página', 'x'.repeat(151))).toHaveLength(1);
  });
});

describe('descricaoComReservas', () => {
  it('acrescenta a central de reservas ao fim, com ponto antes', () => {
    expect(descricaoComReservas('Texto da página', 'Reservas 0800 737 6787')).toBe(
      'Texto da página. Reservas 0800 737 6787',
    );
    expect(descricaoComReservas('Texto. Reservas 0800 737 6787', 'Reservas 0800 737 6787')).toBe(
      'Texto. Reservas 0800 737 6787',
    );
  });
});
