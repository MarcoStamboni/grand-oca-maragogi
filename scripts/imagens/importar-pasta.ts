/**
 * Importa as fotos da pasta local do resort (fotos/) para o cache do pipeline
 * (.cache/imagens/originais/<chave>) e grava o registro src/content/imagens/imagens.yaml.
 *
 * A lista abaixo é a curadoria feita à mão (folhas de contato): cada foto aproveitável recebe
 * uma chave organizada por assunto e um `alt` descritivo. Fotos com pessoas, repetidas ou de
 * assunto não confirmado ficam fora. As fotos da rede (rede/*) já registradas são mantidas.
 *
 * Uso: npm run imagens:importar && npm run imagens:preparar
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ORIGINAIS, RAIZ, REGISTRO } from './comum.ts';

const PASTA_FOTOS = path.join(RAIZ, 'fotos');
/**
 * Arquivo em fotos/, por origem (23/11/2026):
 * - `cliente/...`: pasta do cliente (GRAND OCA MARAGOGI ALL INCLUSIVE RESORT), sem recompressão;
 * - `oficial/...`: galerias por categoria e fotos do site oficial do Grand Oca Maragogi (Oca Hotels),
 *   em até 2100 px, usadas principalmente nas acomodações;
 * - `agencia/...`: fotos do site atual da agência (grandocamaragogi.resortallinclusive.com.br).
 */
const arquivo = (origem: string) => path.join(PASTA_FOTOS, origem);

/** [chave, arquivo em fotos/, alt] */
const FOTOS: readonly (readonly [string, string, string])[] = [
  [
    'grand-oca/acomodacoes/standard-quarto-casal-solteiro.jpg',
    'oficial/acomodacoes/standard-quarto-casal-solteiro.jpg',
    'Quarto Standard com cama de casal e cama de solteiro, toalhas dobradas em forma de cisne e cabeceira de madeira',
  ],
  [
    'grand-oca/acomodacoes/standard-quarto-camas.jpg',
    'oficial/acomodacoes/standard-quarto-camas.jpg',
    'Quarto Standard com duas camas, escrivaninha, espelho de corpo inteiro e ar-condicionado',
  ],
  [
    'grand-oca/acomodacoes/standard-varanda.jpg',
    'oficial/acomodacoes/standard-varanda.jpg',
    'Varanda do apartamento Standard com cadeiras, espreguiçadeira de madeira e portas de vidro para o quarto',
  ],
  [
    'grand-oca/acomodacoes/standard-banheiro.jpg',
    'oficial/acomodacoes/standard-banheiro.jpg',
    'Banheiro do Standard revestido de granito escuro, com box de vidro, bancada e espelho redondo',
  ],
  [
    'grand-oca/acomodacoes/standard-predio-jardim.jpg',
    'oficial/acomodacoes/standard-predio-jardim.jpg',
    'Prédio de dois andares com varandas de madeira em meio ao gramado e aos coqueiros do Grand Oca Maragogi',
  ],
  [
    'grand-oca/acomodacoes/bangalo-fachada.jpg',
    'oficial/acomodacoes/bangalo-fachada.jpg',
    'Bangalô de tijolos aparentes com varanda, cadeiras e gramado sob coqueiros, no Grand Oca Maragogi',
  ],
  [
    'grand-oca/acomodacoes/bangalo-quarto.jpg',
    'oficial/acomodacoes/bangalo-quarto.jpg',
    'Quarto do Bangalô com cama de casal, cabeceira de palha trançada, quadro azul na parede de tijolos e escrivaninha',
  ],
  [
    'grand-oca/acomodacoes/bangalo-quarto-escrivaninha.jpg',
    'oficial/acomodacoes/bangalo-quarto-escrivaninha.jpg',
    'Quarto do Bangalô com cama de casal, escrivaninha de vime, TV e janela voltada para o jardim',
  ],
  [
    'grand-oca/acomodacoes/bangalo-vista-piscina.jpg',
    'oficial/acomodacoes/bangalo-vista-piscina.jpg',
    'Bangalôs de telhado de cerâmica ao lado da piscina, cercados por coqueiros',
  ],
  [
    'grand-oca/acomodacoes/bangalo-triplo-fachada.jpg',
    'oficial/acomodacoes/bangalo-triplo-fachada.jpg',
    'Fachada de tijolos de um bangalô com portas de madeira e canteiro de flores ao longo do caminho de pedra',
  ],
  [
    'grand-oca/acomodacoes/bangalo-triplo-quarto.jpg',
    'oficial/acomodacoes/bangalo-triplo-quarto.jpg',
    'Quarto do Bangalô Triplo com cama de casal, cama extra, quadro azul e cabeceira de palha trançada',
  ],
  [
    'grand-oca/acomodacoes/bangalo-triplo-janela.jpg',
    'oficial/acomodacoes/bangalo-triplo-janela.jpg',
    'Cama e poltrona de vime ao lado da janela do Bangalô Triplo, com vista para o jardim',
  ],
  [
    'grand-oca/acomodacoes/bangalo-triplo-camas.jpg',
    'oficial/acomodacoes/bangalo-triplo-camas.jpg',
    'Duas camas do Bangalô Triplo com toalhas enroladas e cortinas claras ao fundo',
  ],
  [
    'grand-oca/acomodacoes/bangalo-triplo-tres-camas.jpg',
    'oficial/acomodacoes/bangalo-triplo-tres-camas.jpg',
    'Bangalô Triplo com cama de casal e cama extra, ar-condicionado, TV e escrivaninha',
  ],
  [
    'grand-oca/acomodacoes/comunicante-cama-casal.jpg',
    'oficial/acomodacoes/comunicante-cama-casal.jpg',
    'Cama de casal com toalhas e pétalas, cabeceira marrom e luminárias de leitura no Standard Comunicante',
  ],
  [
    'grand-oca/acomodacoes/comunicante-duas-camas.jpg',
    'oficial/acomodacoes/comunicante-duas-camas.jpg',
    'Quarto do Standard Comunicante com cama de casal e cama de solteiro e cortinas leves',
  ],
  [
    'grand-oca/acomodacoes/comunicante-escrivaninha.jpg',
    'oficial/acomodacoes/comunicante-escrivaninha.jpg',
    'Escrivaninha com cadeira laranja, TV de parede e ar-condicionado no Standard Comunicante',
  ],
  [
    'grand-oca/acomodacoes/comunicante-entrada.jpg',
    'oficial/acomodacoes/comunicante-entrada.jpg',
    'Quarto do Standard Comunicante visto da porta, com duas camas, armário e TV',
  ],
  [
    'grand-oca/acomodacoes/comunicante-varanda.jpg',
    'oficial/acomodacoes/comunicante-varanda.jpg',
    'Varanda comprida de madeira com mesa e cadeiras, de frente para o gramado do Grand Oca Maragogi',
  ],
  [
    'grand-oca/acomodacoes/suite-predio.jpg',
    'oficial/acomodacoes/suite-predio.jpg',
    'Prédio de dois andares com varandas de madeira, caminho de pedra e piscina entre coqueiros',
  ],
  [
    'grand-oca/acomodacoes/deluxe-quarto.jpg',
    'oficial/acomodacoes/deluxe-quarto.jpg',
    'Quarto Deluxe com duas camas extragrandes, TV, bancada em azul-turquesa e banquetas de palha',
  ],
  [
    'grand-oca/acomodacoes/deluxe-varanda.jpg',
    'oficial/acomodacoes/deluxe-varanda.jpg',
    'Varanda do quarto Deluxe com espreguiçadeiras azul-turquesa e vista para o parque aquático',
  ],
  [
    'grand-oca/acomodacoes/deluxe-bandeja-cafe.jpg',
    'oficial/acomodacoes/deluxe-bandeja-cafe.jpg',
    'Bandeja com chaleira elétrica, xícaras e sachês de chá e café no quarto Deluxe',
  ],
  [
    'grand-oca/acomodacoes/deluxe-banheiro.jpg',
    'oficial/acomodacoes/deluxe-banheiro.jpg',
    'Banheiro do quarto Deluxe com box de vidro, bancada de madeira, cuba sobre a bancada e espelho redondo iluminado',
  ],
  [
    'grand-oca/acomodacoes/duplo-deluxe-varanda.jpg',
    'oficial/acomodacoes/duplo-deluxe-varanda.jpg',
    'Varanda do Duplo Deluxe com espreguiçadeiras azul-turquesa de frente para a piscina e o parque aquático',
  ],
  [
    'grand-oca/acomodacoes/duplo-deluxe-quarto.jpg',
    'oficial/acomodacoes/duplo-deluxe-quarto.jpg',
    'Quarto Duplo Deluxe com cama de casal, sofá-cama, TV e bancada com banquetas azul-turquesa',
  ],
  [
    'grand-oca/acomodacoes/duplo-deluxe-camas.jpg',
    'oficial/acomodacoes/duplo-deluxe-camas.jpg',
    'Duas camas de casal do Duplo Deluxe, com cabeceira ondulada e ar-condicionado',
  ],
  [
    'grand-oca/acomodacoes/suite-deluxe-sala.jpg',
    'oficial/acomodacoes/suite-deluxe-sala.jpg',
    'Sala de estar da Suíte Deluxe com sofá-cama, mesa redonda e cadeiras azul-turquesa',
  ],
  [
    'grand-oca/acomodacoes/suite-deluxe-quarto.jpg',
    'oficial/acomodacoes/suite-deluxe-quarto.jpg',
    'Cama extragrande da Suíte Deluxe com toalhas em forma de cisne e cabeceira ondulada',
  ],
  [
    'grand-oca/acomodacoes/suite-deluxe-camas.jpg',
    'oficial/acomodacoes/suite-deluxe-camas.jpg',
    'Suíte Deluxe com duas camas extragrandes, piso de madeira clara e ar-condicionado',
  ],
  [
    'grand-oca/acomodacoes/suite-deluxe-varanda.jpg',
    'oficial/acomodacoes/suite-deluxe-varanda.jpg',
    "Varanda da Suíte Deluxe com espreguiçadeiras e vista para a piscina da área D'Água",
  ],
  [
    'grand-oca/acomodacoes/suite-deluxe-banheiro.jpg',
    'oficial/acomodacoes/suite-deluxe-banheiro.jpg',
    'Banheiro da Suíte Deluxe com bancada de madeira, cuba, espelho redondo e box de vidro',
  ],
  [
    'grand-oca/acomodacoes/suite-deluxe-closet.jpg',
    'oficial/acomodacoes/suite-deluxe-closet.jpg',
    'Armário aberto da Suíte Deluxe com cofre, frigobar e toalhas dobradas',
  ],
  [
    'grand-oca/resort/vista-aerea-resort.jpg',
    'oficial/resort/vista-aerea-resort.jpg',
    'Vista aérea do Grand Oca Maragogi, com os bangalôs, as piscinas e o mar azul-esverdeado da Costa dos Corais ao fundo',
  ],
  [
    'grand-oca/resort/vista-aerea-bangalos.jpg',
    'oficial/resort/vista-aerea-bangalos.jpg',
    'Vista aérea dos bangalôs, dos jardins e das piscinas do Grand Oca Maragogi, com o mar ao fundo',
  ],
  [
    'grand-oca/resort/vista-aerea-praia-piscina.jpg',
    'cliente/resort/vista-aerea-praia-piscina.jpg',
    'Vista aérea do resort entre coqueiros, com a piscina de contorno orgânico, o pavilhão do bar e a faixa de areia',
  ],
  [
    'grand-oca/resort/vista-aerea-edificios-novos.jpg',
    'cliente/resort/vista-aerea-edificios-novos.jpg',
    'Vista aérea dos edifícios novos e dos bangalôs do Grand Oca Maragogi entre os coqueirais, com o mar ao fundo',
  ],
  [
    'grand-oca/resort/praia-espreguicadeiras-aerea.jpg',
    'cliente/resort/praia-espreguicadeiras-aerea.jpg',
    'Espreguiçadeiras e guarda-sóis sobre a areia da Praia de Ponta de Mangue, vistos do alto, entre coqueiros',
  ],
  [
    'grand-oca/resort/cabana-gramado.jpg',
    'cliente/resort/cabana-gramado.jpg',
    'Cabana de cortinas brancas com espreguiçadeiras azuis sobre o gramado, em frente a um bangalô',
  ],
  [
    'grand-oca/resort/jardim-cabanas-piscina.jpg',
    'cliente/resort/jardim-cabanas-piscina.jpg',
    'Jardim com cabanas de cortinas brancas, espreguiçadeiras e piscina ao fundo, entre coqueiros',
  ],
  [
    'grand-oca/resort/jardim-cabanas-coqueiral.jpg',
    'agencia/resort/jardim-cabanas-coqueiral.jpg',
    'Cabanas com espreguiçadeiras sobre o gramado, canteiros floridos, piscina e bangalôs entre os coqueiros',
  ],
  [
    'grand-oca/resort/praia-coqueiral.jpg',
    'oficial/resort/praia-coqueiral.jpg',
    'Praia de águas turquesa com coqueiros inclinados sobre a areia, na região de Maragogi',
  ],
  [
    'grand-oca/resort/praia-areia-ampla.jpg',
    'agencia/resort/praia-areia-ampla.jpg',
    'Faixa de areia ampla e mar tranquilo sob céu azul com nuvens, com coqueiral ao fundo',
  ],
  [
    'grand-oca/resort/nascer-do-sol-mar.jpg',
    'agencia/resort/nascer-do-sol-mar.jpg',
    'Nascer do sol sobre o mar calmo, com nuvens coloridas refletidas na água',
  ],
  [
    'grand-oca/piscinas/piscina-borda-infinita.jpg',
    'oficial/piscinas/piscina-borda-infinita.jpg',
    "Piscina de borda infinita com jacuzzi circular de pedra escura e edifícios de apartamentos ao fundo, na área D'Água",
  ],
  [
    'grand-oca/piscinas/piscina-solario.jpg',
    'oficial/piscinas/piscina-solario.jpg',
    'Deck de solário com espreguiçadeiras à beira da piscina, em frente aos apartamentos de varandas de vidro',
  ],
  [
    'grand-oca/piscinas/piscina-bangalos.jpg',
    'cliente/piscinas/piscina-bangalos.jpg',
    'Piscina de águas claras cercada por coqueiros e bangalôs de telhado de cerâmica',
  ],
  [
    'grand-oca/piscinas/piscina-lagoa-coqueiros.jpg',
    'cliente/piscinas/piscina-lagoa-coqueiros.jpg',
    'Piscina em formato de lagoa, com ilhas de grama e coqueiros altos ao redor',
  ],
  [
    'grand-oca/piscinas/piscina-ponte-madeira.jpg',
    'cliente/piscinas/piscina-ponte-madeira.jpg',
    'Ponte de madeira sobre a piscina, com bangalôs e coqueiros ao fundo',
  ],
  [
    'grand-oca/piscinas/piscina-aerea-curvas.jpg',
    'cliente/piscinas/piscina-aerea-curvas.jpg',
    'Piscina de formato sinuoso vista do alto, entre bangalôs de telhado alaranjado e coqueiros',
  ],
  [
    'grand-oca/piscinas/piscina-caminho-pedra.jpg',
    'agencia/piscinas/piscina-caminho-pedra.jpg',
    'Piscina sinuosa com caminho de pedra, ilhas de grama e bangalôs ao fundo',
  ],
  [
    'grand-oca/criancas/parque-aquatico-escorregadores.jpg',
    'agencia/criancas/parque-aquatico-escorregadores.jpg',
    'Escorregadores amarelo e roxo do parque aquático infantil, com coqueiros e bangalôs ao fundo',
  ],
  [
    'grand-oca/criancas/parque-aquatico-torre.jpg',
    'agencia/criancas/parque-aquatico-torre.jpg',
    'Torre de brinquedos aquáticos com escorregadores vermelho e amarelo, em área rasa da piscina infantil',
  ],
  [
    'grand-oca/criancas/piscina-infantil-escorregador.jpg',
    'cliente/criancas/piscina-infantil-escorregador.jpg',
    'Piscina infantil rasa com brinquedo de escorregador laranja e coqueiros ao fundo',
  ],
  [
    'grand-oca/criancas/play-zone.jpg',
    'cliente/criancas/play-zone.jpg',
    'Tenda colorida do Play Zone, espaço de brinquedos infantis, com caminho de piso intertravado e coqueiros',
  ],
  [
    'grand-oca/criancas/varanda-parque-aquatico.jpg',
    'cliente/criancas/varanda-parque-aquatico.jpg',
    'Varanda com espreguiçadeiras de frente para o parque aquático e os escorregadores da piscina',
  ],
  [
    'grand-oca/gastronomia/restaurante-corais-fachada.jpg',
    'oficial/gastronomia/restaurante-corais-fachada.jpg',
    'Fachada do Restaurante dos Corais, com o letreiro de coral laranja e a rua de pedras do resort',
  ],
  [
    'grand-oca/gastronomia/restaurante-corais-buffet.jpg',
    'agencia/gastronomia/restaurante-corais-buffet.jpg',
    'Salão do Restaurante dos Corais com mesas de toalha branca e balcões de buffet sob teto de madeira',
  ],
  [
    'grand-oca/gastronomia/restaurante-corais-noite.jpg',
    'agencia/gastronomia/restaurante-corais-noite.jpg',
    'Restaurante dos Corais iluminado à noite, com a ilha de buffet em primeiro plano',
  ],
  [
    'grand-oca/gastronomia/restaurante-salao-mesas.jpg',
    'oficial/gastronomia/restaurante-salao-mesas.jpg',
    'Salão de restaurante com mesas de toalha branca, cadeiras de madeira e plantas penduradas no teto',
  ],
  [
    'grand-oca/gastronomia/il-giardino-salao.jpg',
    'agencia/gastronomia/il-giardino-salao.jpg',
    'Salão do restaurante italiano Il Giardino, com mesa posta, cadeiras de madeira e painel de tijolos',
  ],
  [
    'grand-oca/gastronomia/il-giardino-mesa.jpg',
    'cliente/gastronomia/il-giardino-mesa.jpg',
    'Mesa de toalha branca com taças e prato de massa, sob o letreiro iluminado do restaurante Il Giardino',
  ],
  [
    'grand-oca/gastronomia/la-brasa-mesa.jpg',
    'agencia/gastronomia/la-brasa-mesa.jpg',
    'Mesa do restaurante La Brasa com petiscos, cervejas e taça, diante da cozinha com lenha aparente',
  ],
  [
    'grand-oca/gastronomia/bar-piscina-noite.jpg',
    'agencia/gastronomia/bar-piscina-noite.jpg',
    'Bar com cobertura de palha à beira da piscina, iluminado à noite',
  ],
  [
    'grand-oca/lazer/academia.jpg',
    'agencia/lazer/academia.jpg',
    'Academia ampla do resort, com esteiras e aparelhos de musculação diante de parede vermelha',
  ],
  [
    'grand-oca/regiao/piscinas-naturais-aereo.jpg',
    'oficial/regiao/piscinas-naturais-aereo.jpg',
    'Vista aérea dos recifes e das piscinas naturais de águas turquesa de Maragogi, na Costa dos Corais',
  ],
];

const chaves = new Set<string>();
for (const [chave, origem] of FOTOS) {
  if (chaves.has(chave)) throw new Error(`Chave repetida: ${chave}`);
  chaves.add(chave);
  const destino = path.join(ORIGINAIS, chave);
  await mkdir(path.dirname(destino), { recursive: true });
  await copyFile(arquivo(origem), destino);
}

const aspas = (texto: string) => `'${texto.replaceAll("'", "''")}'`;
/** Entradas mantidas do registro atual (fotos dos outros resorts da rede). */
const PRESERVADAS = /^rede\//;
const mantidas = (await readFile(REGISTRO, 'utf8'))
  .split(/\n(?=\S)/)
  .filter((bloco) => PRESERVADAS.test(bloco) && !chaves.has(bloco.split(':')[0] ?? ''))
  .map((bloco) => bloco.trimEnd());
const yaml = [
  '# Registro das imagens usadas no site: chave (caminho relativo, com pastas) → texto alternativo.',
  '# Gerado por `npm run imagens:importar` a partir de scripts/imagens/importar-pasta.ts (curadoria',
  '# das fotos da pasta fotos/). Só as imagens registradas aqui existem para o site.',
  '',
  ...FOTOS.flatMap(([chave, , alt]) => [`${chave}:`, `  alt: ${aspas(alt)}`]),
  ...mantidas,
  '',
].join('\n');
await writeFile(REGISTRO, yaml);
console.log(`Importadas: ${FOTOS.length} fotos`);
