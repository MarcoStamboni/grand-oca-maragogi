/**
 * Consentimento e analytics (componente AvisoCookies, que só existe com o analytics ativo).
 * - Sem escolha guardada: mostra o aviso, sem tirar o foco de onde a pessoa está.
 * - "Aceitar" / "Aceitar todos": permite as duas categorias opcionais.
 * - "Configurações": troca o resumo pelas categorias, no mesmo cartão, com uma chave para
 *   Desempenho e outra para Publicidade direcionada (desligadas até a pessoa escolher);
 *   "Salvar preferências" guarda o que estiver marcado.
 * - A escolha fica no localStorage, com data e versão. Com Desempenho permitido, carrega o GA4
 *   ou o GTM com Consent Mode v2; os sinais de publicidade só são liberados com Publicidade
 *   direcionada permitida. Ao desligar Desempenho, nega o consentimento (se o analytics já
 *   estava carregado nesta visita) e apaga os cookies do Google Analytics.
 * - "Preferências de cookies" (rodapé) reabre o aviso já nas configurações, com a escolha
 *   atual marcada; Esc fecha e devolve o foco.
 * - Eventos: cliques em [data-evento] e eventos internos do site (envio do formulário), só
 *   com o analytics carregado. Os parâmetros são o nome do evento e o caminho da página:
 *   nenhum dado pessoal.
 */
import {
  ACEITAR_TODOS,
  CHAVE_CONSENTIMENTO,
  type Consentimento,
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

function lerEscolha(): Consentimento | null {
  try {
    return lerConsentimento(localStorage.getItem(CHAVE_CONSENTIMENTO));
  } catch {
    return null;
  }
}

function gravarEscolha(escolha: Consentimento): void {
  try {
    localStorage.setItem(CHAVE_CONSENTIMENTO, registrarConsentimento(escolha, new Date()));
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
  // As duas telas do cartão: o resumo e as categorias.
  const resumo = aviso.querySelector<HTMLElement>('[data-cookies-resumo]');
  const painel = aviso.querySelector<HTMLElement>('[data-cookies-painel]');
  const chaves = [...aviso.querySelectorAll<HTMLInputElement>('[data-cookies-categoria]')];
  let carregado = false;
  let retornoFoco: HTMLElement | null = null;
  let escolhaAtual = lerEscolha();

  const sinais = (escolha: Consentimento) => {
    const publicidade = escolha.publicidade ? 'granted' : 'denied';
    return {
      ad_storage: publicidade,
      ad_user_data: publicidade,
      ad_personalization: publicidade,
      analytics_storage: escolha.desempenho ? 'granted' : 'denied',
    };
  };

  const carregar = (escolha: Consentimento) => {
    if (carregado) {
      gtag('consent', 'update', sinais(escolha));
      return;
    }
    carregado = true;
    gtag('consent', 'default', sinais(escolha));
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
  // Da largura `sm` em diante ele é um cartão no canto esquerdo e não cobre os botões flutuantes
  // da direita, então não empurra nada.
  const cantinho = window.matchMedia('(min-width: 40rem)');
  const medir = () => {
    const altura = aviso.hidden || cantinho.matches ? 0 : aviso.offsetHeight;
    document.documentElement.style.setProperty('--altura-aviso-cookies', `${altura}px`);
  };
  new ResizeObserver(medir).observe(aviso);
  cantinho.addEventListener('change', medir);

  /** Troca o resumo pelas categorias (e vice-versa); as chaves seguem a escolha atual. */
  const verPainel = (abrir: boolean) => {
    if (!resumo || !painel) return;
    resumo.hidden = abrir;
    painel.hidden = !abrir;
    aviso.setAttribute(
      'aria-labelledby',
      abrir ? 'aviso-cookies-preferencias' : 'aviso-cookies-titulo',
    );
    if (abrir) {
      // Sem escolha guardada, as duas chaves começam desligadas.
      for (const chave of chaves) {
        const categoria = chave.dataset.cookiesCategoria as keyof Consentimento;
        chave.checked = escolhaAtual?.[categoria] ?? false;
      }
      painel.parentElement?.scrollTo(0, 0);
    }
    medir();
  };

  const abrirConfiguracoes = () => {
    verPainel(true);
    aviso.querySelector<HTMLElement>('[data-cookies-painel-titulo]')?.focus();
  };

  const mostrar = (origem?: HTMLElement) => {
    retornoFoco = origem ?? null;
    aviso.hidden = false;
    // Pelo rodapé ("Preferências de cookies"), abre direto nas configurações.
    if (origem) {
      abrirConfiguracoes();
      return;
    }
    verPainel(false);
  };

  const esconder = () => {
    aviso.hidden = true;
    // Volta ao resumo: a próxima abertura começa do começo.
    verPainel(false);
    medir();
    retornoFoco?.focus();
    retornoFoco = null;
  };

  /** Aplica a escolha: com Desempenho, carrega o analytics; sem, nega e limpa os cookies. */
  const aplicar = (escolha: Consentimento) => {
    escolhaAtual = escolha;
    gravarEscolha(escolha);
    if (escolha.desempenho) {
      carregar(escolha);
    } else {
      if (carregado) gtag('consent', 'update', sinais(escolha));
      apagarCookiesAnalytics();
    }
    esconder();
  };

  for (const botao of aviso.querySelectorAll('[data-cookies-aceitar]')) {
    botao.addEventListener('click', () => aplicar(ACEITAR_TODOS));
  }
  aviso.querySelector('[data-cookies-configurar]')?.addEventListener('click', abrirConfiguracoes);
  aviso.querySelector('[data-cookies-salvar]')?.addEventListener('click', () => {
    const marcada = (categoria: keyof Consentimento) =>
      chaves.some((chave) => chave.dataset.cookiesCategoria === categoria && chave.checked);
    aplicar({ desempenho: marcada('desempenho'), publicidade: marcada('publicidade') });
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

  if (escolhaAtual === null) mostrar();
  else if (escolhaAtual.desempenho) carregar(escolhaAtual);
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
