/**
 * Botões de pausar as faixas em movimento contínuo ([data-faixa]): botão de alternância
 * (aria-pressed) que liga .pausada na faixa e troca o ícone. O movimento em si é CSS (global.css).
 */
for (const botao of document.querySelectorAll<HTMLButtonElement>('[data-pausar-faixa]')) {
  const faixa = botao.closest('[data-faixa]');
  const iconePausar = botao.querySelector<HTMLElement>('[data-icone-pausar]');
  const iconeTocar = botao.querySelector<HTMLElement>('[data-icone-tocar]');
  if (!faixa || !iconePausar || !iconeTocar) continue;

  botao.addEventListener('click', () => {
    const pausada = faixa.classList.toggle('pausada');
    botao.setAttribute('aria-pressed', String(pausada));
    iconePausar.hidden = pausada;
    iconeTocar.hidden = !pausada;
  });
}
