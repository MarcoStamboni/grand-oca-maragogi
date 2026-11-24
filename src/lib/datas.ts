/**
 * Datas de referência do conteúdo e regras das datas especiais: feriados com data calculada
 * (fixos ou móveis, a partir da Páscoa) e temporadas com vigência. Funções puras e testadas.
 * Como o site é estático, as datas são calculadas no build: agende builds periódicos.
 */
import type { Oferta } from '@/lib/content-schemas';
import { site } from '@/site.config';

/** Data em que os fatos foram conferidos na fonte (meta og:updated_time e sitemap). */
export const DATA_CONTEUDO = new Date(`${site.dataColetaFonte}T00:00:00Z`);

/** Última revisão das páginas legais (privacidade, termos e cookies). */
export const DATA_POLITICAS = new Date('2026-10-06T00:00:00Z');

const DIA_MS = 86_400_000;

/** Meia-noite UTC do dia informado (datas de conteúdo são dias, sem horário). */
export function inicioDoDia(data: Date): Date {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * DIA_MS);
}

/** Domingo de Páscoa do ano (algoritmo de Meeus/Jones/Butcher, calendário gregoriano). */
export function domingoDePascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

export type Quando =
  | { tipo: 'fixa'; dia: number; mes: number }
  | { tipo: 'pascoa'; deslocamentoDias: number }
  | { tipo: 'periodo'; inicio: Date; fim: Date };

export interface Janela {
  antes: number;
  depois: number;
}

export interface Ocorrencia {
  /** Dia da data em si (o feriado, ou o início da temporada). */
  data: Date;
  inicio: Date;
  fim: Date;
}

/** Data de um feriado fixo ou móvel num ano. */
function dataNoAno(quando: Exclude<Quando, { tipo: 'periodo' }>, ano: number): Date {
  return quando.tipo === 'fixa'
    ? new Date(Date.UTC(ano, quando.mes - 1, quando.dia))
    : somarDias(domingoDePascoa(ano), quando.deslocamentoDias);
}

/**
 * Próxima ocorrência a partir de `hoje`: a deste ano, se o período ainda não acabou; senão, a do
 * ano seguinte. Temporadas (`periodo`) já encerradas devolvem `null` (somem do site).
 */
export function proximaOcorrencia(
  quando: Quando,
  hoje: Date,
  janela: Janela = { antes: 0, depois: 0 },
): Ocorrencia | null {
  const referencia = inicioDoDia(hoje).getTime();
  if (quando.tipo === 'periodo') {
    return quando.fim.getTime() >= referencia
      ? { data: quando.inicio, inicio: quando.inicio, fim: quando.fim }
      : null;
  }
  const anoAtual = new Date(referencia).getUTCFullYear();
  for (const ano of [anoAtual, anoAtual + 1]) {
    const data = dataNoAno(quando, ano);
    const ocorrencia = {
      data,
      inicio: somarDias(data, -janela.antes),
      fim: somarDias(data, janela.depois),
    };
    if (ocorrencia.fim.getTime() >= referencia) return ocorrencia;
  }
  return null;
}

interface ComQuando {
  data: { quando: Quando; janela?: Janela | undefined };
}

/** Datas especiais com a próxima ocorrência, em ordem cronológica (encerradas ficam de fora). */
export function datasEmOrdem<T extends ComQuando>(
  itens: readonly T[],
  hoje: Date,
): { item: T; ocorrencia: Ocorrencia }[] {
  return itens
    .map((item) => ({
      item,
      ocorrencia: proximaOcorrencia(item.data.quando, hoje, item.data.janela),
    }))
    .filter((par): par is { item: T; ocorrencia: Ocorrencia } => par.ocorrencia !== null)
    .sort((a, b) => a.ocorrencia.inicio.getTime() - b.ocorrencia.inicio.getTime());
}

/** Oferta ainda válida no dia do build (`validaAte` ausente = sem prazo). `null` = sem preço. */
export function ofertaVigente(oferta: Oferta | undefined, hoje: Date): Oferta | null {
  if (!oferta) return null;
  if (oferta.validaAte && oferta.validaAte.getTime() < inicioDoDia(hoje).getTime()) return null;
  return oferta;
}
