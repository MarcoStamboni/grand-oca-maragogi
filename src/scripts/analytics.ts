/**
 * Consentimento e analytics (componente AvisoCookies, que só existe com o analytics ativo).
 * - Sem escolha guardada: mostra o aviso, sem tirar o foco de onde a pessoa está.
 * - "Aceitar": guarda a escolha (localStorage, com data e versão) e só então carrega o GA4 ou
 *   o GTM, com Consent Mode v2 (publicidade sempre negada).
 * - "Recusar": guarda a escolha; se o analytics já estava carregado nesta visita, nega o
 *   consentimento e apaga os cookies do Google Analytics.
 * - "Preferências de cookies" (rodapé) reabre o aviso; Esc fecha e devolve o foco.
 * - Eventos: cliques em [data-evento] e eventos internos do site (envio do formulário), só
 *   com o analytics carregado. Os parâmetros são o nome do evento e o caminho da página:
 *   nenhum dado pessoal.
 */
import {
  CHAVE_CONSENTIMENTO,
  type DetalheEvento,
  dominiosDoCookie,
  EVENTO_SITE,
  ehCookieAnalytics,
  lerConsentimento,
  type ProvedorAnalytics,
  registrarConsentimento,
  urlScriptAnalytics,
} from '@/lib/analytics';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** O gtag.js exige que cada chamada entre na fila como o objeto `arguments`. */
function gtag(..._argumentos: unknown[]): void {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params -- formato exigido pelo gtag.js
  window.dataLayer.push(arguments);
}

function lerEscolha(): boolean | null {
  try {
    return lerConsentimento(localStorage.getItem(CHAVE_CONSENTIMENTO));
  } catch {
    return null;
  }
}

function gravarEscolha(aceito: boolean): void {
  try {
    localStorage.setItem(CHAVE_CONSENTIMENTO, registrarConsentimento(aceito, new Date()));
  } catch {
    // Armazenamento bloqueado: a escolha vale só para esta visita.
  }
}

function apagarCookiesAnalytics(): void {
  const nomes = document.cookie
    .split(';')
    .map((par) => par.split('=')[0]?.trim() ?? '')
    .filter(ehCookieAnalytics);
  for (const nome of nomes) {
    document.cookie = `${nome}=; Max-Age=0; path=/`;
    for (const dominio of dominiosDoCookie(location.hostname)) {
      document.cookie = `${nome}=; Max-Age=0; path=/; domain=${dominio}`;
    }
  }
}

function iniciar(aviso: HTMLElement): void {
  const provedor = aviso.dataset.provedor as ProvedorAnalytics;
  const id = aviso.dataset.id ?? '';
  let carregado = false;
  let retornoFoco: HTMLElement | null = null;

  const carregar = () => {
    if (carregado) return;
    carregado = true;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    if (provedor === 'ga4') {
      gtag('js', new Date());
      gtag('config', id);
    } else {
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    }
    const script = document.createElement('script');
    script.async = true;
    script.src = urlScriptAnalytics(provedor, id);
    document.head.append(script);
  };

  const enviar = (nome: string, parametros: Record<string, string>) => {
    if (!carregado) return;
    if (provedor === 'ga4') gtag('event', nome, parametros);
    else window.dataLayer?.push({ event: nome, ...parametros });
  };

  // O aviso aberto empurra o fim da página e o scroll-padding (o foco não fica escondido sob ele).
  const medir = () => {
    const altura = aviso.hidden ? 0 : aviso.offsetHeight;
    document.documentElement.style.setProperty('--altura-aviso-cookies', `${altura}px`);
  };
  new ResizeObserver(medir).observe(aviso);

  const mostrar = (origem?: HTMLElement) => {
    retornoFoco = origem ?? null;
    aviso.hidden = false;
    medir();
    if (origem) aviso.querySelector<HTMLButtonElement>('[data-cookies-aceitar]')?.focus();
  };

  const esconder = () => {
    aviso.hidden = true;
    medir();
    retornoFoco?.focus();
    retornoFoco = null;
  };

  aviso.querySelector('[data-cookies-aceitar]')?.addEventListener('click', () => {
    gravarEscolha(true);
    carregar();
    esconder();
  });
  aviso.querySelector('[data-cookies-recusar]')?.addEventListener('click', () => {
    gravarEscolha(false);
    if (carregado) gtag('consent', 'update', { analytics_storage: 'denied' });
    apagarCookiesAnalytics();
    esconder();
  });
  aviso.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && retornoFoco) esconder();
  });
  for (const botao of document.querySelectorAll<HTMLElement>('[data-preferencias-cookies]')) {
    botao.addEventListener('click', () => mostrar(botao));
  }

  document.addEventListener('click', (evento) => {
    const alvo =
      evento.target instanceof Element ? evento.target.closest<HTMLElement>('[data-evento]') : null;
    if (alvo?.dataset.evento) enviar(alvo.dataset.evento, { pagina: location.pathname });
  });
  document.addEventListener(EVENTO_SITE, (evento) => {
    const { nome, ...parametros } = (evento as CustomEvent<DetalheEvento>).detail;
    enviar(nome, { pagina: location.pathname, ...parametros });
  });

  const escolha = lerEscolha();
  if (escolha === true) carregar();
  else if (escolha === null) mostrar();
}

const aviso = document.querySelector<HTMLElement>('[data-aviso-cookies]');
if (aviso) iniciar(aviso);
