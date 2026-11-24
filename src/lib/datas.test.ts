import { describe, expect, it } from 'vitest';

import {
  datasEmOrdem,
  domingoDePascoa,
  inicioDoDia,
  ofertaVigente,
  proximaOcorrencia,
  type Quando,
} from './datas';

const dia = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (data: Date | undefined) => data?.toISOString().slice(0, 10);

describe('domingoDePascoa', () => {
  it.each([
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
  ])('calcula a Páscoa de %i', (ano, esperado) => {
    expect(iso(domingoDePascoa(ano))).toBe(esperado);
  });
});

describe('proximaOcorrencia', () => {
  const natal: Quando = { tipo: 'fixa', dia: 25, mes: 12 };
  const carnaval: Quando = { tipo: 'pascoa', deslocamentoDias: -47 };

  it('usa a data deste ano enquanto ela não passou', () => {
    expect(iso(proximaOcorrencia(natal, dia('2026-10-07'))?.data)).toBe('2026-12-25');
  });

  it('passa para o ano seguinte depois da data', () => {
    expect(iso(proximaOcorrencia(natal, dia('2026-12-26'))?.data)).toBe('2027-12-25');
  });

  it('calcula feriados móveis a partir da Páscoa', () => {
    // Páscoa de 2027: 28/03 → terça de Carnaval 47 dias antes.
    expect(iso(proximaOcorrencia(carnaval, dia('2026-10-07'))?.data)).toBe('2027-02-09');
  });

  it('aplica a janela e mantém a data enquanto o período não acabou', () => {
    const ocorrencia = proximaOcorrencia(natal, dia('2026-12-26'), { antes: 2, depois: 1 });
    expect(iso(ocorrencia?.inicio)).toBe('2026-12-23');
    expect(iso(ocorrencia?.fim)).toBe('2026-12-26');
  });

  it('devolve null para temporadas encerradas', () => {
    const ferias: Quando = { tipo: 'periodo', inicio: dia('2026-07-01'), fim: dia('2026-07-31') };
    expect(proximaOcorrencia(ferias, dia('2026-08-01'))).toBeNull();
    expect(iso(proximaOcorrencia(ferias, dia('2026-07-31'))?.inicio)).toBe('2026-07-01');
  });
});

describe('datasEmOrdem', () => {
  it('ordena pela próxima ocorrência e tira as encerradas', () => {
    const itens = [
      { id: 'natal', data: { quando: { tipo: 'fixa', dia: 25, mes: 12 } as Quando } },
      { id: 'criancas', data: { quando: { tipo: 'fixa', dia: 12, mes: 10 } as Quando } },
      {
        id: 'julho',
        data: {
          quando: { tipo: 'periodo', inicio: dia('2026-07-01'), fim: dia('2026-07-31') } as Quando,
        },
      },
    ];
    expect(datasEmOrdem(itens, dia('2026-10-07')).map(({ item }) => item.id)).toEqual([
      'criancas',
      'natal',
    ]);
  });
});

describe('ofertaVigente', () => {
  const oferta = { aPartirDe: 1990, por: 'pessoa' as const, validaAte: dia('2026-10-31') };

  it('mantém a oferta até o último dia', () => {
    expect(ofertaVigente(oferta, new Date('2026-10-31T22:00:00Z'))).toBe(oferta);
  });

  it('remove a oferta vencida e a ausente', () => {
    expect(ofertaVigente(oferta, dia('2026-11-01'))).toBeNull();
    expect(ofertaVigente(undefined, dia('2026-11-01'))).toBeNull();
  });
});

describe('inicioDoDia', () => {
  it('normaliza para o início do dia em UTC', () => {
    expect(inicioDoDia(new Date('2026-09-30T23:59:00Z')).toISOString()).toBe(
      '2026-09-30T00:00:00.000Z',
    );
  });
});
