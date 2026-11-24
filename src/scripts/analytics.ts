/**
 * Consentimento e analytics (componente AvisoCookies, que só existe com o analytics ativo).
 * - Sem escolha guardada: mostra o aviso, sem tirar o foco de onde a pessoa está.
 * - "Aceitar": guarda a escolha (localStorage, com data e versão) e só então carrega o GA4 ou
 *   o GTM, com Consent Mode v2 (publicidade sempre negada).
 * - "Configurar": troca o aviso pelo painel de preferências, no mesmo cartão (a chave da medição
 *   começa desligada, ou no que estiver guardado). "Salvar preferências" aplica a escolha: com a
 *   chave desligada equivale a recusar, então nega o consentimento (se já estava carregado nesta
 *   visita) e apaga os cookies do Google Analytics.
 * - "Preferências de cookies" (rodapé) abre direto o painel; Esc fecha e devolve o foco.
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
  medicaoPermitida,
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
  // As duas faces do cartão: o aviso e o painel de preferências.
  const introducao = aviso.querySelector<HTMLElement>('[data-cookies-aviso]');
  const painel = aviso.querySelector<HTMLElement>('[data-cookies-painel]');
  const medicao = aviso.querySelector<HTMLInputElement>('[data-cookies-medicao]');
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

  /** Troca o aviso pelas preferências (e vice-versa), com a chave no que estiver guardado. */
  const verPainel = (abrir: boolean) => {
    if (!introducao || !painel) return;
    introducao.hidden = abrir;
    painel.hidden = !abrir;
    aviso.setAttribute(
      'aria-labelledby',
      abrir ? 'aviso-cookies-preferencias' : 'aviso-cookies-titulo',
    );
    if (abrir && medicao) medicao.checked = lerEscolha() === true;
    medir();
  };

  const mostrar = (origem?: HTMLElement, preferencias = false) => {
    retornoFoco = origem ?? null;
    aviso.hidden = false;
    verPainel(preferencias);
    medir();
    if (!origem) return;
    const alvo = preferencias
      ? medicao
      : aviso.querySelector<HTMLButtonElement>('[data-cookies-aceitar]');
    alvo?.focus();
  };

  const esconder = () => {
    aviso.hidden = true;
    // Volta ao aviso: a próxima abertura começa do começo.
    verPainel(false);
    medir();
    retornoFoco?.focus();
    retornoFoco = null;
  };

  /** Aplica a escolha: aceita carrega o analytics; recusa nega o consentimento e limpa os cookies. */
  const aplicar = (aceito: boolean) => {
    gravarEscolha(aceito);
    if (aceito) {
      carregar();
    } else {
      if (carregado) gtag('consent', 'update', { analytics_storage: 'denied' });
      apagarCookiesAnalytics();
    }
    esconder();
  };

  aviso.querySelector('[data-cookies-aceitar]')?.addEventListener('click', () => aplicar(true));
  aviso.querySelector('[data-cookies-configurar]')?.addEventListener('click', () => {
    verPainel(true);
    medicao?.focus();
  });
  aviso
    .querySelector('[data-cookies-salvar]')
    ?.addEventListener('click', () => aplicar(medicao?.checked === true));
  aviso.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && retornoFoco) esconder();
  });
  for (const botao of document.querySelectorAll<HTMLElement>('[data-preferencias-cookies]')) {
    botao.addEventListener('click', () => mostrar(botao, true));
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

/**
 * O host esperado vem do `data-host` (AvisoCookies.astro), que lê o domínio de site.config.
 * Fora dele, nada é carregado e o aviso de cookies não aparece (ver `medicaoPermitida`).
 */
const aviso = document.querySelector<HTMLElement>('[data-aviso-cookies]');
if (aviso && medicaoPermitida(location.hostname, aviso.dataset['host'])) {
  iniciar(aviso);
} else if (aviso) {
  console.info(
    `[analytics] desligado: esta página está em "${location.hostname}", e a medição só roda em "${aviso.dataset['host']}".`,
  );
}
