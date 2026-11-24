/**
 * Lighthouse nas páginas modelo, em celular e desktop, contra o site gerado (dist/).
 * Uso: `npm run build`, depois `npm run preview -- --port 4322` em outro terminal e
 *      `npm run lighthouse` (ou `npm run lighthouse -- http://localhost:4322 90` para mudar a
 *      URL base e a nota mínima). Usa o Chrome instalado, em modo headless e perfil temporário.
 * Relatórios JSON e o resumo (resumo.md) vão para reports/lighthouse/ (fora do git).
 * Termina com erro se alguma nota ficar abaixo da mínima (padrão: 95).
 * Observação: o `astro preview` não comprime os arquivos (o servidor de produção comprime,
 * pelo .htaccess/_headers), então o desempenho local tende a ser um pouco pior.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(raiz, 'node_modules', 'lighthouse', 'cli', 'index.js');
const pasta = path.join(raiz, 'reports', 'lighthouse');
const [base = 'http://localhost:4322', minimaTexto = '95'] = process.argv.slice(2);
const minima = Number(minimaTexto);

/** Uma página de cada modelo do site. */
const paginas = [
  '/',
  '/acomodacoes/bangalo/',
  '/all-inclusive/restaurantes/mar-aberto/',
  '/lazer/programacao/',
  '/datas-especiais/natal/',
  '/fotos/',
  '/blog/como-escolher-acomodacao/',
  '/perguntas-frequentes/',
];
const formatos = ['celular', 'desktop'] as const;
const categorias = ['performance', 'accessibility', 'best-practices', 'seo'] as const;
const nomesCategorias: Record<(typeof categorias)[number], string> = {
  performance: 'Desempenho',
  accessibility: 'Acessibilidade',
  'best-practices': 'Boas práticas',
  seo: 'SEO',
};

interface Relatorio {
  categories: Record<string, { score: number | null }>;
  audits: Record<string, { score: number | null; title: string; displayValue?: string }>;
}

mkdirSync(pasta, { recursive: true });
const linhas: string[] = [];
const abaixo: string[] = [];

for (const pagina of paginas) {
  for (const formato of formatos) {
    const nome = `${pagina.replace(/^\/|\/$/g, '').replaceAll('/', '_') || 'home'}-${formato}`;
    const saida = path.join(pasta, `${nome}.json`);
    execFileSync(
      process.execPath,
      [
        cli,
        new URL(pagina, base).href,
        '--quiet',
        '--output=json',
        `--output-path=${saida}`,
        `--only-categories=${categorias.join(',')}`,
        '--chrome-flags=--headless=new --no-first-run --no-default-browser-check',
        ...(formato === 'desktop' ? ['--preset=desktop'] : []),
      ],
      { stdio: 'inherit' },
    );
    const relatorio = JSON.parse(readFileSync(saida, 'utf8')) as Relatorio;
    const notas = categorias.map((categoria) =>
      Math.round((relatorio.categories[categoria]?.score ?? 0) * 100),
    );
    const metricas = ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time']
      .map((id) => relatorio.audits[id]?.displayValue ?? '—')
      .join(' · ');
    linhas.push(`| \`${pagina}\` | ${formato} | ${notas.join(' | ')} | ${metricas} |`);
    categorias.forEach((categoria, indice) => {
      if ((notas[indice] ?? 0) < minima) {
        const falhas = Object.values(relatorio.audits)
          .filter((auditoria) => auditoria.score !== null && auditoria.score < 0.9)
          .map((auditoria) => auditoria.title)
          .slice(0, 6);
        abaixo.push(
          `- \`${pagina}\` (${formato}), ${nomesCategorias[categoria]}: ${notas[indice]}. Itens: ${falhas.join('; ')}`,
        );
      }
    });
    console.log(`${pagina} (${formato}): ${notas.join(' / ')}`);
  }
}

const resumo = [
  `# Lighthouse (${new Date().toISOString().slice(0, 10)}, ${base})`,
  '',
  `Nota mínima: ${minima}. Colunas: ${categorias.map((c) => nomesCategorias[c]).join(', ')}.`,
  '',
  `| Página | Formato | ${categorias.map((c) => nomesCategorias[c]).join(' | ')} | LCP · CLS · TBT |`,
  `| --- | --- | ${categorias.map(() => '---').join(' | ')} | --- |`,
  ...linhas,
  '',
  abaixo.length > 0 ? '## Abaixo da nota mínima' : 'Todas as notas atingiram a mínima.',
  '',
  ...abaixo,
  '',
].join('\n');
writeFileSync(path.join(pasta, 'resumo.md'), resumo);
console.log(`\nResumo: ${path.relative(raiz, path.join(pasta, 'resumo.md'))}`);
if (abaixo.length > 0) {
  console.error(`${abaixo.length} nota(s) abaixo de ${minima}.`);
  process.exitCode = 1;
}
