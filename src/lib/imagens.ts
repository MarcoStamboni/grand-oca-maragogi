/**
 * Resolve uma chave de imagem (ex.: "2018/12/bangalo.jpg") para o arquivo otimizado em
 * src/assets/imagens/ e o texto alternativo registrado em src/content/imagens/imagens.yaml.
 * Chave sem registro ou sem arquivo derruba o build com uma mensagem clara.
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getEntry } from 'astro:content';

import { arquivoDaChave } from '@/lib/imagens-chave';
import type { ImagemSchema } from '@/lib/schema';
import { modelo, resort, site } from '@/site.config';

// Carregamento sob demanda: só as imagens realmente usadas entram no build.
const arquivos = import.meta.glob<ImageMetadata>('/src/assets/imagens/**/*.jpg', {
  import: 'default',
});

export interface ImagemResolvida {
  chave: string;
  src: ImageMetadata;
  alt: string;
}

export async function obterImagem(chave: string): Promise<ImagemResolvida> {
  const registro = await getEntry('imagens', chave);
  if (!registro) {
    throw new Error(`Imagem sem texto alternativo em src/content/imagens/imagens.yaml: ${chave}`);
  }
  if (registro.data.rosto) {
    throw new Error(`Foto com rosto de pessoas não é usada no site (rosto: true): ${chave}`);
  }
  if (registro.data.modelo && !modelo.ativo) {
    throw new Error(
      `Ilustração do site-modelo com o modo modelo desligado (troque pela foto real): ${chave}`,
    );
  }
  const carregar = arquivos[`/src/assets/imagens/${arquivoDaChave(chave)}`];
  if (!carregar) {
    throw new Error(`Imagem não otimizada (rode npm run imagens:preparar): ${chave}`);
  }
  return { chave, src: await carregar(), alt: registro.data.alt };
}

export function obterImagens(chaves: readonly string[]): Promise<ImagemResolvida[]> {
  return Promise.all(chaves.map(obterImagem));
}

/** Imagem padrão de compartilhamento (Open Graph) e de fallback. */
export const CHAVE_IMAGEM_PADRAO = resort.imagemPadrao;

/** Largura máxima da foto ampliada. */
const LARGURA_AMPLIADA = 1600;

export interface FotoAmpliada {
  /** Caminho do arquivo WebP gerado no build. */
  src: string;
  largura: number;
  altura: number;
}

/**
 * Foto ampliada (WebP até 1600 px), mantendo a proporção. A galeria e os dados estruturados
 * usam as mesmas opções, então o build gera um único arquivo por foto.
 */
export async function fotoAmpliada({ src }: ImagemResolvida): Promise<FotoAmpliada> {
  const largura = Math.min(LARGURA_AMPLIADA, src.width);
  const imagem = await getImage({ src, width: largura, format: 'webp' });
  return { src: imagem.src, largura, altura: Math.round((src.height * largura) / src.width) };
}

/**
 * Larguras da capa em tela cheia. Precisa ser igual à lista do componente Imagem
 * (src/components/ui/Imagem.astro), senão o preload baixaria um arquivo que a página não usa.
 */
export const LARGURAS_CAPA = [640, 750, 828, 1080, 1280, 1668, 1920] as const;

export interface PreloadImagem {
  href: string;
  srcset: string;
  sizes: string;
}

/**
 * Dados do `<link rel="preload" as="image">` da foto de capa (a candidata a LCP). Sem ele, o
 * navegador só descobre a foto depois de ler o CSS embutido e o começo do corpo da página.
 * As opções são as mesmas do componente Imagem com `prioridade`, para o arquivo baixado no
 * preload ser exatamente o que o `<img>` vai usar.
 */
export async function preloadDaCapa(
  imagem: ImagemResolvida | undefined,
): Promise<PreloadImagem | undefined> {
  if (!imagem) return undefined;
  const gerada = await getImage({
    src: imagem.src,
    format: 'webp',
    layout: 'full-width',
    widths: LARGURAS_CAPA.filter((largura) => largura <= imagem.src.width),
    sizes: '100vw',
    quality: 70,
    fit: 'cover',
    position: 'center',
  });
  const srcset = gerada.srcSet?.attribute;
  if (!srcset) return undefined;
  return { href: gerada.src, srcset, sizes: '100vw' };
}

/** Imagem para o JSON-LD: URL absoluta da foto ampliada, dimensões e `alt` como legenda. */
export async function imagemSchema(imagem: ImagemResolvida): Promise<ImagemSchema> {
  const { src, largura, altura } = await fotoAmpliada(imagem);
  return { url: new URL(src, site.url).href, largura, altura, legenda: imagem.alt };
}

/** Várias imagens para o JSON-LD, sem repetir a mesma foto (ex.: capa que também está na galeria). */
export function imagensSchema(
  imagens: readonly (ImagemResolvida | undefined)[],
): Promise<ImagemSchema[]> {
  const unicas = new Map<string, ImagemResolvida>();
  for (const imagem of imagens) if (imagem) unicas.set(imagem.chave, imagem);
  return Promise.all([...unicas.values()].map(imagemSchema));
}
