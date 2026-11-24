/**
 * Ícone de cada feriado ou temporada (ao lado do nome nos cartões), pela chave do arquivo em
 * src/content/datas-especiais/. Data sem ícone aqui usa o calendário.
 */
import type { NomeIcone } from '../lib/icones.ts';

export const iconesDatas: Readonly<Record<string, NomeIcone>> = {
  reveillon: 'festa',
  carnaval: 'mascara',
  pascoa: 'ovo',
  tiradentes: 'bandeira',
  'dia-do-trabalho': 'maleta',
  independencia: 'bandeira',
  'dia-das-criancas': 'doce',
  finados: 'flor',
  'proclamacao-da-republica': 'monumento',
  'consciencia-negra': 'mao-coracao',
  natal: 'presente',
  'ferias-de-julho': 'mala',
  'ferias-de-verao': 'sol',
};

export function iconeDaData(id: string): NomeIcone {
  return iconesDatas[id] ?? 'calendario';
}
