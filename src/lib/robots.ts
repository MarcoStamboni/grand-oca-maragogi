/**
 * Conteúdo do robots.txt (função pura e testada). Regra geral liberada para todos os
 * buscadores, grupos explícitos para os robôs de IA (liberados ou bloqueados por categoria,
 * conforme src/data/robos.ts) e o endereço do sitemap.
 */
import type { CategoriaRobo, RoboIa } from '@/data/robos';

const nomesCategorias: Record<CategoriaRobo, string> = {
  busca: 'busca com IA',
  assistente: 'assistentes',
  treinamento: 'treinamento de modelos',
};

export interface DadosRobots {
  /** Origem do site, sem barra final. */
  siteUrl: string;
  robos: readonly RoboIa[];
  politica: Readonly<Record<CategoriaRobo, boolean>>;
  /** Site-modelo (demonstração): bloqueia todos os robôs, sem exceções. */
  bloquearTudo?: boolean;
}

/** Um grupo (RFC 9309): vários `User-agent` seguidos compartilham a mesma regra. */
function grupo(titulo: string, agentes: readonly string[], liberado: boolean): string[] {
  if (agentes.length === 0) return [];
  return [
    `# ${titulo}`,
    ...agentes.map((agente) => `User-agent: ${agente}`),
    liberado ? 'Allow: /' : 'Disallow: /',
    '',
  ];
}

export function gerarRobotsTxt({
  siteUrl,
  robos,
  politica,
  bloquearTudo = false,
}: DadosRobots): string {
  if (bloquearTudo) {
    return [
      '# Site fora dos buscadores (site-modelo ou endereço de teste)',
      'User-agent: *',
      'Disallow: /',
      '',
    ].join('\n');
  }
  const categorias = Object.keys(nomesCategorias) as CategoriaRobo[];
  const liberadas = categorias.filter((categoria) => politica[categoria]);
  const bloqueadas = categorias.filter((categoria) => !politica[categoria]);
  const agentes = (lista: readonly CategoriaRobo[]) =>
    robos.filter((robo) => lista.includes(robo.categoria)).map((robo) => robo.agente);
  const rotulos = (lista: readonly CategoriaRobo[]) =>
    lista.map((categoria) => nomesCategorias[categoria]).join(', ');

  return [
    '# Buscadores em geral',
    'User-agent: *',
    'Allow: /',
    '',
    ...grupo(`Robôs de IA liberados (${rotulos(liberadas)})`, agentes(liberadas), true),
    ...grupo(`Robôs de IA bloqueados (${rotulos(bloqueadas)})`, agentes(bloqueadas), false),
    `Sitemap: ${new URL('/sitemap-index.xml', siteUrl).href}`,
    '',
  ].join('\n');
}
