/**
 * Classes visuais dos botões, compartilhadas pelo link com aparência de botão (Botao.astro)
 * e pelos <button> nativos (formulário, aviso de cookies).
 *
 * Cores do Grand Oca: laranja `#F3811D` (botão principal) e verde `#04B474` ("Consultar
 * tarifas"). Os dois usam o tom 700 (laranja #B85309, verde #047D51) para levar texto branco
 * (≥ 4,9:1, WCAG AA): o branco sobre os tons claros do Grand Oca não passa no AA.
 */

export type VarianteBotao =
  'primario' | 'verde' | 'secundario' | 'contorno' | 'branco' | 'claro' | 'whatsapp' | 'texto';
export type TamanhoBotao = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold no-underline transition duration-300 ease-suave hover:no-underline';

/** Botões cheios sobem um pouco e ganham sombra no hover (sem efeito com "menos movimento"). */
const elevar = 'hover:-translate-y-0.5 hover:shadow-cartao active:translate-y-0';

const variantes: Record<VarianteBotao, string> = {
  primario: `bg-coral-700 text-white hover:bg-coral-800 ${elevar}`,
  verde: `bg-verde-700 text-white hover:bg-verde-800 ${elevar}`,
  secundario: `bg-mar-700 text-white hover:bg-mar-800 ${elevar}`,
  contorno: `border-2 border-mar-700 text-mar-700 hover:bg-mar-700 hover:text-white ${elevar}`,
  branco: `bg-white text-mar-800 ring-1 ring-mar-100 hover:bg-mar-50 ${elevar}`,
  claro: 'border-2 border-white/80 text-white backdrop-blur-sm hover:bg-white hover:text-mar-900',
  whatsapp: `bg-verde-800 text-white hover:bg-verde-900 ${elevar}`,
  texto: 'rounded-md px-0 text-mar-700 underline-offset-4 hover:underline',
};

const tamanhos: Record<TamanhoBotao, string> = {
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-7 text-base',
};

export function classesBotao(
  variante: VarianteBotao = 'primario',
  tamanho: TamanhoBotao = 'md',
): string[] {
  return [base, variantes[variante], ...(variante === 'texto' ? [] : [tamanhos[tamanho]])];
}
