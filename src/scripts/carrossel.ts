/**
 * Carrosséis ([data-carrossel]): as setas rolam o trilho em um cartão (com a largura do primeiro
 * cartão mais o espaçamento). Sem JavaScript, o trilho continua rolável com o dedo ou a barra.
 */
for (const raiz of document.querySelectorAll<HTMLElement>('[data-carrossel]')) {
  const trilho = raiz.querySelector<HTMLElement>('[data-carrossel-trilho]');
  if (!trilho) continue;
  const passo = () => {
    const cartao = trilho.firstElementChild as HTMLElement | null;
    const espaco = Number.parseFloat(getComputedStyle(trilho).columnGap) || 0;
    return (cartao?.getBoundingClientRect().width ?? trilho.clientWidth) + espaco;
  };
  raiz
    .querySelector('[data-carrossel-anterior]')
    ?.addEventListener('click', () => trilho.scrollBy({ left: -passo(), behavior: 'smooth' }));
  raiz
    .querySelector('[data-carrossel-proximo]')
    ?.addEventListener('click', () => trilho.scrollBy({ left: passo(), behavior: 'smooth' }));
}
