/**
 * Fundo alternado das seções (padrão → areia → padrão...) em páginas com seções opcionais:
 * chame a função devolvida só nas seções que forem renderizadas, na ordem da página.
 */
export type FundoAlternado = 'padrao' | 'areia';

export function alternarFundos(primeiro: FundoAlternado = 'padrao'): () => FundoAlternado {
  let proximo = primeiro;
  return () => {
    const atual = proximo;
    proximo = atual === 'padrao' ? 'areia' : 'padrao';
    return atual;
  };
}
