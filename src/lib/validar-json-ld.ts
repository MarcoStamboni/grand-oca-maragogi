/**
 * Conferência do JSON-LD publicado em cada página HTML. Usada pela integração de build
 * (src/integrations/validar-json-ld.ts, que derruba o build se houver problema) e pelos testes.
 * Imports relativos com extensão: o astro.config carrega este arquivo sem o alias `@/`.
 */
import { canonica, indexavel, textoVisivel } from './html.ts';

/** Decisões 4 e 7: sem avaliações, ofertas, preços ou classificação por estrelas. */
export const TIPOS_PROIBIDOS = ['AggregateRating', 'Review', 'Rating', 'Offer', 'AggregateOffer'];
export const PROPRIEDADES_PROIBIDAS = [
  'aggregateRating',
  'review',
  'reviews',
  'offers',
  'price',
  'priceRange',
  'priceSpecification',
  'starRating',
];

const TIPOS_PAGINA = ['WebPage', 'AboutPage', 'ContactPage', 'FAQPage'];
const SCRIPT_JSON_LD =
  /<script\b[^>]*\btype=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;

type Objeto = Record<string, unknown>;

const ehObjeto = (valor: unknown): valor is Objeto =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

const tiposDe = (no: Objeto): string[] => {
  const tipo = no['@type'];
  return (Array.isArray(tipo) ? tipo : [tipo]).filter((t): t is string => typeof t === 'string');
};

/** Conteúdo bruto de cada bloco `<script type="application/ld+json">`. */
export function extrairJsonLd(html: string): string[] {
  return [...html.matchAll(SCRIPT_JSON_LD)].map((achado) => achado[1] ?? '');
}

/** Todos os objetos aninhados (inclusive o próprio valor), em profundidade. */
function objetos(valor: unknown): Objeto[] {
  if (Array.isArray(valor)) return valor.flatMap(objetos);
  if (!ehObjeto(valor)) return [];
  return [valor, ...Object.values(valor).flatMap(objetos)];
}

/** URLs das imagens declaradas no JSON-LD (para conferir se o arquivo existe no build). */
export function urlsDeImagens(dados: unknown): string[] {
  return objetos(dados)
    .filter((no) => tiposDe(no).includes('ImageObject'))
    .map((no) => no['contentUrl'])
    .filter((url): url is string => typeof url === 'string');
}

/**
 * Problemas do JSON-LD de uma página. Páginas `noindex` não devem ter JSON-LD; as demais têm
 * exatamente um bloco, com JSON válido, `@graph`, WebSite, Resort, WebPage com a URL canônica,
 * BreadcrumbList (exceto a home), referências `@id` resolvidas, perguntas do FAQPage visíveis
 * na página e nenhum tipo ou propriedade proibidos.
 */
export function problemasJsonLd(html: string): string[] {
  const blocos = extrairJsonLd(html);
  if (!indexavel(html)) {
    return blocos.length > 0 ? ['página noindex não deve ter JSON-LD'] : [];
  }
  if (blocos.length !== 1) return [`esperado 1 bloco de JSON-LD, encontrados ${blocos.length}`];

  const problemas: string[] = [];
  const texto = blocos[0] ?? '';
  if (texto.includes('<')) problemas.push('"<" sem escape dentro do JSON-LD');

  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch (erro) {
    return [...problemas, `JSON inválido: ${erro instanceof Error ? erro.message : String(erro)}`];
  }
  if (!ehObjeto(dados) || dados['@context'] !== 'https://schema.org') {
    return [...problemas, '"@context" deve ser "https://schema.org"'];
  }
  const grafo = dados['@graph'];
  if (!Array.isArray(grafo) || grafo.length === 0 || !grafo.every(ehObjeto)) {
    return [...problemas, '"@graph" ausente ou vazio'];
  }

  // Tipos e propriedades proibidos, em qualquer profundidade.
  const todos = objetos(grafo);
  for (const no of todos) {
    for (const tipo of tiposDe(no).filter((t) => TIPOS_PROIBIDOS.includes(t))) {
      problemas.push(`tipo proibido: ${tipo}`);
    }
    for (const chave of Object.keys(no).filter((c) => PROPRIEDADES_PROIBIDAS.includes(c))) {
      problemas.push(`propriedade proibida: ${chave}`);
    }
  }

  // Nós do grafo: todos com @type e @id únicos.
  const idsDoGrafo = new Set<string>();
  for (const no of grafo) {
    const id = no['@id'];
    if (tiposDe(no).length === 0) problemas.push('nó do grafo sem "@type"');
    if (typeof id !== 'string') problemas.push(`nó ${tiposDe(no).join('/')} sem "@id"`);
    else if (idsDoGrafo.has(id)) problemas.push(`"@id" repetido no grafo: ${id}`);
    else idsDoGrafo.add(id);
  }

  // Referências ({ "@id" } sozinho) apontam para nós definidos na página.
  const definidos = new Set(
    todos
      .filter((no) => Object.keys(no).length > 1 && typeof no['@id'] === 'string')
      .map((no) => no['@id'] as string),
  );
  for (const no of todos) {
    const id = no['@id'];
    if (Object.keys(no).length === 1 && typeof id === 'string' && !definidos.has(id)) {
      problemas.push(`referência sem nó correspondente: ${id}`);
    }
  }

  const doTipo = (tipos: readonly string[]) =>
    grafo.filter((no) => tiposDe(no).some((t) => tipos.includes(t)));
  if (doTipo(['WebSite']).length !== 1) problemas.push('esperado 1 WebSite');
  if (doTipo(['Resort']).length !== 1) problemas.push('esperado 1 Resort');

  const paginas = doTipo(TIPOS_PAGINA);
  const urlCanonica = canonica(html);
  const pagina = paginas[0];
  if (paginas.length !== 1 || !pagina) {
    problemas.push(`esperado 1 nó de página (${TIPOS_PAGINA.join(', ')})`);
  } else if (pagina['url'] !== urlCanonica) {
    problemas.push(`URL da página (${String(pagina['url'])}) difere da canônica (${urlCanonica})`);
  }

  const trilhas = doTipo(['BreadcrumbList']);
  const ehHome = urlCanonica !== undefined && new URL(urlCanonica).pathname === '/';
  if (!ehHome && trilhas.length !== 1) problemas.push('esperado 1 BreadcrumbList');
  for (const trilha of trilhas) {
    const itens = Array.isArray(trilha['itemListElement']) ? trilha['itemListElement'] : [];
    const posicoesOk = itens.every((item, i) => ehObjeto(item) && item['position'] === i + 1);
    if (itens.length < 2 || !posicoesOk) problemas.push('BreadcrumbList com posições inválidas');
    const ultimo: unknown = itens.at(-1);
    if (ehObjeto(ultimo) && ultimo['item'] !== urlCanonica) {
      problemas.push('último item da BreadcrumbList difere da URL canônica');
    }
  }

  // Conteúdo marcado precisa estar visível: perguntas do FAQPage e nome da entidade principal.
  const visivel = textoVisivel(html);
  for (const no of todos.filter((item) => tiposDe(item).includes('Question'))) {
    const nome = no['name'];
    if (typeof nome !== 'string' || !visivel.includes(nome)) {
      problemas.push(`pergunta do FAQPage não exibida: ${String(nome)}`);
    }
  }
  const principal = pagina?.['mainEntity'];
  const idPrincipal = ehObjeto(principal) ? principal['@id'] : undefined;
  const entidade =
    typeof idPrincipal === 'string' ? grafo.find((no) => no['@id'] === idPrincipal) : undefined;
  const nomeEntidade = entidade?.['name'];
  if (typeof nomeEntidade === 'string' && !visivel.includes(nomeEntidade)) {
    problemas.push(`entidade principal não exibida: ${nomeEntidade}`);
  }

  return problemas;
}
