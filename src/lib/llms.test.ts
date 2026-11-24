import { describe, expect, it } from 'vitest';

import { operadores, resort, site } from '@/site.config';

import {
  agruparPaginas,
  fatosPrincipais,
  gerarLlmsFullTxt,
  gerarLlmsTxt,
  type PaginaLlms,
  SECOES_LLMS,
  tituloSemSite,
} from './llms';

const pagina = (caminho: string, ordem: number, extra: Partial<PaginaLlms> = {}): PaginaLlms => ({
  url: `${site.url}${caminho}`,
  caminho,
  titulo: `Título ${caminho}`,
  descricao: `Descrição ${caminho}`,
  ordem,
  ...extra,
});

const paginas = [
  pagina('/', 0, { resposta: 'Resumo da home.' }),
  pagina('/acomodacoes/classic/', 7.5, { resposta: 'Resposta do Classic.' }),
  pagina('/acomodacoes/', 7),
  pagina('/quem-somos/', 24),
];
const dados = {
  paginas,
  perguntas: [{ pergunta: 'Qual o horário do check-in?', resposta: 'A partir das 15h.' }],
  urlCompleto: `${site.url}/llms-full.txt`,
};

describe('agruparPaginas', () => {
  it('ordena dentro da seção e deixa a home fora', () => {
    const grupos = agruparPaginas(paginas);
    expect(grupos.map(({ secao }) => secao.titulo)).toEqual(['Acomodações', 'Optional']);
    expect(grupos[0]?.paginas.map(({ caminho }) => caminho)).toEqual([
      '/acomodacoes/',
      '/acomodacoes/classic/',
    ]);
  });

  it('recusa página sem seção', () => {
    expect(() => agruparPaginas([pagina('/nova-secao/', 1)])).toThrow(/nova-secao/);
  });

  it('"Optional" é a última seção, como pede o padrão', () => {
    expect(SECOES_LLMS.at(-1)?.titulo).toBe('Optional');
  });
});

describe('fatosPrincipais', () => {
  const fatos = fatosPrincipais(operadores.agencia).join('\n');

  it('traz os fatos do site.config', () => {
    expect(fatos).toContain(`${resort.categoriasAcomodacao} categorias de acomodação`);
    expect(fatos).toContain('Check-in a partir das 15h; check-out até as 12h.');
    if (resort.inauguracao) expect(fatos).toContain('Inaugurado em');
    if (resort.tripadvisor) expect(fatos).toContain('Nota no Tripadvisor');
    else expect(fatos).not.toContain('Tripadvisor');
    expect(fatos).toContain(operadores.agencia.telefones[0].exibicao);
    expect(fatos).not.toContain(operadores.agencia.whatsapp.exibicao);
  });

  it('não publica o que não foi confirmado', () => {
    expect(fatos).not.toMatch(/\b\d{5}-\d{3}\b/); // CEP (o WhatsApp tem 5 + 4 dígitos)
    expect(fatos).not.toMatch(/R\$/);
  });
});

describe('gerarLlmsTxt', () => {
  const texto = gerarLlmsTxt(dados, operadores.agencia);

  it('segue o formato do llmstxt.org', () => {
    expect(texto.startsWith(`# ${resort.nome}\n\n> ${resort.descricao}\n`)).toBe(true);
    expect(texto).toContain(
      `- [Título /acomodacoes/](${site.url}/acomodacoes/): Descrição /acomodacoes/`,
    );
    expect(texto).toContain(`## Optional\n\n- [Título /quem-somos/]`);
    expect(texto).toContain(`- [Conteúdo completo](${site.url}/llms-full.txt)`);
  });

  it('identifica o site da agência', () => {
    expect(texto).toContain(operadores.agencia.aviso ?? '');
    expect(gerarLlmsTxt(dados, operadores.oficial)).not.toContain('agência de viagens');
  });
});

describe('gerarLlmsFullTxt', () => {
  it('traz a resposta direta de cada página e as perguntas', () => {
    const texto = gerarLlmsFullTxt(dados, operadores.agencia);
    expect(texto).toContain('## Em resumo\n\nResumo da home.');
    expect(texto).toContain(
      `### Título /acomodacoes/classic/\n\nURL: ${site.url}/acomodacoes/classic/\n\nResposta do Classic.`,
    );
    expect(texto).toContain('### Título /acomodacoes/\n\nURL: ');
    expect(texto).toContain('Descrição /acomodacoes/');
    expect(texto).toContain('## Sobre este site');
    expect(texto).toContain(
      '## Perguntas frequentes\n\n### Qual o horário do check-in?\n\nA partir das 15h.',
    );
  });

  it('traz as perguntas de cada página logo abaixo dela, sem repetir a seção geral', () => {
    const comFaq = {
      ...dados,
      paginas: dados.paginas.map((pagina) =>
        pagina.caminho === '/acomodacoes/'
          ? { ...pagina, perguntas: [{ pergunta: 'Tem suíte?', resposta: 'Sim.' }] }
          : pagina,
      ),
    };
    const texto = gerarLlmsFullTxt(comFaq, operadores.agencia);
    expect(texto).toContain(
      '#### Perguntas frequentes: Título /acomodacoes/\n\n**Tem suíte?**\n\nSim.',
    );
    expect(texto).not.toContain('## Perguntas frequentes\n');
  });
});

describe('tituloSemSite', () => {
  it('remove o sufixo do título (central de reservas)', () => {
    expect(tituloSemSite(site.modeloTitulo.replace('%s', 'Classic'))).toBe('Classic');
    expect(tituloSemSite('Título absoluto')).toBe('Título absoluto');
  });
});
