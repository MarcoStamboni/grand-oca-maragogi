/**
 * Mosaico de fotos ([data-mosaico], ConfiancaReservar.astro): a miniatura escolhida vira a foto
 * grande, com troca suave. Só uma foto grande fica visível para leitores de tela (as outras
 * ficam com `hidden` depois da transição).
 */
for (const mosaico of document.querySelectorAll<HTMLElement>('[data-mosaico]')) {
  const miniaturas = Array.from(
    mosaico.querySelectorAll<HTMLButtonElement>('[data-mosaico-miniatura]'),
  );
  const fotos = Array.from(mosaico.querySelectorAll<HTMLElement>('[data-mosaico-foto]'));

  for (const miniatura of miniaturas) {
    miniatura.addEventListener('click', () => {
      const escolhida = miniatura.dataset.mosaicoMiniatura;
      for (const botao of miniaturas) {
        botao.setAttribute('aria-pressed', String(botao === miniatura));
      }
      for (const foto of fotos) {
        const ativa = foto.dataset.mosaicoFoto === escolhida;
        if (ativa) {
          foto.hidden = false;
          // Dois quadros depois, para a transição de opacidade acontecer.
          requestAnimationFrame(() =>
            requestAnimationFrame(() => foto.removeAttribute('data-inativa')),
          );
        } else if (!foto.hasAttribute('data-inativa')) {
          foto.setAttribute('data-inativa', '');
          setTimeout(() => {
            if (foto.hasAttribute('data-inativa')) foto.hidden = true;
          }, 700);
        }
      }
    });
  }
}
