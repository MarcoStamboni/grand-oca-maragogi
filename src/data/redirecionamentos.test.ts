import { describe, expect, it } from 'vitest';

import { chavesRotas, rotas } from '@/data/rotas';
import { gerarHtaccess, gerarRedirects } from '@/integrations/arquivos-servidor';
import { rotaDisponivel } from '@/lib/navegacao';
import type { OperadorId } from '@/site.config';

import { redirecionamentosPorOperador } from './redirecionamentos';

/** Ids das páginas de detalhe, lidos dos arquivos de conteúdo. */
const idsDe = (pasta: string) =>
  Object.keys(import.meta.glob(`/src/content/*/*.md`))
    .filter((caminho) => caminho.startsWith(`/src/content/${pasta}/`))
    .map((caminho) => caminho.split('/').pop()?.replace(/\.md$/, ''));

const acomodacoes = new Set(idsDe('acomodacoes'));
const restaurantes = new Set(idsDe('restaurantes'));
const datasEspeciais = new Set(idsDe('datas-especiais'));

function destinoExiste(para: string, operador: OperadorId): boolean {
  const fixa = chavesRotas.find((chave) => rotas[chave].caminho === para);
  if (fixa) return rotaDisponivel(fixa, operador);
  const [, tipo, id] =
    para.match(/^\/(acomodacoes|all-inclusive\/restaurantes|datas-especiais)\/([^/]+)\/$/) ?? [];
  if (tipo === 'acomodacoes') return acomodacoes.has(id);
  if (tipo === 'all-inclusive/restaurantes') return restaurantes.has(id);
  if (tipo === 'datas-especiais') return datasEspeciais.has(id);
  return false;
}

describe.each(
  Object.entries(redirecionamentosPorOperador) as [
    OperadorId,
    typeof redirecionamentosPorOperador.agencia,
  ][],
)('redirecionamentos (%s)', (operador, lista) => {
  it('têm origens únicas, sem barra final', () => {
    const origens = lista.map((item) => item.de);
    expect(new Set(origens).size).toBe(origens.length);
    for (const origem of origens) expect(origem).toMatch(/^\/[^/]+(\/[^/]+)*$/);
  });

  it('apontam para páginas que existem para o operador', () => {
    const invalidos = lista.filter((item) => !destinoExiste(item.para, operador));
    expect(invalidos).toEqual([]);
  });

  it('deixam as regras de seção inteira (prefixo) depois das exatas', () => {
    const primeiro = lista.findIndex((item) => item.prefixo);
    if (primeiro < 0) return;
    expect(lista.slice(primeiro).every((item) => item.prefixo === true)).toBe(true);
  });

  it('não têm prefixo que engula uma página do site novo', () => {
    const prefixos = lista.filter((item) => item.prefixo).map((item) => item.de);
    const engolidas = chavesRotas
      .map((chave) => rotas[chave].caminho)
      .filter((caminho) =>
        prefixos.some((prefixo) => caminho === `${prefixo}/` || caminho.startsWith(`${prefixo}/`)),
      );
    expect(engolidas).toEqual([]);
  });
});

describe('arquivos do servidor', () => {
  const exemplo = [
    { de: '/quem-somos', para: '/quem-somos/' },
    { de: '/1', para: '/' },
    { de: '/preços-resort', para: '/reservas/' },
  ] as const;

  it('geram regras sem laço quando só muda a barra final', () => {
    const htaccess = gerarHtaccess(exemplo);
    expect(htaccess).toContain('RewriteRule ^quem-somos$ /quem-somos/ [R=301,L,NC]');
    expect(htaccess).toContain('RewriteRule ^1/?$ / [R=301,L,NC]');
    const redirects = gerarRedirects(exemplo);
    expect(redirects).not.toMatch(/^\/quem-somos\/\s+\/quem-somos\/\s+301$/m);
    expect(redirects).toContain('/pre%C3%A7os-resort  /reservas/  301');
  });

  it('geram regra de seção inteira quando o redirecionamento é de prefixo', () => {
    const secao = [{ de: '/post', para: '/blog/', prefixo: true }] as const;
    expect(gerarHtaccess(secao)).toContain('RewriteRule ^post(/.*)?$ /blog/ [R=301,L,NC]');
    const redirects = gerarRedirects(secao);
    expect(redirects).toContain('/post/*  /blog/  301');
    expect(redirects).toContain('/post  /blog/  301');
  });
});
