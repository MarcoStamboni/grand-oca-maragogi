/**
 * Links internos contextuais de cada página (bloco "Continue o planejamento", antes das perguntas
 * frequentes): três páginas relacionadas do mesmo site, com âncoras descritivas. As páginas de
 * detalhe usam a lista da rota-mãe (ex.: cada acomodação usa a de `acomodacoes`).
 */
import type { RotaChave } from './rotas.ts';

export type LinkRelacionado = readonly [rota: RotaChave, ancora: string];

export const paginasRelacionadas: Partial<Record<RotaChave, readonly LinkRelacionado[]>> = {
  resort: [
    ['acomodacoes', 'as nove categorias de acomodação'],
    ['allInclusive', 'o que o all inclusive inclui'],
    ['comoChegar', 'como chegar a Ponta de Mangue'],
  ],
  servicos: [
    ['resort', 'a estrutura do resort'],
    ['comoChegar', 'as formas de chegar por Recife ou Maceió'],
    ['experiencias', 'as experiências contratadas à parte'],
  ],
  fotos: [
    ['acomodacoes', 'as acomodações em detalhe'],
    ['piscinas', 'o complexo de piscinas'],
    ['lazer', 'o lazer e as atividades do resort'],
  ],
  acomodacoes: [
    ['comparativo', 'o comparativo das acomodações'],
    ['reservasHospedagem', 'a reserva só de hospedagem'],
    ['politicaHospedagem', 'a política de hospedagem'],
  ],
  comparativo: [
    ['acomodacoes', 'a página de cada categoria'],
    ['criancas', 'o resort para crianças'],
    ['reservasHospedagem', 'a cotação de hospedagem'],
  ],
  allInclusive: [
    ['restaurantes', 'os restaurantes do resort'],
    ['bares', 'os sete bares'],
    ['lazer', 'o lazer incluído na diária'],
  ],
  restaurantes: [
    ['allInclusive', 'tudo o que o all inclusive inclui'],
    ['bares', 'os bares e as bebidas'],
    ['reservas', 'as formas de reservar'],
  ],
  bares: [
    ['restaurantes', 'os quatro restaurantes e a praça de alimentação'],
    ['allInclusive', 'as bebidas e refeições incluídas'],
    ['piscinas', 'as piscinas com bar'],
  ],
  lazer: [
    ['piscinas', 'as piscinas e o solário'],
    ['criancas', 'a recreação infantil'],
    ['esportes', 'os esportes e a academia'],
  ],
  piscinas: [
    ['criancas', 'a recreação das crianças'],
    ['bares', 'os bares da piscina e da praia'],
    ['bemEstar', 'o spa e o bem-estar'],
  ],
  criancas: [
    ['piscinas', 'as piscinas e o parque aquático'],
    ['comparativo', 'as acomodações para famílias'],
    ['esportes', 'as atividades e o mergulho'],
  ],
  esportes: [
    ['lazer', 'todo o lazer do resort'],
    ['experiencias', 'o mergulho e os passeios contratados à parte'],
    ['politicaHospedagem', 'as regras da estadia'],
  ],
  bemEstar: [
    ['experiencias', 'as outras experiências à parte'],
    ['piscinas', 'as piscinas e a área D’Água'],
    ['acomodacoes', 'a Suíte Deluxe e as outras acomodações'],
  ],
  experiencias: [
    ['bemEstar', 'o Grand Oca Spa e o Espaço Beleza'],
    ['destino', 'os passeios por Maragogi'],
    ['esportes', 'as atividades da programação'],
  ],
  datasEspeciais: [
    ['reservas', 'as formas de reservar com antecedência'],
    ['acomodacoes', 'as acomodações disponíveis'],
    ['allInclusive', 'o que está incluído na diária'],
  ],
  destino: [
    ['comoChegar', 'como chegar ao resort'],
    ['experiencias', 'os passeios contratados à parte'],
    ['resort', 'o resort pé na areia em Ponta de Mangue'],
  ],
  blog: [
    ['acomodacoes', 'as acomodações do resort'],
    ['criancas', 'o resort para crianças'],
    ['perguntasFrequentes', 'as perguntas frequentes'],
  ],
  comoChegar: [
    ['destino', 'o guia de Maragogi'],
    ['reservasPacoteComAereo', 'o pacote com voo até Recife ou Maceió'],
    ['politicaHospedagem', 'os horários de check-in e check-out'],
  ],
  outrosResorts: [
    ['resort', 'o Grand Oca Maragogi Resort'],
    ['reservas', 'as formas de reservar'],
    ['contato', 'o atendimento da central'],
  ],
  reservas: [
    ['acomodacoes', 'as acomodações para escolher'],
    ['politicaHospedagem', 'a política de hospedagem'],
    ['datasEspeciais', 'os feriados mais procurados'],
  ],
  reservasHospedagem: [
    ['comparativo', 'o comparativo das acomodações'],
    ['allInclusive', 'o que a diária inclui'],
    ['politicaHospedagem', 'as regras da estadia'],
  ],
  reservasPacoteComAereo: [
    ['comoChegar', 'o caminho do aeroporto até o resort'],
    ['reservasHospedagem', 'a reserva só de hospedagem'],
    ['acomodacoes', 'as acomodações do resort'],
  ],
  politicaHospedagem: [
    ['reservas', 'as formas de reservar'],
    ['acomodacoes', 'a capacidade de cada acomodação'],
    ['perguntasFrequentes', 'as perguntas frequentes'],
  ],
  perguntasFrequentes: [
    ['reservas', 'as formas de reservar'],
    ['acomodacoes', 'as acomodações'],
    ['allInclusive', 'o all inclusive'],
  ],
  contato: [
    ['reservas', 'as formas de reservar'],
    ['quemSomos', 'quem é a Resorts Online'],
    ['perguntasFrequentes', 'as perguntas frequentes'],
  ],
  quemSomos: [
    ['contato', 'os canais de atendimento'],
    ['outrosResorts', 'os outros resorts que a agência vende'],
    ['reservas', 'as formas de reservar o Grand Oca Maragogi'],
  ],
  privacidade: [
    ['cookies', 'a política de cookies'],
    ['termos', 'os termos de uso'],
    ['contato', 'os canais de atendimento'],
  ],
  termos: [
    ['privacidade', 'a política de privacidade'],
    ['politicaHospedagem', 'a política de hospedagem'],
    ['contato', 'os canais de atendimento'],
  ],
  cookies: [
    ['privacidade', 'a política de privacidade'],
    ['termos', 'os termos de uso'],
    ['contato', 'os canais de atendimento'],
  ],
};
