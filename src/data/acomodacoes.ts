/**
 * Informações comuns às acomodações. Os dados de cada categoria ficam na coleção `acomodacoes`.
 * Só entram itens que a fonte confirma para todas as categorias (as 10 acomodações do Grand Oca Maragogi):
 * a fonte não lista comodidades comuns a todas, então as listas ficam vazias.
 */

/** Comodidades de todas as categorias (`amenityFeature` no JSON-LD). */
export const comodidadesTodasAcomodacoes: readonly string[] = [];

/** Itens exibidos para todas as categorias (no JSON-LD, não fumantes vira `smokingAllowed`). */
export const itensTodasAcomodacoes: readonly string[] = [...comodidadesTodasAcomodacoes];

/** Benefícios das categorias Premium (`premium: true`): o resort não publica benefícios exclusivos das categorias Deluxe. */
export const beneficiosPremium: readonly string[] = [];

/** Regra de reservas nos restaurantes temáticos, válida para todas as categorias. */
export const regraRestaurantesALaCarte = {
  resumo:
    'Jantar nos restaurantes temáticos com reserva prévia no Guest Service, conforme o número de noites.',
  faixas: [] as readonly { diariasMin: number; diariasMax: number | null; reservas: number }[],
} as const;
