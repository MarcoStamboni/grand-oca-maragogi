/**
 * Registro das rotas fixas do site (mapa das páginas: template-resort-all-inclusive/replicar-site-resort.md).
 * Alimenta menu, rodapé, breadcrumbs, links internos e sitemap.
 * Páginas de detalhe geradas por coleções (acomodações, restaurantes, datas especiais,
 * guia, blog) têm o caminho montado pelos helpers no fim deste arquivo.
 * Import relativo (sem `@/`): este arquivo também é lido pelo astro.config.ts.
 */
import { type OperadorId, recursos, resort } from '../site.config.ts';

export interface Rota {
  caminho: `/${string}`;
  /** Rótulo curto para navegação e breadcrumbs (não é o <title>). */
  rotulo: string;
  pai?: RotaChave;
  /** Rota que só existe para um dos operadores (decisão 1). */
  somenteOperador?: OperadorId;
  /** Recurso desligado em `recursos` (site.config.ts): fora do menu, dos links e do sitemap. */
  desligada?: boolean;
}

/** Guia do destino: o caminho usa o nome que as pessoas buscam (ex.: /porto-de-galinhas/). */
const caminhoDestino = `/${resort.destino.slug}/` as const;

const definicao = {
  home: { caminho: '/', rotulo: 'Início' },

  resort: { caminho: '/o-resort/', rotulo: 'O resort', pai: 'home' },
  servicos: { caminho: '/o-resort/servicos/', rotulo: 'Serviços e comodidades', pai: 'resort' },
  fotos: { caminho: '/fotos/', rotulo: 'Fotos', pai: 'home' },

  acomodacoes: { caminho: '/acomodacoes/', rotulo: 'Acomodações', pai: 'home' },
  comparativo: {
    caminho: '/acomodacoes/comparativo/',
    rotulo: 'Comparativo',
    pai: 'acomodacoes',
  },

  allInclusive: { caminho: '/all-inclusive/', rotulo: 'All inclusive', pai: 'home' },
  restaurantes: {
    caminho: '/all-inclusive/restaurantes/',
    rotulo: 'Restaurantes',
    pai: 'allInclusive',
  },
  bares: { caminho: '/all-inclusive/bares/', rotulo: 'Bares', pai: 'allInclusive' },

  lazer: { caminho: '/lazer/', rotulo: 'Lazer', pai: 'home' },
  piscinas: { caminho: '/lazer/piscinas/', rotulo: 'Piscinas', pai: 'lazer' },
  criancas: { caminho: '/lazer/criancas/', rotulo: 'Crianças', pai: 'lazer' },
  esportes: { caminho: '/lazer/esportes/', rotulo: 'Esportes', pai: 'lazer' },

  bemEstar: { caminho: '/bem-estar/', rotulo: 'Spa e bem-estar', pai: 'home' },
  experiencias: { caminho: '/experiencias/', rotulo: 'Experiências', pai: 'home' },
  datasEspeciais: { caminho: '/datas-especiais/', rotulo: 'Feriados e datas', pai: 'home' },

  destino: { caminho: caminhoDestino, rotulo: resort.destino.nome, pai: 'home' },
  blog: { caminho: '/blog/', rotulo: 'Blog', pai: 'home' },

  comoChegar: { caminho: '/como-chegar/', rotulo: 'Como chegar', pai: 'home' },
  outrosResorts: {
    caminho: '/outros-resorts/',
    rotulo: 'Outros resorts',
    pai: 'home',
    somenteOperador: 'agencia',
    desligada: !recursos.outrosResorts,
  },

  reservas: { caminho: '/reservas/', rotulo: 'Reservas', pai: 'home' },
  reservasHospedagem: {
    caminho: '/reservas/hospedagem/',
    rotulo: 'Só hospedagem',
    pai: 'reservas',
    somenteOperador: 'agencia',
  },
  reservasPacoteComAereo: {
    caminho: '/reservas/pacote-com-aereo/',
    rotulo: 'Hotel + aéreo',
    pai: 'reservas',
    somenteOperador: 'agencia',
  },
  politicaHospedagem: {
    caminho: '/politica-de-hospedagem/',
    rotulo: 'Política de hospedagem',
    pai: 'home',
  },
  perguntasFrequentes: {
    caminho: '/perguntas-frequentes/',
    rotulo: 'Perguntas frequentes',
    pai: 'home',
  },
  contato: { caminho: '/fale-conosco/', rotulo: 'Fale conosco', pai: 'home' },
  quemSomos: { caminho: '/quem-somos/', rotulo: 'Quem somos', pai: 'home' },

  privacidade: {
    caminho: '/politica-de-privacidade/',
    rotulo: 'Política de privacidade',
    pai: 'home',
  },
  termos: { caminho: '/termos-de-uso/', rotulo: 'Termos de uso', pai: 'home' },
  cookies: { caminho: '/politica-de-cookies/', rotulo: 'Política de cookies', pai: 'home' },
} as const satisfies Record<string, Omit<Rota, 'pai'> & { pai?: string }>;

export type RotaChave = keyof typeof definicao;

export const rotas: Readonly<Record<RotaChave, Rota>> = definicao;

export const chavesRotas = Object.keys(definicao) as RotaChave[];

// Caminhos de páginas de detalhe (coleções de conteúdo).
export const caminhoAcomodacao = (id: string) => `/acomodacoes/${id}/` as const;
export const caminhoRestaurante = (id: string) => `/all-inclusive/restaurantes/${id}/` as const;
export const caminhoDataEspecial = (id: string) => `/datas-especiais/${id}/` as const;
export const caminhoGuia = (id: string) => `${caminhoDestino}${id}/` as const;
export const caminhoPost = (id: string) => `/blog/${id}/` as const;
