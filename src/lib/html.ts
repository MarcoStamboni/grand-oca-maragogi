/**
 * Leitura do HTML estático gerado no build (funções puras, sem imports), usada pelas
 * integrações de pós-build: JSON-LD, auditoria das páginas, llms.txt e sitemap.
 * O HTML do Astro é previsível (atributos entre aspas duplas), o que permite regex simples.
 */

const ENTIDADES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: String.fromCharCode(0xa0),
};

export function decodificarEntidades(texto: string): string {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entidade, codigo: string) => {
    if (/^#x/i.test(codigo)) return String.fromCodePoint(parseInt(codigo.slice(2), 16));
    if (codigo.startsWith('#')) return String.fromCodePoint(Number(codigo.slice(1)));
    return ENTIDADES[codigo.toLowerCase()] ?? entidade;
  });
}

/** Texto de um trecho de HTML: sem tags, com entidades decodificadas e espaços normalizados. */
export function textoDe(html: string): string {
  return decodificarEntidades(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/** HTML sem comentários, <head>, scripts, estilos e modelos (o que o visitante pode ler). */
export function corpo(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(head|script|style|template)\b[\s\S]*?<\/\1>/gi, ' ');
}

/** Conteúdo do <main> (sem cabeçalho e rodapé do site). */
export function principal(html: string): string {
  return /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(corpo(html))?.[1] ?? '';
}

/** Texto visível aproximado da página. */
export function textoVisivel(html: string): string {
  return textoDe(corpo(html));
}

/** Tags de abertura de um elemento (ex.: "a", "img", "meta"). */
export function tags(html: string, elemento: string): string[] {
  return html.match(new RegExp(`<${elemento}\\b[^>]*>`, 'gi')) ?? [];
}

/**
 * Valor decodificado de um atributo numa tag de abertura. Atributo sem valor (`<img alt>`, como
 * o Astro escreve `alt=""`) devolve string vazia.
 */
export function atributo(tag: string, nome: string): string | undefined {
  const valor = new RegExp(`\\s${nome}="([^"]*)"`, 'i').exec(tag)?.[1];
  if (valor !== undefined) return decodificarEntidades(valor);
  return new RegExp(`\\s${nome}(?=[\\s/>])`, 'i').test(tag) ? '' : undefined;
}

/** Conteúdo de <meta name="..."> ou <meta property="...">. */
export function meta(html: string, nome: string): string | undefined {
  const tag = tags(html, 'meta').find(
    (item) => atributo(item, 'name') === nome || atributo(item, 'property') === nome,
  );
  return tag ? atributo(tag, 'content') : undefined;
}

export function tituloDaPagina(html: string): string | undefined {
  const titulo = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  return titulo === undefined ? undefined : textoDe(titulo);
}

export function canonica(html: string): string | undefined {
  const tag = tags(html, 'link').find((item) => atributo(item, 'rel') === 'canonical');
  return tag ? atributo(tag, 'href') : undefined;
}

/**
 * Página que entra no índice dos buscadores. No modo modelo (site.config), todas saem com
 * `noindex`, e as que seriam indexáveis levam `<meta name="modelo-indexavel">`: continuam
 * auditadas, no sitemap e no llms.txt como no site publicado.
 */
export function indexavel(html: string): boolean {
  return meta(html, 'modelo-indexavel') === 'sim' || !/noindex/i.test(meta(html, 'robots') ?? '');
}

export interface Cabecalho {
  nivel: number;
  texto: string;
}

export function cabecalhos(html: string): Cabecalho[] {
  return [...corpo(html).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((achado) => ({
    nivel: Number(achado[1]),
    texto: textoDe(achado[2] ?? ''),
  }));
}

/** Valores de `id` dos elementos da página. */
export function ids(html: string): string[] {
  return [...corpo(html).matchAll(/<[a-z][\w-]*\b[^>]*\sid="([^"]*)"/gi)].map(
    (achado) => achado[1] ?? '',
  );
}

/** `href` de todos os links (<a>) da página. */
export function links(html: string): string[] {
  return tags(corpo(html), 'a')
    .map((tag) => atributo(tag, 'href'))
    .filter((href): href is string => href !== undefined);
}

/** Texto da resposta direta (componente RespostaDireta, marcado com `data-resposta-direta`). */
export function respostaDireta(html: string): string | undefined {
  const trecho = /<p\b[^>]*\sdata-resposta-direta\b[^>]*>([\s\S]*?)<\/p>/i.exec(html)?.[1];
  return trecho === undefined ? undefined : textoDe(trecho);
}

/**
 * Data ISO da última atualização da página, lida da meta `og:updated_time` (SEO.astro). O selo
 * visível "Atualizado em" saiu a pedido do usuário (05/10/2026); a data continua no sitemap e no
 * JSON-LD (`dateModified`).
 */
export function atualizadoEm(html: string): string | undefined {
  return /<meta\s+property="og:updated_time"\s+content="(\d{4}-\d{2}-\d{2})/.exec(html)?.[1];
}

export const contarPalavras = (texto: string): number =>
  texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
