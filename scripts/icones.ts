/**
 * Gera os ícones e as versões da logo a partir dos originais da marca da agência
 * (scripts/marca/, enviados pelo usuário em 05/10/2026):
 * - símbolo (sol e mar) → favicon.ico (16, 32 e 48), favicon-96.png, apple-touch-icon (180),
 *   ícones do manifest (192 e 512) e versão "maskable" com margem de segurança, sobre branco;
 * - logo horizontal → public/marca/resort-all-inclusive.webp (cabeçalho e rodapé) e .png
 *   (logo do JSON-LD) e versão clara para fundo escuro (rodapé).
 * Uso: npm run icones  (os arquivos gerados vão para o git)
 * Na troca para o site oficial (operador "oficial"), os ícones precisam voltar a ser do resort.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publico = path.join(raiz, 'public');
const marca = path.join(raiz, 'scripts', 'marca');
const simbolo = await readFile(path.join(marca, 'resort-all-inclusive-simbolo.webp'));
const logo = await readFile(path.join(marca, 'resort-all-inclusive.webp'));
const FUNDO = '#ffffff';

/** Símbolo centralizado num quadrado, com margem (fração do lado) e fundo opcional. */
async function quadrado(tamanho: number, margem: number, fundo?: string): Promise<Buffer> {
  const interno = Math.round(tamanho * (1 - margem * 2));
  const icone = await sharp(simbolo)
    .resize(interno, interno, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: tamanho,
      height: tamanho,
      channels: 4,
      background: fundo ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: icone, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Arquivo .ico com imagens PNG embutidas (formato aceito por todos os navegadores atuais). */
function ico(imagens: { tamanho: number; png: Buffer }[]): Buffer {
  const cabecalho = Buffer.alloc(6 + 16 * imagens.length);
  cabecalho.writeUInt16LE(0, 0);
  cabecalho.writeUInt16LE(1, 2);
  cabecalho.writeUInt16LE(imagens.length, 4);
  let deslocamento = cabecalho.length;
  imagens.forEach(({ tamanho, png }, indice) => {
    const entrada = 6 + 16 * indice;
    cabecalho.writeUInt8(tamanho >= 256 ? 0 : tamanho, entrada);
    cabecalho.writeUInt8(tamanho >= 256 ? 0 : tamanho, entrada + 1);
    cabecalho.writeUInt16LE(1, entrada + 4);
    cabecalho.writeUInt16LE(32, entrada + 6);
    cabecalho.writeUInt32LE(png.length, entrada + 8);
    cabecalho.writeUInt32LE(deslocamento, entrada + 12);
    deslocamento += png.length;
  });
  return Buffer.concat([cabecalho, ...imagens.map(({ png }) => png)]);
}

async function gravar(arquivo: string, conteudo: Buffer): Promise<void> {
  await writeFile(path.join(publico, arquivo), conteudo);
  console.log(`✓ ${arquivo}`);
}

// Aba do navegador: fundo transparente, quase sem margem (o símbolo aparece maior).
const pequenos = await Promise.all(
  [16, 32, 48].map(async (tamanho) => ({ tamanho, png: await quadrado(tamanho, 0.02) })),
);
await gravar('favicon.ico', ico(pequenos));
await gravar('favicon-96.png', await quadrado(96, 0.04));

// Celular e manifest: fundo branco (iOS e Android não mostram transparência).
await gravar('apple-touch-icon.png', await quadrado(180, 0.1, FUNDO));
await gravar('icon-192.png', await quadrado(192, 0.08, FUNDO));
await gravar('icon-512.png', await quadrado(512, 0.08, FUNDO));
// Maskable: o conteúdo precisa caber no círculo central (80%).
await gravar('icon-maskable-512.png', await quadrado(512, 0.18, FUNDO));

// Logo horizontal: 480 px de largura (cabeçalho de 40 a 48 px de altura, telas 2x) e PNG para
// o JSON-LD (Google aceita PNG, JPEG, WebP; PNG é o mais compatível com outros leitores).
await gravar(
  'marca/resort-all-inclusive.webp',
  await sharp(logo).resize({ width: 480 }).webp({ quality: 90 }).toBuffer(),
);
await gravar(
  'marca/resort-all-inclusive.png',
  await sharp(logo).resize({ width: 600 }).png({ compressionLevel: 9, palette: true }).toBuffer(),
);

/**
 * Versão clara da logo para fundos escuros (rodapé): no letreiro (à direita do símbolo), o azul
 * vira branco e o branco da faixa "by Resorts Online" vira o azul-escuro do rodapé; o laranja de
 * "ALL" e o símbolo ficam como estão. A mistura proporcional preserva o antisserrilhado.
 */
async function logoClara(): Promise<Buffer> {
  const { data, info } = await sharp(logo)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const inicioLetreiro = Math.round(info.width * 0.215);
  const azul = (0 + 74 + 151) / 3;
  // Azul-escuro do rodapé (mar-950, #00313f).
  const [escuroR, escuroG, escuroB] = [0, 49, 63];
  for (let y = 0; y < info.height; y++) {
    for (let x = inicioLetreiro; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const [r = 0, g = 0, b = 0] = [data[i], data[i + 1], data[i + 2]];
      if (r > b + 60) continue; // laranja
      const t = Math.min(1, Math.max(0, ((r + g + b) / 3 - azul) / (255 - azul)));
      data[i] = Math.round(255 + (escuroR - 255) * t);
      data[i + 1] = Math.round(255 + (escuroG - 255) * t);
      data[i + 2] = Math.round(255 + (escuroB - 255) * t);
    }
  }
  return sharp(data, { raw: info }).resize({ width: 480 }).webp({ quality: 90 }).toBuffer();
}

await gravar('marca/resort-all-inclusive-claro.webp', await logoClara());
