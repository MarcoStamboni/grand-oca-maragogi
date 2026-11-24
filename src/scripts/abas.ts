/**
 * Abas no padrão WAI-ARIA de tabs (estilos de viagem, carta de bebidas, programação):
 * clique ou setas trocam a aba (Home e End vão para a primeira e a última); só o painel ativo
 * (data-ativo) aparece, os outros ficam escondidos pelo CSS.
 */
for (const raiz of document.querySelectorAll<HTMLElement>('[data-abas]')) {
  const abas = Array.from(raiz.querySelectorAll<HTMLButtonElement>('[data-aba]'));
  const paineis = Array.from(raiz.querySelectorAll<HTMLElement>('[data-painel]'));

  const ativar = (aba: HTMLButtonElement, focar: boolean) => {
    for (const outra of abas) {
      const ativa = outra === aba;
      outra.setAttribute('aria-selected', String(ativa));
      outra.tabIndex = ativa ? 0 : -1;
    }
    for (const painel of paineis) {
      painel.toggleAttribute('data-ativo', painel.id === aba.getAttribute('aria-controls'));
    }
    if (focar) {
      aba.focus();
      aba.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  abas.forEach((aba, indice) => {
    aba.addEventListener('click', () => ativar(aba, false));
    aba.addEventListener('keydown', (evento) => {
      const destinos: Record<string, number> = {
        ArrowRight: indice + 1,
        ArrowDown: indice + 1,
        ArrowLeft: indice - 1,
        ArrowUp: indice - 1,
        Home: 0,
        End: abas.length - 1,
      };
      const destino = destinos[evento.key];
      if (destino === undefined) return;
      evento.preventDefault();
      const proxima = abas[(destino + abas.length) % abas.length];
      if (proxima) ativar(proxima, true);
    });
  });
}
