/**
 * Regras de reserva e de hospedagem (páginas /reservas/, /politica-de-hospedagem/ e o bloco
 * "O que conferir antes de finalizar a reserva"). Horários, crianças e fumantes vêm do
 * site.config.ts. As regras do resort vêm das páginas Lazer, Pet friendly e da agenda publicadas
 * pelo hotel; as de cancelamento são as da agência, porque reservas feitas por agências seguem as
 * condições do parceiro que vendeu.
 */
import { resort } from '../site.config.ts';

/** Cancelamento e não comparecimento (tabela). */
export const regrasCancelamento: readonly { rotulo: string; valor: string }[] = [
  {
    rotulo: 'Cancelamento',
    valor:
      'Segue a regra da tarifa escolhida, informada antes do pagamento. Tarifas promocionais podem não ser reembolsáveis.',
  },
  {
    rotulo: 'Direito de arrependimento',
    valor:
      'Compras feitas a distância podem ser canceladas em até 7 dias após a contratação, com devolução integral (art. 49 do Código de Defesa do Consumidor).',
  },
  {
    rotulo: 'Não comparecimento (no-show)',
    valor: 'Segue a regra da tarifa escolhida, informada antes do pagamento.',
  },
  {
    rotulo: 'Alterações de data',
    valor:
      'Seguem a regra da tarifa escolhida e dependem da disponibilidade. Confirme com a equipe.',
  },
];

/** Dados pedidos no check-in (Ficha Nacional de Registro de Hóspedes). */
export const documentosCheckIn: readonly string[] = [
  'Documento oficial com foto de todos os hóspedes',
  'CPF (estrangeiros apresentam o passaporte)',
  'Endereço completo com CEP',
  'Telefone e e-mail de contato',
];

/** Menores de 18 anos (Estatuto da Criança e do Adolescente, Lei nº 8.069/1990). */
export const regrasMenores: readonly string[] = [
  'Menores de 18 anos só se hospedam acompanhados dos pais ou de um responsável legal.',
  'Com outro adulto, é preciso autorização expressa dos pais ou do responsável legal. Confirme com a equipe o modelo exigido antes de viajar.',
  'Toda criança apresenta documento que comprove a identidade e a filiação, como a certidão de nascimento ou o RG.',
  'Bebidas alcoólicas não são servidas a menores de 18 anos, como manda a lei.',
];

export const outrasRegrasHospedagem: readonly string[] = [
  ...(resort.naoFumantes ? ['As acomodações são para não fumantes.'] : []),
  'Os restaurantes Ix’U, Il Giardino e La Brasa (no jantar) exigem reserva prévia no Guest Service, e a quantidade de reservas incluídas varia conforme o número de noites.',
  'A Experiência VIP Premium, na praia, não admite menores de 14 anos e tem condições próprias.',
  'A programação, os horários e o funcionamento das atrações podem mudar sem aviso prévio ou por causa do clima.',
];

/** "O que conferir antes de finalizar a reserva". */
export const conferirAntesDeReservar: readonly { titulo: string; texto: string }[] = [
  {
    titulo: 'Datas e número de noites',
    texto: 'Confira o dia de entrada e de saída: o check-in e o check-out têm horário fixo.',
  },
  {
    titulo: 'Idade de cada criança',
    texto:
      'A tarifa muda conforme a idade das crianças. Informe a idade de cada uma na data da viagem.',
  },
  {
    titulo: 'Categoria e capacidade',
    texto: 'Cada acomodação tem um limite de adultos e de crianças. Compare antes de escolher.',
  },
  {
    titulo: 'Regra de cancelamento da tarifa',
    texto: 'Tarifas promocionais podem ter regras diferentes. Leia antes de pagar.',
  },
  {
    titulo: 'O que está incluso',
    texto:
      'Refeições, bebidas, piscinas, aventura e recreação estão na diária; spa, esportes náuticos, passeios e traslado são pagos à parte.',
  },
  {
    titulo: 'Documentos dos hóspedes',
    texto:
      'Documento com foto de todos, inclusive das crianças, e autorização para menores sem os pais.',
  },
];
