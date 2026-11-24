/** Outros resorts vendidos pelo operador, sem o resort do próprio site (mesma origem). */
import { type CollectionEntry, getCollection } from 'astro:content';

import { acaoWhatsApp } from '@/lib/acoes';
import { type ImagemResolvida, obterImagem } from '@/lib/imagens';
import { operador, resort as resortDoSite, site } from '@/site.config';

export type OutroResort = CollectionEntry<'outrosResorts'>;

export interface OutroResortExibido {
  resort: OutroResort;
  foto: ImagemResolvida | undefined;
  /** Prévia: o resumo da coleção ou, sem ele, um texto neutro com o destino (nada inventado). */
  resumo: string;
  /** Destino do "Ver detalhes": o portal do resort ou, sem portal, a cotação pelo WhatsApp. */
  link: { href: string; portal: boolean; evento?: string };
}

export async function outrosResorts(): Promise<OutroResortExibido[]> {
  const origem = new URL(site.url).origin;
  const lista = (await getCollection('outrosResorts'))
    .filter(({ data }) => !data.url || new URL(data.url).origin !== origem)
    .filter(({ data }) => data.nome !== resortDoSite.nome)
    .sort((a, b) => a.data.ordem - b.data.ordem);
  return Promise.all(
    lista.map(async (resort) => {
      const { data } = resort;
      const whatsapp = acaoWhatsApp(
        `Olá! Quero saber mais sobre o ${data.nome}, em ${data.destino} (${data.uf}).`,
      );
      return {
        resort,
        foto: data.foto ? await obterImagem(data.foto) : undefined,
        resumo:
          data.resumo ??
          `Resort all inclusive em ${data.destino} (${data.uf}). Consulte tarifas, disponibilidade e pacotes com a equipe da ${operador.nome}.`,
        link: data.url
          ? { href: data.url, portal: true }
          : { href: whatsapp.href, portal: false, evento: whatsapp.evento },
      };
    }),
  );
}
