/**
 * Movimento ao rolar (só com a classe .movimento no <html>, posta no <head> quando o sistema não
 * pede menos movimento e o navegador tem IntersectionObserver):
 * - [data-revelar]: ganha .revelado ao entrar na tela (as transições estão em global.css);
 * - [data-contador="204"]: conta de 0 até o valor quando aparece. O HTML já traz o valor final
 *   (sem JavaScript ou com menos movimento, nada muda) e o número animado fica escondido de
 *   leitores de tela, que leem o valor final ao lado.
 * Ao iniciar, põe .movimento-pronto no <html> (desliga a rede de segurança do CSS).
 */
const raiz = document.documentElement;

function revelar(): void {
  const observador = new IntersectionObserver(
    (entradas) => {
      // Itens que entram juntos (ex.: uma grade de cartões) aparecem em sequência.
      entradas
        .filter((entrada) => entrada.isIntersecting)
        .forEach((entrada, indice) => {
          const elemento = entrada.target as HTMLElement;
          if (!elemento.style.getPropertyValue('--atraso')) {
            elemento.style.setProperty('--atraso', `${Math.min(indice, 6) * 90}ms`);
          }
          elemento.classList.add('revelado');
          observador.unobserve(elemento);
        });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  // O que já está na primeira tela aparece na hora (sem animação de entrada): só o que está
  // abaixo dela espera a rolagem. Assim a primeira pintura não fica com blocos invisíveis.
  const alturaTela = window.innerHeight;
  for (const elemento of document.querySelectorAll('[data-revelar]')) {
    if (elemento.getBoundingClientRect().top < alturaTela) elemento.classList.add('revelado');
    else observador.observe(elemento);
  }
}

function contar(): void {
  const formato = new Intl.NumberFormat('pt-BR');
  // Números já na primeira tela ficam no valor final (sem contar), para a página não "mudar"
  // durante o carregamento; só os de baixo contam ao aparecer.
  const alturaTela = window.innerHeight;
  const contadores = Array.from(document.querySelectorAll<HTMLElement>('[data-contador]')).filter(
    (contador) => contador.getBoundingClientRect().top >= alturaTela,
  );
  for (const contador of contadores) contador.textContent = '0';

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        observador.unobserve(entrada.target);
        const elemento = entrada.target as HTMLElement;
        const alvo = Number(elemento.dataset.contador) || 0;
        const inicio = performance.now();
        const duracao = 1600;
        const passo = (agora: number) => {
          const progresso = Math.min(1, (agora - inicio) / duracao);
          const suave = 1 - (1 - progresso) ** 3;
          elemento.textContent = formato.format(Math.round(alvo * suave));
          if (progresso < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      }
    },
    { threshold: 0.6 },
  );
  for (const contador of contadores) observador.observe(contador);
}

if (raiz.classList.contains('movimento')) {
  revelar();
  contar();
  raiz.classList.add('movimento-pronto');
}
