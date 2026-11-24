/**
 * Regras de metadados (title, description, canonical). Funções puras e testadas.
 */

export const LIMITES = {
  /** Title = H1 + " | Reservas 0800 737 6787" (padrão da rede, sem trava de 65 caracteres). */
  titulo: { min: 15, max: 120 },
  /** Meta description: no máximo 150 caracteres, já com o final "Reservas 0800 737 6787". */
  descricao: { min: 70, max: 150 },
} as const;

/**
 * Meta description com o final da central de reservas: "Texto da página. Reservas 0800 737 6787".
 * Não repete o final quando ele já está no texto.
 */
export function descricaoComReservas(descricao: string, fim: string): string {
  const texto = descricao.trim();
  if (texto.endsWith(fim)) return texto;
  return `${/[.!?]$/.test(texto) ? texto : `${texto}.`} ${fim}`;
}

/** URL canônica absoluta, sempre com barra final (exceto arquivos, ex.: /404.html). */
export function urlCanonica(caminho: string, base: string | URL): string {
  const url = new URL(caminho, base);
  url.search = '';
  url.hash = '';
  if (!/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('/')) {
    url.pathname += '/';
  }
  return url.href;
}

/** Avisos de tamanho de título e descrição (exibidos no build, não interrompem). */
export function avisosMetadados(titulo: string, descricao: string): string[] {
  const avisos: string[] = [];
  const { titulo: t, descricao: d } = LIMITES;
  if (titulo.length < t.min || titulo.length > t.max) {
    avisos.push(`título com ${titulo.length} caracteres (ideal: ${t.min} a ${t.max})`);
  }
  if (descricao.length < d.min || descricao.length > d.max) {
    avisos.push(`descrição com ${descricao.length} caracteres (ideal: ${d.min} a ${d.max})`);
  }
  return avisos;
}
