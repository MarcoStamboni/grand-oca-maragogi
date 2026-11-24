/**
 * Gera as ilustrações de demonstração do site-modelo para as chaves registradas em
 * src/content/imagens/imagens.yaml com o campo `modelo` (tema da cena, ver cenas-modelo.ts).
 *
 * Cada ilustração é um JPEG de 1600 × 1067 px desenhado em SVG (sem texto, para não brigar com
 * títulos sobre a foto). No site de um resort real, essas chaves saem do registro e entram as
 * fotos do resort (README, seção "Imagens"); o build de produção recusa ilustrações de modelo.
 *
 * Uso: npm run imagens:modelo  (use -- --forcar para refazer as que já existem)
 *      npm run imagens:modelo -- --folha  (só gera .cache/imagens/folha-modelo.jpg com os temas)
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import { parse } from 'yaml';

import { svgModelo, TEMAS_MODELO, type TemaModelo } from './cenas-modelo.ts';
import { arquivoOtimizado, CACHE, REGISTRO } from './comum.ts';

const forcar = process.argv.includes('--forcar');

async function existe(arquivo: string): Promise<boolean> {
  try {
    await stat(arquivo);
    return true;
  } catch {
    return false;
  }
}

function rasterizar(chave: string, tema: TemaModelo, largura?: number): Promise<Buffer> {
  const imagem = sharp(Buffer.from(svgModelo(chave, tema)));
  if (largura) imagem.resize(largura);
  return imagem.jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
}

/** Folha de conferência: todos os temas, duas variações de cada. */
async function gerarFolha(): Promise<void> {
  const largura = 400;
  const altura = Math.round((largura * 1067) / 1600);
  const colunas = 4;
  const itens = TEMAS_MODELO.flatMap((tema) =>
    [`folha/${tema}-1`, `folha/${tema}-2`].map((chave) => ({ chave, tema })),
  );
  const linhas = Math.ceil(itens.length / colunas);
  const camadas = await Promise.all(
    itens.map(async ({ chave, tema }, indice) => ({
      input: await rasterizar(chave, tema, largura),
      left: (indice % colunas) * (largura + 8),
      top: Math.floor(indice / colunas) * (altura + 8),
    })),
  );
  const destino = path.join(CACHE, 'folha-modelo.jpg');
  await mkdir(CACHE, { recursive: true });
  await sharp({
    create: {
      width: colunas * (largura + 8) - 8,
      height: linhas * (altura + 8) - 8,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite(camadas)
    .jpeg({ quality: 80 })
    .toFile(destino);
  console.log(`Folha de conferência: ${path.relative(process.cwd(), destino)}`);
}

if (process.argv.includes('--folha')) {
  await gerarFolha();
} else {
  const registro = parse(await readFile(REGISTRO, 'utf8')) as Record<
    string,
    { alt: string; modelo?: TemaModelo }
  >;
  let geradas = 0;
  let mantidas = 0;

  for (const [chave, { modelo: tema }] of Object.entries(registro)) {
    if (!tema) continue;
    if (!TEMAS_MODELO.includes(tema)) {
      throw new Error(`Tema de modelo desconhecido em ${chave}: ${tema}`);
    }
    const destino = arquivoOtimizado(chave);
    if (!forcar && (await existe(destino))) {
      mantidas++;
      continue;
    }
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, await rasterizar(chave, tema));
    geradas++;
  }

  console.log(`Ilustrações de modelo: ${geradas} gerada(s), ${mantidas} mantida(s).`);
}
