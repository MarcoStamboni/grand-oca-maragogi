/**
 * Redirecionamentos 301 das URLs do site antigo (Wix) para as novas.
 * A integração src/integrations/arquivos-servidor.ts gera, a partir desta lista,
 * o .htaccess (Apache) e o _redirects (Netlify/Cloudflare Pages).
 *
 * Origem: pages-sitemap.xml do site antigo, grandocamaragogi.resortallinclusive.com.br (consultado
 * em 23/11/2026). O teste redirecionamentos.test.ts confere que todo destino existe.
 */
import type { OperadorId } from '../site.config.ts';
import { caminhoAcomodacao, caminhoDataEspecial } from './rotas.ts';

export interface Redirecionamento {
  /** Caminho antigo, sem barra final (como no Wix). */
  de: `/${string}`;
  /** Caminho novo, com barra final. */
  para: `/${string}/` | '/';
}

/** Vários caminhos antigos para o mesmo destino. */
export const variosPara = (
  origens: readonly Redirecionamento['de'][],
  para: Redirecionamento['para'],
): Redirecionamento[] => origens.map((de) => ({ de, para }));

const doWix: readonly Redirecionamento[] = [
  { de: '/acomodacoes/apartamentos', para: caminhoAcomodacao('apartamento-standard') },
  { de: '/acomodacoes/bangalo', para: caminhoAcomodacao('bangalo-vista-jardim') },
  { de: '/acomodacoes/bangalo-triplo', para: caminhoAcomodacao('bangalo-triplo') },
  { de: '/acomodacoes/standard-comunicante', para: caminhoAcomodacao('standard-comunicante') },
  { de: '/acomodacoes/suites', para: caminhoAcomodacao('suite') },
  { de: '/acomodacoes/family-suite', para: '/acomodacoes/' },
  { de: '/acomodacoes/deluxe', para: caminhoAcomodacao('deluxe-duas-camas-grandes') },
  { de: '/acomodacoes/duplo-deluxe-sofa-cama', para: caminhoAcomodacao('duplo-deluxe-sofa-cama') },
  { de: '/acomodacoes/suite-deluxe', para: caminhoAcomodacao('suite-deluxe') },
  { de: '/acomodacoes/deluxe-adaptado', para: '/acomodacoes/' },
  { de: '/gastronomia-all-inclusive', para: '/all-inclusive/' },
  { de: '/gastronomia-all-inclusive/restaurantes', para: '/all-inclusive/restaurantes/' },
  { de: '/gastronomia-all-inclusive/bares', para: '/all-inclusive/bares/' },
  { de: '/gastronomia-all-inclusive/carta-de-bebidas', para: '/all-inclusive/' },
  { de: '/o-que-fazer-grand-oca-maragogi-resort', para: '/lazer/' },
  { de: '/o-que-fazer-grand-oca-maragogi-resort/lazer', para: '/lazer/esportes/' },
  { de: '/o-que-fazer-grand-oca-maragogi-resort/criancas', para: '/lazer/criancas/' },
  {
    de: '/o-que-fazer-grand-oca-maragogi-resort/piscina-grand-oca-maragogi',
    para: '/lazer/piscinas/',
  },
  { de: '/localizacao', para: '/como-chegar/' },
  { de: '/blog', para: '/blog/' },
  { de: '/reservas-grand-oca', para: '/reservas/' },
  { de: '/reserva-online-grand-oca', para: '/reservas/' },
  { de: '/reserva-online-grand-oca/somente-hospedagem', para: '/reservas/hospedagem/' },
  { de: '/reserva-online-grand-oca/pacote-completo', para: '/reservas/pacote-com-aereo/' },
  { de: '/pacotes-grand-oca-maragogi-resort-all-inclusive', para: '/reservas/pacote-com-aereo/' },
  { de: '/post/natal-no-grand-oca-maragogi', para: caminhoDataEspecial('natal') },
  {
    de: '/post/feriado-da-proclamacao-da-republica-grand-oca-maragogi-2026',
    para: caminhoDataEspecial('proclamacao-da-republica'),
  },
  {
    de: '/post/black-friday-2026-no-grand-oca-maragogi-garanta-suas-ferias-all-inclusive-no-caribe-brasileiro',
    para: '/datas-especiais/',
  },
  { de: '/reveillon', para: caminhoDataEspecial('reveillon') },
  { de: '/carnaval', para: caminhoDataEspecial('carnaval') },
  { de: '/natal', para: caminhoDataEspecial('natal') },
  { de: '/feriado-de-pascoa', para: caminhoDataEspecial('pascoa') },
  { de: '/feriado-21-de-abril', para: caminhoDataEspecial('tiradentes') },
  { de: '/feriado-dia-do-trabalho', para: caminhoDataEspecial('dia-do-trabalho') },
  { de: '/feriado-7-de-setembro', para: caminhoDataEspecial('sete-de-setembro') },
  { de: '/feriado-dia-das-criancas', para: caminhoDataEspecial('dia-das-criancas') },
  { de: '/feriado-2-de-novembro', para: caminhoDataEspecial('finados') },
  { de: '/feriado-15-de-novembro', para: caminhoDataEspecial('proclamacao-da-republica') },
  { de: '/feriado-20-de-novembro', para: caminhoDataEspecial('consciencia-negra') },
];

/** Mapas por operador: cada operador substitui um site antigo diferente. */
export const redirecionamentosPorOperador: Readonly<
  Record<OperadorId, readonly Redirecionamento[]>
> = {
  agencia: [{ de: '/contato', para: '/fale-conosco/' }, ...doWix],
  oficial: [{ de: '/contato', para: '/fale-conosco/' }],
};
