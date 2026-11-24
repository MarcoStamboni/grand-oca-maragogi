/**
 * llms.txt e llms-full.txt (padrão llmstxt.org): resumo do site para mecanismos de resposta.
 * Funções puras. Os textos das páginas (título, descrição e resposta direta) vêm do HTML
 * gerado no build (src/integrations/gerar-llms.ts), então nada é escrito duas vezes; os fatos
 * vêm do site.config.
 * Imports relativos com extensão: o astro.config carrega este arquivo sem o alias `@/`.
 */
import { type Operador, operador as operadorAtivo, resort, site } from '../site.config.ts';
import { formatarData, formatarDecimal, formatarHora, formatarNumero } from './formatar.ts';

export interface PaginaLlms {
  url: string;
  caminho: string;
  /** Título sem o nome do site. */
  titulo: string;
  descricao: string;
  resposta?: string;
  /** Perguntas frequentes exibidas na página (FAQPage), no llms-full.txt logo abaixo dela. */
  perguntas?: readonly PerguntaLlms[];
  /** Posição dentro da seção (rotas fixas primeiro, depois as páginas de detalhe). */
  ordem: number;
}

export interface SecaoLlms {
  titulo: string;
  prefixos: readonly string[];
}

export interface PerguntaLlms {
  pergunta: string;
  resposta: string;
}

export interface DadosLlms {
  paginas: readonly PaginaLlms[];
  perguntas: readonly PerguntaLlms[];
  /** URL absoluta do llms-full.txt. */
  urlCompleto: string;
}

/** Seções do llms.txt, na ordem. "Optional" é a seção que o padrão permite pular. */
export const SECOES_LLMS: readonly SecaoLlms[] = [
  { titulo: 'O resort', prefixos: ['/o-resort/'] },
  { titulo: 'Acomodações', prefixos: ['/acomodacoes/'] },
  { titulo: 'All inclusive, restaurantes e bares', prefixos: ['/all-inclusive/'] },
  {
    titulo: 'Lazer, bem-estar e experiências',
    prefixos: ['/lazer/', '/bem-estar/', '/experiencias/'],
  },
  { titulo: 'Feriados e datas especiais', prefixos: ['/datas-especiais/'] },
  { titulo: `Guia: ${resort.destino.nome}`, prefixos: [`/${resort.destino.slug}/`] },
  { titulo: 'Fotos e blog', prefixos: ['/fotos/', '/blog/'] },
  {
    titulo: 'Planejamento e reservas',
    prefixos: [
      '/como-chegar/',
      '/reservas/',
      '/outros-resorts/',
      '/politica-de-hospedagem/',
      '/perguntas-frequentes/',
      '/fale-conosco/',
    ],
  },
  {
    titulo: 'Optional',
    prefixos: [
      '/quem-somos/',
      '/politica-de-privacidade/',
      '/termos-de-uso/',
      '/politica-de-cookies/',
    ],
  },
];

/** Título da página sem o sufixo " | <nome do site>". */
export function tituloSemSite(titulo: string): string {
  const sufixo = site.modeloTitulo.replace('%s', '');
  return titulo.endsWith(sufixo) ? titulo.slice(0, -sufixo.length) : titulo;
}

/**
 * Páginas agrupadas por seção, em ordem. A home fica fora (o próprio arquivo é o resumo dela).
 * Página que não cabe em nenhuma seção é erro: obriga a atualizar SECOES_LLMS.
 */
export function agruparPaginas(
  paginas: readonly PaginaLlms[],
): { secao: SecaoLlms; paginas: PaginaLlms[] }[] {
  const internas = paginas.filter(({ caminho }) => caminho !== '/');
  const semSecao = internas.filter(
    ({ caminho }) =>
      !SECOES_LLMS.some(({ prefixos }) => prefixos.some((p) => caminho.startsWith(p))),
  );
  if (semSecao.length > 0) {
    throw new Error(
      `Páginas fora das seções do llms.txt: ${semSecao.map((p) => p.caminho).join(', ')}`,
    );
  }
  return SECOES_LLMS.map((secao) => ({
    secao,
    paginas: internas
      .filter(({ caminho }) => secao.prefixos.some((prefixo) => caminho.startsWith(prefixo)))
      .sort((a, b) => a.ordem - b.ordem || a.caminho.localeCompare(b.caminho)),
  })).filter(({ paginas: lista }) => lista.length > 0);
}

/** Fatos principais do resort e do atendimento (todos do site.config). */
export function fatosPrincipais(op: Operador = operadorAtivo): string[] {
  const { endereco, geo, horarios, aeroporto, tripadvisor } = resort;
  const inauguracao = resort.inauguracao
    ? new Date(`${resort.inauguracao}-01T00:00:00Z`).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null;
  const telefones = op.telefones.map(({ rotulo, exibicao }) => `${rotulo} ${exibicao}`);
  // O número do WhatsApp não é divulgado: os canais publicados são os telefones.
  const canais = telefones;
  const historia = [
    resort.rede ? `Rede: ${resort.rede}.` : null,
    inauguracao ? `Inaugurado em ${inauguracao}.` : null,
  ].filter((parte): parte is string => parte !== null);
  return [
    `Localização: ${endereco.logradouro}, ${endereco.cidade} (${endereco.uf}), região de ${resort.regiao}, Brasil. Coordenadas: ${geo.latitude}, ${geo.longitude}.`,
    `Regime: ${resort.regime}${resort.servico24h ? ', 24 horas por dia' : ''}.`,
    `${resort.unidades ? `Unidades: ${resort.unidades}, em ` : 'Acomodações: '}${resort.categoriasAcomodacao} categorias de acomodação.${resort.naoFumantes ? ' Todas para não fumantes.' : ''}`,
    `Check-in a partir das ${formatarHora(horarios.checkIn)}; check-out até as ${formatarHora(horarios.checkOut)}.`,
    `Aeroporto mais próximo: ${aeroporto.nome} (${aeroporto.iata}), a ${aeroporto.distanciaKm} km${aeroporto.tempoEstimado ? `, ${aeroporto.tempoEstimado} de carro` : ''}.`,
    'Crianças: Kids Club para crianças de 4 a 12 anos, parque aquático, playground e baby area.',
    ...(historia.length > 0 ? [historia.join(' ')] : []),
    ...(tripadvisor
      ? [
          `Nota no Tripadvisor (dado de terceiro, consultado em ${formatarData(tripadvisor.consultadoEm)}): ${formatarDecimal(tripadvisor.nota)} de ${tripadvisor.escala}, com ${formatarNumero(tripadvisor.totalAvaliacoes)} avaliações. ${tripadvisor.url}`,
        ]
      : []),
    `Atendimento deste site (${op.nome}): ${canais.join(' · ')}${op.email ? ` · ${op.email}` : ''}.`,
  ];
}

/** Cabeçalho comum aos dois arquivos: nome, resumo, avisos e fatos. */
function abertura(titulo: string, op: Operador): string[] {
  return [
    `# ${titulo}`,
    '',
    `> ${resort.descricao}`,
    '',
    ...(op.aviso ? [op.aviso, ''] : []),
    `Informações atualizadas em ${formatarData(site.dataColetaFonte)}. Tarifas e disponibilidade mudam conforme a data: os valores "a partir de" das datas especiais são só referência; consulte o atendimento.`,
    '',
    ...fatosPrincipais(op).map((fato) => `- ${fato}`),
    '',
  ];
}

export function gerarLlmsTxt(dados: DadosLlms, op: Operador = operadorAtivo): string {
  const linhas = abertura(resort.nome, op);
  for (const { secao, paginas } of agruparPaginas(dados.paginas)) {
    linhas.push(`## ${secao.titulo}`, '');
    linhas.push(
      ...paginas.map(({ titulo, url, descricao }) => `- [${titulo}](${url}): ${descricao}`),
    );
    if (secao.titulo === 'Optional') {
      linhas.push(
        `- [Conteúdo completo](${dados.urlCompleto}): resposta direta de cada página e todas as perguntas frequentes.`,
      );
    }
    linhas.push('');
  }
  return linhas.join('\n');
}

export function gerarLlmsFullTxt(dados: DadosLlms, op: Operador = operadorAtivo): string {
  const linhas = abertura(`${resort.nome}: conteúdo completo`, op);
  const home = dados.paginas.find(({ caminho }) => caminho === '/');
  if (home?.resposta) linhas.push('## Em resumo', '', home.resposta, '');
  for (const { secao, paginas } of agruparPaginas(dados.paginas)) {
    linhas.push(`## ${secao.titulo === 'Optional' ? 'Sobre este site' : secao.titulo}`, '');
    for (const { titulo, url, descricao, resposta, perguntas = [] } of paginas) {
      linhas.push(`### ${titulo}`, '', `URL: ${url}`, '', resposta ?? descricao, '');
      if (perguntas.length > 0) {
        linhas.push(`#### Perguntas frequentes: ${titulo}`, '');
        for (const item of perguntas) linhas.push(`**${item.pergunta}**`, '', item.resposta, '');
      }
    }
  }
  // Sem FAQ por página, a seção geral reúne as perguntas da FAQ central.
  const temPorPagina = dados.paginas.some(({ perguntas }) => (perguntas?.length ?? 0) > 0);
  if (!temPorPagina && dados.perguntas.length > 0) {
    linhas.push('## Perguntas frequentes', '');
    for (const { pergunta, resposta } of dados.perguntas)
      linhas.push(`### ${pergunta}`, '', resposta, '');
  }
  return linhas.join('\n');
}
