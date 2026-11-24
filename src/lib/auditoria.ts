/**
 * Auditoria das páginas geradas (SEO, AEO e estrutura), usada pela integração
 * src/integrations/auditar-paginas.ts. Funções puras: recebem o HTML de todas as páginas e a
 * lista de arquivos do build e devolvem erros (derrubam o build), avisos e métricas.
 * Imports relativos com extensão: o astro.config carrega este arquivo sem o alias `@/`.
 */
import {
  atributo,
  atualizadoEm,
  cabecalhos,
  contarPalavras,
  corpo,
  ids,
  indexavel,
  links,
  meta,
  principal,
  respostaDireta,
  tags,
  tituloDaPagina,
} from './html.ts';
import { LIMITES } from './seo.ts';
import { modelo, resort } from '../site.config.ts';

/** Meta de AEO: a resposta direta pode ser citada sozinha (40 a 60 palavras). */
export const LIMITE_RESPOSTA = { min: 40, max: 60 } as const;

/** Nomes que deixam a resposta direta autossuficiente (o resort, a praia ou o destino). */
export const ENTIDADES_RESPOSTA = [
  ...new Set([resort.nomeCurto, resort.praia, resort.regiao, resort.destino.nome]),
];

/**
 * Nomes do conteúdo de demonstração. Com o modo modelo desligado (site publicado), qualquer um
 * deles numa página derruba o build: sinal de conteúdo fictício esquecido.
 */
export const NOMES_DO_MODELO = ['Resort Modelo', 'Praia Modelo', 'Cidade Modelo', 'Litoral Modelo'];

export interface PaginaAuditada {
  caminho: string;
  html: string;
}

export interface MetricasPagina {
  caminho: string;
  titulo: string;
  descricao: string;
  palavrasResposta: number;
  h2: number;
  /** H2 que não terminam em "?" (AEO prefere títulos em forma de pergunta). */
  h2SemPergunta: string[];
}

export interface ResultadoAuditoria {
  erros: string[];
  avisos: string[];
  metricas: MetricasPagina[];
}

const dentro = (valor: number, { min, max }: { min: number; max: number }) =>
  valor >= min && valor <= max;

/** Problemas de estrutura de uma página (vale também para as `noindex`). */
function estrutura(html: string): string[] {
  const erros: string[] = [];
  const titulos = cabecalhos(html);
  const h1 = titulos.filter(({ nivel }) => nivel === 1).length;
  if (h1 !== 1) erros.push(`esperado 1 H1, encontrados ${h1}`);
  // O H1 é o primeiro título do HTML: nada de h2-h6 antes dele (menu, avisos, faixas).
  const [primeiro] = titulos;
  if (primeiro && primeiro.nivel !== 1) {
    erros.push(`título antes do H1: H${primeiro.nivel} "${primeiro.texto}"`);
  }
  titulos.forEach(({ nivel, texto }, indice) => {
    const anterior = titulos[indice - 1]?.nivel ?? 1;
    if (nivel > anterior + 1) erros.push(`salto de H${anterior} para H${nivel}: "${texto}"`);
  });
  for (const imagem of tags(corpo(html), 'img')) {
    if (atributo(imagem, 'alt') === undefined) erros.push(`imagem sem alt: ${imagem.slice(0, 80)}`);
  }
  const vistos = new Set<string>();
  for (const id of ids(html)) {
    if (vistos.has(id)) erros.push(`id repetido: ${id}`);
    vistos.add(id);
  }
  return erros;
}

/** Link interno quebrado (página, arquivo ou âncora inexistente). `null` quando está certo. */
function conferirLink(
  href: string,
  origem: string,
  paginas: ReadonlyMap<string, ReadonlySet<string>>,
  arquivos: ReadonlySet<string>,
): string | null {
  if (!href.startsWith('/') && !href.startsWith('#')) return null;
  if (href.startsWith('//')) return null;
  const [caminhoComBusca = '', ancora] = href.split('#');
  const caminho = caminhoComBusca.split('?')[0] || origem;
  const destino = paginas.get(caminho);
  if (!destino) {
    return arquivos.has(decodeURIComponent(caminho)) ? null : `link quebrado: ${href}`;
  }
  if (ancora && !destino.has(decodeURIComponent(ancora))) return `âncora inexistente: ${href}`;
  return null;
}

export function auditarPaginas(
  paginas: readonly PaginaAuditada[],
  arquivos: ReadonlySet<string>,
  /** Nomes aceitos na resposta direta (o integrador acrescenta o nome do operador). */
  entidades: readonly string[] = ENTIDADES_RESPOSTA,
): ResultadoAuditoria {
  const erros: string[] = [];
  const avisos: string[] = [];
  const metricas: MetricasPagina[] = [];
  const idsPorPagina = new Map(paginas.map(({ caminho, html }) => [caminho, new Set(ids(html))]));
  const titulosVistos = new Map<string, string>();
  const descricoesVistas = new Map<string, string>();

  for (const { caminho, html } of paginas) {
    const erro = (texto: string) => erros.push(`${caminho}: ${texto}`);
    estrutura(html).forEach(erro);
    for (const href of new Set(links(html))) {
      const problema = conferirLink(href, caminho, idsPorPagina, arquivos);
      if (problema) erro(problema);
    }
    if (!modelo.ativo) {
      for (const nome of NOMES_DO_MODELO) {
        if (html.includes(nome)) erro(`conteúdo do site-modelo publicado: "${nome}"`);
      }
    }
    if (!indexavel(html)) continue;

    const titulo = tituloDaPagina(html) ?? '';
    const descricao = meta(html, 'description') ?? '';
    if (!dentro(titulo.length, LIMITES.titulo)) erro(`título com ${titulo.length} caracteres`);
    if (!dentro(descricao.length, LIMITES.descricao)) {
      erro(`descrição com ${descricao.length} caracteres`);
    }
    const tituloRepetido = titulosVistos.get(titulo);
    if (tituloRepetido) erro(`título igual ao de ${tituloRepetido}`);
    titulosVistos.set(titulo, caminho);
    const descricaoRepetida = descricoesVistas.get(descricao);
    if (descricaoRepetida) erro(`descrição igual à de ${descricaoRepetida}`);
    descricoesVistas.set(descricao, caminho);

    if (!atualizadoEm(html)) erro('sem data de atualização (og:updated_time)');
    const resposta = respostaDireta(html);
    const palavras = resposta ? contarPalavras(resposta) : 0;
    if (!resposta) erro('sem resposta direta');
    else if (!dentro(palavras, LIMITE_RESPOSTA)) erro(`resposta direta com ${palavras} palavras`);
    else if (!entidades.some((nome) => resposta.includes(nome))) {
      avisos.push(`${caminho}: resposta direta não cita ${entidades.join(' nem ')}`);
    }

    // Só o conteúdo da página: os H2 do menu e do rodapé são navegação, não perguntas.
    const h2 = cabecalhos(principal(html)).filter(({ nivel }) => nivel === 2);
    metricas.push({
      caminho,
      titulo,
      descricao,
      palavrasResposta: palavras,
      h2: h2.length,
      h2SemPergunta: h2.map(({ texto }) => texto).filter((texto) => !texto.endsWith('?')),
    });
  }
  return { erros, avisos, metricas };
}

/** Relatório em Markdown (gravado fora do dist/, em reports/, que não vai para o git). */
export function relatorioAuditoria({ erros, avisos, metricas }: ResultadoAuditoria): string {
  const celula = (texto: string) => texto.replaceAll('|', '\\|');
  return [
    '# Auditoria das páginas (gerada no build)',
    '',
    `Erros: ${erros.length} · avisos: ${avisos.length} · páginas indexáveis: ${metricas.length}`,
    '',
    ...[...erros, ...avisos].map((item) => `- ${item}`),
    '',
    '| Página | Título (car.) | Descrição (car.) | Resposta (palavras) | H2 | H2 sem pergunta |',
    '| --- | --- | --- | --- | --- | --- |',
    ...metricas.map(
      (pagina) =>
        `| ${pagina.caminho} | ${pagina.titulo.length} | ${pagina.descricao.length} | ${pagina.palavrasResposta} | ${pagina.h2} | ${celula(pagina.h2SemPergunta.join('; '))} |`,
    ),
    '',
  ].join('\n');
}
