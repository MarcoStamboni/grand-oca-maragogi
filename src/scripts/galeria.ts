/**
 * Galeria de fotos (src/components/ui/Galeria.astro).
 * Abre a foto ampliada num <dialog> modal: foco preso no diálogo, Esc fecha, setas do
 * teclado e botões navegam, a mudança de foto é anunciada a leitores de tela e, ao fechar,
 * o foco volta para a miniatura da última foto vista.
 * Sem JavaScript, as miniaturas continuam sendo links para as fotos ampliadas.
 */

function iniciarGaleria(raiz: HTMLElement): void {
  const links = Array.from(raiz.querySelectorAll<HTMLAnchorElement>('[data-galeria-item]'));
  const dialogo = raiz.querySelector<HTMLDialogElement>('[data-galeria-dialogo]');
  const elemento = <T extends Element>(seletor: string) =>
    dialogo?.querySelector<T>(seletor) ?? null;

  const figura = elemento<HTMLElement>('[data-galeria-figura]');
  const legenda = elemento<HTMLElement>('[data-galeria-legenda]');
  const contador = elemento<HTMLElement>('[data-galeria-contador]');
  const anuncio = elemento<HTMLElement>('[data-galeria-anuncio]');
  const navegacao = elemento<HTMLElement>('[data-galeria-navegacao]');
  const anterior = elemento<HTMLButtonElement>('[data-galeria-anterior]');
  const proxima = elemento<HTMLButtonElement>('[data-galeria-proxima]');
  const fechar = elemento<HTMLButtonElement>('[data-galeria-fechar]');
  if (
    !dialogo ||
    !figura ||
    !legenda ||
    !contador ||
    !anuncio ||
    !navegacao ||
    !anterior ||
    !proxima ||
    !fechar ||
    links.length === 0
  ) {
    return;
  }

  const imagem = document.createElement('img');
  imagem.className = 'max-h-full min-h-0 w-auto max-w-full rounded-md object-contain';
  imagem.decoding = 'async';
  imagem.alt = '';
  figura.prepend(imagem);
  // Só as fotos visíveis (o filtro de /fotos/ esconde as de outras categorias).
  const visiveis = () => links.filter((link) => !link.closest<HTMLElement>('[hidden]'));
  let lista = visiveis();

  let atual = 0;

  const mostrar = (indice: number) => {
    atual = (indice + lista.length) % lista.length;
    const link = lista[atual];
    if (!link) return;
    const descricao = link.querySelector('img')?.alt ?? '';
    const posicao = `Foto ${atual + 1} de ${lista.length}`;
    imagem.width = Number(link.dataset.largura) || 0;
    imagem.height = Number(link.dataset.altura) || 0;
    imagem.src = link.href;
    imagem.alt = descricao;
    legenda.textContent = descricao;
    contador.textContent = posicao;
    anuncio.textContent = `${posicao}: ${descricao}`;
  };

  for (const link of links) {
    link.addEventListener('click', (evento) => {
      // Ctrl/Cmd/Shift + clique continuam abrindo a foto em outra aba ou janela.
      if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
      evento.preventDefault();
      lista = visiveis();
      navegacao.hidden = lista.length < 2;
      mostrar(lista.indexOf(link));
      dialogo.showModal();
      fechar.focus();
    });
  }

  anterior.addEventListener('click', () => mostrar(atual - 1));
  proxima.addEventListener('click', () => mostrar(atual + 1));
  fechar.addEventListener('click', () => dialogo.close());

  dialogo.addEventListener('keydown', (evento) => {
    if (lista.length < 2) return;
    if (evento.key === 'ArrowLeft') mostrar(atual - 1);
    if (evento.key === 'ArrowRight') mostrar(atual + 1);
  });

  // Clique no fundo (fora da foto e dos controles) fecha.
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo || evento.target === figura) dialogo.close();
  });

  dialogo.addEventListener('close', () => {
    anuncio.textContent = '';
    lista[atual]?.focus();
  });
}

for (const raiz of document.querySelectorAll<HTMLElement>('[data-galeria]')) {
  iniciarGaleria(raiz);
}
