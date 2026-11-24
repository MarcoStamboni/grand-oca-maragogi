/**
 * Páginas que não devem entrar no sitemap: rotas exclusivas de outro operador (decisão 1)
 * e páginas com `semIndice`. A 404 é excluída automaticamente pelo @astrojs/sitemap.
 */
import { chavesRotas, rotas } from './rotas.ts';
import { OPERADOR_ATIVO } from '../site.config.ts';

const exclusivasDeOutroOperador = chavesRotas
  .filter((chave) => {
    const { somenteOperador, desligada } = rotas[chave];
    return desligada || (somenteOperador !== undefined && somenteOperador !== OPERADOR_ATIVO);
  })
  .map((chave) => rotas[chave].caminho);

export const caminhosForaDoSitemap: ReadonlySet<string> = new Set<string>(
  exclusivasDeOutroOperador,
);
