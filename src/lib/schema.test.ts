/**
 * Construtores do JSON-LD: identificadores estáveis, fatos confirmados, nada inventado
 * (CEP, redes, dados da agência) e nenhuma avaliação, oferta ou preço (decisões 4, 5 e 7).
 */
import { describe, expect, it } from 'vitest';

import { operadores, resort, site } from '@/site.config';

import {
  grafoDaPagina,
  idOperador,
  ids,
  type ImagemSchema,
  noAcomodacao,
  noBar,
  noOperador,
  noPagina,
  noResort,
  noRestaurante,
  noTrilha,
  noWebSite,
  perfilDaRota,
  serializarJsonLd,
  urlAbsoluta,
} from './schema';
import { PROPRIEDADES_PROIBIDAS, problemasJsonLd, TIPOS_PROIBIDOS } from './validar-json-ld';

const imagem: ImagemSchema = {
  url: `${site.url}/_astro/foto.webp`,
  largura: 1600,
  altura: 900,
  legenda: 'Vista aérea do resort à beira-mar',
};
const dadosResort = { imagem, restaurantes: [{ id: 'sete-mares', nome: 'Sete Mares' }] };
const trilhaClassic = [
  { rotulo: 'Início', href: '/' },
  { rotulo: 'Acomodações', href: '/acomodacoes/' },
  { rotulo: 'Classic', href: '/acomodacoes/classic/' },
];
const dadosClassic = {
  id: 'classic',
  nome: 'Classic',
  descricao: 'Apartamento de 36 m² para até 4 pessoas.',
  areaM2: 36,
  capacidade: { maxPessoas: 4, descricao: 'até 4 pessoas' },
  camas: ['2 camas de casal'],
  vista: 'Jardim ou piscina',
  comodidades: ['1 TV LED', 'Varanda', 'Cofre digital'],
  imagens: [imagem],
};

/** Todas as chaves e todos os `@type`, em qualquer profundidade. */
function chavesETipos(valor: unknown, chaves = new Set<string>(), tipos = new Set<string>()) {
  if (Array.isArray(valor)) {
    for (const item of valor) chavesETipos(item, chaves, tipos);
  } else if (typeof valor === 'object' && valor !== null) {
    for (const [chave, filho] of Object.entries(valor)) {
      chaves.add(chave);
      if (chave === '@type') [filho].flat().forEach((tipo) => tipos.add(String(tipo)));
      chavesETipos(filho, chaves, tipos);
    }
  }
  return { chaves, tipos };
}

function semProibidos(valor: unknown) {
  const { chaves, tipos } = chavesETipos(valor);
  expect(PROPRIEDADES_PROIBIDAS.filter((chave) => chaves.has(chave))).toEqual([]);
  expect(TIPOS_PROIBIDOS.filter((tipo) => tipos.has(tipo))).toEqual([]);
}

describe('identificadores', () => {
  it('derivam da URL canônica do site', () => {
    expect(ids.website).toBe(`${site.url}/#website`);
    expect(ids.resort).toBe(`${site.url}/#resort`);
    expect(ids.acomodacao('classic')).toBe(`${site.url}/acomodacoes/classic/#acomodacao`);
    expect(ids.restaurante('sete-mares')).toBe(
      `${site.url}/all-inclusive/restaurantes/sete-mares/#restaurante`,
    );
  });

  it('no perfil oficial, o operador é o próprio resort', () => {
    expect(idOperador(operadores.agencia)).toBe(`${site.url}/#operador`);
    expect(idOperador(operadores.oficial)).toBe(ids.resort);
  });
});

describe('noResort', () => {
  const no = noResort(dadosResort, operadores.agencia);

  it('traz os fatos confirmados do site.config', () => {
    expect(no).toMatchObject({
      '@type': 'Resort',
      '@id': ids.resort,
      name: resort.nome,
      // No site da agência, o resort aponta para este site, não para o site do hotel.
      url: `${operadores.agencia.siteUrl}/`,
      checkinTime: '15:00:00',
      checkoutTime: '12:00:00',
      ...(resort.unidades ? { numberOfRooms: resort.unidades } : {}),
      geo: { latitude: resort.geo.latitude, longitude: resort.geo.longitude },
      ...(resort.rede ? { parentOrganization: { name: resort.rede } } : {}),
    });
    if (!resort.unidades) expect('numberOfRooms' in no).toBe(false);
    if (!resort.rede) expect('parentOrganization' in no).toBe(false);
    // No site da agência, o resort leva só a central de reservas (0800), nunca o telefone do hotel.
    expect(no['telephone']).toBe(operadores.agencia.telefones[0].href);
  });

  it('só publica o CEP quando confirmado', () => {
    const endereco = no['address'] as Record<string, unknown>;
    expect('postalCode' in endereco).toBe(resort.endereco.cep !== null);
  });

  it('usa em sameAs só as redes confirmadas', () => {
    const confirmadas = Object.values(resort.redes).filter((url) => url !== null);
    expect(no['sameAs'] ?? []).toEqual(confirmadas);
    if (resort.tripadvisor) expect(no['sameAs']).not.toContain(resort.tripadvisor.url);
  });

  it('não traz avaliação, preço, estrelas nem política de pets', () => {
    semProibidos(no);
    expect(no).not.toHaveProperty('petsAllowed');
  });

  it('liga os restaurantes pelo mesmo @id das páginas de detalhe', () => {
    expect(no['containsPlace']).toEqual([
      {
        '@type': 'Restaurant',
        '@id': ids.restaurante('sete-mares'),
        name: 'Sete Mares',
        url: urlAbsoluta('/all-inclusive/restaurantes/sete-mares/'),
      },
    ]);
  });

  it('recebe os contatos do operador só quando o operador é o resort', () => {
    expect(no).not.toHaveProperty('contactPoint');
    const oficial = noResort(dadosResort, operadores.oficial);
    expect(oficial['contactPoint']).toBeDefined();
    expect(oficial['email'] ?? null).toBe(operadores.oficial.email);
  });
});

describe('noOperador', () => {
  it('perfil agência: TravelAgency com os telefones e sem dados ainda não informados', () => {
    const agencia = operadores.agencia;
    const no = noOperador(agencia);
    expect(no).toMatchObject({
      '@type': 'TravelAgency',
      '@id': idOperador(agencia),
      name: agencia.nome,
      telephone: agencia.telefones[0].href,
    });
    // Só os telefones: o número do WhatsApp não é publicado.
    expect(no?.['contactPoint']).toHaveLength(agencia.telefones.length);
    expect(no ? 'address' in no : false).toBe(agencia.endereco !== null);
    expect(no ? 'email' in no : false).toBe(agencia.email !== null);
    expect(no ? 'taxID' in no : false).toBe(agencia.cnpj !== null);
  });

  it('perfil oficial: sem nó separado', () => {
    expect(noOperador(operadores.oficial)).toBeNull();
  });
});

describe('noWebSite', () => {
  it('é publicado pelo operador e fala do resort', () => {
    expect(noWebSite(operadores.agencia)).toMatchObject({
      url: `${site.url}/`,
      inLanguage: 'pt-BR',
      publisher: { '@id': idOperador(operadores.agencia) },
      about: { '@id': ids.resort },
    });
    expect(noWebSite(operadores.oficial)['publisher']).toEqual({ '@id': ids.resort });
  });
});

describe('noPagina', () => {
  const url = urlAbsoluta('/acomodacoes/classic/');
  const base = { url, titulo: 'Classic | Summerville', descricao: 'Apartamento Classic.' };

  it('monta a WebPage com data, imagem principal e trilha', () => {
    const no = noPagina({
      ...base,
      atualizadoEm: new Date('2026-09-30T00:00:00Z'),
      imagem,
      trilha: trilhaClassic,
    });
    expect(no).toMatchObject({
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      dateModified: '2026-09-30',
      isPartOf: { '@id': ids.website },
      about: { '@id': ids.resort },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        contentUrl: imagem.url,
        caption: imagem.legenda,
        width: 1600,
        height: 900,
      },
    });
  });

  it('sem trilha e sem imagem, omite as propriedades', () => {
    const no = noPagina(base);
    expect(no).not.toHaveProperty('breadcrumb');
    expect(no).not.toHaveProperty('primaryImageOfPage');
    expect(no).not.toHaveProperty('dateModified');
  });

  it('vira FAQPage com as perguntas recebidas', () => {
    const no = noPagina({
      ...base,
      perguntas: [{ id: 'check-in', pergunta: 'Qual o horário?', resposta: 'A partir das 15h.' }],
    });
    expect(no['@type']).toBe('FAQPage');
    expect(no['mainEntity']).toEqual([
      {
        '@type': 'Question',
        '@id': `${url}#pergunta-check-in`,
        name: 'Qual o horário?',
        acceptedAnswer: { '@type': 'Answer', text: 'A partir das 15h.' },
      },
    ]);
  });

  it('aponta a entidade principal pelo @id', () => {
    const no = noPagina({ ...base, principal: noAcomodacao(dadosClassic) });
    expect(no['mainEntity']).toEqual({ '@id': ids.acomodacao('classic') });
  });
});

describe('perfilDaRota', () => {
  it('define tipo e assunto das rotas especiais', () => {
    expect(perfilDaRota('contato')).toEqual({ tipo: 'ContactPage' });
    expect(perfilDaRota('quemSomos')).toEqual({ tipo: 'AboutPage', sobre: 'operador' });
    expect(perfilDaRota('privacidade')).toEqual({ sobre: 'operador' });
    expect(perfilDaRota('destino')).toEqual({ sobre: 'destino' });
    expect(perfilDaRota('home').principal).toEqual({ '@id': ids.resort });
    expect(perfilDaRota('lazer')).toEqual({});
  });
});

describe('noTrilha', () => {
  it('numera os itens a partir de 1, com URLs absolutas', () => {
    const url = urlAbsoluta('/acomodacoes/classic/');
    expect(noTrilha(url, trilhaClassic)['itemListElement']).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${site.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Acomodações', item: `${site.url}/acomodacoes/` },
      { '@type': 'ListItem', position: 3, name: 'Classic', item: url },
    ]);
  });
});

describe('noAcomodacao', () => {
  const no = noAcomodacao(dadosClassic);

  it('descreve a categoria sem preço nem oferta', () => {
    expect(no).toMatchObject({
      '@type': 'HotelRoom',
      floorSize: { value: 36, unitCode: 'MTK' },
      occupancy: { maxValue: 4, description: 'até 4 pessoas' },
      bed: ['2 camas de casal'],
      ...(resort.naoFumantes ? { smokingAllowed: false } : {}),
      containedInPlace: { '@id': ids.resort },
    });
    // Sem confirmação da fonte, o site não afirma nada sobre fumar na acomodação.
    if (!resort.naoFumantes) expect('smokingAllowed' in no).toBe(false);
    expect(no['amenityFeature']).toContainEqual({
      '@type': 'LocationFeatureSpecification',
      name: 'Vista',
      value: 'Jardim ou piscina',
    });
    semProibidos(no);
  });

  it('sem foto real, não publica imagem', () => {
    expect(noAcomodacao({ ...dadosClassic, imagens: [] })).not.toHaveProperty('image');
  });
});

describe('noRestaurante', () => {
  const base = {
    id: 'sete-mares',
    nome: 'Sete Mares',
    descricao: 'Restaurante principal.',
    cozinhas: ['Pernambucana', 'Italiana'],
    aceitaReservas: false,
    dietas: [],
    imagens: [],
  };

  it('só afirma reservas quando a fonte informa', () => {
    expect(noRestaurante(base)).not.toHaveProperty('acceptsReservations');
    expect(noRestaurante({ ...base, aceitaReservas: true })['acceptsReservations']).toBe(true);
  });

  it('mapeia as opções alimentares para RestrictedDiet', () => {
    const no = noRestaurante({
      ...base,
      dietas: [
        { tipo: 'vegana', nome: 'Opções veganas' },
        { tipo: 'sem-gluten', nome: 'Opções sem glúten' },
      ],
    });
    expect(no['hasMenu']).toEqual({
      '@type': 'Menu',
      hasMenuItem: [
        {
          '@type': 'MenuItem',
          name: 'Opções veganas',
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Opções sem glúten',
          suitableForDiet: 'https://schema.org/GlutenFreeDiet',
        },
      ],
    });
  });

  it('não gera horário sem dia da semana nem dados proibidos', () => {
    const no = noRestaurante(base);
    expect(no).not.toHaveProperty('openingHoursSpecification');
    expect(no['servesCuisine']).toEqual(['Pernambucana', 'Italiana']);
    semProibidos(no);
  });
});

describe('noBar', () => {
  const no = noBar({
    id: 'cafe-des-ponts',
    nome: 'Café des Ponts',
    descricao: 'Bar do lobby.',
    imagens: [],
  });

  it('usa a âncora do cartão como @id e liga o bar ao resort', () => {
    expect(no).toMatchObject({
      '@type': 'BarOrPub',
      '@id': `${site.url}/all-inclusive/bares/#cafe-des-ponts`,
      url: `${site.url}/all-inclusive/bares/#cafe-des-ponts`,
      containedInPlace: { '@id': ids.resort },
    });
    expect(no).not.toHaveProperty('openingHoursSpecification');
    expect(no).not.toHaveProperty('image');
    semProibidos(no);
  });

  it('entra no grafo como entidade extra da página', () => {
    const url = urlAbsoluta('/all-inclusive/bares/');
    const grafo = grafoDaPagina(
      { url, titulo: 'Bares', descricao: 'Bares.', entidades: [no], resort: dadosResort },
      operadores.agencia,
    );
    expect(grafo['@graph'].at(-1)).toBe(no);
  });
});

describe('serializarJsonLd', () => {
  it('escapa "<" e continua sendo JSON válido', () => {
    const dados = { texto: '</script><b>' };
    const json = serializarJsonLd(dados);
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual(dados);
  });
});

describe('grafoDaPagina', () => {
  const url = urlAbsoluta('/acomodacoes/classic/');
  const html = (grafo: unknown, corpo: string) =>
    `<html><head><link rel="canonical" href="${url}"><script type="application/ld+json">${serializarJsonLd(grafo)}</script></head><body>${corpo}</body></html>`;

  it('página de acomodação passa na conferência do build', () => {
    const grafo = grafoDaPagina(
      {
        url,
        titulo: 'Classic | Summerville',
        descricao: 'Apartamento Classic.',
        trilha: trilhaClassic,
        principal: noAcomodacao(dadosClassic),
        resort: dadosResort,
      },
      operadores.agencia,
    );
    const tipos = grafo['@graph'].map((no) => no['@type']);
    expect(tipos).toEqual([
      'WebSite',
      'TravelAgency',
      'Resort',
      'WebPage',
      'BreadcrumbList',
      'HotelRoom',
    ]);
    expect(problemasJsonLd(html(grafo, '<h1>Classic</h1>'))).toEqual([]);
  });

  it('perfil oficial: sem nó do operador e sem @id repetido', () => {
    const grafo = grafoDaPagina(
      { url, titulo: 'Classic', descricao: 'Classic.', trilha: trilhaClassic, resort: dadosResort },
      operadores.oficial,
    );
    const idsGrafo = grafo['@graph'].map((no) => no['@id']);
    expect(new Set(idsGrafo).size).toBe(idsGrafo.length);
    expect(grafo['@graph'].some((no) => no['@type'] === 'TravelAgency')).toBe(false);
  });

  it('páginas do guia trazem o destino como assunto', () => {
    const grafo = grafoDaPagina({
      url,
      titulo: 'Guia',
      descricao: 'Guia.',
      sobre: 'destino',
      trilha: trilhaClassic,
      resort: dadosResort,
    });
    expect(grafo['@graph'].find((no) => no['@id'] === ids.destino)).toMatchObject({
      '@type': 'TouristDestination',
      name: resort.destino.nome,
    });
  });
});
