/**
 * Conjunto fechado de ícones usados no site.
 * - Traço: Lucide (ISC), lidos de lucide-static no build.
 * - Marcas: Simple Icons (CC0), só para identificar canais (WhatsApp, redes).
 * Nada disso vai para o cliente além do SVG inline de cada ícone usado.
 */
import iconesLucide from 'lucide-static/icon-nodes.json';
import { siFacebook, siInstagram, siWhatsapp, siYoutube } from 'simple-icons';

type NoSvg = [string, Record<string, string | number>];

const tracos = {
  telefone: 'phone',
  calendario: 'calendar',
  menu: 'menu',
  fechar: 'x',
  'seta-baixo': 'chevron-down',
  'seta-direita': 'arrow-right',
  local: 'map-pin',
  email: 'mail',
  check: 'check',
  info: 'info',
  estrela: 'star',
  'link-externo': 'external-link',
  relogio: 'clock',
  pessoas: 'users',
  cama: 'bed',
  area: 'maximize',
  ondas: 'waves-horizontal',
  talheres: 'utensils',
  sol: 'sun',
  imagem: 'image',
  aviao: 'plane',
  carro: 'car',
  anterior: 'chevron-left',
  proxima: 'chevron-right',
  ampliar: 'zoom-in',
  cafe: 'coffee',
  taca: 'wine',
  lua: 'moon',
  drink: 'martini',
  bebe: 'baby',
  musica: 'music',
  academia: 'dumbbell',
  trofeu: 'trophy',
  alvo: 'target',
  lupa: 'search',
  ar: 'air-vent',
  wifi: 'wifi',
  tv: 'tv',
  frigobar: 'refrigerator',
  cofre: 'lock',
  secador: 'wind',
  'sem-fumo': 'cigarette-off',
  poltrona: 'armchair',
  banheira: 'bath',
  sofa: 'sofa',
  chave: 'key',
  bicicleta: 'bike',
  ingresso: 'ticket',
  camisa: 'shirt',
  saude: 'heart-pulse',
  copo: 'glass-water',
  salada: 'salad',
  ovo: 'egg',
  bandeira: 'flag',
  maleta: 'briefcase',
  monumento: 'landmark',
  'mao-coracao': 'hand-heart',
  mala: 'luggage',
  arvore: 'tree-pine',
  mascara: 'drama',
  doce: 'candy',
  coracao: 'heart',
  brilho: 'sparkles',
  folha: 'leaf',
  peixe: 'fish',
  coqueiro: 'tree-palm',
  barco: 'sailboat',
  presente: 'gift',
  festa: 'party-popper',
  flor: 'flower-2',
  escudo: 'shield-check',
  cookie: 'cookie',
  documento: 'file-text',
  pegadas: 'footprints',
  gotas: 'droplets',
  pausar: 'pause',
  tocar: 'play',
  'seta-cima': 'arrow-up',
  'nascer-do-sol': 'sunrise',
  'por-do-sol': 'sunset',
  concha: 'shell',
  'guarda-sol': 'umbrella',
  piscina: 'waves-ladder',
  sorvete: 'ice-cream-cone',
  ampulheta: 'hourglass',
  bussola: 'compass',
  carrinho: 'shopping-cart',
  selo: 'badge-check',
  validado: 'circle-check',
  cartao: 'credit-card',
  mamadeira: 'milk',
  casa: 'house',
  paleta: 'palette',
  sorriso: 'face-grinning',
  brinquedo: 'toy-brick',
  desconto: 'badge-percent',
  'nao-validado': 'circle-x',
} as const;

const marcas = {
  whatsapp: siWhatsapp.path,
  instagram: siInstagram.path,
  youtube: siYoutube.path,
  facebook: siFacebook.path,
} as const;

export type NomeIcone = keyof typeof tracos | keyof typeof marcas;

export const nomesIcones = [...Object.keys(tracos), ...Object.keys(marcas)] as NomeIcone[];

export interface DefinicaoIcone {
  tipo: 'traco' | 'marca';
  nos: NoSvg[];
}

const nos = iconesLucide as unknown as Record<string, NoSvg[]>;

export function obterIcone(nome: NomeIcone): DefinicaoIcone {
  if (nome in marcas) {
    return { tipo: 'marca', nos: [['path', { d: marcas[nome as keyof typeof marcas] }]] };
  }
  const chave = tracos[nome as keyof typeof tracos];
  const definicao = nos[chave];
  if (!definicao) throw new Error(`Ícone Lucide não encontrado: ${chave}`);
  return { tipo: 'traco', nos: definicao };
}
