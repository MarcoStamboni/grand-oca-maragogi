/**
 * Menu principal (ordem do site do Grand Oca: o resort, acomodações, all inclusive, lazer e
 * destino, com a localização e o como chegar dentro do destino). As acomodações e o guia vêm das coleções de conteúdo.
 * O próprio tópico é o link da página-mãe, e o primeiro subitem repete essa página com um rótulo
 * de visão geral (ex.: "Conheça o resort"), para ela não ficar escondida quando o submenu abre
 * ao passar o mouse.
 */
import { getCollection } from 'astro:content';

import { caminhoAcomodacao, caminhoGuia, rotas } from '@/data/rotas';
import { type Link, linkRota, linksDisponiveis } from '@/lib/navegacao';

export interface ItemMenu extends Link {
  /** Subitens exibidos no submenu (desktop) e no menu do celular. */
  filhos: Link[];
}

/** Primeiro subitem: a própria página do tópico, com o rótulo de visão geral. */
function comVisaoGeral(topo: Link, rotulo: string, filhos: Link[]): ItemMenu {
  return { ...topo, filhos: [{ rotulo, href: topo.href }, ...filhos] };
}

export async function menuPrincipal(): Promise<ItemMenu[]> {
  const [acomodacoes, guia] = await Promise.all([
    getCollection('acomodacoes'),
    getCollection('guia'),
  ]);
  const porOrdem = <T extends { data: { ordem: number } }>(a: T, b: T) =>
    a.data.ordem - b.data.ordem;

  return [
    comVisaoGeral(
      linkRota('resort'),
      'Conheça o resort',
      linksDisponiveis(['servicos', 'fotos', 'experiencias', 'datasEspeciais', 'outrosResorts']),
    ),
    comVisaoGeral(linkRota('acomodacoes'), 'Todas as acomodações', [
      linkRota('comparativo', 'Comparar acomodações'),
      ...acomodacoes.sort(porOrdem).map((item) => ({
        rotulo: item.data.nome,
        href: caminhoAcomodacao(item.id),
      })),
    ]),
    comVisaoGeral(
      linkRota('allInclusive'),
      'Como funciona o all inclusive',
      linksDisponiveis(['restaurantes', 'bares']),
    ),
    comVisaoGeral(
      linkRota('lazer', 'Lazer e família'),
      'Lazer e entretenimento',
      linksDisponiveis(['piscinas', 'criancas', 'esportes', 'bemEstar']),
    ),
    comVisaoGeral(linkRota('destino', 'Destino'), `Conheça ${rotas.destino.rotulo}`, [
      linkRota('comoChegar', 'Localização e como chegar'),
      ...guia
        .sort(porOrdem)
        .map((item) => ({ rotulo: item.data.titulo, href: caminhoGuia(item.id) })),
    ]),
  ];
}
