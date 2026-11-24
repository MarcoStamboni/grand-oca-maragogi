/**
 * Textos institucionais da agência (Quem somos), os mesmos em todos os sites do portal
 * Resort All Inclusive. Os dados de contato vêm do operador no site.config.ts.
 */
import type { NomeIcone } from '../lib/icones.ts';

/** "Nossa história": parágrafos. */
export const historia: readonly string[] = [
  'A Resorts Online nasceu em maio de 2002 com um objetivo: oferecer um serviço completo, humanizado, ágil e eficiente para quem quer viajar. São mais de duas décadas no mercado de turismo, com atuação no Brasil, no Caribe, na Argentina, na América do Sul e em outros destinos internacionais.',
  'Ao longo desse tempo, a empresa construiu uma trajetória baseada em solidez, credibilidade e confiança, com foco em hotéis e resorts de qualidade.',
];

/** "No que acreditamos". */
export const crenca =
  'Acreditamos que viajar é uma das melhores experiências da vida. Por isso, o nosso trabalho é cuidar dos detalhes da viagem, da escolha do resort ao dia do check-in.';

/** "Como trabalhamos": cartões. */
export const comoTrabalhamos: readonly { titulo: string; texto: string; icone: NomeIcone }[] = [
  {
    titulo: 'Consultores de viagem',
    texto: 'Uma equipe treinada para indicar o resort certo para cada perfil de viagem.',
    icone: 'pessoas',
  },
  {
    titulo: 'Viagem do seu jeito',
    texto: 'Você escolhe a quantidade de noites e tem flexibilidade de datas.',
    icone: 'calendario',
  },
  {
    titulo: 'Tarifas especiais',
    texto: 'Tarifas não publicadas podem ser consultadas com a nossa equipe.',
    icone: 'estrela',
  },
  {
    titulo: 'Hospedagem ou pacote',
    texto: 'Só a hospedagem ou o pacote completo com passagens aéreas, com o mesmo atendimento.',
    icone: 'aviao',
  },
];
