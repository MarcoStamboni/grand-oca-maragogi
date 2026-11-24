/**
 * Busca rápida de tarifas (BuscaTarifas.astro): datas mínimas (hoje e o dia seguinte à entrada),
 * conferência da saída depois da entrada e o botão "Cotar pelo WhatsApp", que monta a mensagem
 * com as datas e os hóspedes. Nada é guardado nem enviado pelo site.
 */

const paraIso = (data: Date) => data.toISOString().slice(0, 10);
const paraBr = (iso: string) => iso.split('-').reverse().join('/');

function iniciar(formulario: HTMLFormElement): void {
  const entrada = formulario.querySelector<HTMLInputElement>('[data-busca-entrada]');
  const saida = formulario.querySelector<HTMLInputElement>('[data-busca-saida]');
  const erro = formulario.querySelector<HTMLElement>('[data-busca-erro]');
  const whatsapp = formulario.querySelector<HTMLButtonElement>('[data-busca-whatsapp]');
  if (!entrada || !saida || !erro) return;

  const hoje = new Date();
  entrada.min = paraIso(hoje);
  const atualizarSaida = () => {
    const base = entrada.value ? new Date(`${entrada.value}T12:00:00`) : hoje;
    saida.min = paraIso(new Date(base.getTime() + 86_400_000));
    if (saida.value && saida.value < saida.min) saida.value = saida.min;
  };
  entrada.addEventListener('change', atualizarSaida);
  atualizarSaida();

  const conferir = (): boolean => {
    erro.textContent = '';
    if (!formulario.reportValidity()) return false;
    if (saida.value <= entrada.value) {
      erro.textContent = 'A data de saída precisa ser depois da data de entrada.';
      saida.focus();
      return false;
    }
    return true;
  };

  formulario.addEventListener('submit', (evento) => {
    if (!conferir()) evento.preventDefault();
  });

  whatsapp?.addEventListener('click', () => {
    if (!conferir()) return;
    const dados = new FormData(formulario);
    const numero = (chave: string) => Number(dados.get(chave) ?? 0);
    const criancas = numero('criancas');
    const mensagem = [
      `Olá! Gostaria de uma cotação para o ${formulario.dataset.resort ?? 'resort'}:`,
      `entrada em ${paraBr(entrada.value)}, saída em ${paraBr(saida.value)},`,
      `${numero('quartos')} quarto(s), ${numero('adultos')} adulto(s)` +
        (criancas > 0 ? ` e ${criancas} criança(s).` : '.'),
      criancas > 0 ? 'Informo a idade das crianças na conversa.' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const url = `https://wa.me/${formulario.dataset.whatsapp ?? ''}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank', 'noopener');
  });
}

for (const formulario of document.querySelectorAll<HTMLFormElement>('[data-busca-tarifas]')) {
  iniciar(formulario);
}
