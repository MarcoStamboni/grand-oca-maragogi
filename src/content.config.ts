/**
 * Coleções de conteúdo tipadas. O build falha se algum arquivo violar o schema.
 * No site-modelo, todo o conteúdo é EXEMPLO fictício (fontes: "/modelo/"). Para um resort real,
 * os fatos vêm do documento de fonte (template-resort-all-inclusive/replicar-site-resort.md) e os campos opcionais ficam
 * ausentes quando a fonte não informa (nunca preencher com suposição).
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { chavesRotas } from '@/data/rotas';
import {
  chaveImagem,
  data,
  diaSemana,
  fonte,
  fontes,
  fotos,
  hora,
  horario,
  oferta,
  respostaDireta,
  seo,
} from '@/lib/content-schemas';

// ---------------------------------------------------------------------------
// Acomodações
// ---------------------------------------------------------------------------

const acomodacoes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/acomodacoes' }),
  schema: z.object({
    nome: z.string().min(1),
    /** Artigo do nome nos textos ("o Bangalô", "a Suíte"). */
    artigo: z.enum(['o', 'a']),
    ordem: z.number().int().positive(),
    resumo: z.string().min(40).max(200),
    seo,
    respostaDireta,
    /** Categoria superior (selo "Premium" e benefícios de `beneficiosPremium`). */
    premium: z.boolean().default(false),
    /** Quantas unidades a categoria tem, quando a fonte informa. */
    quantidade: z.number().int().positive().optional(),
    /** Área em m², quando a fonte informa (ausente = não exibir). */
    areaM2: z.number().positive().optional(),
    ambientes: z.number().int().positive(),
    descricaoAmbientes: z.string().min(1).optional(),
    capacidade: z.object({
      maxPessoas: z.number().int().positive(),
      adultos: z.number().int().positive().optional(),
      criancas: z.number().int().nonnegative().optional(),
      idadeMaxCriancas: z.number().int().positive().optional(),
      /** Texto exibido, fiel à fonte (ex.: "até 4 pessoas"). */
      descricao: z.string().min(1),
    }),
    /** Configuração de camas, quando a fonte informa (ausente = não exibir). */
    camas: z.array(z.string().min(1)).default([]),
    vistas: z.array(z.enum(['jardim', 'piscina', 'mar', 'lago', 'resort', 'natureza'])).min(1),
    frenteMar: z.boolean().default(false),
    varanda: z.boolean().default(false),
    hidromassagem: z.boolean().default(false),
    piscinaPrivativa: z.boolean().default(false),
    /** Perfil de viagem para o qual a categoria é indicada (tabela comparativa). */
    indicadoPara: z.string().min(1),
    /** Diferenciais da categoria, do mais importante ao menos importante. */
    diferenciais: z.array(z.string().min(1)).default([]),
    conjugacao: z.string().min(1).optional(),
    /** Pacotes pagos à parte, exclusivos da categoria. */
    experienciasPagas: z.array(z.string().min(1)).default([]),
    /** Categoria vendida só pela central (não aparece no motor online). */
    reservaSomenteCentral: z.boolean().default(false),
    /**
     * Comparação com as outras categorias (página /acomodacoes/comparativo/): o que a diferencia,
     * pontos fortes e pontos de atenção, sempre a partir dos fatos da categoria.
     */
    comparacao: z
      .object({
        diferenca: z.string().min(40).max(300),
        fortes: z.array(z.string().min(1)).min(1),
        atencao: z.array(z.string().min(1)).min(1),
      })
      .optional(),
    fotos,
    banner: chaveImagem.optional(),
    fontes,
    atualizadoEm: data,
  }),
});

// ---------------------------------------------------------------------------
// Restaurantes (com cardápio opcional, aberto em janela na página do restaurante)
// ---------------------------------------------------------------------------

const restaurantes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/restaurantes' }),
  schema: z.object({
    nome: z.string().min(1),
    ordem: z.number().int().positive(),
    tipo: z.enum(['principal', 'a-la-carte', 'piscina', 'infantil', 'casual']),
    resumo: z.string().min(40).max(200),
    seo,
    respostaDireta,
    /** Formato do serviço (ex.: "Buffet", "À la carte"). */
    servico: z.enum(['buffet', 'a-la-carte', 'buffet-e-a-la-carte', 'casual']),
    /** Culinárias servidas (servesCuisine no schema). */
    cozinhas: z.array(z.string().min(1)).min(1),
    destaques: z.array(z.string().min(1)).default([]),
    noitesTematicas: z
      .array(z.object({ dias: z.array(diaSemana).min(1), tema: z.string().min(1) }))
      .default([]),
    /** Dietas atendidas (mapeiam para RestrictedDiet no schema). */
    opcoesAlimentares: z
      .array(z.enum(['vegana', 'vegetariana', 'sem-gluten', 'sem-lactose']))
      .default([]),
    bebidasInclusas: z.array(z.string().min(1)).default([]),
    /** Traje pedido no salão (ex.: "Bermuda ou calça e sapato fechado para homens"). */
    traje: z.string().min(1).optional(),
    /** `refeicao` posiciona o horário na tabela de refeições (café, almoço, jantar). */
    /** Horários publicados pela fonte. Vazio = a fonte não informa (o bloco some). */
    horarios: z
      .array(horario.extend({ refeicao: z.enum(['cafe-da-manha', 'almoco', 'jantar']) }))
      .default([]),
    reserva: z
      .object({
        obrigatoria: z.boolean(),
        /** Sujeita à regra de reservas por número de diárias (`regraRestaurantesALaCarte`). */
        elegibilidade: z.boolean(),
        horarios: z.array(hora).default([]),
        toleranciaMinutos: z.number().int().positive().optional(),
        observacao: z.string().min(1).optional(),
      })
      .optional(),
    /** Cardápio de referência (pratos podem mudar; a página avisa). */
    cardapio: z
      .array(
        z.object({
          secao: z.string().min(1),
          itens: z
            .array(z.object({ nome: z.string().min(1), descricao: z.string().min(1).optional() }))
            .min(1),
        }),
      )
      .default([]),
    fotos,
    banner: chaveImagem.optional(),
    fontes,
    atualizadoEm: data,
  }),
});

// ---------------------------------------------------------------------------
// Bares e estações
// ---------------------------------------------------------------------------

const bares = defineCollection({
  loader: file('src/content/bares/bares.yaml'),
  schema: z.object({
    nome: z.string().min(1),
    ordem: z.number().int().positive(),
    /** Agrupamento na página de bares. */
    area: z.enum(['lobby', 'piscina', 'praia', 'noite', 'lago']),
    /** Onde fica, quando a fonte informa. */
    local: z.string().min(1).optional(),
    resumo: z.string().min(20).max(200),
    /** Só quando a fonte restringe o público. */
    publico: z.literal('adulto').optional(),
    bebidas: z.array(z.string().min(1)).default([]),
    comidas: z.array(z.string().min(1)).default([]),
    /** Horários publicados pela fonte. Vazio = a fonte não informa (o bloco some). */
    horarios: z.array(horario).default([]),
    servicosPagos: z.array(z.string().min(1)).default([]),
    fotos,
    banner: chaveImagem.optional(),
    fontes,
  }),
});

// ---------------------------------------------------------------------------
// Atividades (lazer, crianças, esportes, bem-estar)
// ---------------------------------------------------------------------------

const atividades = defineCollection({
  loader: file('src/content/atividades/atividades.yaml'),
  schema: z.object({
    nome: z.string().min(1),
    categoria: z.enum(['criancas', 'piscina', 'esportes', 'entretenimento', 'bem-estar']),
    resumo: z.string().min(20).max(220),
    /** Público como a fonte descreve (ex.: "maiores de 14 anos"). */
    publico: z.string().min(1).optional(),
    idadeMinima: z.number().int().nonnegative().optional(),
    idadeMaxima: z.number().int().positive().optional(),
    local: z.string().min(1).optional(),
    horarios: z.array(horario).default([]),
    conformeProgramacao: z.boolean().default(false),
    /** 'nao-informado': a fonte não diz se é incluso ou pago (não afirmar nas páginas). */
    cobranca: z.enum(['incluso', 'pago', 'nao-informado']),
    /** 'a-confirmar': não publicar até confirmar. */
    status: z.enum(['confirmado', 'a-confirmar']).default('confirmado'),
    fotos,
    fontes,
  }),
});

// ---------------------------------------------------------------------------
// Datas especiais: feriados (data calculada a cada build) e temporadas com vigência
// ---------------------------------------------------------------------------

/**
 * Quando a data acontece:
 * - `fixa`: mesmo dia todo ano (ex.: Natal, 25/12);
 * - `pascoa`: dias de distância do Domingo de Páscoa (Carnaval = -47, Sexta-feira Santa = -2,
 *   Corpus Christi = +60);
 * - `periodo`: temporada com início e fim (some do site depois do fim).
 */
const quando = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('fixa'),
    dia: z.number().int().min(1).max(31),
    mes: z.number().int().min(1).max(12),
  }),
  z.object({ tipo: z.literal('pascoa'), deslocamentoDias: z.number().int() }),
  z.object({ tipo: z.literal('periodo'), inicio: data, fim: data }),
]);

const datasEspeciais = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/datas-especiais' }),
  schema: z
    .object({
      titulo: z.string().min(1),
      /** Nome com artigo, como entra nas frases ("o Réveillon", "as férias de julho"). */
      naFrase: z.string().min(3),
      tipo: z.enum(['feriado', 'temporada']),
      quando,
      /**
       * Dias do período em volta da data (`fixa` e `pascoa`), ex.: Carnaval de sábado a quarta
       * = { antes: 3, depois: 1 } a partir da terça. Ausente = só o dia.
       */
      janela: z
        .object({ antes: z.number().int().nonnegative(), depois: z.number().int().nonnegative() })
        .optional(),
      /** Dias do "feriadão" sugeridos para a estadia (só texto, não muda a data). */
      /** Período exibido no lugar da data exata (tipo + mês). Sem ele, mostra a data calculada. */
      periodo: z.string().min(3).optional(),
      sugestaoEstadia: z.string().min(1).optional(),
      resumo: z.string().min(40).max(180),
      destaques: z.array(z.string().min(1)).min(3).max(4),
      seo,
      respostaDireta,
      oferta: oferta.optional(),
      fotos,
      fontes,
    })
    .refine((item) => item.quando.tipo !== 'periodo' || item.quando.fim >= item.quando.inicio, {
      message: 'A data de fim deve ser igual ou posterior à de início.',
      path: ['quando'],
    }),
});

// ---------------------------------------------------------------------------
// Guia do destino
// ---------------------------------------------------------------------------

const guia = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guia' }),
  schema: z.object({
    titulo: z.string().min(1),
    ordem: z.number().int().positive(),
    /** Texto curto dos cartões do hub. */
    resumo: z.string().min(40).max(200),
    seo,
    respostaDireta,
    /** Fatos agrupados por tema. Cada tema vira uma seção, com a `pergunta` como título (AEO). */
    secoes: z
      .array(
        z.object({
          tema: z.string().min(1),
          pergunta: z.string().min(10).endsWith('?'),
          fatos: z.array(z.object({ texto: z.string().min(1), fonte })).min(1),
        }),
      )
      .min(1),
    fotos,
    atualizadoEm: data,
  }),
});

// ---------------------------------------------------------------------------
// Blog (artigos de planejamento de viagem; texto em Markdown)
// ---------------------------------------------------------------------------

export const categoriasBlog = ['planejamento', 'familia', 'destino', 'gastronomia'] as const;

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string().min(10).max(90),
    resumo: z.string().min(80).max(220),
    seo,
    respostaDireta,
    categoria: z.enum(categoriasBlog),
    publicadoEm: data,
    atualizadoEm: data,
    /** Autor exibido. Ausente = a equipe do operador do site. */
    autor: z.string().min(1).optional(),
    capa: chaveImagem,
    /** Páginas do site relacionadas (chaves de src/data/rotas.ts), no fim do artigo. */
    relacionadas: z.array(z.enum(chavesRotas)).default([]),
  }),
});

// ---------------------------------------------------------------------------
// Outros resorts do operador (página /outros-resorts/ e seção da home)
// ---------------------------------------------------------------------------

const outrosResorts = defineCollection({
  loader: file('src/content/outros-resorts/outros-resorts.yaml'),
  schema: z.object({
    nome: z.string().min(1),
    ordem: z.number().int().positive(),
    destino: z.string().min(1),
    uf: z.string().length(2),
    /** Prévia do resort. Sem ela, o site mostra um texto neutro com o destino. */
    resumo: z.string().min(30).max(160).optional(),
    /** Portal do resort na rede. Sem ele, "Ver detalhes" vira a cotação pelo WhatsApp. */
    url: z.url().optional(),
    foto: chaveImagem.optional(),
  }),
});

// ---------------------------------------------------------------------------
// FAQ (alimenta as FAQs por página, a FAQ central e o FAQPage)
// ---------------------------------------------------------------------------

/** Rota fixa (chave de src/data/rotas.ts) ou página de detalhe, ex.: "acomodacao:standard". */
const paginaFaq = z.union([
  z.enum(chavesRotas),
  /** "todas": a pergunta aparece em todas as páginas com FAQ (ex.: onde reservar). */
  z.literal('todas'),
  z.string().regex(/^(acomodacao|restaurante|guia|data-especial|post):[a-z0-9-]+$/),
]);

export const temasFaq = [
  'resort',
  'localizacao',
  'hospedagem',
  'all-inclusive',
  'lazer',
  'reservas',
  'destino',
] as const;

const faq = defineCollection({
  loader: file('src/content/faq/faq.yaml'),
  schema: z.object({
    pergunta: z.string().min(10).endsWith('?'),
    /** Resposta direta (meta AEO: 40 a 60 palavras). */
    resposta: z.string().min(80).max(500),
    /** Agrupamento na página /perguntas-frequentes/. */
    tema: z.enum(temasFaq),
    paginas: z.array(paginaFaq).min(1),
    ordem: z.number().int().default(100),
    fontes,
  }),
});

// ---------------------------------------------------------------------------
// Registro de imagens (chave → texto alternativo). Arquivos: src/assets/imagens/
// ---------------------------------------------------------------------------

export const temasModelo = [
  'praia',
  'piscina',
  'quarto',
  'restaurante',
  'bar',
  'criancas',
  'spa',
  'esporte',
  'noite',
  'destino',
  'festa',
] as const;

const imagens = defineCollection({
  loader: file('src/content/imagens/imagens.yaml'),
  schema: z.object({
    /** Descreve o que aparece na imagem; sem afirmar fatos que a fonte não confirma. */
    alt: z.string().min(10).max(200),
    /**
     * Foto em que aparece o rosto de alguém (hóspede, criança, equipe). Fica registrada, mas o
     * site não a usa (direito de imagem).
     */
    rosto: z.boolean().default(false),
    /**
     * Ilustração de demonstração do site-modelo (tema da cena, `npm run imagens:modelo`).
     * O build de produção (`modelo.ativo = false`) recusa páginas com essas imagens.
     */
    modelo: z.enum(temasModelo).optional(),
  }),
});

export const collections = {
  imagens,
  acomodacoes,
  restaurantes,
  bares,
  atividades,
  datasEspeciais,
  guia,
  blog,
  outrosResorts,
  faq,
};
