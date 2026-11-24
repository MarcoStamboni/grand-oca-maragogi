/**
 * Gera folhas de contato (miniaturas numeradas) para revisar as fotos e escrever os textos
 * alternativos. Saída em .cache/imagens/folhas/ (fora do git).
 *
 * Uso:
 *   npm run imagens:folhas -- conteudo            fotos citadas em src/content/
 *   npm run imagens:folhas -- pagina:o-resort     fotos de uma página do site oficial
 *   npm run imagens:folhas -- chaves:a.jpg,b.jpg  lista explícita
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { CACHE, ORIGINAIS, RAIZ } from './comum.ts';

interface ItemInventario {
  chave: string;
  largura: number;
  altura: number;
  paginas: string[];
}

const COLUNAS = 4;
const LINHAS = 3;
const LARGURA = 360;
const ALTURA = 270;
const RODAPE = 34;
const PASTA = path.join(CACHE, 'folhas');

const inventario: ItemInventario[] = JSON.parse(
  await readFile(path.join(CACHE, 'inventario.json'), 'utf8'),
);

async function chavesDoConteudo(): Promise<string[]> {
  const encontradas = new Set<string>();
  const padrao = /(\d{4}\/\d{2}\/[^\s'"]+\.(?:jpe?g|png|webp))/gi;
  const visitar = async (pasta: string): Promise<void> => {
    for (const entrada of await readdir(pasta, { withFileTypes: true })) {
      const caminho = path.join(pasta, entrada.name);
      if (entrada.isDirectory()) await visitar(caminho);
      else if (/\.(md|ya?ml)$/.test(entrada.name) && entrada.name !== 'imagens.yaml') {
        for (const achado of (await readFile(caminho, 'utf8')).matchAll(padrao)) {
          if (achado[1]) encontradas.add(achado[1]);
        }
      }
    }
  };
  await visitar(path.join(RAIZ, 'src/content'));
  return [...encontradas];
}

const argumento = process.argv[2] ?? 'conteudo';
let chaves: string[];
if (argumento === 'conteudo') chaves = await chavesDoConteudo();
else if (argumento.startsWith('pagina:')) {
  const pagina = argumento.slice('pagina:'.length);
  chaves = inventario.filter((item) => item.paginas.includes(pagina)).map((item) => item.chave);
} else if (argumento.startsWith('chaves:')) chaves = argumento.slice('chaves:'.length).split(',');
else throw new Error(`Argumento desconhecido: ${argumento}`);

const nomeGrupo = argumento.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
await mkdir(PASTA, { recursive: true });
for (const arquivo of await readdir(PASTA)) {
  if (arquivo.startsWith(`${nomeGrupo}-`)) await rm(path.join(PASTA, arquivo));
}

const porFolha = COLUNAS * LINHAS;
const indice: string[] = [];

for (let inicio = 0; inicio < chaves.length; inicio += porFolha) {
  const lote = chaves.slice(inicio, inicio + porFolha);
  const camadas = await Promise.all(
    lote.map(async (chave, posicao) => {
      const numero = inicio + posicao + 1;
      const dados = await readFile(path.join(ORIGINAIS, chave));
      const miniatura = await sharp(dados)
        .resize(LARGURA, ALTURA, { fit: 'contain', background: '#ffffff' })
        .toBuffer();
      const item = inventario.find((registro) => registro.chave === chave);
      const rotulo = `#${numero} ${path.basename(chave)}`.slice(0, 44);
      const dimensoes = item ? `${item.largura}x${item.altura}` : '';
      const texto = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${RODAPE}"><rect width="100%" height="100%" fill="#062a31"/><text x="6" y="22" font-family="Arial" font-size="15" fill="#ffffff">${rotulo.replace(/&/g, '&amp;').replace(/</g, '&lt;')} · ${dimensoes}</text></svg>`,
      );
      indice.push(`#${numero}\t${chave}\t${dimensoes}`);
      const x = (posicao % COLUNAS) * LARGURA;
      const y = Math.floor(posicao / COLUNAS) * (ALTURA + RODAPE);
      return [
        { input: miniatura, left: x, top: y },
        { input: texto, left: x, top: y + ALTURA },
      ];
    }),
  );
  const numeroFolha = Math.floor(inicio / porFolha) + 1;
  await sharp({
    create: {
      width: COLUNAS * LARGURA,
      height: LINHAS * (ALTURA + RODAPE),
      channels: 3,
      background: '#dddddd',
    },
  })
    .composite(camadas.flat())
    .jpeg({ quality: 80 })
    .toFile(path.join(PASTA, `${nomeGrupo}-${String(numeroFolha).padStart(2, '0')}.jpg`));
}

const numero = (linha: string) => Number(linha.slice(1, linha.indexOf('\t')));
indice.sort((a, b) => numero(a) - numero(b));
await writeFile(path.join(PASTA, `${nomeGrupo}-indice.txt`), indice.join('\n'));
console.log(
  `${chaves.length} imagens em ${Math.ceil(chaves.length / porFolha)} folha(s): ${PASTA}`,
);
