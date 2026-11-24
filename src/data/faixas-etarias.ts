/**
 * Faixas etárias da recreação, como a fonte publica (Kids Club do Grand Oca Maragogi).
 * `null` = a fonte não define o limite.
 */
export const faixasEtarias: readonly {
  nome: string;
  idadeMinima: number | null;
  idadeMaxima: number | null;
}[] = [
  { nome: '4 a 7 anos', idadeMinima: 4, idadeMaxima: 7 },
  { nome: '8 a 12 anos', idadeMinima: 8, idadeMaxima: 12 },
  { nome: 'Até 3 anos, com um responsável', idadeMinima: null, idadeMaxima: 3 },
  { nome: 'Adultos (programação das 9h às 23h)', idadeMinima: null, idadeMaxima: null },
];
