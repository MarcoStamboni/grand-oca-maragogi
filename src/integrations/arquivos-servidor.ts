/**
 * Integração de build: grava em dist/ os arquivos de configuração do servidor.
 * - .htaccess (Apache): redirecionamentos 301, página 404, cache, compressão e segurança.
 * - _redirects e _headers (Netlify / Cloudflare Pages): o mesmo, no formato dessas plataformas.
 * Os redirecionamentos vêm de src/data/redirecionamentos.ts (operador ativo).
 */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

import { type Redirecionamento, redirecionamentosPorOperador } from '../data/redirecionamentos.ts';
import { dominio, OPERADOR_ATIVO } from '../site.config.ts';

const AVISO = 'Gerado no build por src/integrations/arquivos-servidor.ts. Não edite em dist/.';

const CABECALHOS_SEGURANCA = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

const CACHE = {
  /** Arquivos com hash no nome (CSS, JS, imagens e fontes otimizadas). */
  imutavel: 'public, max-age=31536000, immutable',
  /** HTML: sempre revalida, para publicar mudanças na hora. */
  html: 'public, max-age=0, must-revalidate',
  /** Ícones e arquivos de public/ sem hash. */
  estatico: 'public, max-age=604800',
  /** robots.txt, sitemaps, manifest. */
  curto: 'public, max-age=3600',
} as const;

const TIPOS_COMPRIMIVEIS =
  'text/html text/css text/plain text/xml application/javascript application/json application/xml application/manifest+json image/svg+xml';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Regra de rewrite: aceita a URL antiga com ou sem barra final, sem criar laço. */
function regraApache({ de, para }: Redirecionamento): string {
  const caminho = escaparRegex(de.slice(1));
  const barraOpcional = para === `${de}/` ? '' : '/?';
  return `  RewriteRule ^${caminho}${barraOpcional}$ ${para} [R=301,L,NC]`;
}

/**
 * 301 de www.<host> para o host canônico em HTTPS, preservando caminho e query string (padrão da
 * HostGator, validado no Makai em 29/10/2026). O host sai de `dominio.url`.
 */
export function regraWww(urlCanonica: string | null): string {
  if (!urlCanonica) return '';
  const host = new URL(urlCanonica).host;
  return `
  # Redirecionamento 301 de www.${host} (HTTP ou HTTPS) para o host canônico.
  RewriteCond %{HTTP_HOST} ^www\\.${escaparRegex(host)}$ [NC]
  RewriteRule ^(.*)$ https://${host}/$1 [R=301,L,NE]
`;
}

/** Host de validação fora dos buscadores (dominio.validacao). */
function blocoValidacao(host: string | null): string {
  if (!host) return '';
  return `
# Endereço de validação (${host}): o site abre normalmente, mas fica fora dos buscadores.
<IfModule mod_setenvif.c>
  SetEnvIfNoCase Host "^${host.replace(/\./g, '\\.')}$" ENDERECO_VALIDACAO
</IfModule>
<IfModule mod_headers.c>
  Header always set X-Robots-Tag "noindex, nofollow" env=ENDERECO_VALIDACAO
</IfModule>
`;
}
export function gerarHtaccess(
  redirecionamentos: readonly Redirecionamento[],
  hostValidacao: string | null = null,
  urlCanonica: string | null = null,
): string {
  const seguranca = Object.entries(CABECALHOS_SEGURANCA)
    .map(([nome, valor]) => `  Header always set ${nome} "${valor}"`)
    .join('\n');

  return `# ${AVISO}

Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddDefaultCharset utf-8
AddCharset utf-8 .html .css .js .json .xml .txt .webmanifest

<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
  AddType image/avif .avif
  AddType image/webp .webp
  AddType font/woff2 .woff2
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
${regraWww(urlCanonica)}
  # HTTPS obrigatório (HostGator com SSL ativo nos subdomínios).
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

  # URLs antigas → novas (${redirecionamentos.length} regras)
${redirecionamentos.map(regraApache).join('\n')}
</IfModule>

<IfModule mod_headers.c>
${seguranca}
  # HSTS: descomente só depois de o HTTPS estar ativo em todo o domínio.
  # Header always set Strict-Transport-Security "max-age=31536000"

  <FilesMatch "\\.html$">
    Header set Cache-Control "${CACHE.html}"
  </FilesMatch>
  <FilesMatch "\\.(png|svg|ico|jpg|webp|avif)$">
    Header set Cache-Control "${CACHE.estatico}"
  </FilesMatch>
  <FilesMatch "\\.(txt|xml|webmanifest)$">
    Header set Cache-Control "${CACHE.curto}"
  </FilesMatch>
  <If "%{REQUEST_URI} =~ m#^/_astro/#">
    Header set Cache-Control "${CACHE.imutavel}"
  </If>
</IfModule>

<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS ${TIPOS_COMPRIMIVEIS}
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE ${TIPOS_COMPRIMIVEIS}
</IfModule>
${blocoValidacao(hostValidacao)}`;
}

export function gerarRedirects(redirecionamentos: readonly Redirecionamento[]): string {
  const linhas = redirecionamentos.flatMap(({ de, para }) => {
    const variantes = new Set([de, encodeURI(de)]);
    return [...variantes].flatMap((origem) =>
      [origem, `${origem}/`]
        .filter((caminho) => caminho !== para)
        .map((caminho) => `${caminho}  ${para}  301`),
    );
  });
  return `# ${AVISO}\n${linhas.join('\n')}\n`;
}

export function gerarHeaders(): string {
  const seguranca = Object.entries(CABECALHOS_SEGURANCA)
    .map(([nome, valor]) => `  ${nome}: ${valor}`)
    .join('\n');
  return `# ${AVISO}
/*
${seguranca}

/_astro/*
  Cache-Control: ${CACHE.imutavel}

/*.png
  Cache-Control: ${CACHE.estatico}

/*.svg
  Cache-Control: ${CACHE.estatico}

/*.txt
  Cache-Control: ${CACHE.curto}
  Content-Type: text/plain; charset=utf-8

/sitemap*
  Cache-Control: ${CACHE.curto}

/site.webmanifest
  Cache-Control: ${CACHE.curto}
  Content-Type: application/manifest+json; charset=utf-8
`;
}

export default function arquivosServidor(): AstroIntegration {
  return {
    name: 'arquivos-servidor',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const redirecionamentos = redirecionamentosPorOperador[OPERADOR_ATIVO];
        const destino = (nome: string) => fileURLToPath(new URL(nome, dir));
        await writeFile(
          destino('.htaccess'),
          gerarHtaccess(redirecionamentos, dominio.validacao, dominio.url),
        );
        await writeFile(destino('_redirects'), gerarRedirects(redirecionamentos));
        // Cópia versionada dos arquivos de servidor (referência no repositório).
        const copia = fileURLToPath(new URL('../../servidor/', import.meta.url));
        await mkdir(copia, { recursive: true });
        await writeFile(
          `${copia}.htaccess`,
          gerarHtaccess(redirecionamentos, dominio.validacao, dominio.url),
        );
        await writeFile(`${copia}_redirects`, gerarRedirects(redirecionamentos));
        await writeFile(destino('_headers'), gerarHeaders());
        logger.info(
          `.htaccess, _redirects e _headers gerados (${redirecionamentos.length} redirecionamentos).`,
        );
      },
    },
  };
}

/**
 * Páginas de redirecionamento (meta refresh + canonical) para cada URL do site anterior: garantem a
 * mudança de endereço mesmo em hospedagens que ignoram o .htaccess. Roda depois da auditoria, porque
 * essas páginas não são conteúdo do site.
 */
export function paginasRedirecionamento(): AstroIntegration {
  return {
    name: 'paginas-redirecionamento',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const redirecionamentos = redirecionamentosPorOperador[OPERADOR_ATIVO];
        const destino = (nome: string) => fileURLToPath(new URL(nome, dir));
        const base = dominio.url ?? dominio.provisorio;
        for (const { de, para } of redirecionamentos) {
          const pasta = de.replace(/^\//, '');
          if (pasta === para.replace(/^\/|\/$/g, '')) continue;
          const arquivo = destino(`${pasta}/index.html`);
          try {
            await access(arquivo);
            continue;
          } catch {
            // não existe: pode criar
          }
          await mkdir(dirname(arquivo), { recursive: true });
          await writeFile(
            arquivo,
            `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Página transferida</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${base}${para}"><meta http-equiv="refresh" content="0; url=${para}"></head><body><p>Esta página mudou de endereço: <a href="${para}">continuar</a>.</p></body></html>
`,
          );
        }
      },
    },
  };
}
