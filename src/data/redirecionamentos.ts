/**
 * Redirecionamentos 301 das URLs do site antigo (Wix) para as novas.
 * A integração src/integrations/arquivos-servidor.ts gera, a partir desta lista,
 * o .htaccess (Apache) e o _redirects (Netlify/Cloudflare Pages).
 *
 * Origem: sitemaps do site antigo, grandocamaragogi.resortallinclusive.com.br (`pages`,
 * `blog-posts` e `blog-categories`), conferidos de novo contra o site no ar em 24/11/2026: 43 URLs,
 * nenhuma sem destino (docs/redirecionamentos-301.md). O teste redirecionamentos.test.ts confere
 * que todo destino existe.
 */
import type { OperadorId } from '../site.config.ts';
import { caminhoAcomodacao, caminhoDataEspecial } from './rotas.ts';

export interface Redirecionamento {
  /** Caminho antigo, sem barra final (como no Wix). */
  de: `/${string}`;
  /** Caminho novo, com barra final. */
  para: `/${string}/` | '/';
  /**
   * `true` = pega também tudo que vier abaixo do caminho (ex.: `/post` pega `/post/qualquer`).
   * Rede de segurança para as seções do Wix com endereços que não estão no sitemap (tags do
   * blog, posts antigos). Entram depois das regras exatas: a primeira que casar é a que vale.
   */
  prefixo?: boolean;
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
  // Página de modelo do Wix que ficou no sitemap (título "1", sem conteúdo do resort).
  { de: '/1', para: '/' },
  // Feed do blog do Wix (fora do sitemap, mas no ar e linkado em todas as páginas do blog).
  { de: '/blog-feed.xml', para: '/blog/' },
  // PDFs hospedados no Wix (fora do sitemap, linkados nas páginas de lazer e da carta de bebidas;
  // levantados em 24/11/2026 rastreando os links de todas as páginas no ar). Cada um vai para a
  // página nova que trata do mesmo assunto.
  { de: '/_files/ugd/3966a2_13794a7b7052496786ea76cefa800698.pdf', para: '/all-inclusive/' },
  { de: '/_files/ugd/3966a2_2019ab2265ce404c8995d65d93c94e84.pdf', para: '/all-inclusive/' },
  { de: '/_files/ugd/3966a2_0d8d8b719ca7419abedbbc8accf60203.pdf', para: '/lazer/criancas/' },
  { de: '/_files/ugd/3966a2_8ad3f16bb4d94547a4a32e41c72ac749.pdf', para: '/lazer/piscinas/' },
  { de: '/_files/ugd/3966a2_0b790e891c0640e8a07e4eeea1c455e4.pdf', para: '/lazer/esportes/' },
  // --- Redes de segurança (sempre por último): seções inteiras do Wix para o blog novo. ---
  // Os demais PDFs do Wix saíam todos da página "o que fazer", que agora é /lazer/.
  { de: '/_files', para: '/lazer/', prefixo: true },
  // Em 24/11/2026 o Wix do Grand Oca não tinha página de tag nem de categoria no ar, mas ele cria
  // esses endereços sozinho quando um post ganha tag: por isso a seção inteira.
  { de: '/blog/tags', para: '/blog/', prefixo: true },
  { de: '/blog/categories', para: '/blog/', prefixo: true },
  // Qualquer post antigo sem destino próprio nas regras acima.
  { de: '/post', para: '/blog/', prefixo: true },
];

/** Mapas por operador: cada operador substitui um site antigo diferente. */
export const redirecionamentosPorOperador: Readonly<
  Record<OperadorId, readonly Redirecionamento[]>
> = {
  agencia: [{ de: '/contato', para: '/fale-conosco/' }, ...doWix],
  oficial: [{ de: '/contato', para: '/fale-conosco/' }],
};
