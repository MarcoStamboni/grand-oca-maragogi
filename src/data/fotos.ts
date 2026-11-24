/**
 * Fotos gerais do resort (primeira categoria da galeria /fotos/: praia, vista aérea e jardins).
 * As demais categorias vêm das coleções (src/lib/fotos.ts).
 */
export const fotosDoResort: readonly string[] = [
  'grand-oca/resort/vista-aerea-resort.jpg',
  'grand-oca/resort/vista-aerea-bangalos.jpg',
  'grand-oca/resort/vista-aerea-praia-piscina.jpg',
  'grand-oca/resort/vista-aerea-edificios-novos.jpg',
  'grand-oca/resort/praia-espreguicadeiras-aerea.jpg',
  'grand-oca/resort/praia-coqueiral.jpg',
  'grand-oca/resort/praia-areia-ampla.jpg',
  'grand-oca/resort/cabana-gramado.jpg',
  'grand-oca/resort/jardim-cabanas-piscina.jpg',
  'grand-oca/resort/jardim-cabanas-coqueiral.jpg',
  'grand-oca/resort/nascer-do-sol-mar.jpg',
  'grand-oca/regiao/piscinas-naturais-aereo.jpg',
];

/**
 * Fotos de gastronomia sem restaurante identificado na foto (galeria, categoria "Restaurantes e
 * bares", antes das fotos dos restaurantes e bares).
 */
export const fotosGastronomia: readonly string[] = [
  'grand-oca/gastronomia/restaurante-salao-mesas.jpg',
  'grand-oca/gastronomia/restaurante-corais-noite.jpg',
];

/**
 * Fotos ao lado do bloco de perguntas frequentes das páginas internas: cada página usa uma,
 * escolhida pelo endereço (sempre a mesma na mesma página).
 */
export const fotosPerguntas: readonly string[] = [
  'grand-oca/resort/vista-aerea-resort.jpg',
  'grand-oca/resort/praia-coqueiral.jpg',
  'grand-oca/piscinas/piscina-borda-infinita.jpg',
  'grand-oca/resort/jardim-cabanas-coqueiral.jpg',
  'grand-oca/resort/vista-aerea-praia-piscina.jpg',
];

/** Foto do bloco de perguntas para um endereço (escolha estável). */
export function fotoDasPerguntas(caminho: string): string | undefined {
  if (fotosPerguntas.length === 0) return undefined;
  let soma = 0;
  for (const letra of caminho) soma = (soma * 31 + letra.charCodeAt(0)) % 9973;
  return fotosPerguntas[soma % fotosPerguntas.length];
}

/** Fotos de piscinas sem atividade específica (galeria, categoria "Piscinas"). */
export const fotosPiscinas: readonly string[] = [
  'grand-oca/piscinas/piscina-lagoa-coqueiros.jpg',
  'grand-oca/piscinas/piscina-ponte-madeira.jpg',
  'grand-oca/piscinas/piscina-aerea-curvas.jpg',
  'grand-oca/piscinas/piscina-caminho-pedra.jpg',
];

/** Fotos dos espaços infantis (galeria, categoria "Crianças"). */
export const fotosCriancas: readonly string[] = [
  'grand-oca/criancas/play-zone.jpg',
  'grand-oca/criancas/piscina-infantil-escorregador.jpg',
  'grand-oca/criancas/varanda-parque-aquatico.jpg',
];

/** Fotos do spa e do bem-estar (galeria, categoria "Spa e bem-estar"). */
export const fotosSpa: readonly string[] = ['grand-oca/lazer/academia.jpg'];
