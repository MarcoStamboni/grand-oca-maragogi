import { describe, expect, it } from 'vitest';

import { assetsAlcancados } from './alcance';

describe('assetsAlcancados', () => {
  const assets = new Map<string, string | null>([
    ['pagina.abc.js', 'import"./comum.def.js";'],
    ['comum.def.js', 'const x=1;'],
    ['estilo.ghi.css', '@font-face{src:url(/_astro/fontes/inter.jkl.woff2)}'],
    ['fontes/inter.jkl.woff2', null],
    ['foto.mno.webp', null],
    ['orfao.pqr.js', 'import"./comum.def.js";'],
    ['foto-orfa.stu.jpg', null],
  ]);

  it('segue as páginas, os imports entre scripts e as fontes do CSS', () => {
    const html =
      '<script type="module" src="/_astro/pagina.abc.js"></script><link href="/_astro/estilo.ghi.css"><img src="https://x.br/_astro/foto.mno.webp">';
    expect([...assetsAlcancados([html], assets)].sort()).toEqual([
      'comum.def.js',
      'estilo.ghi.css',
      'fontes/inter.jkl.woff2',
      'foto.mno.webp',
      'pagina.abc.js',
    ]);
  });

  it('um script órfão não mantém nada só por importar outro', () => {
    expect(assetsAlcancados(['<p>sem assets</p>'], assets).size).toBe(0);
  });
});
