/**
 * Busca na FAQ central: filtra as perguntas pelo texto digitado (pergunta e resposta, sem
 * diferenciar acentos nem maiúsculas), esconde os temas sem resultado e anuncia o total.
 * Sem JavaScript, o campo não aparece e todas as perguntas ficam visíveis.
 */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

for (const raiz of document.querySelectorAll<HTMLElement>('[data-busca-faq]')) {
  const campo = raiz.querySelector<HTMLInputElement>('input[type="search"]');
  const anuncio = raiz.querySelector<HTMLElement>('[data-busca-anuncio]');
  const vazio = document.querySelector<HTMLElement>('[data-busca-vazio]');
  const temas = Array.from(document.querySelectorAll<HTMLElement>('[data-tema-faq]'));
  if (!campo) continue;

  const indice = temas.map((tema) => ({
    tema,
    itens: Array.from(tema.querySelectorAll<HTMLDetailsElement>('details')).map((item) => ({
      item,
      texto: normalizar(item.textContent ?? ''),
    })),
  }));

  let espera: number | undefined;
  campo.addEventListener('input', () => {
    window.clearTimeout(espera);
    espera = window.setTimeout(() => {
      const termo = normalizar(campo.value);
      let total = 0;
      for (const { tema, itens } of indice) {
        let doTema = 0;
        for (const { item, texto } of itens) {
          const visivel = termo === '' || texto.includes(termo);
          item.hidden = !visivel;
          if (visivel) doTema += 1;
        }
        tema.hidden = doTema === 0;
        total += doTema;
      }
      if (vazio) vazio.hidden = total > 0;
      if (anuncio) {
        anuncio.textContent =
          termo === ''
            ? ''
            : `${total} ${total === 1 ? 'pergunta encontrada' : 'perguntas encontradas'}`;
      }
    }, 150);
  });
}
