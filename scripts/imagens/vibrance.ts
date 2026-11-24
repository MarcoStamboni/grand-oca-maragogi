/**
 * Filtro "Vibrance" (Vibrant Colors): realça mais as cores apagadas do que as que já são vivas,
 * como o ajuste Vibrance do Photoshop. Assim o verde do gramado, o azul da piscina e o laranja dos
 * telhados ganham vida sem estourar o que já era saturado, e brancos e cinzas continuam neutros.
 *
 * Opera em pixels sRGB de 8 bits (buffer "raw" intercalado, 3 ou 4 canais; o alfa é preservado).
 * Módulo puro, sem dependências, para valer no pipeline e nos testes.
 */

/** Intensidade usada no site (0 = nada; 1 = muito forte). */
export const VIBRANCE_PADRAO = 0.8;

/**
 * Quanto a saturação de um pixel de saturação `s` (0 a 1) é multiplicada: até `1 + intensidade * 0.9`
 * para cores apagadas e quase nada para as já saturadas.
 */
export function fatorVibrance(saturacao: number, intensidade: number): number {
  return 1 + intensidade * 0.9 * (1 - saturacao) ** 2;
}

export function aplicarVibrance(
  pixels: Uint8Array,
  canais: 3 | 4,
  intensidade: number = VIBRANCE_PADRAO,
): Uint8Array {
  const saida = new Uint8Array(pixels.length);
  for (let i = 0; i < pixels.length; i += canais) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    const maximo = Math.max(r, g, b);
    const minimo = Math.min(r, g, b);
    const saturacao = maximo === 0 ? 0 : (maximo - minimo) / maximo;
    const fator = fatorVibrance(saturacao, intensidade);
    // Afasta cada canal do cinza de mesma luminância (Rec. 709), sem mexer na luz.
    const luz = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    saida[i] = limitar(luz + (r - luz) * fator);
    saida[i + 1] = limitar(luz + (g - luz) * fator);
    saida[i + 2] = limitar(luz + (b - luz) * fator);
    if (canais === 4) saida[i + 3] = pixels[i + 3] ?? 255;
  }
  return saida;
}

function limitar(valor: number): number {
  return valor < 0 ? 0 : valor > 255 ? 255 : Math.round(valor);
}
