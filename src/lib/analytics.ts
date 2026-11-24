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

/** Endereço do script do provedor (só é inserido depois do consentimento). */
export function urlScriptAnalytics(provedor: ProvedorAnalytics, id: string): string {
  const arquivo = provedor === 'gtm' ? 'gtm.js' : 'gtag/js';
  return `https://www.googletagmanager.com/${arquivo}?id=${encodeURIComponent(id)}`;
}

/** Chave no localStorage. A escolha fica no navegador da pessoa, sem cookie. */
export const CHAVE_CONSENTIMENTO = 'resort:consentimento-analytics';

/** Suba a versão quando o uso de dados mudar: a escolha antiga deixa de valer e o aviso volta. */
export const VERSAO_CONSENTIMENTO = 1;

interface RegistroConsentimento {
  versao: number;
  aceito: boolean;
  /** Data e hora da escolha (ISO 8601), para comprovar o consentimento. */
  data: string;
}

export function registrarConsentimento(aceito: boolean, data: Date): string {
  const registro: RegistroConsentimento = {
    versao: VERSAO_CONSENTIMENTO,
    aceito,
    data: data.toISOString(),
  };
  return JSON.stringify(registro);
}

/** Escolha guardada: `true` aceitou, `false` recusou, `null` sem escolha válida (mostrar o aviso). */
export function lerConsentimento(bruto: string | null): boolean | null {
  if (!bruto) return null;
  try {
    const registro: unknown = JSON.parse(bruto);
    if (
      typeof registro === 'object' &&
      registro !== null &&
      'versao' in registro &&
      'aceito' in registro &&
      registro.versao === VERSAO_CONSENTIMENTO &&
      typeof registro.aceito === 'boolean'
    ) {
      return registro.aceito;
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
