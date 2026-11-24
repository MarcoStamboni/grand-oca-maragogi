/**
 * Complexo aquático do resort. As atividades na piscina ficam na coleção `atividades`
 * (categoria `piscina`). Fonte: páginas de piscinas e de entretenimento do Grand Oca Maragogi.
 * O resort informa a extensão (quase 400 m), não a área em m², e não diz quantas piscinas são.
 */
export const piscinaPrincipal = {
  /** Extensão do conjunto de piscinas, em metros ("quase 400 m"). */
  extensaoM: 400,
  caracteristicas: [
    'Várias piscinas em frente aos bangalôs, com diferentes profundidades',
    'Nova área D’Água, com solário e borda infinita',
    'Parque aquático infantil com toboágua e áreas rasas',
    'Bar Galés, dentro da piscina principal',
    'Bar da Piscina D’Água, com snacks, gelados e chá da tarde',
    'Hidro, hidro fitness e recreação na água',
  ],
  /** Áreas do complexo, como a fonte publica. */
  zonas: ['Piscina principal', 'Área D’Água', 'Parque aquático infantil'],
  fontes: ['/lazer/piscinas/', '/entretenimento/'],
} as const;

/** Fotos das piscinas usadas na página /lazer/piscinas/ (registradas em imagens.yaml). */
export const fotosPiscina = [
  'grand-oca/piscinas/piscina-borda-infinita.jpg',
  'grand-oca/piscinas/piscina-solario.jpg',
  'grand-oca/piscinas/piscina-bangalos.jpg',
  'grand-oca/criancas/parque-aquatico-escorregadores.jpg',
] as const;
