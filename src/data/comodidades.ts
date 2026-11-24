/**
 * Comodidades e serviços do resort. Alimentam o `amenityFeature` do JSON-LD do resort e aparecem
 * nas páginas de lazer, serviços e all inclusive. Só entra o que a fonte afirma.
 * Fonte: páginas do resort, de entretenimento e de gastronomia do Grand Oca Maragogi.
 */
export const comodidadesResort = [
  'All inclusive com refeições, bebidas selecionadas e snacks',
  'Praia de Ponta de Mangue a cerca de 10 metros',
  'Várias piscinas com diferentes profundidades',
  'Área D’Água com solário e borda infinita',
  'Parque aquático infantil',
  'Playground',
  'Kids Club para crianças de 4 a 12 anos',
  'Baby area',
  'Quatro restaurantes',
  'Sete bares',
  'Praça de alimentação',
  'Academia e aulas de ginástica',
  'Centro de mergulho PADI',
  'Salão de beleza',
  'Enfermaria para primeiros socorros',
  'Lojas de lembranças e artesanato',
  'Agência de viagens para traslados e passeios',
  'Guest Service ao lado da recepção',
  'Wi-Fi',
] as const;

export interface Servico {
  nome: string;
  descricao: string;
  /** `true` = cobrado à parte. */
  pago: boolean;
}

/** Serviços do resort (página /o-resort/servicos/). */
export const servicosResort: readonly Servico[] = [
  {
    nome: 'Guest Service',
    descricao:
      'Departamento de atendimento ao hóspede, ao lado da recepção, onde também são feitas as reservas dos restaurantes temáticos.',
    pago: false,
  },
  {
    nome: 'Wi-Fi',
    descricao: 'Acesso à internet sem fio nas áreas do resort.',
    pago: false,
  },
  {
    nome: 'Academia',
    descricao:
      'Academia com aulas programadas, como Cardio HIT, funcional, Pilates com bola e alongamento, e hidro fitness na piscina.',
    pago: false,
  },
  {
    nome: 'Enfermaria',
    descricao: 'Serviço de enfermaria para primeiros socorros durante a estadia.',
    pago: false,
  },
  {
    nome: 'Baby area',
    descricao: 'Espaço de apoio a famílias que viajam com bebês e crianças pequenas.',
    pago: false,
  },
  {
    nome: 'Salão de beleza',
    descricao: 'Espaço de beleza aberto todos os dias, com serviços de manicure e cabeleireiro.',
    pago: true,
  },
  {
    nome: 'Lojas',
    descricao: 'Lojas para comprar lembranças da viagem, moda e artesanato local.',
    pago: true,
  },
  {
    nome: 'Centro de mergulho PADI',
    descricao:
      'Aulas de mergulho e passeios até as piscinas naturais em frente ao resort, com certificação PADI.',
    pago: true,
  },
  {
    nome: 'Agência de viagens',
    descricao:
      'Reserva de traslados e passeios pelos arredores, como as piscinas naturais da Costa dos Corais.',
    pago: true,
  },
];
