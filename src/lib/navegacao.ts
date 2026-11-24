/**
 * Navegação derivada de src/data/rotas.ts: rodapé, breadcrumbs e filtros por operador.
 * Funções puras (o menu principal, que lê coleções, fica em menu.ts).
 * Links para rotas exclusivas de outro operador (decisão 1) são filtrados aqui.
 */
import { rotas, type RotaChave } from '@/data/rotas';
import { OPERADOR_ATIVO, type OperadorId } from '@/site.config';

export interface Link {
  rotulo: string;
  href: string;
}

export interface GrupoRodape {
  titulo: string;
  links: Link[];
}

/** A rota existe para o operador informado? */
export function rotaDisponivel(chave: RotaChave, operador: OperadorId = OPERADOR_ATIVO): boolean {
  const { somenteOperador, desligada } = rotas[chave];
  if (desligada) return false;
  return !somenteOperador || somenteOperador === operador;
}

/** Link de uma rota fixa. `rotulo` substitui o rótulo padrão. */
export function linkRota(chave: RotaChave, rotulo?: string): Link {
  return { rotulo: rotulo ?? rotas[chave].rotulo, href: rotas[chave].caminho };
}

export function linksDisponiveis(chaves: readonly RotaChave[]): Link[] {
  return chaves.filter((chave) => rotaDisponivel(chave)).map((chave) => linkRota(chave));
}

/**
 * Trilha de breadcrumbs até a rota, começando em "Início".
 * `extra` acrescenta itens de páginas de detalhe (ex.: nome de uma acomodação).
 */
export function trilha(chave: RotaChave, extra: readonly Link[] = []): Link[] {
  const itens: Link[] = [];
  let atual: RotaChave | undefined = chave;
  while (atual) {
    itens.unshift(linkRota(atual));
    atual = rotas[atual].pai;
  }
  return [...itens, ...extra];
}

/** Grupos de links do rodapé (a coluna "Atendimento" é montada no componente). */
export function gruposRodape(): GrupoRodape[] {
  return [
    {
      titulo: 'O resort',
      links: linksDisponiveis([
        'resort',
        'servicos',
        'allInclusive',
        'restaurantes',
        'bares',
        'lazer',
        'bemEstar',
        'fotos',
      ]),
    },
    {
      titulo: 'Hospedagem',
      links: linksDisponiveis([
        'acomodacoes',
        'comparativo',
        'reservasHospedagem',
        'reservasPacoteComAereo',
        'datasEspeciais',
        'politicaHospedagem',
        'outrosResorts',
      ]),
    },
    {
      titulo: 'Planeje sua viagem',
      links: linksDisponiveis([
        'comoChegar',
        'destino',
        'criancas',
        'piscinas',
        'blog',
        'perguntasFrequentes',
      ]),
    },
  ];
}

/** Grupo "Institucional" do rodapé (Preferências de cookies entra no rodapé com o analytics). */
export function linksInstitucionais(): Link[] {
  return linksDisponiveis(['quemSomos', 'contato', 'privacidade', 'cookies', 'termos']);
}
