/** Conferência do JSON-LD publicado: cada regra precisa acusar o problema que descreve. */
import { describe, expect, it } from 'vitest';

import { extrairJsonLd, problemasJsonLd, urlsDeImagens } from './validar-json-ld';

const origem = 'https://exemplo.com.br';
const canonica = `${origem}/pagina/`;

function grafoValido() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${origem}/#website`, url: `${origem}/` },
      { '@type': 'Resort', '@id': `${origem}/#resort`, name: 'Resort' },
      {
        '@type': 'WebPage',
        '@id': `${canonica}#webpage`,
        url: canonica,
        isPartOf: { '@id': `${origem}/#website` },
        breadcrumb: { '@id': `${canonica}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonica}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${origem}/` },
          { '@type': 'ListItem', position: 2, name: 'Página', item: canonica },
        ],
      },
    ] as Record<string, unknown>[],
  };
}

function html(json: string, { url = canonica, corpo = '', head = '' } = {}): string {
  return `<!doctype html><html><head><link rel="canonical" href="${url}">${head}<script type="application/ld+json">${json}</script></head><body>${corpo}</body></html>`;
}

const comGrafo = (alterar: (grafo: Record<string, unknown>[]) => void) => {
  const dados = grafoValido();
  alterar(dados['@graph']);
  return html(JSON.stringify(dados));
};

describe('problemasJsonLd', () => {
  it('aceita um grafo completo', () => {
    expect(problemasJsonLd(html(JSON.stringify(grafoValido())))).toEqual([]);
  });

  it('acusa JSON inválido e "<" sem escape', () => {
    expect(problemasJsonLd(html('{"@context": '))[0]).toMatch(/JSON inválido/);
    const dados = grafoValido();
    dados['@graph'].push({ '@type': 'Thing', '@id': 'x', name: '<b>' });
    expect(problemasJsonLd(html(JSON.stringify(dados)))).toContain(
      '"<" sem escape dentro do JSON-LD',
    );
  });

  it('acusa avaliações, ofertas e preços em qualquer profundidade', () => {
    const problemas = problemasJsonLd(
      comGrafo((grafo) => {
        const resort = grafo[1] ?? {};
        resort['aggregateRating'] = { '@type': 'AggregateRating', ratingValue: 4.7 };
        resort['makesOffer'] = { '@type': 'Offer', price: 100 };
        resort['starRating'] = { '@type': 'Rating', ratingValue: 5 };
      }),
    );
    expect(problemas).toEqual(
      expect.arrayContaining([
        'tipo proibido: AggregateRating',
        'tipo proibido: Offer',
        'tipo proibido: Rating',
        'propriedade proibida: aggregateRating',
        'propriedade proibida: price',
        'propriedade proibida: starRating',
      ]),
    );
  });

  it('acusa referência sem nó e @id repetido', () => {
    const problemas = problemasJsonLd(
      comGrafo((grafo) => {
        grafo.push({ '@type': 'Thing', '@id': `${origem}/#resort`, about: { '@id': 'nada' } });
      }),
    );
    expect(problemas).toContain(`"@id" repetido no grafo: ${origem}/#resort`);
    expect(problemas).toContain('referência sem nó correspondente: nada');
  });

  it('exige WebPage com a URL canônica e BreadcrumbList fora da home', () => {
    expect(
      problemasJsonLd(html(JSON.stringify(grafoValido()), { url: `${origem}/outra/` })),
    ).toEqual(
      expect.arrayContaining([
        `URL da página (${canonica}) difere da canônica (${origem}/outra/)`,
        'último item da BreadcrumbList difere da URL canônica',
      ]),
    );
    const semTrilha = comGrafo((grafo) => {
      grafo.splice(3, 1);
      delete grafo[2]?.['breadcrumb'];
    });
    expect(problemasJsonLd(semTrilha)).toContain('esperado 1 BreadcrumbList');
  });

  it('a home dispensa a BreadcrumbList', () => {
    const dados = grafoValido();
    dados['@graph'] = dados['@graph'].slice(0, 2);
    dados['@graph'].push({ '@type': 'WebPage', '@id': `${origem}/#webpage`, url: `${origem}/` });
    expect(problemasJsonLd(html(JSON.stringify(dados), { url: `${origem}/` }))).toEqual([]);
  });

  it('exige que as perguntas do FAQPage estejam visíveis na página', () => {
    const dados = grafoValido();
    const pagina = dados['@graph'][2] ?? {};
    pagina['@type'] = 'FAQPage';
    pagina['mainEntity'] = [
      { '@type': 'Question', name: 'Tem Cortina d’Água?', acceptedAnswer: { text: 'Sim.' } },
      { '@type': 'Question', name: 'Pode levar "pet"?', acceptedAnswer: { text: '-' } },
    ];
    const json = JSON.stringify(dados);
    expect(
      problemasJsonLd(html(json, { corpo: '<summary>Tem Cortina d’Água?</summary>' })),
    ).toEqual(['pergunta do FAQPage não exibida: Pode levar "pet"?']);
    expect(
      problemasJsonLd(
        html(json, { corpo: '<p>Tem Cortina d’Água?</p><p>Pode levar &quot;pet&quot;?</p>' }),
      ),
    ).toEqual([]);
  });

  it('páginas noindex não têm JSON-LD; as demais têm exatamente um bloco', () => {
    const noindex = '<meta name="robots" content="noindex, nofollow">';
    expect(problemasJsonLd(html('{}', { head: noindex }))).toEqual([
      'página noindex não deve ter JSON-LD',
    ]);
    expect(problemasJsonLd(`<head>${noindex}</head>`)).toEqual([]);
    expect(problemasJsonLd('<head></head>')).toEqual([
      'esperado 1 bloco de JSON-LD, encontrados 0',
    ]);
  });
});

describe('extração', () => {
  it('lê o bloco e as URLs das imagens', () => {
    const dados = grafoValido();
    dados['@graph'].push({
      '@type': 'Thing',
      '@id': 'x',
      image: [{ '@type': 'ImageObject', contentUrl: `${origem}/_astro/a.webp` }],
    });
    const [bloco] = extrairJsonLd(html(JSON.stringify(dados)));
    expect(urlsDeImagens(JSON.parse(bloco ?? '{}'))).toEqual([`${origem}/_astro/a.webp`]);
  });
});
