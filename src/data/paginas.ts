/**
 * Textos das páginas fixas: <title> (sem o nome do site), meta description, H1, sobretítulo,
 * subtítulo e resposta direta (AEO). As páginas em src/pages/ só montam o layout e leem daqui.
 * Fatos: docs/conteudo-grand-oca-maragogi.md. Regras conferidas por teste (paginas.test.ts) e
 * pela auditoria do build:
 * - `titulo` até 44 caracteres (o layout acrescenta " | <nome do resort>");
 * - `descricao` de 70 a 160 caracteres, única;
 * - `respostaDireta` de 40 a 60 palavras, citando o resort, a praia ou o destino.
 * Cada página tem uma palavra-chave própria (no H1 e na descrição), sem disputar com as outras.
 */
import type { RotaChave } from './rotas.ts';

export interface TextoPagina {
  titulo: string;
  descricao: string;
  h1: string;
  sobretitulo?: string;
  subtitulo?: string;
  respostaDireta: string;
}

/** Páginas com texto próprio (a home tem o seu em src/data/home.ts). */
export type RotaComTexto = Exclude<RotaChave, 'home'>;

export const paginas: Readonly<Record<RotaComTexto, TextoPagina>> = {
  resort: {
    titulo: 'Conheça o resort',
    descricao:
      'Conheça o Grand Oca Maragogi, resort all inclusive pé na areia na Praia de Ponta de Mangue, com piscinas e Kids Club.',
    h1: 'Conheça o Grand Oca Maragogi Resort',
    sobretitulo: 'O resort',
    subtitulo:
      'Um resort all inclusive de frente para o mar, entre coqueiros, piscinas e a Costa dos Corais.',
    respostaDireta:
      'O Grand Oca Maragogi Resort fica na Praia de Ponta de Mangue, em Maragogi, no litoral norte de Alagoas, entre Recife e Maceió. São 420 unidades de hospedagem espalhadas por jardins de coqueiros, várias piscinas, quatro restaurantes, sete bares, academia, Kids Club e um centro de mergulho a poucos passos do mar.',
  },
  servicos: {
    titulo: 'Serviços e comodidades',
    descricao:
      'Serviços do Grand Oca Maragogi: Guest Service, Wi-Fi, enfermaria, lojas, salão de beleza, academia e centro de mergulho.',
    h1: 'Serviços e comodidades do Grand Oca Maragogi',
    sobretitulo: 'O resort',
    subtitulo: 'O que está à disposição no dia a dia e o que é contratado à parte.',
    respostaDireta:
      'O Grand Oca Maragogi Resort tem Guest Service ao lado da recepção, Wi-Fi, enfermaria para primeiros socorros, lojas de lembranças e artesanato local, salão de beleza aberto todos os dias, academia, baby area e agência de viagens para traslados e passeios. O centro de mergulho PADI e os serviços extras são contratados à parte.',
  },
  fotos: {
    titulo: 'Fotos do resort',
    descricao:
      'Fotos do Grand Oca Maragogi: piscinas, apartamentos, bangalôs, restaurantes, parque aquático e a praia de Ponta de Mangue.',
    h1: 'Fotos do Grand Oca Maragogi Resort',
    sobretitulo: 'Galeria',
    subtitulo: 'A praia, as piscinas, as acomodações e a gastronomia em imagens.',
    respostaDireta:
      'A galeria reúne imagens do Grand Oca Maragogi Resort organizadas por área: a praia de Ponta de Mangue, as piscinas, o parque aquático, os apartamentos e bangalôs, os restaurantes e a academia. Use os filtros para ver só o que interessa à sua viagem e abra cada foto em tamanho maior.',
  },
  acomodacoes: {
    titulo: 'Acomodações',
    descricao:
      'Acomodações do Grand Oca Maragogi: Standard, bangalôs, suítes e quartos Deluxe, para casais, famílias e grupos.',
    h1: 'Acomodações do Grand Oca Maragogi Resort',
    sobretitulo: 'Hospedagem',
    subtitulo: 'Apartamentos, bangalôs, suítes e quartos Deluxe entre jardins, piscinas e a praia.',
    respostaDireta:
      'O Grand Oca Maragogi Resort tem 420 unidades em nove categorias: Standard, Standard Comunicante, Bangalô Vista Jardim, Bangalô Vista Piscina, Bangalô Triplo, Suíte, Deluxe com duas camas grandes, Duplo Deluxe com sofá-cama e Suíte Deluxe. As capacidades vão de dois a seis hóspedes, com vista para jardins ou piscinas.',
  },
  comparativo: {
    titulo: 'Comparativo das acomodações',
    descricao:
      'Compare as acomodações do Grand Oca Maragogi: metragem, capacidade, camas, vista e diferenciais de cada categoria.',
    h1: 'Comparativo das acomodações do Grand Oca Maragogi',
    sobretitulo: 'Hospedagem',
    subtitulo: 'Metragem, capacidade e diferenciais de cada categoria, lado a lado.',
    respostaDireta:
      'A melhor acomodação do Grand Oca Maragogi Resort depende do grupo e da vista desejada. Os bangalôs ficam perto das piscinas, o Standard Comunicante reúne até seis pessoas em dois quartos, a área D’Água traz os quartos Deluxe com varanda para a piscina e a Suíte Deluxe, de 72 m², é a maior do resort.',
  },
  allInclusive: {
    titulo: 'All inclusive',
    descricao:
      'All inclusive do Grand Oca Maragogi: refeições em buffet, restaurantes temáticos, sete bares e bebidas selecionadas incluídas.',
    h1: 'All inclusive do Grand Oca Maragogi Resort',
    sobretitulo: 'All inclusive',
    subtitulo: 'Refeições, bebidas e lazer incluídos, com o mar de Maragogi como cenário.',
    respostaDireta:
      'No all inclusive do Grand Oca Maragogi Resort, a diária cobre café da manhã, almoço, chá da tarde e jantar, snacks e bebidas selecionadas, como cervejas, caipirinhas, destilados, vinhos em taça e coquetéis. Os restaurantes Ix’U, Il Giardino e La Brasa entram no regime com reserva prévia. Espumante, vinho em garrafa e room service ficam de fora.',
  },
  restaurantes: {
    titulo: 'Restaurantes',
    descricao:
      'Restaurantes do Grand Oca Maragogi: Corais, Ix’U, Il Giardino e La Brasa, do buffet regional às carnes na brasa.',
    h1: 'Restaurantes do Grand Oca Maragogi Resort',
    sobretitulo: 'Gastronomia',
    subtitulo: 'Buffet de frente para o mar e três restaurantes temáticos dentro do all inclusive.',
    respostaDireta:
      'O Grand Oca Maragogi Resort tem quatro restaurantes: o Corais, buffet regional de frente para o mar, o Ix’U, de cozinha fusion à beira da praia, o Il Giardino, de cozinha italiana, e o La Brasa, de churrasco no almoço e carnes na brasa à noite. Os três temáticos pedem reserva prévia no Guest Service.',
  },
  bares: {
    titulo: 'Bares',
    descricao:
      'Bares do Grand Oca Maragogi: Coqueirais, Galés, Drink Parrot, Ponta de Mangue e outros, na piscina e na praia.',
    h1: 'Bares do Grand Oca Maragogi Resort',
    sobretitulo: 'Gastronomia',
    subtitulo: 'Da piscina à praia, sete bares com bebidas do all inclusive.',
    respostaDireta:
      'O Grand Oca Maragogi Resort tem sete bares: Coqueirais, ao lado da piscina principal, Galés, dentro da piscina, Drink Parrot, de coquetéis, Ponta de Mangue, na praia, Tropical, junto aos shows, o bar da Piscina D’Água, com snacks e chá da tarde, e o SportBar, para acompanhar os jogos.',
  },
  lazer: {
    titulo: 'Lazer',
    descricao:
      'Lazer no Grand Oca Maragogi: piscinas, praia de Ponta de Mangue, esportes, academia, hidro e programação de shows.',
    h1: 'Lazer no Grand Oca Maragogi Resort',
    sobretitulo: 'Lazer',
    subtitulo: 'Piscinas, praia, esportes e shows para todas as idades.',
    respostaDireta:
      'O lazer no Grand Oca Maragogi Resort combina piscinas, praia de Ponta de Mangue, caiaque, vôlei, beach tênis, futebol, hidro, academia e dança, com programação adulta das 9h às 23h. O Kids Club cuida da recreação infantil, e os shows acontecem na Esplanada Tropical. Mergulho e passeios são contratados à parte.',
  },
  piscinas: {
    titulo: 'Piscinas',
    descricao:
      'Piscinas do Grand Oca Maragogi: complexo de quase 400 m, profundidades variadas, área D’Água com solário, bares e hidro.',
    h1: 'Piscinas do Grand Oca Maragogi Resort',
    sobretitulo: 'Lazer',
    subtitulo: 'Várias piscinas entre bangalôs e jardins, com bares e parque aquático.',
    respostaDireta:
      'As piscinas do Grand Oca Maragogi Resort se estendem por quase 400 metros em frente aos bangalôs, com diferentes profundidades, e incluem a nova área D’Água, com solário, borda infinita e parque aquático. Bares dentro e ao lado da água servem bebidas e snacks, e a programação traz hidro e recreação.',
  },
  criancas: {
    titulo: 'Para crianças',
    descricao:
      'Grand Oca Maragogi para crianças: Kids Club de 4 a 12 anos, parque aquático, playground, oficinas e shows infantis.',
    h1: 'Grand Oca Maragogi Resort para crianças',
    sobretitulo: 'Lazer',
    subtitulo: 'Kids Club, parque aquático e programação diária para os pequenos.',
    respostaDireta:
      'No Grand Oca Maragogi Resort, o Kids Club recebe crianças de 4 a 12 anos das 9h às 12h e das 14h às 18h, com jogos, oficinas, atividades na piscina e na praia e shows. O resort tem parque aquático com toboágua, playground com cama elástica, o Play Zone e uma baby area para os menores.',
  },
  esportes: {
    titulo: 'Esportes e atividades',
    descricao:
      'Esportes no Grand Oca Maragogi: caiaque, vôlei, beach tênis, futebol, hidro, academia e mergulho na Costa dos Corais.',
    h1: 'Esportes e atividades no Grand Oca Maragogi',
    sobretitulo: 'Lazer',
    subtitulo: 'Atividades na areia, na água e na academia, com programação diária.',
    respostaDireta:
      'A programação esportiva do Grand Oca Maragogi Resort inclui caiaque, hidro, vôlei, beach tênis, futebol, dança e aulas na academia, como Cardio HIT, funcional, Pilates com bola e hidro fitness. O resort também tem um centro de mergulho PADI para passeios às piscinas naturais, e horários e modalidades podem mudar.',
  },
  bemEstar: {
    titulo: 'Spa e bem-estar',
    descricao:
      'Bem-estar no Grand Oca Maragogi: Grand Oca Spa, Espaço Beleza, academia com aulas e hidro fitness em frente ao mar.',
    h1: 'Spa e bem-estar no Grand Oca Maragogi',
    sobretitulo: 'Bem-estar',
    subtitulo: 'Spa, salão de beleza, academia e momentos de pausa à beira-mar.',
    respostaDireta:
      'O bem-estar no Grand Oca Maragogi Resort reúne o Grand Oca Spa, o Espaço Beleza, com manicure e cabeleireiro todos os dias, e a academia, com aulas como funcional, Pilates com bola, alongamento e hidro fitness. Os serviços do spa e do salão são contratados à parte, e a praia de Ponta de Mangue completa o descanso.',
  },
  experiencias: {
    titulo: 'Experiências',
    descricao:
      'Experiências no Grand Oca Maragogi além do all inclusive: mergulho PADI, passeios às piscinas naturais, spa e traslados.',
    h1: 'Experiências no Grand Oca Maragogi Resort',
    sobretitulo: 'Experiências',
    subtitulo: 'O que contratar à parte para completar a viagem a Maragogi.',
    respostaDireta:
      'Além do all inclusive, o Grand Oca Maragogi Resort oferece experiências contratadas à parte: aulas de mergulho e passeios às piscinas naturais com o centro PADI, serviços do Grand Oca Spa e do Espaço Beleza e traslados ou passeios pela região, reservados na agência de viagens do resort.',
  },
  datasEspeciais: {
    titulo: 'Feriados e datas especiais',
    descricao:
      'Feriados no Grand Oca Maragogi: Réveillon, Carnaval, Páscoa, Natal e emendas, com dicas para reservar com antecedência.',
    h1: 'Feriados e datas especiais no Grand Oca Maragogi',
    sobretitulo: 'Datas especiais',
    subtitulo: 'Os períodos mais procurados do ano, para reservar com antecedência.',
    respostaDireta:
      'Os feriados são as datas mais disputadas do Grand Oca Maragogi Resort, de Maragogi, em Alagoas. Réveillon, Carnaval, Páscoa, Natal e as emendas de novembro costumam pedir reserva antecipada, e tarifas, noites mínimas e disponibilidade variam a cada ano. Consulte a central de reservas com antecedência para garantir a categoria.',
  },
  destino: {
    titulo: 'Guia de Maragogi',
    descricao:
      'Guia de Maragogi para quem fica no Grand Oca Maragogi: Costa dos Corais, piscinas naturais, mergulho e a cidade.',
    h1: 'Guia de Maragogi, na Costa dos Corais',
    sobretitulo: 'O destino',
    subtitulo: 'Recifes, piscinas naturais, praias de coqueirais e a vida da cidade.',
    respostaDireta:
      'Maragogi, no litoral norte de Alagoas, entre Recife e Maceió, é conhecida como a Costa dos Corais. A cidade reúne praias de coqueirais, recifes e piscinas naturais em área de preservação ambiental, boas para mergulho e snorkel. O Grand Oca Maragogi Resort fica na Praia de Ponta de Mangue.',
  },
  blog: {
    titulo: 'Blog de viagem',
    descricao:
      'Blog do Grand Oca Maragogi: dicas para escolher a acomodação, montar a mala e viajar com crianças a Maragogi.',
    h1: 'Blog: dicas para a sua viagem a Maragogi',
    sobretitulo: 'Blog',
    subtitulo: 'Planejamento, viagem em família e dicas do destino.',
    respostaDireta:
      'O blog reúne dicas práticas para planejar a viagem ao Grand Oca Maragogi Resort: como escolher entre apartamentos, bangalôs e quartos Deluxe, o que levar na mala para a praia e as piscinas, e como organizar as férias com crianças em Maragogi. Os artigos são escritos pela equipe da Resorts Online.',
  },
  comoChegar: {
    titulo: 'Como chegar',
    descricao:
      'Como chegar ao Grand Oca Maragogi: Rodovia AL-101 Norte, em Ponta de Mangue, a 126 km de Recife e 136 km de Maceió.',
    h1: 'Onde fica o Grand Oca Maragogi Resort',
    sobretitulo: 'Localização',
    subtitulo: 'Endereço, aeroportos de Recife e Maceió, rotas e mapa.',
    respostaDireta:
      'O Grand Oca Maragogi Resort fica na Rodovia AL-101 Norte, s/n, em Ponta de Mangue, Maragogi, Alagoas, a cerca de 10 metros da praia. Os aeroportos mais usados são o de Recife (REC), a cerca de 126 km, e o de Maceió (MCZ), a cerca de 136 km, e o trecho final é feito de carro ou transfer.',
  },
  outrosResorts: {
    titulo: 'Outros resorts all inclusive',
    descricao:
      'Outros resorts all inclusive da Rede Resort All Inclusive pelo Brasil, para comparar com o Grand Oca Maragogi.',
    h1: 'Outros resorts all inclusive',
    sobretitulo: 'Rede Resort All Inclusive',
    subtitulo: 'Mais opções de resorts all inclusive pelo Brasil, com o mesmo atendimento.',
    respostaDireta:
      'Além do Grand Oca Maragogi Resort, em Maragogi, a Rede Resort All Inclusive reúne hospedagem e pacotes em outros resorts all inclusive pelo Brasil. A lista abaixo ajuda a comparar destinos e estruturas, e a mesma equipe atende as cotações de todos eles por telefone, WhatsApp e e-mail.',
  },
  reservas: {
    titulo: 'Reservas',
    descricao:
      'Reserve o Grand Oca Maragogi: só hospedagem ou pacote com aéreo, em até 10x sem juros no cartão ou 5% off no Pix.',
    h1: 'Reserve o Grand Oca Maragogi Resort',
    sobretitulo: 'Reservas',
    subtitulo: 'Escolha entre só a hospedagem ou o pacote com aéreo.',
    respostaDireta:
      'Há duas formas de reservar o Grand Oca Maragogi Resort com a Resorts Online: só a hospedagem, para quem já tem as passagens ou vai de carro, ou o pacote com hotel e aéreo, para organizar a viagem inteira numa só cotação. Nos dois casos, o all inclusive é o mesmo, e a equipe confirma a disponibilidade.',
  },
  reservasHospedagem: {
    titulo: 'Reserva de hospedagem',
    descricao:
      'Hospedagem no Grand Oca Maragogi: informe as datas e os hóspedes e consulte as categorias com a nossa equipe.',
    h1: 'Hospedagem no Grand Oca Maragogi Resort',
    sobretitulo: 'Reservas',
    subtitulo: 'Só a hospedagem all inclusive, para quem já tem o transporte.',
    respostaDireta:
      'Para reservar só a hospedagem no Grand Oca Maragogi Resort, informe as datas de entrada e saída, o número de quartos, os adultos e a idade de cada criança. O check-in é a partir das 15h e o check-out, até as 12h. A diária inclui refeições, bebidas selecionadas e o lazer do resort.',
  },
  reservasPacoteComAereo: {
    titulo: 'Pacote com aéreo',
    descricao:
      'Pacote com aéreo para o Grand Oca Maragogi: hotel all inclusive e voos para Recife ou Maceió numa única cotação.',
    h1: 'Pacote com aéreo para o Grand Oca Maragogi',
    sobretitulo: 'Reservas',
    subtitulo: 'Hotel all inclusive e passagens numa só cotação.',
    respostaDireta:
      'O pacote com aéreo para o Grand Oca Maragogi Resort junta a hospedagem all inclusive e as passagens, geralmente para Recife ou Maceió, numa única cotação. Informe a cidade de origem, as datas e os hóspedes, com a idade das crianças, e a equipe da Resorts Online envia as opções disponíveis.',
  },
  politicaHospedagem: {
    titulo: 'Política de hospedagem',
    descricao:
      'Política de hospedagem do Grand Oca Maragogi: check-in às 15h, check-out às 12h, crianças, menores e restaurantes temáticos.',
    h1: 'Política de hospedagem do Grand Oca Maragogi',
    sobretitulo: 'Hospedagem',
    subtitulo: 'Horários, crianças e regras para aproveitar a estadia sem surpresas.',
    respostaDireta:
      'No Grand Oca Maragogi Resort, o check-in começa às 15h e o check-out deve ser feito até as 12h. Early check-in e late check-out dependem de disponibilidade. Menores de 18 anos sem os pais precisam de autorização dos responsáveis, e os restaurantes temáticos exigem reserva prévia no Guest Service.',
  },
  perguntasFrequentes: {
    titulo: 'Perguntas frequentes',
    descricao:
      'Perguntas frequentes sobre o Grand Oca Maragogi: acomodações, all inclusive, crianças, lazer, reservas e destino.',
    h1: 'Perguntas frequentes sobre o Grand Oca Maragogi',
    sobretitulo: 'Dúvidas',
    subtitulo: 'Respostas rápidas, organizadas por tema.',
    respostaDireta:
      'Aqui estão as respostas para as dúvidas mais comuns sobre o Grand Oca Maragogi Resort, agrupadas por tema: o resort, a localização na Praia de Ponta de Mangue, as acomodações, o all inclusive, o lazer e as crianças, as reservas e Maragogi. Se faltar alguma resposta, a equipe da Resorts Online ajuda.',
  },
  contato: {
    titulo: 'Fale conosco',
    descricao:
      'Fale com a Resorts Online sobre o Grand Oca Maragogi por telefone, WhatsApp ou e-mail, de segunda a sábado.',
    h1: 'Fale conosco',
    sobretitulo: 'Atendimento',
    subtitulo: 'Cotações de hospedagem e de pacotes com aéreo.',
    respostaDireta:
      'Para falar sobre reservas no Grand Oca Maragogi Resort, use a central de reservas da Resorts Online por telefone, o WhatsApp ou o e-mail reservas@resortallinclusive.com.br. A equipe atende de segunda a sexta, das 10h às 18h, e aos sábados, das 10h às 13h, com cotações de hospedagem e de pacotes com aéreo.',
  },
  quemSomos: {
    titulo: 'Quem somos',
    descricao:
      'Quem somos: a Resorts Online, agência fundada em 2002 que vende hospedagem e pacotes para o Grand Oca Maragogi.',
    h1: 'Quem é a Resorts Online',
    sobretitulo: 'Quem somos',
    subtitulo: 'A agência que vende hospedagem e pacotes para o Grand Oca Maragogi.',
    respostaDireta:
      'Este site faz parte do portal Resort All Inclusive, da Resorts Online Viagens e Turismo, agência fundada em maio de 2002, em São Paulo, que vende hospedagem e pacotes para o Grand Oca Maragogi Resort. Não é o site oficial do hotel: a equipe atende por telefone, WhatsApp e e-mail.',
  },
  privacidade: {
    titulo: 'Política de privacidade',
    descricao:
      'Política de privacidade do site do Grand Oca Maragogi: dados tratados, finalidades, prazos e direitos pela LGPD.',
    h1: 'Política de privacidade',
    sobretitulo: 'Privacidade',
    respostaDireta:
      'Esta política explica como o site do Grand Oca Maragogi Resort, operado pela Resorts Online, trata dados pessoais: o que é coletado nos contatos e nas cotações, para que é usado, com quem é compartilhado, por quanto tempo fica guardado e como exercer os direitos previstos na Lei Geral de Proteção de Dados.',
  },
  termos: {
    titulo: 'Termos de uso',
    descricao:
      'Termos de uso do site do Grand Oca Maragogi: informações publicadas, reservas, uso do conteúdo e responsabilidades.',
    h1: 'Termos de uso',
    sobretitulo: 'Termos',
    respostaDireta:
      'Estes termos valem para quem usa o site do Grand Oca Maragogi Resort, operado pela Resorts Online. Eles explicam como as informações são publicadas, como funcionam as reservas feitas pelos canais da agência, o uso de textos e imagens e as responsabilidades da agência e de quem navega no site.',
  },
  cookies: {
    titulo: 'Política de cookies',
    descricao:
      'Política de cookies do site do Grand Oca Maragogi: quais cookies podem ser usados e como mudar a sua escolha.',
    h1: 'Política de cookies',
    sobretitulo: 'Cookies',
    respostaDireta:
      'O site do Grand Oca Maragogi Resort, operado pela Resorts Online, só usa cookies de medição de audiência se você aceitar no aviso de cookies. Sem o aceite, nenhum script de terceiros é carregado. Esta página explica quais cookies podem ser usados, para que servem e como mudar a sua escolha a qualquer momento.',
  },
};

export function textoDaPagina(rota: RotaComTexto): TextoPagina {
  return paginas[rota];
}
