/** Nome de quem opera o site nas frases, com o artigo certo (decisão 1; armadilha de concordância). */
import { type Operador, operador as operadorAtivo } from '@/site.config';

/** "a Resorts Online" · "o Resort Modelo All Inclusive". */
export function operadorComArtigo(op: Operador = operadorAtivo): string {
  return `${op.artigo} ${op.nome}`;
}

/** "pela Resorts Online" · "pelo Resort Modelo All Inclusive". */
export function porOperador(op: Operador = operadorAtivo): string {
  return `${op.artigo === 'a' ? 'pela' : 'pelo'} ${op.nome}`;
}
