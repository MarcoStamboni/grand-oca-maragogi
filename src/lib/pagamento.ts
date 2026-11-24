/**
 * Textos das condições de pagamento do operador (site.config: `operador.reservas.pagamento`),
 * usados nos selos das páginas de reserva, da home e do motor. `null` = sem condição divulgada.
 */
import { operador } from '@/site.config';

export interface CondicaoPagamento {
  /** Destaque curto (ex.: "10x sem juros"). */
  destaque: string;
  /** Complemento (ex.: "no cartão de crédito"). */
  complemento: string;
  icone: 'cartao' | 'desconto';
}

const { pagamento } = operador.reservas;

export const condicoesPagamento: CondicaoPagamento[] = pagamento
  ? [
      {
        destaque: `${pagamento.parcelasSemJuros}x sem juros`,
        complemento: 'no cartão de crédito',
        icone: 'cartao',
      },
      {
        destaque: `${pagamento.descontoPixPct}% de desconto`,
        complemento: 'à vista no Pix',
        icone: 'desconto',
      },
    ]
  : [];

/** Frase completa (ex.: para listas): "10x sem juros no cartão de crédito ou 5% de desconto à vista no Pix". */
export const fraseCondicoesPagamento: string | null = pagamento
  ? `${pagamento.parcelasSemJuros}x sem juros no cartão de crédito ou ${pagamento.descontoPixPct}% de desconto à vista no Pix`
  : null;
