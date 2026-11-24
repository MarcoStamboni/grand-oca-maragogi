/**
 * Experiências além da diária (página /experiencias/). Nenhuma tem preço publicado: os valores
 * são informados no momento da contratação. Fonte: páginas de entorno, entretenimento e do
 * resort do Grand Oca Maragogi (Oca Hotels).
 */
import type { NomeIcone } from '../lib/icones.ts';

export interface Experiencia {
  id: string;
  nome: string;
  descricao: string;
  icone: NomeIcone;
  /** Como pedir, quando a fonte informa. */
  comoContratar?: string;
  fontes: readonly string[];
}

export const experiencias: readonly Experiencia[] = [
  {
    id: 'mergulho-padi',
    nome: 'Mergulho e snorkel nas piscinas naturais',
    descricao:
      'O centro de mergulho do resort tem certificação PADI e oferece aulas e passeios até as piscinas naturais em frente ao resort, em mergulho com cilindro ou com snorkel.',
    icone: 'ondas',
    comoContratar: 'Serviço contratado à parte; informe-se no resort ou na agência de viagens.',
    fontes: ['/resort/', '/entorno/'],
  },
  {
    id: 'passeios-e-traslados',
    nome: 'Passeios e traslados',
    descricao:
      'A agência de viagens do resort reserva traslados e passeios pelos arredores, como as saídas aos recifes e às piscinas naturais da Costa dos Corais.',
    icone: 'bussola',
    comoContratar: 'Os passeios e traslados são contratados à parte, no resort.',
    fontes: ['/resort/'],
  },
  {
    id: 'grand-oca-spa',
    nome: 'Grand Oca Spa e Espaço Beleza',
    descricao:
      'O resort tem spa e um salão de beleza que abre todos os dias, com serviços de manicure e cabeleireiro, para quem quer incluir cuidado pessoal na viagem.',
    icone: 'flor',
    comoContratar: 'Serviços cobrados à parte; consulte o resort sobre horários e valores.',
    fontes: ['/resort/', '/entretenimento/'],
  },
  {
    id: 'vip-premium',
    nome: 'Experiência VIP Premium',
    descricao:
      'Área exclusiva na praia, com atendimento de hostess, camas de praia, bebidas e brunch no Ix’U, das 9h às 17h. A entrada não é permitida para menores de 14 anos.',
    icone: 'taca',
    comoContratar: 'Tem preço e condições próprios, informados pelo resort.',
    fontes: ['/gastronomia/'],
  },
];
