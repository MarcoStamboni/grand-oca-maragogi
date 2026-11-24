/**
 * `<lastmod>` do sitemap igual à data do "Atualizado em" de cada página (função pura).
 * Usada pela integração src/integrations/lastmod-sitemap.ts depois do @astrojs/sitemap.
 */

export interface ResultadoLastmod {
  xml: string;
  /** URLs do sitemap sem data conhecida (ficam sem `<lastmod>`). */
  semData: string[];
}

/** Troca (ou acrescenta) o `<lastmod>` de cada `<url>` pela data da página. */
export function aplicarLastmod(xml: string, datas: ReadonlyMap<string, string>): ResultadoLastmod {
  const semData: string[] = [];
  const novo = xml.replace(/<url>([\s\S]*?)<\/url>/g, (_bloco, conteudo: string) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(conteudo)?.[1] ?? '';
    const semLastmod = conteudo.replace(/<lastmod>[^<]*<\/lastmod>/, '');
    const data = datas.get(loc);
    if (!data) {
      semData.push(loc);
      return `<url>${semLastmod}</url>`;
    }
    return `<url>${semLastmod.replace('</loc>', `</loc><lastmod>${data}</lastmod>`)}</url>`;
  });
  return { xml: novo, semData };
}
