/**
 * Imagem de compartilhamento (Open Graph) do site: 1200×630, usada no cartão do link no
 * WhatsApp, Facebook, LinkedIn e X. Foto do resort em destaque, logo da Rede Resort All
 * Inclusive, nome do hotel, destino e o 0800 da central de reservas.
 *
 * Gera public/compartilhar.jpg. Rode de novo se mudar a foto, o nome ou o telefone:
 *   node scripts/imagens/compartilhar.ts
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const L = 1200;
const A = 630;

const texto = {
  nome: 'Grand Oca Maragogi Resort',
  destino: 'Praia de Ponta de Mangue · Maragogi (AL)',
  telefone: 'Reservas: 0800 737 6787',
};
// Vista aérea do resort (npm run imagens:preparar; o sufixo do arquivo muda se a chave mudar).
const FOTO = 'src/assets/imagens/grand-oca/resort/vista-aerea-resort.jpg';
const LOGO = 'public/marca/resort-all-inclusive.png';

const escapar = (valor: string) =>
  valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Degradê escuro embaixo (leitura do texto) e camada de textos.
const sobreposicao = `
<svg width="${L}" height="${A}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.15"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#021f3d" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="${L}" height="${A}" fill="url(#v)"/>
  <text x="60" y="470" font-family="Poppins, Arial, Helvetica, sans-serif" font-size="58"
    font-weight="700" fill="#ffffff">${escapar(texto.nome)}</text>
  <text x="60" y="518" font-family="Poppins, Arial, Helvetica, sans-serif" font-size="28"
    fill="#ffffff" fill-opacity="0.9">${escapar(texto.destino)}</text>
  <rect x="60" y="545" width="430" height="58" rx="29" fill="#0a7d4f"/>
  <text x="275" y="584" text-anchor="middle" font-family="Poppins, Arial, Helvetica, sans-serif"
    font-size="28" font-weight="700" fill="#ffffff">${escapar(texto.telefone)}</text>
</svg>`;

// Logo da rede numa cápsula branca no canto superior esquerdo.
const logo = await sharp(await readFile(path.join(RAIZ, LOGO)))
  .resize({ height: 56 })
  .toBuffer();
const { width: larguraLogo = 220 } = await sharp(logo).metadata();
const capsula = Buffer.from(
  `<svg width="${larguraLogo + 40}" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="${larguraLogo + 40}" height="80" rx="18" fill="#ffffff" fill-opacity="0.95"/></svg>`,
);

await sharp(await readFile(path.join(RAIZ, FOTO)))
  .resize(L, A, { fit: 'cover', position: 'centre' })
  .composite([
    { input: Buffer.from(sobreposicao), left: 0, top: 0 },
    { input: capsula, left: 50, top: 40 },
    { input: logo, left: 70, top: 52 },
  ])
  .jpeg({ quality: 86, mozjpeg: true, progressive: true })
  .toFile(path.join(RAIZ, 'public/compartilhar.jpg'));

console.log('public/compartilhar.jpg gerada (1200×630).');
