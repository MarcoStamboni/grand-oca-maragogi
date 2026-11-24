/**
 * Arquivos de `_astro/` que alguma página publicada usa (função pura, sem imports), para a
 * integração `limpar-arquivos` apagar o resto do dist/.
 * Parte dos textos fora de `_astro/` (HTML, XML, manifest...), que citam `/_astro/<arquivo>`, e
 * segue as referências dentro dos próprios assets: scripts importam outros pelo nome
 * ("./trecho.abc123.js") e CSS cita fontes e imagens.
 */

const REFERENCIA_ASTRO = /_astro\/([^"'()\s,?#]+)/g;

function citados(texto: string): string[] {
  return [...texto.matchAll(REFERENCIA_ASTRO)].map((achado) => decodeURIComponent(achado[1] ?? ''));
}

/**
 * @param textosPublicados conteúdo dos arquivos de texto fora de `_astro/`.
 * @param assets arquivos de `_astro/` (caminho relativo à pasta) e, para JS e CSS, o conteúdo
 * (`null` para binários como imagens e fontes).
 */
export function assetsAlcancados(
  textosPublicados: readonly string[],
  assets: ReadonlyMap<string, string | null>,
): Set<string> {
  const nomeDoArquivo = (relativo: string) => relativo.split('/').at(-1) ?? relativo;
  const alcancados = new Set<string>();
  const fila = textosPublicados.flatMap(citados);

  while (fila.length > 0) {
    const atual = fila.pop() ?? '';
    if (alcancados.has(atual) || !assets.has(atual)) continue;
    alcancados.add(atual);
    const texto = assets.get(atual);
    if (!texto) continue;
    fila.push(...citados(texto));
    for (const outro of assets.keys()) {
      if (!alcancados.has(outro) && texto.includes(nomeDoArquivo(outro))) fila.push(outro);
    }
  }
  return alcancados;
}
