/**
 * Monta a pasta que vai para a hospedagem, no formato da HostGator: `publicar/<domínio>/`,
 * com o mesmo nome da pasta do site no servidor (cada site é uma pasta com o nome do domínio
 * na home). É só enviar o conteúdo dela por SFTP.
 *
 * Entra TUDO o que o build gerou em `dist/`, inclusive o `.htaccess` (arquivo oculto: confira se
 * o seu programa de FTP mostra arquivos ocultos) e os `_redirects`/`_headers`, no mesmo formato
 * dos outros sites da agência já publicados. No Apache esses dois não fazem nada (quem redireciona
 * é o `.htaccess`); ficam ali só como referência e não expõem nada.
 *
 * Uso: npm run publicar   (depois de npm run build)
 */
import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const DESTINO_BASE = path.join(RAIZ, 'publicar');
/** Nada fica de fora: a pasta é um espelho do `dist/`. */
const FORA = new Set<string>();

async function existe(caminho: string): Promise<boolean> {
  try {
    await stat(caminho);
    return true;
  } catch {
    return false;
  }
}

if (!(await existe(DIST))) {
  console.error('✗ Não há dist/. Rode "npm run build" antes de "npm run publicar".');
  process.exit(1);
}

/** Domínio do site, lido do próprio build (sitemap-index.xml). */
const indice = path.join(DIST, 'sitemap-index.xml');
if (!(await existe(indice))) {
  console.error('✗ dist/sitemap-index.xml não existe: gere o site de novo (npm run build).');
  process.exit(1);
}
const endereco = (await readFile(indice, 'utf8')).match(/<loc>([^<]+)<\/loc>/)?.[1];
if (!endereco) {
  console.error('✗ Não achei o endereço do site no sitemap-index.xml.');
  process.exit(1);
}
const dominio = new URL(endereco).host;
const destino = path.join(DESTINO_BASE, dominio);

await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });

for (const entrada of await readdir(DIST)) {
  if (FORA.has(entrada)) continue;
  await cp(path.join(DIST, entrada), path.join(destino, entrada), { recursive: true });
}

/** Conta arquivos e bytes da pasta montada. */
async function medir(pasta: string): Promise<{ arquivos: number; bytes: number }> {
  let arquivos = 0;
  let bytes = 0;
  for (const entrada of await readdir(pasta, { withFileTypes: true, recursive: true })) {
    if (!entrada.isFile()) continue;
    arquivos++;
    bytes += (await stat(path.join(entrada.parentPath, entrada.name))).size;
  }
  return { arquivos, bytes };
}

const { arquivos, bytes } = await medir(destino);
const temHtaccess = await existe(path.join(destino, '.htaccess'));

console.log(`Pasta pronta: publicar/${dominio}`);
console.log(`  ${arquivos} arquivo(s) · ${(bytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  .htaccess: ${temHtaccess ? 'incluído' : 'FALTANDO — não publique sem ele'}`);
console.log('  conteúdo: espelho de dist/ (nada fica de fora)');
console.log(`\nEnvie o conteúdo dessa pasta para a pasta ${dominio}/ na HostGator.`);
if (!temHtaccess) process.exit(1);
