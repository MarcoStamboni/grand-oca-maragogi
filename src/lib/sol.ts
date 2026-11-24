/**
 * Nascer e pôr do sol aproximados para uma data e um ponto (algoritmo da NOAA, precisão de
 * cerca de 1 minuto perto do equador). Módulo puro: roda no navegador (widget "Hoje em Muro
 * Alto") e nos testes. Não é dado do resort, é cálculo astronômico.
 */

const RAD = Math.PI / 180;

export interface HorariosSol {
  nascer: Date;
  por: Date;
}

/** Dia do ano em UTC (1 a 366). */
function diaDoAno(data: Date): number {
  const inicio = Date.UTC(data.getUTCFullYear(), 0, 0);
  const dia = Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
  return (dia - inicio) / 86_400_000;
}

/**
 * Horários do nascer e do pôr do sol no dia UTC de `data`, em `latitude`/`longitude` (graus,
 * sul e oeste negativos). Para o Nordeste do Brasil (UTC−3), o dia UTC e o local coincidem
 * entre 3h e meia-noite, o que basta para o widget.
 */
export function horariosDoSol(data: Date, latitude: number, longitude: number): HorariosSol {
  const gama = ((2 * Math.PI) / 365) * (diaDoAno(data) - 1);
  const equacaoTempo =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gama) -
      0.032077 * Math.sin(gama) -
      0.014615 * Math.cos(2 * gama) -
      0.040849 * Math.sin(2 * gama));
  const declinacao =
    0.006918 -
    0.399912 * Math.cos(gama) +
    0.070257 * Math.sin(gama) -
    0.006758 * Math.cos(2 * gama) +
    0.000907 * Math.sin(2 * gama) -
    0.002697 * Math.cos(3 * gama) +
    0.00148 * Math.sin(3 * gama);
  // 90,833°: refração atmosférica e raio do disco solar.
  const anguloHorario = Math.acos(
    Math.cos(90.833 * RAD) / (Math.cos(latitude * RAD) * Math.cos(declinacao)) -
      Math.tan(latitude * RAD) * Math.tan(declinacao),
  );
  const meioDia = 720 - 4 * longitude - equacaoTempo;
  const meiaDuracao = (4 * anguloHorario) / RAD;
  const base = Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
  return {
    nascer: new Date(base + (meioDia - meiaDuracao) * 60_000),
    por: new Date(base + (meioDia + meiaDuracao) * 60_000),
  };
}

/** Posição do sol no arco do dia: 0 no nascer, 1 no pôr; fora do dia, `null`. */
export function progressoDoDia(agora: Date, { nascer, por }: HorariosSol): number | null {
  const total = por.getTime() - nascer.getTime();
  const decorrido = agora.getTime() - nascer.getTime();
  if (decorrido < 0 || decorrido > total) return null;
  return decorrido / total;
}
