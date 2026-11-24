/**
 * Artigos do blog (coleção `blog`): ordem de exibição, rótulos das categorias e tempo de leitura.
 */
import { type CollectionEntry, getCollection } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export const rotulosCategoriaBlog: Record<Post['data']['categoria'], string> = {
  planejamento: 'Planejamento',
  familia: 'Viagem em família',
  destino: 'Destino',
  gastronomia: 'Gastronomia',
};

/** Palavras por minuto usadas na estimativa de leitura. */
const PALAVRAS_POR_MINUTO = 200;

/** Do mais recente para o mais antigo (data de publicação). */
export async function postsEmOrdem(): Promise<Post[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.publicadoEm.getTime() - a.data.publicadoEm.getTime());
}

/** Minutos de leitura do corpo em Markdown (mínimo de 1). */
export function minutosDeLeitura(markdown: string | undefined): number {
  const palavras = (markdown ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO));
}
