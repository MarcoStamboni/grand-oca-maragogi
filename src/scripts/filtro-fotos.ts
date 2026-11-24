/**
 * Filtro da galeria /fotos/: uma única galeria, e cada botão (aria-pressed) mostra só as fotos da
 * categoria escolhida (`data-categoria` em cada item); "Todas" volta a mostrar tudo.
 * Sem JavaScript, os botões não aparecem e todas as fotos ficam visíveis.
 */
for (const raiz of document.querySelectorAll<HTMLElement>('[data-filtro-fotos]')) {
  const botoes = Array.from(raiz.querySelectorAll<HTMLButtonElement>('[data-filtro]'));
  const fotos = Array.from(document.querySelectorAll<HTMLElement>('li[data-categoria]'));
  const anuncio = raiz.querySelector<HTMLElement>('[data-filtro-anuncio]');

  for (const botao of botoes) {
    botao.addEventListener('click', () => {
      const escolhida = botao.dataset.filtro ?? 'todas';
      for (const outro of botoes) outro.setAttribute('aria-pressed', String(outro === botao));
      let visiveis = 0;
      for (const foto of fotos) {
        const visivel = escolhida === 'todas' || foto.dataset.categoria === escolhida;
        foto.hidden = !visivel;
        if (visivel) {
          visiveis += 1;
          // Fotos que entram depois do filtro aparecem já reveladas (sem esperar a rolagem).
          foto.classList.add('revelado');
        }
      }
      if (anuncio) anuncio.textContent = `${visiveis} fotos: ${botao.textContent?.trim() ?? ''}`;
    });
  }
}
