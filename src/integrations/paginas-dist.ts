/**
 * Leitura do dist/ para as integrações de pós-build: páginas HTML (com o caminho público)
 * e a lista de todos os arquivos publicados.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface PaginaDist {
  /** Caminho público: "/acomodacoes/classic/" ou "/404.html". */
  caminho: string;
  /** Caminho do arquivo no disco. */
  arquivo: string;
  html: string;
}

export interface Dist {
  raiz: string;
  /** Caminhos públicos de todos os arquivos ("/_astro/foto.webp", "/llms.txt"). */
  arquivos: ReadonlySet<string>;
  /** Páginas em ordem alfabética de caminho. */
  paginas: PaginaDist[];
}

/** "acomodacoes/classic/index.html" → "/acomodacoes/classic/"; "404.html" → "/404.html". */
export function caminhoDaPagina(relativo: string): string {
  const caminho = `/${relativo}`;
  return caminho.endsWith('/index.html') ? caminho.slice(0, -'index.html'.length) : caminho;
}

export async function lerDist(dir: URL): Promise<Dist> {
  const raiz = fileURLToPath(dir);
  const relativos = (await readdir(raiz, { withFileTypes: true, recursive: true }))
    .filter((entrada) => entrada.isFile())
    .map((entrada) =>
      path.relative(raiz, path.join(entrada.parentPath, entrada.name)).split(path.sep).join('/'),
    );
  const paginas = await Promise.all(
    relativos
      .filter((relativo) => relativo.endsWith('.html'))
      .map(async (relativo) => {
        const arquivo = path.join(raiz, relativo);
        return {
          caminho: caminhoDaPagina(relativo),
          arquivo,
          html: await readFile(arquivo, 'utf8'),
        };
      }),
  );
  return {
    raiz,
    arquivos: new Set(relativos.map((relativo) => `/${relativo}`)),
    paginas: paginas.sort((a, b) => a.caminho.localeCompare(b.caminho)),
  };
}
