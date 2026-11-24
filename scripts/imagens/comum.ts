/**
 * Utilitários compartilhados pelos scripts de imagem.
 * Executados com Node (remoção de tipos nativa), sem passar pelo Vite/Astro.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { arquivoDaChave } from '../../src/lib/imagens-chave.ts';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CSV = path.join(RAIZ, 'docs/anexos/imagens-site-oficial.csv');
export const CACHE = path.join(RAIZ, '.cache/imagens');
export const ORIGINAIS = path.join(CACHE, 'originais');
export const INVENTARIO = path.join(CACHE, 'inventario.json');
export const DESTINO = path.join(RAIZ, 'src/assets/imagens');
export const REGISTRO = path.join(RAIZ, 'src/content/imagens/imagens.yaml');
/**
 * Origem das fotos do site anterior do resort (WordPress), usada para montar a URL canônica de
 * cada chave do inventário. TODO (site real): troque pelo domínio do site anterior.
 */
export const PREFIXO_URL = 'https://www.site-anterior-do-resort.com.br/wp-content/uploads/';

export type TipoImagem = 'foto' | 'possivel-IA' | 'ui/selo';

export interface LinhaCsv {
  url: string;
  chave: string;
  tipo: TipoImagem;
  altOriginal: string;
  largura: number | null;
  altura: number | null;
  paginas: string[];
}

/** Regra da decisão 3: imagens "ChatGPT-Image" nunca entram no site. */
export function ehImagemIA(chave: string): boolean {
  return /chatgpt-image/i.test(chave);
}

/**
 * Chave = caminho depois de /wp-content/uploads/ (ex.: "2018/12/bangalo.jpg"), em qualquer site
 * WordPress (o site anterior do resort).
 */
export function chaveDaUrl(url: string): string {
  const [, resto] = url.match(/^https?:\/\/[^/]+\/wp-content\/uploads\/(.+)$/) ?? [];
  if (!resto) throw new Error(`URL fora de wp-content/uploads: ${url}`);
  return decodeURIComponent(resto);
}

/** Arquivo otimizado correspondente a uma chave (mesma regra usada pelo site). */
export function arquivoOtimizado(chave: string): string {
  return path.join(DESTINO, arquivoDaChave(chave));
}

/** Parser de CSV (RFC 4180: aspas, vírgulas e aspas duplicadas dentro de campos). */
export function analisarCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let campo = '';
  let linha: string[] = [];
  let entreAspas = false;
  // Remove o BOM (U+FEFF) do início, se houver.
  const conteudo = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    if (entreAspas) {
      if (c === '"' && conteudo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreAspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreAspas = true;
    } else if (c === ',') {
      linha.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && conteudo[i + 1] === '\n') i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  if (campo !== '' || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((valor) => valor !== ''));
}

export async function lerCsv(): Promise<LinhaCsv[]> {
  const [cabecalho, ...linhas] = analisarCsv(await readFile(CSV, 'utf8'));
  if (!cabecalho) throw new Error('CSV vazio');
  const indice = (nome: string) => {
    const posicao = cabecalho.indexOf(nome);
    if (posicao < 0) throw new Error(`Coluna ausente no CSV: ${nome}`);
    return posicao;
  };
  const col = {
    url: indice('url'),
    tipo: indice('tipo'),
    alt: indice('alt_original'),
    largura: indice('largura'),
    altura: indice('altura'),
    paginas: indice('paginas'),
  };
  const numero = (valor: string | undefined) =>
    valor && /^\d+$/.test(valor) ? Number(valor) : null;

  return linhas.map((linha) => {
    const url = linha[col.url] ?? '';
    return {
      url,
      chave: chaveDaUrl(url),
      tipo: (linha[col.tipo] ?? 'foto') as TipoImagem,
      altOriginal: linha[col.alt] ?? '',
      largura: numero(linha[col.largura]),
      altura: numero(linha[col.altura]),
      paginas: (linha[col.paginas] ?? '').split(' ').filter(Boolean),
    };
  });
}

/**
 * Fotos elegíveis: tipo "foto" e sem "ChatGPT-Image" no nome. O inventário tem algumas
 * URLs repetidas (http/https, com e sem www): ficam uma por chave, com as páginas somadas,
 * e o download sempre usa a URL canônica (`PREFIXO_URL`).
 */
export async function fotosElegiveis(): Promise<LinhaCsv[]> {
  const porChave = new Map<string, LinhaCsv>();
  for (const linha of await lerCsv()) {
    if (linha.tipo !== 'foto' || ehImagemIA(linha.chave)) continue;
    const existente = porChave.get(linha.chave);
    if (existente) {
      existente.paginas = [...new Set([...existente.paginas, ...linha.paginas])];
      existente.altOriginal ||= linha.altOriginal;
    } else {
      porChave.set(linha.chave, { ...linha, url: PREFIXO_URL + linha.chave });
    }
  }
  return [...porChave.values()];
}

/** Executa tarefas com limite de concorrência. */
export async function emLotes<T, R>(
  itens: readonly T[],
  limite: number,
  tarefa: (item: T, indice: number) => Promise<R>,
): Promise<R[]> {
  const resultados: R[] = new Array(itens.length);
  let proximo = 0;
  const trabalhadores = Array.from({ length: Math.min(limite, itens.length) }, async () => {
    while (proximo < itens.length) {
      const indice = proximo++;
      resultados[indice] = await tarefa(itens[indice] as T, indice);
    }
  });
  await Promise.all(trabalhadores);
  return resultados;
}
