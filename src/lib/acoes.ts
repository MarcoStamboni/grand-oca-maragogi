/**
 * Chamadas para ação globais, derivadas do operador ativo (site.config.ts).
 * `evento` alimenta o analytics da Etapa 9 (clique em WhatsApp, telefone, reserva).
 */
import { rotas } from '@/data/rotas';
import type { NomeIcone } from '@/lib/icones';
import { rotaDisponivel } from '@/lib/navegacao';
import { linkTelefone, linkWhatsApp, operador } from '@/site.config';

export interface Acao {
  rotulo: string;
  /** Rótulo curto para espaços pequenos (barra do celular). */
  rotuloCurto: string;
  href: string;
  evento: 'clique_reservar' | 'clique_whatsapp' | 'clique_telefone';
  icone: NomeIcone;
  externo: boolean;
}

const telefonePrincipal = operador.telefones[0];

export const acoes = {
  consultarTarifas: {
    rotulo: 'Consultar tarifas',
    rotuloCurto: 'Reservar',
    // Leva direto às duas modalidades (só hospedagem ou hotel + aéreo).
    href: `${rotas.reservas.caminho}#modalidades`,
    evento: 'clique_reservar',
    icone: 'calendario',
    externo: false,
  },
  whatsapp: {
    rotulo: 'Falar no WhatsApp',
    rotuloCurto: 'WhatsApp',
    href: linkWhatsApp(),
    evento: 'clique_whatsapp',
    icone: 'whatsapp',
    externo: true,
  },
  ligar: {
    rotulo: `Ligar: ${telefonePrincipal.exibicao}`,
    rotuloCurto: 'Ligar',
    href: linkTelefone(telefonePrincipal),
    evento: 'clique_telefone',
    icone: 'telefone',
    externo: false,
  },
} as const satisfies Record<string, Acao>;

/** WhatsApp com uma mensagem específica (ex.: pedido de cotação de pacote). */
export function acaoWhatsApp(mensagem: string, rotulo: string = acoes.whatsapp.rotulo): Acao {
  return { ...acoes.whatsapp, rotulo, href: linkWhatsApp(mensagem) };
}

/**
 * Reserva de hospedagem: página própria quando o operador a tem (agência);
 * senão, o motor de reservas externo (resort oficial).
 */
export const reservarHospedagem: Acao = rotaDisponivel('reservasHospedagem')
  ? {
      rotulo: 'Reservar hospedagem',
      rotuloCurto: 'Reservar',
      href: rotas.reservasHospedagem.caminho,
      evento: 'clique_reservar',
      icone: 'calendario',
      externo: false,
    }
  : {
      rotulo: 'Reservar hospedagem',
      rotuloCurto: 'Reservar',
      href: operador.reservas.hospedagemUrl ?? rotas.contato.caminho,
      evento: 'clique_reservar',
      icone: 'calendario',
      externo: operador.reservas.hospedagemUrl !== null,
    };

/** Pacote hotel + aéreo: só existe para operadores que vendem o produto. */
export const pacoteComAereo: Acao | null = rotaDisponivel('reservasPacoteComAereo')
  ? {
      rotulo: 'Pacote com aéreo',
      rotuloCurto: 'Pacote',
      href: rotas.reservasPacoteComAereo.caminho,
      evento: 'clique_reservar',
      icone: 'aviao',
      externo: false,
    }
  : null;
