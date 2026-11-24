import { describe, expect, it } from 'vitest';

import {
  atributo,
  atualizadoEm,
  cabecalhos,
  canonica,
  contarPalavras,
  decodificarEntidades,
  ids,
  indexavel,
  links,
  meta,
  principal,
  respostaDireta,
  textoVisivel,
  tituloDaPagina,
} from './html';

const pagina = `<!doctype html><html><head>
<title>Classic | Summerville</title>
<meta name="description" content="Apartamento &quot;Classic&quot; de 36 m²">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://exemplo.com.br/acomodacoes/classic/">
<script type="application/ld+json">{"name":"<h2>Não conta</h2>"}</script>
</head><body>
<header id="topo"><h2>Menu</h2></header>
<main id="conteudo"><h1 class="t">Classic</h1>
<meta property="og:updated_time" content="2026-09-30">
<p class="x" data-resposta-direta>O Classic do <b>Summerville</b> tem 36&nbsp;m².</p>
<!-- <h2>comentário</h2> -->
<h2 id="ficha">Qual é o tamanho?</h2><a href="/acomodacoes/#lista">Voltar</a>
</main>
<footer><h2>Atendimento</h2><a href="https://wa.me/55">WhatsApp</a></footer>
</body></html>`;

describe('leitura do HTML gerado', () => {
  it('decodifica entidades nomeadas e numéricas', () => {
    expect(decodificarEntidades('a &amp; b &quot;c&quot; d&#39;e &#x27;f&#x27; &lt;g&gt;')).toBe(
      `a & b "c" d'e 'f' <g>`,
    );
  });

  it('lê título, descrição, robots e canônica', () => {
    expect(tituloDaPagina(pagina)).toBe('Classic | Summerville');
    expect(meta(pagina, 'description')).toBe('Apartamento "Classic" de 36 m²');
    expect(canonica(pagina)).toBe('https://exemplo.com.br/acomodacoes/classic/');
    expect(indexavel(pagina)).toBe(true);
    expect(indexavel('<meta name="robots" content="noindex, nofollow">')).toBe(false);
  });

  it('ignora head, scripts e comentários nos títulos e no texto', () => {
    expect(cabecalhos(pagina)).toEqual([
      { nivel: 2, texto: 'Menu' },
      { nivel: 1, texto: 'Classic' },
      { nivel: 2, texto: 'Qual é o tamanho?' },
      { nivel: 2, texto: 'Atendimento' },
    ]);
    expect(cabecalhos(principal(pagina)).map(({ texto }) => texto)).toEqual([
      'Classic',
      'Qual é o tamanho?',
    ]);
    expect(textoVisivel(pagina)).not.toContain('Não conta');
    expect(textoVisivel(pagina)).not.toContain('comentário');
  });

  it('lê atributos com e sem valor', () => {
    expect(atributo('<img src="a.jpg" alt>', 'alt')).toBe('');
    expect(atributo('<img alt="Praia" src="a.jpg">', 'alt')).toBe('Praia');
    expect(atributo('<img src="a.jpg" data-alt="x">', 'alt')).toBeUndefined();
  });

  it('lista ids e links', () => {
    expect(ids(pagina)).toEqual(['topo', 'conteudo', 'ficha']);
    expect(links(pagina)).toEqual(['/acomodacoes/#lista', 'https://wa.me/55']);
  });

  it('lê a resposta direta e a data de atualização', () => {
    const resposta = respostaDireta(pagina) ?? '';
    // O espaço fixo (&nbsp;) vira espaço comum: o texto serve para contar e comparar palavras.
    expect(resposta).toBe('O Classic do Summerville tem 36 m².');
    expect(contarPalavras(resposta)).toBe(7);
    expect(atualizadoEm(pagina)).toBe('2026-09-30');
  });
});
