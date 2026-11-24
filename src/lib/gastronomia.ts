/**
 * Restaurantes e bares em ordem, e textos de horário derivados dos dados.
 */
import { type CollectionEntry, getCollection } from 'astro:content';

import type { Horario } from '@/lib/content-schemas';
import {
  formatarFaixaHorario,
  formatarHora,
  formatarLista,
  formatarListaOu,
  maiusculaInicial,
  minusculaInicial,
  terminaNoDiaSeguinte,
} from '@/lib/formatar';
import type { DadosBar, DadosRestaurante, ImagemSchema } from '@/lib/schema';

export type Restaurante = CollectionEntry<'restaurantes'>;
export type Bar = CollectionEntry<'bares'>;
export type Refeicao = Restaurante['data']['horarios'][number]['refeicao'];

const porOrdem = <T extends { data: { ordem: number } }>(a: T, b: T) => a.data.ordem - b.data.ordem;

export async function restaurantesOrdenados(): Promise<Restaurante[]> {
  return (await getCollection('restaurantes')).sort(porOrdem);
}

export async function baresOrdenados(): Promise<Bar[]> {
  return (await getCollection('bares')).sort(porOrdem);
}

export const refeicoes: readonly { id: Refeicao; rotulo: string }[] = [
  { id: 'cafe-da-manha', rotulo: 'Café da manhã' },
  { id: 'almoco', rotulo: 'Almoço' },
  { id: 'jantar', rotulo: 'Jantar' },
];

const tiposRestaurante: Record<Restaurante['data']['tipo'], string> = {
  principal: 'Restaurante principal',
  'a-la-carte': 'Restaurante à la carte',
  piscina: 'Restaurante da piscina',
  infantil: 'Restaurante infantil',
  casual: 'Espaço gastronômico',
};

export function textoTipo({ data }: Restaurante): string {
  return tiposRestaurante[data.tipo];
}

const opcoesAlimentares: Record<Restaurante['data']['opcoesAlimentares'][number], string> = {
  vegana: 'veganas',
  vegetariana: 'vegetarianas',
  'sem-gluten': 'sem glúten',
  'sem-lactose': 'sem lactose',
};

/** ["veganas", "vegetarianas", "sem glúten", "sem lactose"] (concordam com "opções"). */
export function textosOpcoesAlimentares({ data }: Restaurante): string[] {
  return data.opcoesAlimentares.map((opcao) => opcoesAlimentares[opcao]);
}

/** Dados do Restaurant (JSON-LD), com os mesmos itens exibidos na página. */
export function dadosSchemaRestaurante(
  restaurante: Restaurante,
  imagens: readonly ImagemSchema[],
): DadosRestaurante {
  const { id, data } = restaurante;
  return {
    id,
    nome: data.nome,
    descricao: data.resumo,
    cozinhas: data.cozinhas,
    aceitaReservas: data.reserva?.obrigatoria === true,
    dietas: data.opcoesAlimentares.map((tipo) => ({
      tipo,
      nome: `Opções ${opcoesAlimentares[tipo]}`,
    })),
    imagens,
  };
}

/** Dados do BarOrPub (JSON-LD): nome, resumo e a foto do cartão. */
export function dadosSchemaBar({ id, data }: Bar, imagens: readonly ImagemSchema[]): DadosBar {
  return { id, nome: data.nome, descricao: data.resumo, imagens };
}

/** Horários de entrada com reserva: "19h ou 21h". `null` sem horários de reserva. */
export function textoHorariosReserva({ data }: Restaurante): string | null {
  const horarios = data.reserva?.horarios ?? [];
  return horarios.length > 0 ? formatarListaOu(horarios.map(formatarHora)) : null;
}

export function rotuloRefeicao(refeicao: Refeicao): string {
  return refeicoes.find(({ id }) => id === refeicao)?.rotulo ?? refeicao;
}

/**
 * Horário de uma refeição: "7h às 10h30" · "7h às 11h (à la carte, exclusivo para hóspedes
 * dos bangalôs)". Sem horário de fechamento e com reserva, mostra as entradas possíveis
 * ("Com reserva, às 19h ou 21h"), que é o que a fonte informa.
 */
export function textoHorarioRestaurante(
  restaurante: Restaurante,
  horario: Restaurante['data']['horarios'][number],
): string {
  const entradas = textoHorariosReserva(restaurante);
  const faixa =
    !horario.fecha && entradas ? `com reserva, às ${entradas}` : formatarFaixaHorario(horario);
  const extra =
    horario.fecha && horario.observacao ? ` (${minusculaInicial(horario.observacao)})` : '';
  return `${maiusculaInicial(faixa)}${extra}`;
}

/**
 * Célula da tabela de refeições. Quando o rótulo do horário não é o da refeição, ele vem
 * antes ("Diurno: 10h às 18h"). `null` = o restaurante não serve essa refeição.
 */
export function celulaRefeicao(restaurante: Restaurante, refeicao: Refeicao): string | null {
  const textos = restaurante.data.horarios
    .filter((horario) => horario.refeicao === refeicao)
    .map((horario) => {
      const prefixo =
        horario.rotulo && horario.rotulo !== rotuloRefeicao(refeicao) ? `${horario.rotulo}: ` : '';
      return `${prefixo}${textoHorarioRestaurante(restaurante, horario)}`;
    });
  return textos.length > 0 ? textos.join(' · ') : null;
}

/** "Café da manhã, almoço e jantar" (refeições servidas, sem repetir). */
export function textoRefeicoes({ data }: Restaurante): string {
  const servidas = refeicoes.filter(({ id }) => data.horarios.some((h) => h.refeicao === id));
  return maiusculaInicial(formatarLista(servidas.map(({ rotulo }) => minusculaInicial(rotulo))));
}

/**
 * Horário de bar: "Cafeteria e bar: 10h às 7h do dia seguinte" ·
 * "10h às 15h (varia conforme a maré)".
 */
export function textoHorario(horario: Horario): string {
  const faixa = formatarFaixaHorario(horario);
  const extra = horario.observacao ? ` (${minusculaInicial(horario.observacao)})` : '';
  return `${horario.rotulo ? `${horario.rotulo}: ` : ''}${faixa}${extra}`;
}

export const areasBares: Record<Bar['data']['area'], string> = {
  lobby: 'No lobby',
  piscina: 'Na piscina',
  praia: 'Na praia',
  noite: 'À noite',
  lago: 'À beira do lago',
};

/** Bares com algum horário que atravessa a meia-noite (abertos de madrugada). */
export function baresDeMadrugada(bares: readonly Bar[]): { bar: Bar; horarios: Horario[] }[] {
  return bares
    .map((bar) => ({ bar, horarios: bar.data.horarios.filter(terminaNoDiaSeguinte) }))
    .filter(({ horarios }) => horarios.length > 0);
}

const servicos: Record<Restaurante['data']['servico'], string> = {
  buffet: 'Buffet',
  'a-la-carte': 'À la carte',
  'buffet-e-a-la-carte': 'Buffet e à la carte',
  casual: 'Pizzaria, hamburgueria, pastéis e sorveteria',
};

/** "Buffet" · "À la carte". */
export function textoServico({ data }: Restaurante): string {
  return servicos[data.servico];
}
