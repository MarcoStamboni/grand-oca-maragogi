/**
 * Folha única de ícones (sprite SVG): um <symbol> por ícone do site. As páginas só referenciam
 * `/icones.svg#nome` (Icone.astro), em vez de repetir o desenho de cada ícone no HTML. O arquivo
 * é baixado uma vez e fica em cache.
 */
import type { APIRoute } from 'astro';

import { nomesIcones, obterIcone } from '@/lib/icones';

const atributos = (valores: Record<string, string | number>) =>
  Object.entries(valores)
    .map(([chave, valor]) => `${chave}="${String(valor).replace(/"/g, '&quot;')}"`)
    .join(' ');

export const GET: APIRoute = () => {
  const simbolos = nomesIcones.map((nome) => {
    const { nos } = obterIcone(nome);
    const conteudo = nos.map(([tag, attrs]) => `<${tag} ${atributos(attrs)}/>`).join('');
    return `<symbol id="${nome}" viewBox="0 0 24 24">${conteudo}</symbol>`;
  });
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg">${simbolos.join('')}</svg>`, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
