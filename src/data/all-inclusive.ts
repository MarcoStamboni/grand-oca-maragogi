/**
 * O que está e o que não está incluso no all inclusive (home, /all-inclusive/ e reservas).
 * Fonte: páginas de gastronomia e de all inclusive do Grand Oca Maragogi (Oca Hotels) e da
 * agência. Condições, marcas e horários podem mudar sem aviso: o resort orienta confirmar no local.
 */
export const allInclusive = {
  incluso: [
    'Café da manhã, almoço, chá da tarde e jantar, com buffet no Restaurante dos Corais',
    'Restaurantes temáticos Ix’U, Il Giardino e La Brasa, com reserva prévia no Guest Service',
    'Água, água de coco, sucos e refrigerantes',
    'Cervejas, caipirinhas, destilados, vinhos em taça e coquetéis selecionados',
    'Snacks, sanduíches, hambúrgueres, pizzas, comida mexicana e sorvetes na praça de alimentação',
    'Reposição diária de itens definidos para o frigobar',
  ],
  naoIncluso: [
    'Bebidas importadas, espumante e vinho em garrafa',
    'Room service e itens fora do cardápio all inclusive',
    'Experiência VIP Premium, com condições e preços próprios',
    'Serviços extras não gastronômicos, como mergulho, spa e passeios',
    'Traslado entre o aeroporto e o resort',
  ],
  fontes: ['/all-inclusive/', '/gastronomia/', '/resort/'],
} as const;

/** As refeições do dia, com os horários publicados pela fonte. */
export const refeicoesDoDia: readonly { rotulo: string; valor: string }[] = [
  { rotulo: 'Café da manhã', valor: 'Das 7h às 10h, no Restaurante dos Corais' },
  { rotulo: 'Almoço', valor: 'Das 12h30 às 15h, no Restaurante dos Corais ou no La Brasa' },
  { rotulo: 'Chá da tarde', valor: 'Das 16h30 às 17h30, no terraço junto ao Corais' },
  { rotulo: 'Jantar', valor: 'Das 19h às 22h, no Corais ou nos restaurantes temáticos' },
  { rotulo: 'Snacks', valor: 'Na praça de alimentação e nos bares, conforme o ponto de serviço' },
];
