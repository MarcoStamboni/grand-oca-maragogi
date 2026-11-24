/**
 * Gera publicar/grand-oca-maragogi-site.zip com o conteúdo de dist/ (inclui o .htaccess), pronto para
 * enviar à pasta do site no cPanel (Gerenciador de Arquivos → Upload → Extrair).
 * Uso: npm run build && npm run zip
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const saida = path.join(raiz, 'publicar', 'grand-oca-maragogi-site.zip');
mkdirSync(path.dirname(saida), { recursive: true });
rmSync(saida, { force: true });
// No Windows, usa o bsdtar do sistema (o tar do Git Bash não grava .zip).
const tar =
  process.platform === 'win32'
    ? path.join(process.env.SystemRoot ?? 'C:/Windows', 'System32', 'tar.exe')
    : 'tar';
execFileSync(tar, ['-a', '-c', '-f', saida, '-C', path.join(raiz, 'dist'), '.'], {
  stdio: 'inherit',
});
console.log(`Gerado: ${saida}`);
