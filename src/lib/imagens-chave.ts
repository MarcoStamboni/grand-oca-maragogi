/**
 * Conversão de chave de imagem (caminho relativo, com pastas) para o arquivo otimizado
 * em src/assets/imagens/. Módulo puro, compartilhado pelo site e pelos scripts de imagem
 * (por isso não usa aliases nem módulos do Astro).
 *
 * Ex.: "acomodacoes/Suite-Master.-1.jpg" → "acomodacoes/suite-master-1-<hash>.jpg"
 * O nome é normalizado (minúsculas, sem acentos e símbolos) e limitado a 80 caracteres,
 * para não estourar o limite de caminho do Windows. O hash da chave original (6 caracteres)
 * garante que nomes parecidos ("Foto.-2.jpg" e "Foto-2.jpg", ".png" e ".jpg") não colidam.
 */
const LIMITE_NOME = 80;

/** FNV-1a de 32 bits, em hexadecimal (determinístico e sem dependências). */
function hashCurto(texto: string): string {
  let hash = 0x811c9dc5;
  for (const caractere of texto) {
    hash ^= caractere.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 6);
}

export function arquivoDaChave(chave: string): string {
  const partes = chave.split('/');
  const arquivo = partes.pop() ?? '';
  const base = arquivo
    .replace(/\.[a-z0-9]+$/i, '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITE_NOME)
    .replace(/-+$/, '');
  return [...partes, `${base || 'imagem'}-${hashCurto(chave)}.jpg`].join('/');
}
