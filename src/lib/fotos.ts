/**
 * Categorias da galeria /fotos/, montadas a partir do conteúdo: cada foto aparece uma vez só,
 * na primeira categoria em que entra. Assim a galeria acompanha as coleções sem lista manual
 * (só as fotos gerais do resort ficam em src/data/fotos.ts).
 */
import { getCollection } from 'astro:content';

import {
  fotosCriancas,
  fotosDoResort,
  fotosGastronomia,
  fotosPiscinas,
  fotosSpa,
} from '@/data/fotos';
import type { NomeIcone } from '@/lib/icones';

export interface CategoriaFotos {
  id: string;
  titulo: string;
  icone: NomeIcone;
  chaves: string[];
}

const porOrdem = <T extends { data: { ordem: number } }>(a: T, b: T) => a.data.ordem - b.data.ordem;

export async function categoriasDeFotos(): Promise<CategoriaFotos[]> {
  const [acomodacoes, restaurantes, bares, atividades, guia] = await Promise.all([
    getCollection('acomodacoes'),
    getCollection('restaurantes'),
    getCollection('bares'),
    getCollection('atividades', ({ data }) => data.status === 'confirmado'),
    getCollection('guia'),
  ]);
  const deAtividades = (...categorias: string[]) =>
    atividades
      .filter(({ data }) => categorias.includes(data.categoria))
      .flatMap(({ data }) => data.fotos);

  const candidatas: CategoriaFotos[] = [
    { id: 'resort', titulo: 'Resort e lago', icone: 'guarda-sol', chaves: [...fotosDoResort] },
    {
      id: 'acomodacoes',
      titulo: 'Acomodações',
      icone: 'cama',
      chaves: acomodacoes.sort(porOrdem).flatMap(({ data }) => data.fotos),
    },
    {
      id: 'gastronomia',
      titulo: 'Restaurantes e bares',
      icone: 'talheres',
      chaves: [
        ...fotosGastronomia,
        ...restaurantes.sort(porOrdem).flatMap(({ data }) => data.fotos),
        ...bares.sort(porOrdem).flatMap(({ data }) => data.fotos),
      ],
    },
    {
      id: 'piscinas',
      titulo: 'Piscinas',
      icone: 'piscina',
      chaves: [...fotosPiscinas, ...deAtividades('piscina')],
    },
    {
      id: 'criancas',
      titulo: 'Crianças',
      icone: 'bebe',
      chaves: [...fotosCriancas, ...deAtividades('criancas')],
    },
    {
      id: 'lazer',
      titulo: 'Esportes e lazer',
      icone: 'trofeu',
      chaves: deAtividades('esportes', 'entretenimento'),
    },
    {
      id: 'bem-estar',
      titulo: 'Spa e bem-estar',
      icone: 'flor',
      chaves: [...deAtividades('bem-estar'), ...fotosSpa],
    },
    {
      id: 'destino',
      titulo: 'Destino',
      icone: 'bussola',
      chaves: guia.sort(porOrdem).flatMap(({ data }) => data.fotos),
    },
  ];

  const usadas = new Set<string>();
  return candidatas
    .map((categoria) => ({
      ...categoria,
      chaves: categoria.chaves.filter((chave) => {
        if (usadas.has(chave)) return false;
        usadas.add(chave);
        return true;
      }),
    }))
    .filter(({ chaves }) => chaves.length > 0);
}
