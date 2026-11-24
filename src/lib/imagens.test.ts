/**
 * Integridade do pipeline de imagens: toda chave usada no conteúdo tem texto alternativo
 * e arquivo otimizado; nenhuma chave é "ChatGPT-Image" (decisão 3) e nenhuma foto com rosto de
 * pessoas (`rosto: true`) é usada no conteúdo, nas páginas, nos dados ou nos componentes.
 */
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { arquivoDaChave } from './imagens-chave';

const registro = parse(
  Object.values(
    import.meta.glob<string>('/src/content/imagens/imagens.yaml', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  )[0] ?? '',
) as Record<string, { alt: string; rosto?: boolean }>;

const arquivos = new Set(
  Object.keys(import.meta.glob('/src/assets/imagens/**/*.jpg')).map((caminho) =>
    caminho.replace('/src/assets/imagens/', ''),
  ),
);

const conteudo = import.meta.glob<string>(
  ['/src/content/**/*.{md,yaml}', '!/src/content/imagens/**'],
  { query: '?raw', import: 'default', eager: true },
);

/**
 * Chaves no formato do WordPress ("2018/12/foto.jpg"), do site-modelo ("modelo/geral/praia.jpg")
 * ou da pasta de fotos do resort ("grand-oca/resort/praia-coqueiral.jpg").
 */
const padraoChave =
  /((?:\d{4}\/\d{2}|(?:modelo|summerville|grand-oca)\/[a-z-]+)\/[^\s'"`]+\.(?:jpe?g|png|webp))/gi;
const chavesDe = (textos: Record<string, string>) =>
  new Set(
    Object.values(textos).flatMap((texto) =>
      [...texto.matchAll(padraoChave)].map((achado) => achado[1] ?? ''),
    ),
  );
const chavesUsadas = chavesDe(conteudo);

// Páginas, dados e componentes também citam chaves (capas, faixa de fotos, piscina).
const codigo = import.meta.glob<string>('/src/{pages,data,components}/**/*.{astro,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('registro de imagens', () => {
  it('tem texto alternativo para toda imagem usada no conteúdo', () => {
    // Sanidade: os globs encontraram o conteúdo e o registro.
    expect(chavesUsadas.size).toBeGreaterThan(30);
    expect(Object.keys(registro).length).toBeGreaterThanOrEqual(chavesUsadas.size);
    const semRegistro = [...chavesUsadas].filter((chave) => !registro[chave]);
    expect(semRegistro).toEqual([]);
  });

  it('tem arquivo otimizado para toda chave registrada', () => {
    const semArquivo = Object.keys(registro).filter(
      (chave) => !arquivos.has(arquivoDaChave(chave)),
    );
    expect(semArquivo).toEqual([]);
  });

  it('não tem arquivos órfãos em src/assets/imagens', () => {
    const esperados = new Set(Object.keys(registro).map(arquivoDaChave));
    expect([...arquivos].filter((arquivo) => !esperados.has(arquivo))).toEqual([]);
  });

  it('não usa fotos com rosto de pessoas (rosto: true)', () => {
    // Sanidade: o glob do código achou chaves.
    expect(chavesDe(codigo).size).toBeGreaterThan(10);
    const comRosto = [...chavesUsadas, ...chavesDe(codigo)].filter(
      (chave) => registro[chave]?.rosto,
    );
    expect(comRosto).toEqual([]);
  });

  it('não usa imagens "ChatGPT-Image"', () => {
    const proibidas = [...Object.keys(registro), ...chavesUsadas].filter((chave) =>
      /chatgpt-image/i.test(chave),
    );
    expect(proibidas).toEqual([]);
  });
});

describe('nome do arquivo otimizado', () => {
  it('normaliza, limita e diferencia chaves parecidas', () => {
    const a = arquivoDaChave('fotos/Suite-Master.-2.jpg');
    const b = arquivoDaChave('fotos/Suite-Master-2.jpg');
    expect(a).toMatch(/^fotos\/suite-master-2-[0-9a-f]{6}\.jpg$/);
    expect(a).not.toBe(b);
    expect(arquivoDaChave(`2026/07/${'x'.repeat(200)}.webp`).length).toBeLessThan(100);
  });
});
