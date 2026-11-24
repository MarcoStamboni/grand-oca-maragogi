/**
 * Formatação de datas, horários e números em pt-BR.
 * Funções puras, sem dependência do Astro (testadas em formatar.test.ts).
 */
import type { DiaSemana, Horario } from '@/lib/content-schemas';

const LOCALE = 'pt-BR';

/**
 * Datas de conteúdo ("AAAA-MM-DD") viram meia-noite UTC. Formatar em UTC evita
 * que o fuso do servidor de build mude o dia exibido.
 */
const formatoDataLonga = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long', timeZone: 'UTC' });
const formatoDataCurta = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatoLista = new Intl.ListFormat(LOCALE, { style: 'long', type: 'conjunction' });
const formatoListaOu = new Intl.ListFormat(LOCALE, { style: 'long', type: 'disjunction' });

/** "30 de setembro de 2026" · "1º de dezembro de 2026" (primeiro dia do mês em ordinal). */
export function formatarData(data: Date | string): string {
  return formatoDataLonga.format(paraData(data)).replace(/^1 de /, '1º de ');
}

/** "30/09/2026" */
export function formatarDataCurta(data: Date | string): string {
  return formatoDataCurta.format(paraData(data));
}

/** "2026-09-30" (para o atributo `datetime`). */
export function dataIso(data: Date | string): string {
  return paraData(data).toISOString().slice(0, 10);
}

function paraData(data: Date | string): Date {
  const resultado = typeof data === 'string' ? new Date(`${data.slice(0, 10)}T00:00:00Z`) : data;
  if (Number.isNaN(resultado.getTime())) {
    throw new RangeError(`Data inválida: ${String(data)}`);
  }
  return resultado;
}

/** "07:00" → "7h" · "10:30" → "10h30" */
export function formatarHora(hora: string): string {
  const [h = '0', m = '00'] = hora.split(':');
  const horas = String(Number(h));
  return m === '00' ? `${horas}h` : `${horas}h${m}`;
}

/** Converte "HH:MM" em minutos desde a meia-noite. */
function minutos(hora: string): number {
  const [h = '0', m = '0'] = hora.split(':');
  return Number(h) * 60 + Number(m);
}

/** A faixa termina no dia seguinte (ex.: 21h às 3h)? Sem `fecha`, a fonte não diz. */
export function terminaNoDiaSeguinte({ abre, fecha }: Pick<Horario, 'abre' | 'fecha'>): boolean {
  return fecha !== undefined && minutos(fecha) <= minutos(abre);
}

/**
 * "7h às 10h30" · "10h às 7h do dia seguinte" · "a partir das 19h".
 * Não acrescenta dias da semana: use `formatarDias` quando houver.
 */
export function formatarFaixaHorario({ abre, fecha }: Pick<Horario, 'abre' | 'fecha'>): string {
  if (!fecha) return `a partir das ${formatarHora(abre)}`;
  const viraDia = terminaNoDiaSeguinte({ abre, fecha });
  return `${formatarHora(abre)} às ${formatarHora(fecha)}${viraDia ? ' do dia seguinte' : ''}`;
}

const nomesDiasPlural: Record<DiaSemana, string> = {
  seg: 'segundas',
  ter: 'terças',
  qua: 'quartas',
  qui: 'quintas',
  sex: 'sextas',
  sab: 'sábados',
  dom: 'domingos',
};

/** "todos os dias" · "terças e sextas" · `null` quando a fonte não informa. */
export function formatarDias(dias: Horario['dias']): string | null {
  if (!dias) return null;
  if (dias === 'todos') return 'todos os dias';
  return formatarLista(dias.map((dia) => nomesDiasPlural[dia]));
}

/** "a, b e c" */
export function formatarLista(itens: readonly string[]): string {
  return formatoLista.format(itens);
}

/** "a, b ou c" (alternativas, ex.: vista para o jardim ou para a piscina). */
export function formatarListaOu(itens: readonly string[]): string {
  return formatoListaOu.format(itens);
}

/** "Texto" → "texto" (para encaixar uma frase da fonte no meio de outra). */
export function minusculaInicial(texto: string): string {
  return texto.charAt(0).toLocaleLowerCase(LOCALE) + texto.slice(1);
}

/** "texto" → "Texto" (início de frase ou de célula de tabela). */
export function maiusculaInicial(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase(LOCALE) + texto.slice(1);
}

/** ["Cervejas", "Água"] → "Cervejas e água" (itens de lista viram uma frase). */
export function formatarListaFrase(itens: readonly string[]): string {
  return maiusculaInicial(formatarLista(itens.map(minusculaInicial)));
}

/** 11441 → "11.441" */
export function formatarNumero(valor: number): string {
  return valor.toLocaleString(LOCALE);
}

/** Espaço que não quebra linha (U+00A0), gerado pelo código para não virar caractere invisível no arquivo. */
export const ESPACO_FIXO = String.fromCharCode(0xa0);

/** 36 → "36 m²", sem quebra de linha entre o número e a unidade. */
export function formatarArea(metrosQuadrados: number): string {
  return `${formatarNumero(metrosQuadrados)}${ESPACO_FIXO}m²`;
}

/** 4.7 → "4,7" */
export function formatarDecimal(valor: number, casas = 1): string {
  return valor.toLocaleString(LOCALE, {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** Gera um id de âncora a partir de um texto ("Onde fica?" → "onde-fica"). */
export function paraAncora(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const nomesMeses = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

/**
 * Período legível: "1º a 31 de outubro de 2026", "1º de dezembro de 2026 a 31 de janeiro de 2027".
 * Datas em UTC (datas de conteúdo). O primeiro dia do mês sai em ordinal (1º).
 */
export function formatarPeriodo(inicio: Date, fim: Date): string {
  const dia = (numero: number) => (numero === 1 ? '1º' : String(numero));
  const [di, mi, ai] = [dia(inicio.getUTCDate()), inicio.getUTCMonth(), inicio.getUTCFullYear()];
  const [df, mf, af] = [dia(fim.getUTCDate()), fim.getUTCMonth(), fim.getUTCFullYear()];
  const mes = (indice: number) => nomesMeses[indice] ?? '';
  if (ai === af && mi === mf) return `${di} a ${df} de ${mes(mf)} de ${af}`;
  if (ai === af) return `${di} de ${mes(mi)} a ${df} de ${mes(mf)} de ${af}`;
  return `${di} de ${mes(mi)} de ${ai} a ${df} de ${mes(mf)} de ${af}`;
}

/**
 * Data ou período de uma ocorrência: "25 de dezembro de 2026" (um dia) ou "6 a 10 de fevereiro
 * de 2027" (período).
 */
export function formatarOcorrencia({ inicio, fim }: { inicio: Date; fim: Date }): string {
  return inicio.getTime() === fim.getTime() ? formatarData(inicio) : formatarPeriodo(inicio, fim);
}

const formatoMoeda = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** "R$ 1.990" (sem centavos, com espaço fixo entre o símbolo e o valor). */
export function formatarPreco(valor: number): string {
  return formatoMoeda.format(valor).replace(/\s/u, ESPACO_FIXO);
}
