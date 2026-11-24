/**
 * Otimiza as imagens registradas em src/content/imagens/imagens.yaml a partir do cache
 * (.cache/imagens/originais/) para src/assets/imagens/, que vai para o git.
 *
 * - Corrige a orientação (EXIF), limita a largura a 1600 px, aplica o filtro Vibrance (cores vivas,
 *   scripts/imagens/vibrance.ts) e o tom quente do site, remove metadados e grava
 *   JPEG progressivo (mozjpeg). AVIF/WebP e o srcset são gerados pelo Astro no build.
 * - Remove de src/assets/imagens/ os arquivos que saíram do registro.
 * - Falha se: alguma chave usada no conteúdo não estiver registrada, alguma chave
 *   registrada for "ChatGPT-Image" ou não existir no cache.
 *
 * Uso: npm run imagens:preparar  (use -- --forcar para reprocessar tudo)
 */
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import { parse } from 'yaml';

import {
  arquivoOtimizado,
  DESTINO,
  ehImagemIA,
  emLotes,
  ORIGINAIS,
  RAIZ,
  REGISTRO,
} from './comum.ts';
import { aplicarVibrance, VIBRANCE_PADRAO } from './vibrance.ts';

const LARGURA_MAXIMA = 1600;
/**
 * Capas das páginas (topo em tela cheia): ampliadas para 1920 px (Full HD) com reamostragem
 * Lanczos e nitidez extra. As fotos oficiais das acomodações e do resort têm até 2100 px; as da pasta
 * do cliente, até 1280 px (a ampliação deixa a capa nítida na tela grande, mas não cria detalhe real).
 */
const LARGURA_CAPA = 1920;
const CAPAS = new Set<string>([
  'grand-oca/resort/vista-aerea-resort.jpg',
  'grand-oca/resort/vista-aerea-bangalos.jpg',
  'grand-oca/resort/praia-coqueiral.jpg',
  'grand-oca/resort/praia-areia-ampla.jpg',
  'grand-oca/resort/jardim-cabanas-coqueiral.jpg',
  'grand-oca/resort/vista-aerea-praia-piscina.jpg',
  'grand-oca/resort/vista-aerea-edificios-novos.jpg',
  'grand-oca/resort/praia-espreguicadeiras-aerea.jpg',
  'grand-oca/resort/nascer-do-sol-mar.jpg',
  'grand-oca/regiao/piscinas-naturais-aereo.jpg',
  'grand-oca/piscinas/piscina-solario.jpg',
  'grand-oca/piscinas/piscina-borda-infinita.jpg',
  'grand-oca/piscinas/piscina-bangalos.jpg',
  'grand-oca/criancas/parque-aquatico-escorregadores.jpg',
  'grand-oca/criancas/parque-aquatico-torre.jpg',
  'grand-oca/gastronomia/restaurante-corais-buffet.jpg',
  'grand-oca/gastronomia/restaurante-salao-mesas.jpg',
  'grand-oca/gastronomia/restaurante-corais-noite.jpg',
  'grand-oca/gastronomia/bar-piscina-noite.jpg',
  'grand-oca/lazer/academia.jpg',
  'grand-oca/acomodacoes/bangalo-fachada.jpg',
  'grand-oca/acomodacoes/bangalo-triplo-fachada.jpg',
  'grand-oca/acomodacoes/standard-predio-jardim.jpg',
  'grand-oca/acomodacoes/comunicante-varanda.jpg',
  'grand-oca/acomodacoes/suite-predio.jpg',
  'grand-oca/acomodacoes/suite-deluxe-varanda.jpg',
  'grand-oca/acomodacoes/duplo-deluxe-varanda.jpg',
  'grand-oca/acomodacoes/deluxe-varanda.jpg',
]);
/**
 * Chaves que não vêm do cache e não são processadas aqui: as fotos dos outros resorts da rede.
 * Os arquivos são mantidos.
 */
const PRESERVADAS = /^rede\//;
const forcar = process.argv.includes('--forcar');

async function existe(arquivo: string): Promise<boolean> {
  try {
    await stat(arquivo);
    return true;
  } catch {
    return false;
  }
}

/** Chaves citadas nos arquivos de conteúdo (exceto o próprio registro). */
async function chavesUsadasNoConteudo(): Promise<Map<string, string[]>> {
  const usadas = new Map<string, string[]>();
  const padrao = /(\d{4}\/\d{2}\/[^\s'"]+\.(?:jpe?g|png|webp))/gi;
  const visitar = async (pasta: string): Promise<void> => {
    for (const entrada of await readdir(pasta, { withFileTypes: true })) {
      const caminho = path.join(pasta, entrada.name);
      if (entrada.isDirectory()) await visitar(caminho);
      else if (/\.(md|ya?ml)$/.test(entrada.name) && caminho !== REGISTRO) {
        const relativo = path.relative(RAIZ, caminho);
        for (const achado of (await readFile(caminho, 'utf8')).matchAll(padrao)) {
          const chave = achado[1];
          if (chave) usadas.set(chave, [...(usadas.get(chave) ?? []), relativo]);
        }
      }
    }
  };
  await visitar(path.join(RAIZ, 'src/content'));
  return usadas;
}

async function listarArquivos(pasta: string): Promise<string[]> {
  if (!(await existe(pasta))) return [];
  const encontrados: string[] = [];
  for (const entrada of await readdir(pasta, { withFileTypes: true, recursive: true })) {
    if (entrada.isFile()) encontrados.push(path.join(entrada.parentPath, entrada.name));
  }
  return encontrados;
}

const registro = parse(await readFile(REGISTRO, 'utf8')) as Record<string, { alt: string }>;
const todasChaves = Object.keys(registro);
const chaves = todasChaves.filter((chave) => !PRESERVADAS.test(chave));
const erros: string[] = [];

for (const chave of chaves) {
  if (ehImagemIA(chave)) erros.push(`Imagem "ChatGPT-Image" no registro (decisão 3): ${chave}`);
  if (!(await existe(path.join(ORIGINAIS, chave)))) {
    erros.push(`Não está no cache (rode npm run imagens:baixar): ${chave}`);
  }
}
for (const [chave, arquivos] of await chavesUsadasNoConteudo()) {
  if (!registro[chave]) erros.push(`Usada em ${arquivos.join(', ')} sem registro/alt: ${chave}`);
}

const destinos = new Map<string, string>();
for (const chave of todasChaves) {
  const destino = arquivoOtimizado(chave);
  const outra = destinos.get(destino);
  if (outra) erros.push(`Duas chaves geram o mesmo arquivo: ${outra} e ${chave}`);
  destinos.set(destino, chave);
}

if (erros.length > 0) {
  for (const erro of erros) console.error(`✗ ${erro}`);
  process.exit(1);
}

let processadas = 0;
let mantidas = 0;
let bytesOriginais = 0;
let bytesFinais = 0;

await emLotes(chaves, 4, async (chave) => {
  const origem = path.join(ORIGINAIS, chave);
  const destino = arquivoOtimizado(chave);
  if (!forcar && (await existe(destino))) {
    mantidas++;
    return;
  }
  // Leitura em buffer: o libvips não abre caminhos longos no Windows.
  const dados = await readFile(origem);
  const capa = CAPAS.has(chave);
  const base = sharp(dados).rotate();
  const redimensionada = capa
    ? // Nitidez extra só nas capas ampliadas, para compensar a suavização da ampliação.
      base
        .resize({ width: LARGURA_CAPA, kernel: 'lanczos3' })
        .sharpen({ sigma: 1, m1: 0.6, m2: 2.5 })
    : base.resize({ width: LARGURA_MAXIMA, withoutEnlargement: true });
  // Pixels sRGB (sem alfa) para o filtro Vibrance, aplicado antes do toque de luz e tom quente.
  const { data: pixels, info } = await redimensionada
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const vivos = aplicarVibrance(pixels, 3, VIBRANCE_PADRAO);
  const saida = await sharp(vivos, { raw: { width: info.width, height: info.height, channels: 3 } })
    // Depois do Vibrance, só um toque de brilho e o tom quente de sol (mais vermelho, menos azul).
    .modulate({ brightness: 1.03 })
    .linear([1.03, 1.01, 0.97], [2, 1, -2])
    // Qualidade alta: o Astro recomprime em AVIF/WebP no build, então a base precisa de folga.
    .jpeg({ quality: 92, mozjpeg: true, progressive: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, saida);
  processadas++;
  bytesOriginais += dados.length;
  bytesFinais += saida.length;
});

// Remove arquivos que não correspondem mais a nenhuma chave registrada.
let removidas = 0;
for (const arquivo of await listarArquivos(DESTINO)) {
  if (!destinos.has(arquivo)) {
    await rm(arquivo);
    removidas++;
  }
}

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);
console.log(
  `Registradas: ${chaves.length} · processadas: ${processadas} · mantidas: ${mantidas} · removidas: ${removidas}`,
);
if (processadas > 0) console.log(`Tamanho: ${mb(bytesOriginais)} MB → ${mb(bytesFinais)} MB`);
