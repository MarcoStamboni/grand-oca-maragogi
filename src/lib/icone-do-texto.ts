/**
 * Ícone que faz referência ao texto de um item de lista (ListaCheck): a primeira regra cujo
 * padrão aparece no texto define o ícone; sem nenhuma, fica o check. Função pura e testada.
 * A ordem importa: regras mais específicas vêm antes (ex.: "piscina infantil" → bebê, antes de
 * "piscina").
 */
import type { NomeIcone } from './icones.ts';

const regras: readonly [RegExp, NomeIcone][] = [
  [/cookie|navegador/i, 'cookie'],
  [/programação/i, 'calendario'],
  [/early check-in|late check-out/i, 'relogio'],
  [/check-in|entrada/i, 'chave'],
  [/check-out|saída/i, 'mala'],
  [/^passeio|passeios,/i, 'barco'],
  [/não fumantes|fumar/i, 'sem-fumo'],
  [/lavanderia|passadoria|roupa/i, 'camisa'],
  [/enfermaria|médic|saúde/i, 'saude'],
  [/cafeteira|cápsula/i, 'cafe'],
  [/metragem/i, 'area'],
  [/ambientes|porta de correr/i, 'sofa'],
  [/salada|fruta|vegetarian|glúten|lactose/i, 'salada'],
  [/(?<![a-z])água|suco|refrigerante/i, 'copo'],
  [/caipirinha/i, 'drink'],
  [
    /(?<![a-z])massas?(?![a-z])|risoto|antepasto|pães|tiramis|panna|sanduíche|petisco|peixe|moqueca|caldeirada|prato/i,
    'talheres',
  ],
  [/ceia|natal|réveillon|arraiá|junin|carnaval|gincana|oficina/i, 'festa'],
  [/emendar|fim de semana/i, 'calendario'],
  [/clima|verão|inverno/i, 'sol'],
  [/gerações|todas as idades/i, 'pessoas'],
  [/tudo incluído|all inclusive/i, 'brilho'],
  [/menores de 18|responsável legal/i, 'documento'],
  [/dados|consentimento|portabilidade|privacidade/i, 'escudo'],
  [/fornecedor|empresas|compartilh/i, 'pessoas'],
  [/ar-condicionado|ar condicionado/i, 'ar'],
  [/wi-?fi|internet/i, 'wifi'],
  [/\btv\b|televis/i, 'tv'],
  [/frigobar|geladeira/i, 'frigobar'],
  [/cofre/i, 'cofre'],
  [/secador/i, 'secador'],
  [/hidromassagem|banheira|banho/i, 'banheira'],
  [/sofá|sala de estar/i, 'sofa'],
  [/varanda|sacada|deck|espreguiçadeira/i, 'poltrona'],
  [/baby|bebê|bebe|kids|criança|infantil|teens|adolescente|filho|recreação/i, 'bebe'],
  [/piscina/i, 'piscina'],
  [/vista para o mar|frente para o mar|\bmar\b|praia|pé na areia|beira-mar/i, 'ondas'],
  [/jardim|jardins|verde|natureza/i, 'folha'],
  [/café|café da manhã/i, 'cafe'],
  [/drink|coquetel|bar\b|bares/i, 'drink'],
  [/bebida|vinho|espumante|cerveja/i, 'taca'],
  [/refeiç|restaurante|jantar|almoço|buffet|à la carte|gastronomia|cardápio|lanche/i, 'talheres'],
  [/sorvete|sobremesa/i, 'sorvete'],
  [/academia|fitness|musculação/i, 'academia'],
  [/esporte|quadra|futebol|vôlei|beach tennis|tênis/i, 'trofeu'],
  [/bicicleta|bike|caiaque|stand up|náutic/i, 'bicicleta'],
  [/barco|passeio|catamarã|lancha/i, 'barco'],
  [/spa|massagem|bem-estar|relax|sauna/i, 'flor'],
  [/show|música|musica|entretenimento|noite|festa|animação/i, 'musica'],
  [/aniversário|comemora|lua de mel|romântic|decoração/i, 'coracao'],
  [/premium|exclusiv|vip|amenities/i, 'brilho'],
  [/cama|quarto|acomodaç|suíte|bangalô|apartamento|categoria/i, 'cama'],
  [/hóspede|pessoas|adultos|casais|famíli|grupo/i, 'pessoas'],
  [/check-in|check-out|horário|24 horas|hora/i, 'relogio'],
  [/data|datas|noites|feriado|calendário|temporada/i, 'calendario'],
  [/documento|autorização|certidão|rg\b|cpf|passaporte/i, 'documento'],
  [/cancelamento|reembolso|segur|proteç|garantia|lei\b/i, 'escudo'],
  [/estacionamento|carro|transfer|traslado/i, 'carro'],
  [/aéreo|voo|passagem|aeroporto/i, 'aviao'],
  [/whatsapp/i, 'whatsapp'],
  [/telefone|central|atendimento|equipe/i, 'telefone'],
  [/e-mail|email/i, 'email'],
  [/localiza|endereço|região|destino/i, 'local'],
  [/tarifa|preço|pagamento|oferta|confirmação/i, 'estrela'],
  [/sol\b|sombra|guarda-sol/i, 'sol'],
  [/cantina|bistrô|grill|peixe & sal/i, 'talheres'],
  [/sorveteria/i, 'sorvete'],
  [/resort|vila galé|enotel|grand oca/i, 'guarda-sol'],
];

/**
 * `padrao`: ícone quando nenhuma regra combina (check nas listas de incluídos, info nas de
 * atenção, `null` nos títulos de cartões, que ficam sem ícone).
 */
export function iconeDoTexto(texto: string): NomeIcone;
export function iconeDoTexto<P extends NomeIcone | null>(texto: string, padrao: P): NomeIcone | P;
export function iconeDoTexto(texto: string, padrao: NomeIcone | null = 'check'): NomeIcone | null {
  return regras.find(([regra]) => regra.test(texto))?.[1] ?? padrao;
}
