/**
 * Dados estruturados (JSON-LD, schema.org). Funções puras e testadas: recebem dados simples
 * (do site.config e das coleções) e devolvem os nós do `@graph` de cada página.
 *
 * Regras do projeto aplicadas aqui:
 * - propriedade sem dado na fonte fica de fora (nada presumido, nada inventado);
 * - sem AggregateRating, Review, Offer, preço, priceRange ou starRating (decisões 4 e 7);
 * - `@id` estáveis a partir da URL canônica (`https://.../#resort`, `<página>#webpage`);
 * - o que vai para o JSON-LD é o que a página exibe.
 */
import { comodidadesResort } from '@/data/comodidades';
import {
  caminhoAcomodacao,
  caminhoPost,
  caminhoRestaurante,
  type RotaChave,
  rotas,
} from '@/data/rotas';
import { dataIso } from '@/lib/formatar';
import type { Link } from '@/lib/navegacao';
import { urlCanonica } from '@/lib/seo';
import {
  type Endereco,
  linkMapa,
  type Operador,
  operador as operadorAtivo,
  resort,
  site,
} from '@/site.config';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Nó do grafo: objeto schema.org com `@type`. */
export interface NoSchema {
  '@type': string | readonly string[];
  '@id'?: string;
  [propriedade: string]: unknown;
}

/** Nó com `@id` (pode ser referenciado por outros nós). */
export type NoComId = NoSchema & { '@id': string };

/** Referência a um nó do grafo pelo `@id`. */
export interface Referencia {
  '@id': string;
}

export interface ImagemSchema {
  /** URL absoluta do arquivo publicado. */
  url: string;
  largura: number;
  altura: number;
  /** Texto alternativo registrado (vira `caption`). */
  legenda: string;
}

export interface PerguntaSchema {
  id?: string;
  pergunta: string;
  resposta: string;
}

export type TipoPagina = 'WebPage' | 'AboutPage' | 'ContactPage' | 'FAQPage';

/** Assunto da página (`about`): o resort, quem opera o site ou o destino. */
export type AssuntoPagina = 'resort' | 'operador' | 'destino';

/** Opções de dados estruturados que uma página repassa ao layout. */
export interface OpcoesDadosEstruturados {
  /** Entidade principal (`mainEntity`): nó completo (vai para o grafo) ou referência. */
  principal?: NoComId | Referencia;
  /** Perguntas exibidas na página (transformam a página em FAQPage). */
  perguntas?: readonly PerguntaSchema[];
  /** Outras entidades exibidas na página (ex.: os bares), acrescentadas ao grafo. */
  entidades?: readonly NoComId[];
}

export interface DadosResort {
  imagem?: ImagemSchema;
  /** Restaurantes do resort (`containsPlace`). */
  restaurantes: readonly { id: string; nome: string }[];
}

export interface DadosPagina extends OpcoesDadosEstruturados {
  /** URL canônica absoluta. */
  url: string;
  /** Título completo (o mesmo do <title>). */
  titulo: string;
  descricao: string;
  tipo?: TipoPagina;
  sobre?: AssuntoPagina;
  atualizadoEm?: Date;
  /** Foto principal exibida na página. */
  imagem?: ImagemSchema;
  /** Trilha de breadcrumbs (a home não tem). */
  trilha?: readonly Link[];
}

export interface DadosAcomodacao {
  id: string;
  nome: string;
  descricao: string;
  areaM2?: number;
  capacidade: { maxPessoas: number; descricao: string };
  camas: readonly string[];
  /** Texto da vista, como exibido ("Jardim ou piscina"). */
  vista: string;
  comodidades: readonly string[];
  imagens: readonly ImagemSchema[];
}

export type OpcaoAlimentar = 'vegana' | 'vegetariana' | 'sem-gluten' | 'sem-lactose';

export interface DadosRestaurante {
  id: string;
  nome: string;
  descricao: string;
  cozinhas: readonly string[];
  /** `true` só quando a fonte informa reserva; caso contrário a propriedade fica de fora. */
  aceitaReservas: boolean;
  dietas: readonly { tipo: OpcaoAlimentar; nome: string }[];
  imagens: readonly ImagemSchema[];
}

export interface DadosBar {
  /** Id do bar, que também é a âncora do cartão em /all-inclusive/bares/. */
  id: string;
  nome: string;
  descricao: string;
  imagens: readonly ImagemSchema[];
}

export interface DadosPost {
  id: string;
  titulo: string;
  descricao: string;
  publicadoEm: Date;
  atualizadoEm: Date;
  /** Autor exibido; ausente = a organização que publica o site. */
  autor?: string | undefined;
  imagem: ImagemSchema;
}

// ---------------------------------------------------------------------------
// Identificadores
// ---------------------------------------------------------------------------

/** URL absoluta e canônica de um caminho do site. */
export function urlAbsoluta(caminho: string): string {
  return urlCanonica(caminho, site.url);
}

const raiz = urlAbsoluta('/');

export const ids = {
  website: `${raiz}#website`,
  resort: `${raiz}#resort`,
  destino: `${raiz}#destino`,
  pagina: (url: string) => `${url}#webpage`,
  trilha: (url: string) => `${url}#breadcrumb`,
  acomodacao: (id: string) => `${urlAbsoluta(caminhoAcomodacao(id))}#acomodacao`,
  restaurante: (id: string) => `${urlAbsoluta(caminhoRestaurante(id))}#restaurante`,
  bar: (id: string) => `${urlAbsoluta(rotas.bares.caminho)}#${id}`,
  post: (id: string) => `${urlAbsoluta(caminhoPost(id))}#artigo`,
} as const;

/** No perfil oficial, quem publica o site é o próprio resort. */
export function idOperador(op: Operador = operadorAtivo): string {
  return op.tipoSchema === 'Resort' ? ids.resort : `${raiz}#operador`;
}

export const ref = (id: string): Referencia => ({ '@id': id });

function idAssunto(assunto: AssuntoPagina, op: Operador): string {
  if (assunto === 'operador') return idOperador(op);
  return assunto === 'destino' ? ids.destino : ids.resort;
}

// ---------------------------------------------------------------------------
// Peças reutilizadas
// ---------------------------------------------------------------------------

export function noImagem({ url, largura, altura, legenda }: ImagemSchema): NoSchema {
  return {
    '@type': 'ImageObject',
    contentUrl: url,
    width: largura,
    height: altura,
    caption: legenda,
  };
}

const caracteristica = (name: string, value: boolean | string = true): NoSchema => ({
  '@type': 'LocationFeatureSpecification',
  name,
  value,
});

/** Endereço sem CEP enquanto `cep` for `null` (decisão 5). */
function endereco({ logradouro, bairro, cidade, uf, cep, pais }: Endereco): NoSchema {
  return {
    '@type': 'PostalAddress',
    streetAddress: bairro ? `${logradouro}, ${bairro}` : logradouro,
    addressLocality: cidade,
    addressRegion: uf,
    ...(cep ? { postalCode: cep } : {}),
    addressCountry: pais,
  };
}

/** Telefone principal, e-mail (quando houver) e canais de atendimento do operador. */
function contatos(op: Operador): Record<string, unknown> {
  return {
    telephone: op.telefones[0].href,
    ...(op.email ? { email: op.email } : {}),
    contactPoint: [
      ...op.telefones.map((telefone) => ({
        '@type': 'ContactPoint',
        contactType: telefone.rotulo,
        telephone: telefone.href,
      })),
    ],
  };
}

// ---------------------------------------------------------------------------
// Entidades do site (presentes em todas as páginas)
// ---------------------------------------------------------------------------

export function noWebSite(op: Operador = operadorAtivo): NoSchema {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: raiz,
    name: site.nome,
    inLanguage: site.idioma,
    publisher: ref(idOperador(op)),
    about: ref(ids.resort),
  };
}

/**
 * Organização que opera o site (perfil agência: `TravelAgency`). Razão social, CNPJ, e-mail
 * e endereço só entram quando preenchidos no site.config. No perfil oficial, o operador é o
 * próprio resort e não há nó separado.
 */
export function noOperador(op: Operador = operadorAtivo): NoSchema | null {
  if (op.tipoSchema === 'Resort') return null;
  return {
    '@type': op.tipoSchema,
    '@id': idOperador(op),
    name: op.nome,
    ...(op.razaoSocial ? { legalName: op.razaoSocial } : {}),
    ...(op.cnpj ? { taxID: op.cnpj } : {}),
    description: op.descricao,
    url: urlCanonica('/', op.siteUrl),
    ...(op.logo ? { logo: new URL(`${op.logo.caminho}.png`, op.siteUrl).href } : {}),
    ...contatos(op),
    ...(op.endereco ? { address: endereco(op.endereco) } : {}),
  };
}

/**
 * O resort (`Resort`, subtipo de `LodgingBusiness`). Sem `starRating` ("padrão cinco estrelas"
 * é texto de marketing), `priceRange`, `petsAllowed`, avaliações ou CEP não confirmado.
 * `sameAs` só com as redes confirmadas (as `null` ficam de fora).
 */
export function noResort(
  { imagem, restaurantes }: DadosResort,
  op: Operador = operadorAtivo,
): NoSchema {
  const redes = Object.values(resort.redes).filter((url): url is string => url !== null);
  const { geo, horarios } = resort;
  return {
    '@type': 'Resort',
    '@id': ids.resort,
    name: resort.nome,
    alternateName: [...resort.nomesAlternativos],
    description: resort.descricao,
    // Página do resort neste site (no perfil oficial, o próprio site do resort).
    url: urlCanonica('/', op.siteUrl),
    ...(imagem ? { image: noImagem(imagem) } : {}),
    address: endereco(resort.endereco),
    geo: { '@type': 'GeoCoordinates', latitude: geo.latitude, longitude: geo.longitude },
    hasMap: linkMapa,
    // Perfil oficial: contatos do hotel. Site da agência: só a central de reservas (0800), que é o
    // telefone de reserva publicado neste site (nunca os contatos do hotel).
    ...(op.tipoSchema === 'Resort' ? contatos(op) : { telephone: op.telefones[0].href }),
    checkinTime: `${horarios.checkIn}:00`,
    checkoutTime: `${horarios.checkOut}:00`,
    ...(resort.unidades ? { numberOfRooms: resort.unidades } : {}),
    ...(resort.inauguracao ? { foundingDate: resort.inauguracao } : {}),
    ...(resort.rede ? { parentOrganization: { '@type': 'Organization', name: resort.rede } } : {}),
    amenityFeature: comodidadesResort.map((nome) => caracteristica(nome)),
    containsPlace: restaurantes.map(({ id, nome }) => ({
      '@type': 'Restaurant',
      '@id': ids.restaurante(id),
      name: nome,
      url: urlAbsoluta(caminhoRestaurante(id)),
    })),
    ...(redes.length > 0 ? { sameAs: redes } : {}),
  };
}

/** Destino do guia (assunto das páginas do guia, ex.: Porto de Galinhas). */
export function noDestino(): NoSchema {
  const { cidade, uf, pais } = resort.endereco;
  return {
    '@type': 'TouristDestination',
    '@id': ids.destino,
    name: resort.destino.nome,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cidade,
      addressRegion: uf,
      addressCountry: pais,
    },
  };
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export function noTrilha(url: string, itens: readonly Link[]): NoSchema {
  return {
    '@type': 'BreadcrumbList',
    '@id': ids.trilha(url),
    itemListElement: itens.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.rotulo,
      item: urlAbsoluta(item.href),
    })),
  };
}

export function noPergunta(url: string, { id, pergunta, resposta }: PerguntaSchema): NoSchema {
  return {
    '@type': 'Question',
    ...(id ? { '@id': `${url}#pergunta-${id}` } : {}),
    name: pergunta,
    acceptedAnswer: { '@type': 'Answer', text: resposta },
  };
}

const temTipo = (no: NoComId | Referencia): no is NoComId => '@type' in no;

export function noPagina(dados: DadosPagina, op: Operador = operadorAtivo): NoSchema {
  const {
    url,
    titulo,
    descricao,
    tipo = 'WebPage',
    sobre = 'resort',
    atualizadoEm,
    imagem,
  } = dados;
  const perguntas = dados.perguntas ?? [];
  const principal = dados.principal && ref(dados.principal['@id']);
  return {
    '@type': perguntas.length > 0 ? 'FAQPage' : tipo,
    '@id': ids.pagina(url),
    url,
    name: titulo,
    description: descricao,
    inLanguage: site.idioma,
    isPartOf: ref(ids.website),
    // Página com FAQ: as perguntas são a entidade principal e a entidade da página (quarto,
    // restaurante...) vira o assunto (`about`).
    about: perguntas.length > 0 && principal ? principal : ref(idAssunto(sobre, op)),
    ...(atualizadoEm ? { dateModified: dataIso(atualizadoEm) } : {}),
    ...(imagem ? { primaryImageOfPage: noImagem(imagem) } : {}),
    ...((dados.trilha?.length ?? 0) > 1 ? { breadcrumb: ref(ids.trilha(url)) } : {}),
    ...(perguntas.length > 0
      ? { mainEntity: perguntas.map((item) => noPergunta(url, item)) }
      : principal
        ? { mainEntity: principal }
        : {}),
  };
}

/**
 * Tipo e assunto de cada rota fixa, para as páginas não repetirem essa configuração.
 * Rotas ausentes: `WebPage` sobre o resort.
 */
const perfisPorRota: Partial<
  Record<RotaChave, Pick<DadosPagina, 'tipo' | 'sobre'> & OpcoesDadosEstruturados>
> = {
  home: { principal: ref(ids.resort) },
  resort: { principal: ref(ids.resort) },
  contato: { tipo: 'ContactPage' },
  quemSomos: { tipo: 'AboutPage', sobre: 'operador' },
  perguntasFrequentes: { tipo: 'FAQPage' },
  privacidade: { sobre: 'operador' },
  termos: { sobre: 'operador' },
  cookies: { sobre: 'operador' },
  destino: { sobre: 'destino' },
};

export function perfilDaRota(
  rota: RotaChave,
): Pick<DadosPagina, 'tipo' | 'sobre'> & OpcoesDadosEstruturados {
  return perfisPorRota[rota] ?? {};
}

/**
 * Grafo completo da página: WebSite, operador (perfil agência), Resort, destino (guia),
 * WebPage, BreadcrumbList, a entidade principal (HotelRoom, Restaurant) e as demais entidades
 * exibidas (BarOrPub), sem nós repetidos.
 */
export function grafoDaPagina(
  dados: DadosPagina & { resort: DadosResort },
  op: Operador = operadorAtivo,
): { '@context': 'https://schema.org'; '@graph': NoSchema[] } {
  const { resort: dadosResort, trilha, principal, entidades = [], ...pagina } = dados;
  const nos: (NoSchema | null)[] = [
    noWebSite(op),
    noOperador(op),
    noResort(dadosResort, op),
    pagina.sobre === 'destino' ? noDestino() : null,
    noPagina({ ...pagina, trilha, principal }, op),
    trilha && trilha.length > 1 ? noTrilha(pagina.url, trilha) : null,
    principal && temTipo(principal) ? principal : null,
    ...entidades,
  ];
  return {
    '@context': 'https://schema.org',
    '@graph': nos.filter((no): no is NoSchema => no !== null),
  };
}

// ---------------------------------------------------------------------------
// Entidades das páginas de detalhe
// ---------------------------------------------------------------------------

/** Categoria de acomodação (`HotelRoom`), sem preço nem oferta. */
export function noAcomodacao(dados: DadosAcomodacao): NoComId {
  return {
    '@type': 'HotelRoom',
    '@id': ids.acomodacao(dados.id),
    name: dados.nome,
    description: dados.descricao,
    url: urlAbsoluta(caminhoAcomodacao(dados.id)),
    ...(dados.areaM2
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: dados.areaM2,
            unitCode: 'MTK',
            unitText: 'm²',
          },
        }
      : {}),
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: dados.capacidade.maxPessoas,
      description: dados.capacidade.descricao,
    },
    ...(dados.camas.length > 0 ? { bed: [...dados.camas] } : {}),
    amenityFeature: [
      ...dados.comodidades.map((nome) => caracteristica(nome)),
      caracteristica('Vista', dados.vista),
    ],
    ...(resort.naoFumantes ? { smokingAllowed: false } : {}),
    ...(dados.imagens.length > 0 ? { image: dados.imagens.map(noImagem) } : {}),
    containedInPlace: ref(ids.resort),
  };
}

const dietas: Record<OpcaoAlimentar, string> = {
  vegana: 'https://schema.org/VeganDiet',
  vegetariana: 'https://schema.org/VegetarianDiet',
  'sem-gluten': 'https://schema.org/GlutenFreeDiet',
  // O schema.org não tem "sem lactose"; um prato sem lactose atende à dieta com pouca lactose.
  'sem-lactose': 'https://schema.org/LowLactoseDiet',
};

/**
 * Restaurante do resort. As opções alimentares viram itens do cardápio com `suitableForDiet`
 * (`RestrictedDiet`), única forma prevista no schema.org. Sem `openingHoursSpecification`:
 * a fonte não informa os dias da semana, que a propriedade exige.
 */
export function noRestaurante(dados: DadosRestaurante): NoComId {
  return {
    '@type': 'Restaurant',
    '@id': ids.restaurante(dados.id),
    name: dados.nome,
    description: dados.descricao,
    url: urlAbsoluta(caminhoRestaurante(dados.id)),
    address: endereco(resort.endereco),
    servesCuisine: [...dados.cozinhas],
    ...(dados.aceitaReservas ? { acceptsReservations: true } : {}),
    ...(dados.dietas.length > 0
      ? {
          hasMenu: {
            '@type': 'Menu',
            hasMenuItem: dados.dietas.map(({ tipo, nome }) => ({
              '@type': 'MenuItem',
              name: nome,
              suitableForDiet: dietas[tipo],
            })),
          },
        }
      : {}),
    ...(dados.imagens.length > 0 ? { image: dados.imagens.map(noImagem) } : {}),
    containedInPlace: ref(ids.resort),
  };
}

/**
 * Bar ou estação do resort (`BarOrPub`), com `@id` igual à âncora do cartão na página de bares.
 * Sem horários estruturados (a fonte não informa os dias da semana).
 */
export function noBar(dados: DadosBar): NoComId {
  const id = ids.bar(dados.id);
  return {
    '@type': 'BarOrPub',
    '@id': id,
    name: dados.nome,
    description: dados.descricao,
    url: id,
    address: endereco(resort.endereco),
    ...(dados.imagens.length > 0 ? { image: dados.imagens.map(noImagem) } : {}),
    containedInPlace: ref(ids.resort),
  };
}

/**
 * Artigo do blog (`BlogPosting`). O autor é a pessoa indicada no conteúdo ou, sem ela, a
 * organização que publica o site; o editor é sempre essa organização.
 */
export function noPost(dados: DadosPost, op: Operador = operadorAtivo): NoComId {
  const url = urlAbsoluta(caminhoPost(dados.id));
  return {
    '@type': 'BlogPosting',
    '@id': ids.post(dados.id),
    headline: dados.titulo,
    description: dados.descricao,
    url,
    mainEntityOfPage: ref(ids.pagina(url)),
    inLanguage: site.idioma,
    datePublished: dataIso(dados.publicadoEm),
    dateModified: dataIso(dados.atualizadoEm),
    author: dados.autor ? { '@type': 'Person', name: dados.autor } : ref(idOperador(op)),
    publisher: ref(idOperador(op)),
    image: noImagem(dados.imagem),
    about: ref(ids.resort),
  };
}

// ---------------------------------------------------------------------------
// Serialização
// ---------------------------------------------------------------------------

/** Escape do JSON para "<" (barra invertida + u003c), montado sem escrever a sequência. */
const MENOR_ESCAPADO = `${String.fromCharCode(0x5c)}u003c`;

/** JSON para `<script type="application/ld+json">`: nenhum "<" literal fecha a tag por engano. */
export function serializarJsonLd(dados: unknown): string {
  return JSON.stringify(dados).replaceAll('<', MENOR_ESCAPADO);
}
