/**
 * Widget "Agora no destino" (HojeNoResort.astro): hora local, data, nascer e pôr do sol e o
 * sol no arco do céu. Atualiza a cada 30 segundos.
 */
import { horariosDoSol, progressoDoDia } from '@/lib/sol';

for (const widget of document.querySelectorAll<HTMLElement>('[data-hoje]')) {
  const latitude = Number(widget.dataset.latitude);
  const longitude = Number(widget.dataset.longitude);
  const timeZone = widget.dataset.fuso;
  const hora = widget.querySelector<HTMLTimeElement>('[data-hoje-hora]');
  const data = widget.querySelector('[data-hoje-data]');
  const nascer = widget.querySelector('[data-hoje-nascer]');
  const por = widget.querySelector('[data-hoje-por]');
  const sol = widget.querySelector('[data-hoje-sol]');
  const trilha = widget.querySelector('[data-hoje-trilha]');
  if (!timeZone || !hora || !data || !nascer || !por || !sol || !trilha) continue;

  const formatoHora = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  });
  const formatoData = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const atualizar = () => {
    const agora = new Date();
    const horarios = horariosDoSol(agora, latitude, longitude);
    hora.textContent = formatoHora.format(agora);
    hora.dateTime = agora.toISOString();
    data.textContent = formatoData.format(agora);
    nascer.textContent = formatoHora.format(horarios.nascer);
    por.textContent = formatoHora.format(horarios.por);

    // À noite, o sol fica escondido no horizonte e a trilha, vazia.
    const progresso = progressoDoDia(agora, horarios);
    const angulo = Math.PI * (progresso ?? 0);
    const x = 100 - 90 * Math.cos(angulo);
    const y = 94 - 90 * Math.sin(angulo);
    sol.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    sol.setAttribute('opacity', progresso === null ? '0' : '1');
    trilha.setAttribute('stroke-dashoffset', String(1 - (progresso ?? 0)));
  };

  atualizar();
  setInterval(atualizar, 30_000);
}
