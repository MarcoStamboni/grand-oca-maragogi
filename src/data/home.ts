/**
 * Textos da home que dependem do resort (o resto vem do site.config.ts e das coleções).
 * Fatos: docs/conteudo-grand-oca-maragogi.md. A resposta direta precisa ter de 40 a 60 palavras e
 * citar o resort (a auditoria do build confere). Palavra-chave da home: "Grand Oca Maragogi Resort".
 */
import type { NomeIcone } from '../lib/icones.ts';
import type { RotaChave } from './rotas.ts';

export const textosHome = {
  /** Resposta direta (AEO), no cartão do topo. */
  respostaDireta:
    'O Grand Oca Maragogi Resort é um resort all inclusive pé na areia na Praia de Ponta de Mangue, em Maragogi, Alagoas, entre Recife e Maceió. Tem 420 unidades de hospedagem em nove categorias, várias piscinas com parque aquático, quatro restaurantes, sete bares, Kids Club para crianças de 4 a 12 anos e centro de mergulho.',
  /** Parágrafos do cartão "Como é o resort?". */
  apresentacao: [
    'O Grand Oca Maragogi Resort ocupa uma faixa de coqueirais de frente para o mar da Costa dos Corais, a cerca de 10 metros da Praia de Ponta de Mangue. Os apartamentos e bangalôs se espalham por jardins de grama e palmeiras, com vista para as piscinas ou para o verde, e a área D’Água, a mais nova do resort, reúne quartos Deluxe com varanda de frente para o parque aquático.',
    'O regime all inclusive cobre as refeições em buffet no Restaurante dos Corais, os restaurantes temáticos com reserva prévia, os bares da piscina e da praia e bebidas selecionadas. Para completar, a estrutura de lazer inclui piscinas de várias profundidades, esportes, academia, Kids Club e shows na Esplanada Tropical.',
  ],
  /** Lista "Em resumo" do mesmo cartão, com o ícone (branco) de cada item. */
  emResumo: [
    { texto: 'Dez categorias, de apartamentos a suítes', icone: 'cama' },
    { texto: 'Quatro restaurantes e sete bares', icone: 'talheres' },
    { texto: 'Kids Club para crianças de 4 a 12 anos', icone: 'bebe' },
    { texto: 'Piscinas por quase 400 metros', icone: 'piscina' },
    { texto: 'Pé na areia, na Praia de Ponta de Mangue', icone: 'ondas' },
    { texto: 'Bebidas selecionadas incluídas', icone: 'taca' },
  ] satisfies { texto: string; icone: NomeIcone }[],
  /** Parágrafos da seção "O que o all inclusive oferece?". */
  allInclusive: [
    'A gastronomia do Grand Oca Maragogi Resort gira em torno do Restaurante dos Corais, de frente para o mar, com café da manhã, almoço e jantar em buffet, show cooking e culinária regional. Três restaurantes temáticos, o Ix’U, o Il Giardino e o La Brasa, entram no regime com reserva prévia, e a praça de alimentação reúne hambúrgueres, pizzas, comida mexicana e sorvetes.',
    'As bebidas selecionadas, de cervejas e caipirinhas a destilados, vinhos em taça e coquetéis, são servidas em sete bares, do Galés, dentro da piscina principal, ao Ponta de Mangue, na areia. O chá da tarde, os snacks e a reposição diária do frigobar completam o regime.',
  ],
  /** Mosaico "Experiências que te esperam": atalhos visuais por interesse (rota + foto). */
  experiencias: [
    {
      titulo: 'Piscinas',
      texto: 'Quase 400 metros de piscinas, com área D’Água',
      rota: 'piscinas',
      foto: 'grand-oca/piscinas/piscina-borda-infinita.jpg',
      destaque: true,
    },
    {
      titulo: 'Acomodações',
      texto: 'Bangalôs, suítes e quartos Deluxe',
      rota: 'acomodacoes',
      foto: 'grand-oca/acomodacoes/bangalo-fachada.jpg',
    },
    {
      titulo: 'Gastronomia',
      texto: 'Corais, Ix’U, Il Giardino e La Brasa',
      rota: 'restaurantes',
      foto: 'grand-oca/gastronomia/restaurante-corais-buffet.jpg',
    },
    {
      titulo: 'Crianças',
      texto: 'Kids Club e parque aquático',
      rota: 'criancas',
      foto: 'grand-oca/criancas/parque-aquatico-escorregadores.jpg',
    },
    {
      titulo: 'Praia e mergulho',
      texto: 'Ponta de Mangue e piscinas naturais',
      rota: 'experiencias',
      foto: 'grand-oca/regiao/piscinas-naturais-aereo.jpg',
    },
  ] satisfies {
    titulo: string;
    texto: string;
    rota: RotaChave;
    foto: string;
    destaque?: boolean;
  }[],
  /**
   * "Como é um dia no all inclusive?": exemplo de roteiro. Os horários das refeições são os do
   * Restaurante dos Corais; as demais atividades seguem a programação do dia.
   */
  umDia: [
    {
      hora: '7h–10h',
      periodo: 'Café da manhã',
      titulo: 'Café no Restaurante dos Corais',
      texto:
        'Buffet de frente para o mar, com tapiocas, bolo de goma, frutas, pães e itens regionais.',
      foto: 'grand-oca/gastronomia/restaurante-corais-buffet.jpg',
    },
    {
      hora: 'Manhã',
      periodo: 'Praia',
      titulo: 'Caminhada na areia',
      texto: 'A Praia de Ponta de Mangue começa a poucos passos dos jardins e dos bangalôs.',
      foto: 'grand-oca/resort/praia-coqueiral.jpg',
    },
    {
      hora: '12h30–15h',
      periodo: 'Almoço',
      titulo: 'Almoço e piscina',
      texto: 'Buffet no Corais ou churrasco informal no La Brasa, antes de voltar às piscinas.',
      foto: 'grand-oca/piscinas/piscina-solario.jpg',
    },
    {
      hora: '16h30–17h30',
      periodo: 'Tarde',
      titulo: 'Chá da tarde e parque aquático',
      texto: 'Pausa para o chá da tarde e tempo para os escorregadores do parque aquático.',
      foto: 'grand-oca/criancas/parque-aquatico-torre.jpg',
    },
    {
      hora: '19h–22h',
      periodo: 'Noite',
      titulo: 'Jantar e shows',
      texto: 'Jantar no Corais ou em um restaurante temático, com shows na Esplanada Tropical.',
      foto: 'grand-oca/gastronomia/restaurante-corais-noite.jpg',
    },
  ],
  /** Seletor de idades da seção das crianças (fatos da página Lazer e do Kids Club). */
  faixasDetalhe: [
    {
      id: 'kids1',
      rotulo: '4 a 7 anos',
      titulo: 'Brincadeiras e oficinas',
      texto:
        'Castelo de areia, pequenos pintores, oficinas de massinha, brigadeiro, cupcake e pizza, caça ao tesouro e hidro kids fazem parte da programação do Kids Club.',
    },
    {
      id: 'kids2',
      rotulo: '8 a 12 anos',
      titulo: 'Esportes e gincanas',
      texto:
        'Jogos esportivos, basquete e polo aquático, corrida de prancha, gincanas, caminhada ecológica e festa da espuma estão entre as atividades dessa faixa etária.',
    },
    {
      id: 'teens',
      rotulo: 'Menores de 4 anos',
      titulo: 'Para os menores',
      texto:
        'Crianças de até 3 anos podem participar de algumas atividades acompanhadas por um responsável. O resort também tem uma baby area para famílias com bebês.',
    },
    {
      id: 'familia',
      rotulo: 'Família',
      titulo: 'Todos juntos',
      texto:
        'A programação inclui o Family Oca, o parque aquático, o playground com cama elástica e escorregadores, os shows infantis e a praia de Ponta de Mangue.',
    },
  ],
  /** Introdução da seção das crianças. */
  criancas:
    'Quem viaja com crianças encontra o Kids Club, com atividades das 9h às 12h e das 14h às 18h para crianças de 4 a 12 anos, além de parque aquático com toboágua, playground, baby area, oficinas e shows infantis.',
} as const;
