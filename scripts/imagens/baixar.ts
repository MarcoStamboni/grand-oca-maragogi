/**
 * Baixa as fotos do inventário (docs/anexos/imagens-site-oficial.csv) para o cache local
 * .cache/imagens/originais/ (fora do git) e grava .cache/imagens/inventario.json.
 *
 * Exclui "ChatGPT-Image" (decisão 3) e ícones/selos/logos. Arquivos já baixados são mantidos.
 * Uso: npm run imagens:baixar
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp, { type Metadata } from 'sharp';

import { emLotes, fotosElegiveis, INVENTARIO, ORIGINAIS } from './comum.ts';

const CONCORRENCIA = 4;
const TENTATIVAS = 3;
const AGENTE =
  'Mozilla/5.0 (compatible; ResortModeloSiteBuild/1.0; download de imagens do inventario)';

/** Erro que não adianta repetir (ex.: a URL não serve uma imagem). */
class ErroDefinitivo extends Error {}

async function existe(arquivo: string): Promise<boolean> {
  try {
    return (await stat(arquivo)).size > 0;
  } catch {
    return false;
  }
}

async function baixar(url: string, destino: string): Promise<void> {
  let ultimoErro: unknown;
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    try {
      const resposta = await fetch(url, {
        headers: { 'User-Agent': AGENTE },
        signal: AbortSignal.timeout(30_000),
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const tipo = resposta.headers.get('content-type') ?? '';
      // Algumas URLs do inventário devolvem uma página HTML com status 200.
      if (!tipo.startsWith('image/'))
        throw new ErroDefinitivo(`não é imagem (${tipo || 'sem content-type'})`);
      const dados = Buffer.from(await resposta.arrayBuffer());
      await mkdir(path.dirname(destino), { recursive: true });
      await writeFile(destino, dados);
      return;
    } catch (erro) {
      if (erro instanceof ErroDefinitivo) throw erro;
      ultimoErro = erro;
      await new Promise((resolver) => setTimeout(resolver, 1000 * tentativa));
    }
  }
  throw ultimoErro;
}

const fotos = await fotosElegiveis();
console.log(`Fotos elegíveis no inventário: ${fotos.length}`);

let baixadas = 0;
let existentes = 0;
const falhas: { chave: string; erro: string }[] = [];

const inventario = await emLotes(fotos, CONCORRENCIA, async (foto) => {
  const destino = path.join(ORIGINAIS, foto.chave);
  if (await existe(destino)) {
    existentes++;
  } else {
    try {
      await baixar(foto.url, destino);
      baixadas++;
    } catch (erro) {
      falhas.push({ chave: foto.chave, erro: String(erro) });
      return null;
    }
  }
  // Lê como buffer: o libvips não abre caminhos acima de 260 caracteres no Windows.
  let meta: Metadata;
  try {
    meta = await sharp(await readFile(destino)).metadata();
  } catch (erro) {
    falhas.push({ chave: foto.chave, erro: `arquivo inválido: ${String(erro)}` });
    return null;
  }
  return {
    chave: foto.chave,
    largura: meta.width,
    altura: meta.height,
    formato: meta.format,
    bytes: (await stat(destino)).size,
    altOriginal: foto.altOriginal,
    paginas: foto.paginas,
  };
});

await mkdir(path.dirname(INVENTARIO), { recursive: true });
await writeFile(
  INVENTARIO,
  JSON.stringify(
    inventario.filter((item) => item !== null),
    null,
    2,
  ),
);

console.log(`Baixadas: ${baixadas} · já existiam: ${existentes} · falhas: ${falhas.length}`);
for (const falha of falhas) console.error(`  ✗ ${falha.chave}: ${falha.erro}`);
if (falhas.length > 0) process.exitCode = 1;
