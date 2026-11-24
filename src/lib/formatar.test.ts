import { describe, expect, it } from 'vitest';

import {
  ESPACO_FIXO,
  dataIso,
  formatarArea,
  formatarData,
  formatarDataCurta,
  formatarDecimal,
  formatarDias,
  formatarFaixaHorario,
  formatarHora,
  formatarLista,
  formatarListaFrase,
  formatarListaOu,
  formatarNumero,
  formatarPeriodo,
  maiusculaInicial,
  minusculaInicial,
  paraAncora,
  terminaNoDiaSeguinte,
} from './formatar';

describe('datas', () => {
  it('formata datas de conteúdo sem deslocar o dia pelo fuso', () => {
    const data = new Date('2026-09-30');
    expect(formatarData(data)).toBe('30 de setembro de 2026');
    expect(formatarDataCurta(data)).toBe('30/09/2026');
    expect(dataIso(data)).toBe('2026-09-30');
  });

  it('aceita string ISO', () => {
    expect(formatarData('2026-12-01')).toBe('1º de dezembro de 2026');
  });

  it('rejeita data inválida', () => {
    expect(() => formatarData('ontem')).toThrow(RangeError);
  });
});

describe('horários', () => {
  it('formata horas cheias e quebradas', () => {
    expect(formatarHora('07:00')).toBe('7h');
    expect(formatarHora('10:30')).toBe('10h30');
    expect(formatarHora('00:00')).toBe('0h');
  });

  it('formata faixas, inclusive as que viram o dia', () => {
    expect(formatarFaixaHorario({ abre: '07:00', fecha: '10:30' })).toBe('7h às 10h30');
    expect(formatarFaixaHorario({ abre: '10:00', fecha: '07:00' })).toBe(
      '10h às 7h do dia seguinte',
    );
    expect(formatarFaixaHorario({ abre: '21:00', fecha: '03:00' })).toBe(
      '21h às 3h do dia seguinte',
    );
    expect(formatarFaixaHorario({ abre: '19:00' })).toBe('a partir das 19h');
  });

  it('identifica faixas que terminam no dia seguinte', () => {
    expect(terminaNoDiaSeguinte({ abre: '21:00', fecha: '03:00' })).toBe(true);
    expect(terminaNoDiaSeguinte({ abre: '09:00', fecha: '18:00' })).toBe(false);
    expect(terminaNoDiaSeguinte({ abre: '19:00' })).toBe(false);
  });

  it('formata dias da semana sem presumir quando a fonte não informa', () => {
    expect(formatarDias(undefined)).toBeNull();
    expect(formatarDias('todos')).toBe('todos os dias');
    expect(formatarDias(['ter', 'sex'])).toBe('terças e sextas');
    expect(formatarDias(['seg', 'qua', 'sab'])).toBe('segundas, quartas e sábados');
  });
});

describe('números e textos', () => {
  it('usa separadores do pt-BR', () => {
    expect(formatarNumero(11441)).toBe('11.441');
    expect(formatarArea(156)).toBe(`156${ESPACO_FIXO}m²`);
    expect(ESPACO_FIXO.charCodeAt(0)).toBe(0xa0);
    expect(formatarDecimal(4.7)).toBe('4,7');
    expect(formatarLista(['Classic', 'Suíte', 'Bangalô'])).toBe('Classic, Suíte e Bangalô');
    expect(formatarListaOu(['19h', '19h30', '20h'])).toBe('19h, 19h30 ou 20h');
    expect(minusculaInicial('À la carte')).toBe('à la carte');
    expect(maiusculaInicial('jardim ou piscina')).toBe('Jardim ou piscina');
    expect(formatarListaFrase(['Cervejas', 'Água', 'Sucos'])).toBe('Cervejas, água e sucos');
  });

  it('gera âncoras sem acentos', () => {
    expect(paraAncora('Onde fica o Summerville?')).toBe('onde-fica-o-summerville');
    expect(paraAncora('  Crianças & bebês ')).toBe('criancas-bebes');
  });
});

describe('formatarPeriodo', () => {
  it('agrupa mês e ano quando possível', () => {
    expect(formatarPeriodo(new Date('2026-10-01'), new Date('2026-10-31'))).toBe(
      '1º a 31 de outubro de 2026',
    );
    expect(formatarPeriodo(new Date('2026-11-15'), new Date('2026-12-31'))).toBe(
      '15 de novembro a 31 de dezembro de 2026',
    );
    expect(formatarPeriodo(new Date('2026-12-01'), new Date('2027-01-31'))).toBe(
      '1º de dezembro de 2026 a 31 de janeiro de 2027',
    );
  });
});
