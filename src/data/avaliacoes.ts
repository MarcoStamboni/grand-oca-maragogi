/**
 * Avaliações de hóspedes (seção "Avaliações do <resort>" da home). Só no texto da página: nunca
 * viram Review/AggregateRating no JSON-LD.
 * PENDENTE: sem avaliações reais com autorização ou fonte pública verificável, a lista fica vazia
 * e a seção não aparece. Ao incluir, informe a `fonte` (ex.: "Tripadvisor, março de 2026").
 */
export interface Avaliacao {
  texto: string;
  /** Nome como o hóspede assina (ex.: "Fernanda R."). */
  autor: string;
  /** Nota de 1 a 5. */
  nota: 1 | 2 | 3 | 4 | 5;
  /** Onde a avaliação foi publicada (ex.: "Tripadvisor, março de 2026"). */
  fonte?: string;
  /** Depoimento ilustrativo do site-modelo. */
  exemplo?: true;
}

export const avaliacoes: readonly Avaliacao[] = [];

/** Aspectos que mais pesam na avaliação (texto do cartão azul). */
export const aspectosAvaliados =
  'Natureza, estrutura de lazer, piscinas, atividades de aventura, gastronomia, atendimento, limpeza e experiência com crianças estão entre os pontos mais comentados por quem se hospeda.';
