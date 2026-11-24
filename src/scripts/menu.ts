/**
 * Menu principal (único JavaScript do cabeçalho).
 * - Desktop: submenus abrem ao passar o mouse sobre o item e, no padrão "disclosure" (WAI-ARIA
 *   APG), pelo botão da seta (toque e teclado), com aria-expanded;
 *   fecha com Esc, clique fora ou quando o foco sai do item.
 * - Celular: <dialog> modal (foco preso, Esc fecha, fundo inerte); o tópico é link e a seta ao
 *   lado mostra as páginas internas.
 * - Cabeçalho ganha `data-rolado` (sombra) quando a página sai do topo.
 * Sem JavaScript, os links de primeiro nível continuam funcionando e o botão do
 * celular leva ao mapa do site no rodapé.
 */

function iniciarSubmenus(): void {
  const itens = Array.from(document.querySelectorAll<HTMLElement>('[data-submenu]'));
  if (itens.length === 0) return;

  const partes = (item: HTMLElement) => {
    const botao = item.querySelector<HTMLButtonElement>('[data-submenu-botao]');
    const painel = item.querySelector<HTMLElement>('[data-submenu-painel]');
    return botao && painel ? { botao, painel } : null;
  };

  const definir = (item: HTMLElement, aberto: boolean) => {
    const elementos = partes(item);
    if (!elementos) return;
    elementos.botao.setAttribute('aria-expanded', String(aberto));
    elementos.painel.hidden = !aberto;
  };

  const fecharTodos = (exceto?: HTMLElement) => {
    for (const item of itens) if (item !== exceto) definir(item, false);
  };

  for (const item of itens) {
    const elementos = partes(item);
    if (!elementos) continue;
    elementos.botao.hidden = false;

    elementos.botao.addEventListener('click', () => {
      const aberto = elementos.botao.getAttribute('aria-expanded') === 'true';
      fecharTodos(item);
      definir(item, !aberto);
    });

    // Mouse: abre ao passar sobre o item (tópico ou seta) e fecha ao sair, com uma pequena
    // espera para dar tempo de levar o cursor até o painel. Toque e teclado usam o botão.
    let espera: number | undefined;
    item.addEventListener('pointerenter', (evento) => {
      if (evento.pointerType !== 'mouse') return;
      window.clearTimeout(espera);
      fecharTodos(item);
      definir(item, true);
    });
    item.addEventListener('pointerleave', (evento) => {
      if (evento.pointerType !== 'mouse') return;
      espera = window.setTimeout(() => definir(item, false), 250);
    });

    item.addEventListener('focusout', (evento) => {
      if (!item.contains(evento.relatedTarget as Node | null)) definir(item, false);
    });
  }

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    const aberto = itens.find(
      (item) => partes(item)?.botao.getAttribute('aria-expanded') === 'true',
    );
    if (!aberto) return;
    definir(aberto, false);
    partes(aberto)?.botao.focus();
  });

  document.addEventListener('click', (evento) => {
    if (!(evento.target as Element).closest('[data-submenu]')) fecharTodos();
  });
}

/** Celular: a seta ao lado de cada tópico mostra ou esconde as páginas internas. */
function iniciarSubmenusCelular(): void {
  for (const botao of document.querySelectorAll<HTMLButtonElement>(
    '[data-submenu-celular-botao]',
  )) {
    const painel = document.getElementById(botao.getAttribute('aria-controls') ?? '');
    if (!painel) continue;
    botao.addEventListener('click', () => {
      const aberto = botao.getAttribute('aria-expanded') === 'true';
      botao.setAttribute('aria-expanded', String(!aberto));
      painel.hidden = aberto;
    });
  }
}

function iniciarMenuCelular(): void {
  const dialogo = document.querySelector<HTMLDialogElement>('[data-menu-dialogo]');
  const abrir = document.querySelector<HTMLButtonElement>('[data-menu-abrir]');
  if (!dialogo || !abrir) return;

  abrir.addEventListener('click', () => {
    dialogo.showModal();
    abrir.setAttribute('aria-expanded', 'true');
  });

  dialogo.addEventListener('close', () => {
    abrir.setAttribute('aria-expanded', 'false');
    abrir.focus();
  });

  for (const fechar of dialogo.querySelectorAll('[data-menu-fechar]')) {
    fechar.addEventListener('click', () => dialogo.close());
  }

  // Clique no fundo (fora do painel) fecha.
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });

  // Ao alargar a janela para o layout desktop, o menu do celular fecha.
  window.matchMedia('(min-width: 80rem)').addEventListener('change', (consulta) => {
    if (consulta.matches && dialogo.open) dialogo.close();
  });
}

function iniciarCabecalho(): void {
  const cabecalho = document.querySelector<HTMLElement>('[data-cabecalho]');
  if (!cabecalho) return;
  const atualizar = () => cabecalho.toggleAttribute('data-rolado', window.scrollY > 8);
  atualizar();
  window.addEventListener('scroll', atualizar, { passive: true });
}

iniciarSubmenus();
iniciarMenuCelular();
iniciarSubmenusCelular();
iniciarCabecalho();
