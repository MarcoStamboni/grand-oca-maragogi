/**
 * Atividades de lazer publicadas e textos derivados dos dados.
 * Itens `status: a-confirmar` nunca aparecem nas páginas.
 */
import { type CollectionEntry, getCollection } from 'astro:content';

import { formatarDias, formatarFaixaHorario, maiusculaInicial } from '@/lib/formatar';
import { type ImagemResolvida, obterImagem } from '@/lib/imagens';

export type Atividade = CollectionEntry<'atividades'>;

export interface AtividadeComFoto {
  atividade: Atividade;
  foto: ImagemResolvida | undefined;
}

/** Atividades confirmadas, na ordem do arquivo de conteúdo. */
export async function atividadesPublicadas(): Promise<Atividade[]> {
  return getCollection('atividades', ({ data }) => data.status === 'confirmado');
}

/** Seleciona atividades pelo id, na ordem pedida (erro claro se faltar alguma). */
export function selecionar(atividades: readonly Atividade[], ids: readonly string[]): Atividade[] {
  return ids.map((id) => {
    const encontrada = atividades.find((atividade) => atividade.id === id);
    if (!encontrada) throw new Error(`Atividade não publicada ou inexistente: ${id}`);
    return encontrada;
  });
}

export async function comFoto(atividades: readonly Atividade[]): Promise<AtividadeComFoto[]> {
  return Promise.all(
    atividades.map(async (atividade) => ({
      atividade,
      foto: atividade.data.fotos[0] ? await obterImagem(atividade.data.fotos[0]) : undefined,
    })),
  );
}

/**
 * "Incluso no all inclusive" · "Pago à parte". `null` quando a fonte não informa
 * (`nao-informado`): as páginas não afirmam nem uma coisa nem outra.
 */
export function textoCobranca({ data }: Atividade): string | null {
  if (data.cobranca === 'incluso') return 'Incluso no all inclusive';
  if (data.cobranca === 'pago') return 'Pago à parte';
  return null;
}

/** "5h às 21h, todos os dias" · "Conforme a programação" · `null` sem informação. */
export function textoHorarioAtividade({ data }: Atividade): string | null {
  if (data.horarios.length > 0) {
    return data.horarios
      .map((horario) => {
        const dias = formatarDias(horario.dias);
        return `${maiusculaInicial(formatarFaixaHorario(horario))}${dias ? `, ${dias}` : ''}`;
      })
      .join(' · ');
  }
  return data.conformeProgramacao ? 'Conforme a programação' : null;
}
