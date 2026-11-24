/** Acomodações em ordem, com a foto de capa resolvida, e textos derivados dos dados. */
import { type CollectionEntry, getCollection } from 'astro:content';

import { beneficiosPremium, comodidadesTodasAcomodacoes } from '@/data/acomodacoes';
import { formatarArea, formatarLista, maiusculaInicial } from '@/lib/formatar';
import { type ImagemResolvida, obterImagem } from '@/lib/imagens';
import type { DadosAcomodacao, ImagemSchema } from '@/lib/schema';

export type Acomodacao = CollectionEntry<'acomodacoes'>;

export interface AcomodacaoComCapa {
  entrada: Acomodacao;
  capa: ImagemResolvida | undefined;
}

export async function acomodacoesOrdenadas(): Promise<Acomodacao[]> {
  return (await getCollection('acomodacoes')).sort((a, b) => a.data.ordem - b.data.ordem);
}

/** Capa dos cartões: a primeira foto real (`undefined` quando não há foto real). */
export async function acomodacoesComCapa(): Promise<AcomodacaoComCapa[]> {
  const entradas = await acomodacoesOrdenadas();
  return Promise.all(
    entradas.map(async (entrada) => ({
      entrada,
      capa: entrada.data.fotos[0] ? await obterImagem(entrada.data.fotos[0]) : undefined,
    })),
  );
}

/** "do Bangalô Exclusive" · "da Suíte Família" (concordância nos títulos). */
export function doNome({ data }: Acomodacao): string {
  return `${data.artigo === 'a' ? 'da' : 'do'} ${data.nome}`;
}

/** Fatos curtos para cartões: "36 m²", "até 4 pessoas". */
export function fatosCurtos({ data }: Acomodacao): string[] {
  return data.areaM2
    ? [formatarArea(data.areaM2), data.capacidade.descricao]
    : [data.capacidade.descricao];
}

/** "Resort e lago" · "Lago". */
export function textoVistas({ data }: Acomodacao): string {
  return maiusculaInicial(formatarLista(data.vistas));
}

/** "2 (térreo e mezanino)" · "1". */
export function textoAmbientes({ data }: Acomodacao): string {
  return data.descricaoAmbientes
    ? `${data.ambientes} (${data.descricaoAmbientes})`
    : String(data.ambientes);
}

/** "1 cama king no térreo e 2 camas de solteiro (0,90 × 2,00 m) no mezanino". */
export function textoCamas({ data }: Acomodacao): string {
  return formatarLista(data.camas);
}

/** Até `limite` destaques para tabelas e cartões (os primeiros diferenciais). */
export function destaquesCurtos({ data }: Acomodacao, limite = 3): string[] {
  return data.diferenciais.slice(0, limite);
}

/** "Sim" / "Não" das colunas booleanas do comparativo. */
export const simOuNao = (valor: boolean): string => (valor ? 'Sim' : 'Não');

/** Linhas do comparativo de todas as categorias (tabela em /acomodacoes/comparativo/). */
export function linhaComparativo(acomodacao: Acomodacao) {
  const { data } = acomodacao;
  return {
    area: data.areaM2 ? formatarArea(data.areaM2) : 'Não informada',
    capacidade: data.capacidade.descricao,
    vista: textoVistas(acomodacao),
    ambientes: textoAmbientes(acomodacao),
    hidromassagem: simOuNao(data.hidromassagem),
    piscinaPrivativa: simOuNao(data.piscinaPrivativa),
    indicadoPara: data.indicadoPara,
  };
}

/**
 * Dados do HotelRoom (JSON-LD), com os mesmos itens exibidos na página: comodidades da
 * categoria, comuns a todas e, nos bangalôs, os benefícios Premium.
 */
export function dadosSchemaAcomodacao(
  acomodacao: Acomodacao,
  imagens: readonly ImagemSchema[],
): DadosAcomodacao {
  const { id, data } = acomodacao;
  return {
    id,
    nome: data.nome,
    descricao: data.resumo,
    ...(data.areaM2 ? { areaM2: data.areaM2 } : {}),
    capacidade: { maxPessoas: data.capacidade.maxPessoas, descricao: data.capacidade.descricao },
    camas: data.camas,
    vista: textoVistas(acomodacao),
    comodidades: [
      ...data.diferenciais,
      ...comodidadesTodasAcomodacoes,
      ...(data.premium ? beneficiosPremium : []),
    ],
    imagens,
  };
}

/** Outras categorias, das mais próximas na ordem às mais distantes. */
export function outrasAcomodacoes<T extends { entrada: Acomodacao }>(
  todas: readonly T[],
  atual: Acomodacao,
  limite = 3,
): T[] {
  return todas
    .filter(({ entrada }) => entrada.id !== atual.id)
    .sort(
      (a, b) =>
        Math.abs(a.entrada.data.ordem - atual.data.ordem) -
          Math.abs(b.entrada.data.ordem - atual.data.ordem) ||
        a.entrada.data.ordem - b.entrada.data.ordem,
    )
    .slice(0, limite);
}
