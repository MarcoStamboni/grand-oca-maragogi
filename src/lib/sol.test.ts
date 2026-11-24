import { describe, expect, it } from 'vitest';

import { horariosDoSol, progressoDoDia } from './sol';

// Coordenadas do resort (src/site.config.ts).
const LATITUDE = -8.435569;
const LONGITUDE = -34.9809301;

/** Minutos entre duas datas (valor absoluto). */
const diferenca = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60_000;

describe('horariosDoSol', () => {
  it('calcula o nascer e o pôr do sol perto do equinócio de março', () => {
    // Conta à mão: a longitude de −35° põe o meio-dia solar 40 min antes das 12h de UTC−3, a
    // equação do tempo (≈ −7,5 min) o atrasa para ≈ 11h27, e o dia dura ≈ 12h07 no equinócio:
    // nascer ≈ 05h24 e pôr ≈ 17h31 (UTC−3).
    const { nascer, por } = horariosDoSol(new Date('2026-03-20T12:00:00Z'), LATITUDE, LONGITUDE);
    expect(diferenca(nascer, new Date('2026-03-20T08:24:00Z'))).toBeLessThan(3);
    expect(diferenca(por, new Date('2026-03-20T20:31:00Z'))).toBeLessThan(3);
  });

  it('dá dias mais longos no verão do hemisfério sul', () => {
    const dezembro = horariosDoSol(new Date('2026-12-21T12:00:00Z'), LATITUDE, LONGITUDE);
    const junho = horariosDoSol(new Date('2026-06-21T12:00:00Z'), LATITUDE, LONGITUDE);
    const duracao = ({ nascer, por }: typeof junho) => por.getTime() - nascer.getTime();
    expect(duracao(dezembro)).toBeGreaterThan(duracao(junho));
  });
});

describe('progressoDoDia', () => {
  const dia = {
    nascer: new Date('2026-03-20T08:30:00Z'),
    por: new Date('2026-03-20T20:30:00Z'),
  };

  it('vai de 0 no nascer a 1 no pôr do sol', () => {
    expect(progressoDoDia(dia.nascer, dia)).toBe(0);
    expect(progressoDoDia(new Date('2026-03-20T14:30:00Z'), dia)).toBe(0.5);
    expect(progressoDoDia(dia.por, dia)).toBe(1);
  });

  it('é nulo à noite', () => {
    expect(progressoDoDia(new Date('2026-03-20T23:00:00Z'), dia)).toBeNull();
  });
});
