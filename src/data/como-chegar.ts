/**
 * Como chegar ao resort (página /como-chegar/ e seção da home). Os aeroportos ficam no
 * site.config.ts (`resort.aeroporto`). Fonte: páginas do Grand Oca Maragogi (Oca Hotels) e a
 * página de localização da agência. As fontes divergem quanto ao tempo de estrada entre os
 * aeroportos e o resort, então só as distâncias são publicadas.
 */
import type { NomeIcone } from '../lib/icones.ts';

export const rotasDeAcesso: readonly { titulo: string; descricao: string }[] = [
  {
    titulo: 'De carro, pela Rodovia AL-101 Norte',
    descricao:
      'O resort fica na AL-101 Norte, s/n, em Ponta de Mangue, ao norte do centro de Maragogi. Confira a rota atualizada no mapa antes de sair.',
  },
  {
    titulo: 'Saindo do Recife',
    descricao:
      'São cerca de 126 km de estrada pelo litoral sul de Pernambuco até Maragogi. O aeroporto do Recife (REC) costuma ser o mais próximo em distância rodoviária.',
  },
  {
    titulo: 'Saindo de Maceió',
    descricao:
      'São cerca de 136 km pelo litoral norte de Alagoas até Ponta de Mangue. O aeroporto de Maceió (MCZ) pode ser a melhor escolha, dependendo dos horários de voo e do roteiro.',
  },
];

export const transportes: readonly { nome: string; descricao: string; icone: NomeIcone }[] = [
  {
    nome: 'Transfer',
    descricao:
      'Transfer privativo ou compartilhado entre o aeroporto e o resort, contratado conforme a disponibilidade e as condições do serviço.',
    icone: 'aviao',
  },
  {
    nome: 'Carro alugado ou táxi',
    descricao:
      'Dá liberdade para conhecer as praias e as piscinas naturais de Maragogi. A distância entre o resort e o centro normalmente exige transporte.',
    icone: 'carro',
  },
];

/** Qual transporte escolher (bloco "Qual opção escolher?"). */
export const escolhaTransporte =
  'Compare o custo total, somando passagem, transfer e tempo de deslocamento, e não só a distância. O transfer facilita a chegada de famílias, e o carro alugado dá mais liberdade para passear pela região.';

/** Dicas do bloco "Antes de viajar". */
export const dicasAntesDeViajar: readonly string[] = [
  'Compare os voos para Recife e para Maceió: a escolha depende de horários, tarifas e do transfer.',
  'Leve documento com foto de todos os hóspedes, inclusive das crianças.',
  'O check-in começa às 15h; organize o horário de chegada considerando o trecho final de estrada.',
];
