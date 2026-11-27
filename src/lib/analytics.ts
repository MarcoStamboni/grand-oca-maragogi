/**
 * Analytics e consentimento (LGPD), funções puras e testadas. Nada é carregado por padrão:
 * só com PUBLIC_ANALYTICS_ENABLED=true, um ID válido e o consentimento da pessoa.
 * Usadas no build (src/lib/ambiente.ts) e no navegador (src/scripts/analytics.ts).
 */

export type ProvedorAnalytics = 'ga4' | 'gtm';

export type ConfigAnalytics =
  { ativo: false } | { ativo: true; provedor: ProvedorAnalytics; id: string };

export interface EntradaAnalytics {
  habilitado: boolean;
  ga4?: string | undefined;
  gtm?: string | undefined;
}

/**
 * Configuração efetiva. Com os dois IDs, vale o GTM (o GA4 é configurado dentro dele).
 * Habilitado sem ID ou com ID em formato inválido derruba o build: melhor do que publicar
 * um aviso de cookies que não mede nada.
 */
export function resolverAnalytics({ habilitado, ga4, gtm }: EntradaAnalytics): ConfigAnalytics {
  if (!habilitado) return { ativo: false };
  const idGtm = gtm?.trim();
  const idGa4 = ga4?.trim();
  if (idGtm) {
    if (!/^GTM-[A-Z0-9]+$/.test(idGtm)) throw new Error(`PUBLIC_GTM_ID inválido: "${idGtm}"`);
    return { ativo: true, provedor: 'gtm', id: idGtm };
  }
  if (idGa4) {
    if (!/^G-[A-Z0-9]+$/.test(idGa4)) throw new Error(`PUBLIC_GA4_ID inválido: "${idGa4}"`);
    return { ativo: true, provedor: 'ga4', id: idGa4 };
  }
  throw new Error('PUBLIC_ANALYTICS_ENABLED=true exige PUBLIC_GA4_ID ou PUBLIC_GTM_ID.');
}

/** Código do Google gravado no site (site.config.ts → `medicao`). */
export interface MedicaoDoSite {
  ga4: string | null;
  gtm: string | null;
}

/**
 * De onde vem o código do Google. Com algum ID no .env (PUBLIC_GA4_ID / PUBLIC_GTM_ID), vale só o
 * .env, como antes (útil para testes). Sem ID no .env, vale o código de produção de site.config:
 * a medição liga sozinha em qualquer build e fica presa ao domínio do site (`travarDominio`).
 */
export function origemMedicao(
  env: EntradaAnalytics,
  doSite: MedicaoDoSite,
): EntradaAnalytics & { travarDominio: boolean } {
  if (env.ga4?.trim() || env.gtm?.trim()) return { ...env, travarDominio: false };
  const ga4 = doSite.ga4?.trim() || undefined;
  const gtm = doSite.gtm?.trim() || undefined;
  const temCodigo = Boolean(ga4 || gtm);
  return { habilitado: temCodigo, ga4, gtm, travarDominio: temCodigo };
}

/** Endereço do script do provedor (só é inserido depois do consentimento). */
export function urlScriptAnalytics(provedor: ProvedorAnalytics, id: string): string {
  const arquivo = provedor === 'gtm' ? 'gtm.js' : 'gtag/js';
  return `https://www.googletagmanager.com/${arquivo}?id=${encodeURIComponent(id)}`;
}

/** Chave no localStorage. A escolha fica no navegador da pessoa, sem cookie. */
export const CHAVE_CONSENTIMENTO = 'resort:consentimento-analytics';

/**
 * Suba a versão quando o uso de dados mudar: a escolha antiga deixa de valer e o aviso volta.
 * A escolha da versão 1 (só aceitar/recusar) continua valendo: vira Desempenho, sem Publicidade.
 */
export const VERSAO_CONSENTIMENTO = 2;

/** Categorias opcionais do aviso. Os cookies estritamente necessários não dependem de escolha. */
export interface Consentimento {
  /** Medição de audiência (Google Analytics). */
  desempenho: boolean;
  /** Mensuração de campanhas e remarketing (sinais de publicidade do Consent Mode). */
  publicidade: boolean;
}

export const ACEITAR_TODOS: Consentimento = { desempenho: true, publicidade: true };

interface RegistroConsentimento extends Consentimento {
  versao: number;
  /** Data e hora da escolha (ISO 8601), para comprovar o consentimento. */
  data: string;
}

export function registrarConsentimento(escolha: Consentimento, data: Date): string {
  const registro: RegistroConsentimento = {
    versao: VERSAO_CONSENTIMENTO,
    desempenho: escolha.desempenho,
    publicidade: escolha.publicidade,
    data: data.toISOString(),
  };
  return JSON.stringify(registro);
}

/** Escolha guardada por categoria, ou `null` sem escolha válida (mostrar o aviso). */
export function lerConsentimento(bruto: string | null): Consentimento | null {
  if (!bruto) return null;
  try {
    const registro: unknown = JSON.parse(bruto);
    if (typeof registro !== 'object' || registro === null || !('versao' in registro)) return null;
    if (registro.versao === 1 && 'aceito' in registro && typeof registro.aceito === 'boolean') {
      return { desempenho: registro.aceito, publicidade: false };
    }
    if (
      registro.versao === VERSAO_CONSENTIMENTO &&
      'desempenho' in registro &&
      'publicidade' in registro &&
      typeof registro.desempenho === 'boolean' &&
      typeof registro.publicidade === 'boolean'
    ) {
      return { desempenho: registro.desempenho, publicidade: registro.publicidade };
    }
  } catch {
    // Registro corrompido: pede a escolha de novo.
  }
  return null;
}

/**
 * A medição só roda no site publicado. Numa prévia local, num endereço de homologação ou numa
 * cópia do site, uma visita de teste iria para a propriedade do cliente e sujaria os relatórios
 * dele — por isso o script não carrega o Google nem mostra o aviso de cookies fora do domínio.
 * Sem `hostDoSite`, libera (site ainda sem domínio definido).
 */
export function medicaoPermitida(hostAtual: string, hostDoSite: string | undefined): boolean {
  if (!hostDoSite) return true;
  const atual = hostAtual.toLowerCase();
  const esperado = hostDoSite.toLowerCase();
  return atual === esperado || atual.endsWith(`.${esperado}`);
}

/** Evento interno do site (ex.: envio do formulário), repassado ao analytics se houver consentimento. */
export const EVENTO_SITE = 'resort:evento';

export interface DetalheEvento {
  nome: string;
  [parametro: string]: string;
}

/** Cookies do Google Analytics, apagados quando a pessoa retira o consentimento. */
export function ehCookieAnalytics(nome: string): boolean {
  return /^(_ga|_gid|_gat)/.test(nome.trim());
}

/** Domínios em que o cookie pode ter sido gravado ("a.b.com.br" → ".a.b.com.br", ".b.com.br"...). */
export function dominiosDoCookie(host: string): string[] {
  const partes = host.split('.');
  return partes.slice(0, -1).map((_parte, indice) => `.${partes.slice(indice).join('.')}`);
}
