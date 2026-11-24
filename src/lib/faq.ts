/** Perguntas frequentes por página e por tema, na ordem definida no conteúdo. */
import { type CollectionEntry, getCollection } from 'astro:content';

import type { ItemFaq } from '@/components/ui/Faq.astro';
import type { temasFaq } from '@/content.config';
import { resort } from '@/site.config';

export type TemaFaq = (typeof temasFaq)[number];

export const titulosTemas: Record<TemaFaq, string> = {
  resort: 'O resort',
  localizacao: 'Localização e como chegar',
  hospedagem: 'Hospedagem e acomodações',
  'all-inclusive': 'All inclusive e gastronomia',
  lazer: 'Lazer e crianças',
  reservas: 'Reservas e políticas',
  destino: resort.destino.nome,
};

/** Parágrafo de cada tema na FAQ central. */
export const introducoesTemas: Record<TemaFaq, string> = {
  resort: `O que é o ${resort.nomeCurto}, para quem ele é indicado e o que o resort oferece em estrutura e serviços.`,
  localizacao: `Onde fica o ${resort.nomeCurto}, qual é o aeroporto mais próximo e como ir do aeroporto até o resort.`,
  hospedagem: `Categorias de acomodação, capacidade, check-in e check-out e o que cada quarto oferece.`,
  'all-inclusive': `O que está incluído no all inclusive, como funcionam os restaurantes e os bares e o que é pago à parte.`,
  lazer: `Piscinas, recreação infantil por idade, esportes, spa e a programação de entretenimento do resort.`,
  reservas: `Como reservar, regras para crianças, cancelamento e as políticas que valem durante a estadia.`,
  destino: `Recifes, piscinas naturais, praias e o que conhecer ${resort.destino.em} ${resort.destino.nome}.`,
};

const paraItem = ({ id, data }: CollectionEntry<'faq'>): ItemFaq => ({
  id,
  pergunta: data.pergunta,
  resposta: data.resposta,
});

const porOrdem = (a: CollectionEntry<'faq'>, b: CollectionEntry<'faq'>) =>
  a.data.ordem - b.data.ordem;

/** Quantas perguntas cada página indexável mostra (regra AEO da rede: exatamente 15). */
export const PERGUNTAS_POR_PAGINA = 15;

/**
 * Perguntas de uma página: as próprias do assunto e as marcadas para "todas" as páginas (ex.:
 * onde reservar), que entram por último. `chave`: rota fixa ("allInclusive") ou detalhe
 * ("acomodacao:bangalo").
 */
export async function faqDaPagina(chave: string): Promise<ItemFaq[]> {
  const itens = await getCollection(
    'faq',
    ({ data }) => data.paginas.includes(chave) || data.paginas.includes('todas'),
  );
  const proprias = itens.filter(({ data }) => !data.paginas.includes('todas')).sort(porOrdem);
  const gerais = itens.filter(({ data }) => data.paginas.includes('todas')).sort(porOrdem);
  return [...proprias, ...gerais].map(paraItem);
}

/**
 * Quantas perguntas cada tema mostra na página central. As demais continuam publicadas na página
 * do assunto de cada uma (toda pergunta pertence a uma página do site). Sem esse limite, a página
 * central juntaria as centenas de perguntas do site inteiro num documento só: pesado de carregar
 * no celular e difícil de percorrer.
 */
export const PERGUNTAS_POR_TEMA = 20;

/** Página que reúne o assunto de cada tema ("ver todas as perguntas sobre..."). */
export const paginaDoTema: Record<TemaFaq, string> = {
  resort: '/o-resort/',
  localizacao: '/como-chegar/',
  hospedagem: '/acomodacoes/',
  'all-inclusive': '/all-inclusive/',
  lazer: '/lazer/',
  reservas: '/reservas/',
  destino: `/${resort.destino.slug}/`,
};

/**
 * O tema no meio da frase ("mais 32 perguntas sobre o resort"). É escrito à mão, e não derivado
 * do título: o do destino é nome próprio e mantém a maiúscula.
 */
export const rotuloDoTema: Record<TemaFaq, string> = {
  resort: 'o resort',
  localizacao: 'localização e como chegar',
  hospedagem: 'hospedagem e acomodações',
  'all-inclusive': 'all inclusive e gastronomia',
  lazer: 'lazer e crianças',
  reservas: 'reservas e políticas',
  destino: resort.destino.nome,
};

export interface GrupoFaq {
  tema: TemaFaq;
  titulo: string;
  introducao: string;
  itens: ItemFaq[];
  /** Quantas perguntas o tema tem no site inteiro (pode ser mais do que as exibidas aqui). */
  total: number;
  /** Página do assunto, para quem quiser as outras perguntas do tema. */
  pagina: string;
  /** O tema no meio da frase ("perguntas sobre o resort"). */
  rotulo: string;
}

/**
 * Perguntas da página central, agrupadas por tema (na ordem de `titulosTemas`) e limitadas a
 * `PERGUNTAS_POR_TEMA`. Vêm primeiro as que não aparecem em nenhuma outra página do site, para
 * nenhuma resposta ficar fora do ar.
 */
export async function faqPorTema(): Promise<GrupoFaq[]> {
  // Sem repetir a mesma pergunta (o mesmo texto pode servir a páginas diferentes).
  const vistas = new Set<string>();
  const todas = (await getCollection('faq')).sort(porOrdem).filter(({ data }) => {
    const chave = data.pergunta.trim().toLowerCase();
    if (vistas.has(chave)) return false;
    vistas.add(chave);
    return true;
  });
  /** Só na página central: não entra em nenhuma página de assunto. */
  const soNaCentral = ({ data }: CollectionEntry<'faq'>) =>
    data.paginas.length === 1 && data.paginas[0] === 'perguntasFrequentes';
  return (Object.keys(titulosTemas) as TemaFaq[])
    .map((tema) => {
      const doTema = todas.filter((item) => item.data.tema === tema);
      const ordenadas = [...doTema.filter(soNaCentral), ...doTema.filter((i) => !soNaCentral(i))];
      return {
        tema,
        titulo: titulosTemas[tema],
        introducao: introducoesTemas[tema],
        itens: ordenadas.slice(0, PERGUNTAS_POR_TEMA).map(paraItem),
        total: doTema.length,
        pagina: paginaDoTema[tema],
        rotulo: rotuloDoTema[tema],
      };
    })
    .filter((grupo) => grupo.itens.length > 0);
}
