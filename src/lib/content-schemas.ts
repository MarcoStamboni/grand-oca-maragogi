/**
 * Peças de schema (Zod) reutilizadas pelas coleções de conteúdo.
 * Regra do projeto: nenhum dado é inventado. Campos sem informação na fonte ficam
 * ausentes (opcionais) em vez de receber um valor presumido.
 */
import { z } from 'astro/zod';

/** Horário no formato 24 h "HH:MM". */
export const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM (24 h).');

export const diaSemana = z.enum(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']);
export type DiaSemana = z.infer<typeof diaSemana>;

/**
 * Faixa de funcionamento. Se `fecha` for menor que `abre`, termina no dia seguinte.
 * `fecha` ausente: a fonte só informa o início (ex.: turnos de jantar).
 * `dias` ausente: a fonte não especifica os dias (não presumir "todos os dias").
 */
export const horario = z.object({
  rotulo: z.string().min(1).optional(),
  abre: hora,
  fecha: hora.optional(),
  dias: z.union([z.literal('todos'), z.array(diaSemana).min(1)]).optional(),
  observacao: z.string().min(1).optional(),
});
export type Horario = z.infer<typeof horario>;

/**
 * Origem de um fato: caminho de uma página do site oficial do resort (ex.: "/o-resort/") ou
 * URL completa. No site-modelo, "/modelo/" marca conteúdo de exemplo.
 */
export const fonte = z.union([z.string().startsWith('/'), z.url()]);

/** Lista de fontes, obrigatória: todo fato precisa de origem. */
export const fontes = z.array(fonte).min(1);

/**
 * Chave de imagem: caminho relativo, com pastas (ex.: "acomodacoes/suite-1.jpg" ou, nas fotos
 * baixadas de um WordPress, "2018/12/bangalo.jpg"). O pipeline resolve a chave para o arquivo
 * otimizado e para o `alt`. Imagens "ChatGPT-Image" são proibidas (decisão 3).
 */
export const chaveImagem = z
  .string()
  .regex(
    /^[\w.-]+(\/[\w.-]+)+\.(jpe?g|png|webp)$/i,
    'Use um caminho com pasta, ex.: "acomodacoes/suite-1.jpg".',
  )
  .refine((valor) => !/chatgpt-image/i.test(valor), {
    message: 'Imagens "ChatGPT-Image" não podem ser usadas (decisão 3).',
  });

export const fotos = z.array(chaveImagem).default([]);

/** Data ISO "AAAA-MM-DD" convertida para Date. */
export const data = z.coerce.date();

/**
 * Metadados da página de detalhe. `titulo` ≤ 30 caracteres porque o layout acrescenta
 * " | <nome do resort>" (title final ≤ 65).
 */
export const seo = z.object({
  titulo: z.string().min(5).max(30),
  descricao: z.string().min(70).max(160),
});

/** Resposta direta do topo da página (AEO: 40 a 60 palavras, conferido por teste). */
export const respostaDireta = z.string().min(200).max(450);

/** Preço "a partir de" de uma oferta (nunca vai para o JSON-LD). */
export const oferta = z.object({
  /** Valor em reais, sem centavos (ex.: 1990 → "R$ 1.990"). */
  aPartirDe: z.number().int().positive(),
  por: z.enum(['pessoa', 'casal', 'apartamento']),
  noites: z.number().int().positive().optional(),
  /** Condição exibida sob o preço (ex.: "pagamento à vista, sujeito à disponibilidade"). */
  condicao: z.string().min(1).optional(),
  /** Último dia em que a oferta vale; depois dele, o preço some sozinho no próximo build. */
  validaAte: data.optional(),
});
export type Oferta = z.infer<typeof oferta>;
