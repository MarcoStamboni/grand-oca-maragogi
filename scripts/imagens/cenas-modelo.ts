/**
 * Cenas das ilustrações de demonstração do site-modelo, desenhadas em SVG (sem texto).
 * A cor e a posição dos elementos saem da chave da imagem: a mesma chave gera sempre a mesma
 * ilustração, e duas chaves do mesmo tema nunca saem iguais. Usado por scripts/imagens/modelo.ts.
 */
import iconesLucide from 'lucide-static/icon-nodes.json' with { type: 'json' };

export const TEMAS_MODELO = [
  'praia',
  'piscina',
  'quarto',
  'restaurante',
  'bar',
  'criancas',
  'spa',
  'esporte',
  'noite',
  'destino',
  'festa',
] as const;
export type TemaModelo = (typeof TEMAS_MODELO)[number];

const L = 1600;
const A = 1067;

// ---------------------------------------------------------------------------
// Aleatório determinístico (a mesma chave gera sempre a mesma imagem)
// ---------------------------------------------------------------------------

function semente(texto: string): number {
  let hash = 0x811c9dc5;
  for (const caractere of texto) {
    hash ^= caractere.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

function gerador(chave: string) {
  let estado = semente(chave) || 1;
  const proximo = () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    entre: (min: number, max: number) => min + (max - min) * proximo(),
    inteiro: (min: number, max: number) => Math.floor(min + (max - min + 1) * proximo()),
    um: <T>(lista: readonly T[]): T => lista[Math.floor(proximo() * lista.length)] as T,
    chance: (p: number) => proximo() < p,
  };
}
type Aleatorio = ReturnType<typeof gerador>;

// ---------------------------------------------------------------------------
// Peças de desenho
// ---------------------------------------------------------------------------

type NoSvg = [string, Record<string, string | number>];
const nosLucide = iconesLucide as unknown as Record<string, NoSvg[]>;

/** Ícone Lucide (traço) posicionado pelo centro. */
function icone(nome: string, cx: number, cy: number, tamanho: number, cor: string, traco = 1.6) {
  const nos = nosLucide[nome];
  if (!nos) throw new Error(`Ícone Lucide não encontrado: ${nome}`);
  const escala = tamanho / 24;
  const filhos = nos
    .map(([tag, attrs]) => {
      const atributos = Object.entries(attrs)
        .filter(([nomeAttr]) => nomeAttr !== 'key')
        .map(([nomeAttr, valor]) => `${nomeAttr}="${valor}"`)
        .join(' ');
      return `<${tag} ${atributos}/>`;
    })
    .join('');
  return `<g transform="translate(${cx - tamanho / 2} ${cy - tamanho / 2}) scale(${escala})" fill="none" stroke="${cor}" stroke-width="${traco}" stroke-linecap="round" stroke-linejoin="round">${filhos}</g>`;
}

function degrade(id: string, cores: readonly string[], vertical = true) {
  const passos = cores
    .map(
      (cor, i) =>
        `<stop offset="${(i / Math.max(1, cores.length - 1)) * 100}%" stop-color="${cor}"/>`,
    )
    .join('');
  const direcao = vertical ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="1"';
  return `<linearGradient id="${id}" ${direcao}>${passos}</linearGradient>`;
}

/** Faixa de onda de `y` até o fim da imagem. */
function onda(
  y: number,
  amplitude: number,
  periodo: number,
  fase: number,
  cor: string,
  opacidade = 1,
) {
  let d = `M0 ${y}`;
  for (let x = 0; x <= L; x += 40) {
    d += ` L${x} ${(y + Math.sin((x + fase) / periodo) * amplitude).toFixed(1)}`;
  }
  d += ` L${L} ${A} L0 ${A} Z`;
  return `<path d="${d}" fill="${cor}" opacity="${opacidade}"/>`;
}

/** Linha de espuma/reflexo ondulada (só traço). */
function linhaOndulada(
  y: number,
  amplitude: number,
  periodo: number,
  fase: number,
  cor: string,
  largura: number,
  opacidade: number,
) {
  let d = `M0 ${y}`;
  for (let x = 0; x <= L; x += 30) {
    d += ` L${x} ${(y + Math.sin((x + fase) / periodo) * amplitude).toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round" opacity="${opacidade}"/>`;
}

function sol(cx: number, cy: number, r: number, cor = '#ffc93d') {
  return `<circle cx="${cx}" cy="${cy}" r="${r * 2.4}" fill="${cor}" opacity="0.18"/><circle cx="${cx}" cy="${cy}" r="${r * 1.5}" fill="${cor}" opacity="0.28"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${cor}"/>`;
}

function nuvem(cx: number, cy: number, escala: number, opacidade = 0.9) {
  return `<g transform="translate(${cx} ${cy}) scale(${escala})" fill="#ffffff" opacity="${opacidade}"><ellipse cx="0" cy="0" rx="90" ry="34"/><ellipse cx="-50" cy="6" rx="55" ry="26"/><ellipse cx="55" cy="8" rx="60" ry="24"/><ellipse cx="10" cy="-22" rx="50" ry="32"/></g>`;
}

/** Coqueiro desenhado (tronco curvo e folhas). `inclinacao` em pixels no topo. */
function coqueiro(
  x: number,
  chao: number,
  altura: number,
  inclinacao: number,
  corFolha: string,
  corTronco = '#8a5a34',
) {
  const topoX = x + inclinacao;
  const topoY = chao - altura;
  const tronco = `<path d="M${x} ${chao} Q${x + inclinacao * 0.2} ${chao - altura * 0.55} ${topoX} ${topoY}" fill="none" stroke="${corTronco}" stroke-width="${altura * 0.06}" stroke-linecap="round"/>`;
  const folhas = [-160, -125, -90, -55, -20, 15, 200]
    .map((angulo) => {
      const comprimento = altura * 0.48;
      const rad = (angulo * Math.PI) / 180;
      const fimX = topoX + Math.cos(rad) * comprimento;
      const fimY = topoY + Math.sin(rad) * comprimento * 0.75 + comprimento * 0.25;
      const ctrlX = topoX + Math.cos(rad) * comprimento * 0.5;
      const ctrlY = topoY + Math.sin(rad) * comprimento * 0.5 - comprimento * 0.28;
      return `<path d="M${topoX} ${topoY} Q${ctrlX} ${ctrlY} ${fimX} ${fimY} Q${ctrlX + 18} ${ctrlY + 30} ${topoX} ${topoY}" fill="${corFolha}"/>`;
    })
    .join('');
  const cocos = `<circle cx="${topoX - 8}" cy="${topoY + 10}" r="${altura * 0.025}" fill="#6b3f1f"/><circle cx="${topoX + 10}" cy="${topoY + 12}" r="${altura * 0.025}" fill="#6b3f1f"/>`;
  return tronco + folhas + cocos;
}

function guardaSol(x: number, chao: number, tamanho: number, cor: string) {
  const topo = chao - tamanho * 1.5;
  return `<line x1="${x}" y1="${chao}" x2="${x}" y2="${topo}" stroke="#7a5233" stroke-width="${tamanho * 0.06}" stroke-linecap="round"/><path d="M${x - tamanho} ${topo + tamanho * 0.25} Q${x} ${topo - tamanho * 0.75} ${x + tamanho} ${topo + tamanho * 0.25} Z" fill="${cor}"/><path d="M${x - tamanho * 0.33} ${topo + tamanho * 0.25} Q${x} ${topo - tamanho * 0.75} ${x + tamanho * 0.33} ${topo + tamanho * 0.25} Z" fill="#ffffff" opacity="0.85"/>`;
}

function espreguicadeira(x: number, y: number, escala: number, cor: string) {
  return `<g transform="translate(${x} ${y}) scale(${escala})"><rect x="0" y="0" width="150" height="26" rx="10" fill="#ffffff"/><rect x="0" y="0" width="150" height="10" rx="5" fill="${cor}"/><rect x="118" y="-34" width="34" height="56" rx="10" fill="#ffffff" transform="rotate(-22 135 -6)"/><line x1="18" y1="26" x2="10" y2="46" stroke="#b08a63" stroke-width="5"/><line x1="132" y1="26" x2="140" y2="46" stroke="#b08a63" stroke-width="5"/></g>`;
}

// ---------------------------------------------------------------------------
// Cenas
// ---------------------------------------------------------------------------

const VERDES = ['#0f7a4a', '#13915a', '#1aa36b', '#2a8f4f'];
const DESTAQUES = ['#f3811d', '#ff6a4d', '#ffb21f', '#04b474', '#0076c1'];

function cenaPraia(r: Aleatorio): string {
  const horizonte = A * r.entre(0.36, 0.46);
  const costa = A * r.entre(0.66, 0.74);
  const solX = r.entre(L * 0.15, L * 0.85);
  const defs =
    degrade('ceu', ['#8fcdf4', '#cfeafb', '#fff1d6']) +
    degrade('mar', ['#0f6fb0', '#1aa0d6', '#5fd0e6']);
  let corpo = `<rect width="${L}" height="${A}" fill="url(#ceu)"/>`;
  corpo += sol(solX, horizonte * r.entre(0.35, 0.6), 60);
  for (let i = 0; i < 3; i++)
    corpo += nuvem(r.entre(100, L - 100), r.entre(60, horizonte - 80), r.entre(0.6, 1.2), 0.85);
  corpo += `<rect y="${horizonte}" width="${L}" height="${A - horizonte}" fill="url(#mar)"/>`;
  for (let i = 0; i < 5; i++) {
    corpo += linhaOndulada(
      horizonte + 30 + i * ((costa - horizonte) / 5),
      4,
      r.entre(50, 90),
      r.entre(0, 400),
      '#ffffff',
      3,
      0.35,
    );
  }
  corpo += onda(costa - 18, 10, 120, r.entre(0, 600), '#e8fbff', 0.9);
  corpo += onda(costa, 12, 140, r.entre(0, 600), '#f4d9a6');
  corpo += onda(costa + 60, 8, 160, r.entre(0, 600), '#efcd92');
  const lado = r.chance(0.5);
  corpo += coqueiro(lado ? L * 0.1 : L * 0.9, A + 20, A * 0.78, lado ? 150 : -150, r.um(VERDES));
  corpo += coqueiro(lado ? L * 0.22 : L * 0.78, A + 40, A * 0.6, lado ? 90 : -90, r.um(VERDES));
  const chao = costa + r.entre(150, 220);
  for (let i = 0; i < r.inteiro(2, 4); i++) {
    corpo += guardaSol(
      r.entre(L * 0.35, L * 0.8),
      chao + r.entre(-30, 40),
      r.entre(55, 80),
      r.um(DESTAQUES),
    );
  }
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaPiscina(r: Aleatorio): string {
  const defs =
    degrade('deck', ['#fbefd9', '#f1dcb8']) +
    degrade('agua', ['#7fe0ef', '#1ab0d8', '#0a86c0'], false);
  const x = L * r.entre(0.08, 0.14);
  const y = A * r.entre(0.16, 0.24);
  const largura = L - x * 2;
  const altura = A * r.entre(0.46, 0.54);
  let corpo = `<rect width="${L}" height="${A}" fill="url(#deck)"/>`;
  for (let i = 0; i < 18; i++)
    corpo += `<line x1="${i * 100}" y1="0" x2="${i * 100 - 300}" y2="${A}" stroke="#e5cfa8" stroke-width="3" opacity="0.6"/>`;
  corpo += `<rect x="${x - 22}" y="${y - 22}" width="${largura + 44}" height="${altura + 44}" rx="90" fill="#ffffff"/>`;
  corpo += `<rect x="${x}" y="${y}" width="${largura}" height="${altura}" rx="70" fill="url(#agua)"/>`;
  for (let i = 0; i < 9; i++) {
    const ly = y + 40 + i * (altura / 9);
    corpo += `<path d="M${x + 60} ${ly} q60 -18 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" fill="none" stroke="#ffffff" stroke-width="4" opacity="${r.entre(0.2, 0.45)}" transform="translate(${r.entre(-40, 40)} 0)"/>`;
  }
  corpo += `<circle cx="${x + largura * 0.82}" cy="${y + altura * 0.45}" r="46" fill="none" stroke="#ff6a4d" stroke-width="22"/><circle cx="${x + largura * 0.82}" cy="${y + altura * 0.45}" r="46" fill="none" stroke="#ffffff" stroke-width="22" stroke-dasharray="36 36"/>`;
  const fileira = y + altura + 70;
  const cor = r.um(DESTAQUES);
  for (let i = 0; i < 5; i++) corpo += espreguicadeira(L * 0.14 + i * L * 0.15, fileira, 1.2, cor);
  corpo += `<g opacity="0.9">${coqueiro(L * 0.04, A * 0.5, A * 0.5, 120, r.um(VERDES))}</g>`;
  corpo += guardaSol(L * 0.93, A * 0.98, 80, r.um(DESTAQUES));
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaQuarto(r: Aleatorio): string {
  const defs =
    degrade('parede', ['#fff8ec', '#f4e3c6']) +
    degrade('janela', ['#9ad4f6', '#d8f0fd', '#fff1d6']) +
    degrade('marJanela', ['#1789d4', '#5fd0e6']);
  const piso = A * 0.76;
  const coberta = r.um(['#0076c1', '#00578f', '#f3811d', '#1aa36b', '#e9a23b']);
  const janelaX = L * r.entre(0.56, 0.62);
  let corpo = `<rect width="${L}" height="${A}" fill="url(#parede)"/>`;
  corpo += `<rect y="${piso}" width="${L}" height="${A - piso}" fill="#d6b285"/>`;
  for (let i = 0; i < 12; i++)
    corpo += `<line x1="${i * 150}" y1="${piso}" x2="${i * 150 - 120}" y2="${A}" stroke="#c49b6b" stroke-width="3"/>`;
  corpo += `<rect x="${janelaX}" y="${A * 0.14}" width="${L * 0.32}" height="${A * 0.46}" rx="8" fill="url(#janela)"/>`;
  corpo += `<rect x="${janelaX}" y="${A * 0.38}" width="${L * 0.32}" height="${A * 0.22}" fill="url(#marJanela)"/>`;
  corpo += `<rect x="${janelaX}" y="${A * 0.14}" width="${L * 0.32}" height="${A * 0.46}" rx="8" fill="none" stroke="#ffffff" stroke-width="18"/>`;
  corpo += `<line x1="${janelaX + L * 0.16}" y1="${A * 0.14}" x2="${janelaX + L * 0.16}" y2="${A * 0.6}" stroke="#ffffff" stroke-width="12"/>`;
  corpo += `<rect x="${janelaX - 70}" y="${A * 0.1}" width="70" height="${A * 0.62}" rx="20" fill="#ffffff" opacity="0.85"/><rect x="${janelaX + L * 0.32}" y="${A * 0.1}" width="70" height="${A * 0.62}" rx="20" fill="#ffffff" opacity="0.85"/>`;
  corpo += sol(janelaX + L * r.entre(0.06, 0.26), A * 0.27, 26);
  const camaX = L * 0.08;
  corpo += `<rect x="${camaX}" y="${A * 0.36}" width="${L * 0.42}" height="${A * 0.26}" rx="26" fill="#b98a5a"/>`;
  corpo += `<rect x="${camaX + 40}" y="${A * 0.5}" width="${L * 0.38}" height="${A * 0.13}" rx="20" fill="#ffffff"/>`;
  corpo += `<rect x="${camaX + 70}" y="${A * 0.44}" width="${L * 0.14}" height="${A * 0.09}" rx="26" fill="#ffffff" stroke="#efe3cf" stroke-width="4"/><rect x="${camaX + 90 + L * 0.15}" y="${A * 0.44}" width="${L * 0.14}" height="${A * 0.09}" rx="26" fill="#ffffff" stroke="#efe3cf" stroke-width="4"/>`;
  corpo += `<path d="M${camaX + 20} ${A * 0.58} L${camaX + L * 0.44} ${A * 0.58} L${camaX + L * 0.47} ${piso + 40} L${camaX - 10} ${piso + 40} Z" fill="${coberta}"/>`;
  corpo += `<rect x="${camaX + 10}" y="${A * 0.6}" width="${L * 0.44}" height="20" rx="8" fill="#ffffff" opacity="0.6"/>`;
  corpo += `<rect x="${camaX + L * 0.45}" y="${A * 0.52}" width="${L * 0.07}" height="${A * 0.24}" rx="10" fill="#c99a68"/>`;
  corpo += `<path d="M${camaX + L * 0.465} ${A * 0.46} h${L * 0.04} l20 ${A * 0.06} h-${L * 0.04 + 40} Z" fill="#fff1c2"/><line x1="${camaX + L * 0.485}" y1="${A * 0.52}" x2="${camaX + L * 0.485}" y2="${A * 0.46}" stroke="#7a5233" stroke-width="6"/>`;
  if (r.chance(0.6))
    corpo += `<rect x="${L * 0.84}" y="${A * 0.62}" width="${L * 0.1}" height="${A * 0.15}" rx="14" fill="${r.um(DESTAQUES)}" opacity="0.9"/>`;
  corpo += `<g transform="translate(${L * 0.93} ${A * 0.5})"><rect x="-40" y="90" width="80" height="90" rx="12" fill="#e9d2b0"/><path d="M0 90 C -60 30 -40 -40 0 -60 C 40 -40 60 30 0 90" fill="${r.um(VERDES)}"/></g>`;
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaRestaurante(r: Aleatorio): string {
  const defs = degrade('fundo', ['#fff3df', '#f6d3a1']);
  const madeira = r.um(['#c98f5a', '#b97c47', '#a86b3c']);
  let corpo = `<rect width="${L}" height="${A}" fill="url(#fundo)"/>`;
  for (let i = 0; i < 4; i++) {
    const x = L * (0.18 + i * 0.22);
    corpo += `<line x1="${x}" y1="0" x2="${x}" y2="${A * 0.16}" stroke="#7a5233" stroke-width="4"/><path d="M${x - 70} ${A * 0.24} Q${x} ${A * 0.08} ${x + 70} ${A * 0.24} Z" fill="${r.um(['#f3811d', '#0076c1', '#1aa36b'])}"/><circle cx="${x}" cy="${A * 0.25}" r="22" fill="#fff6c8" opacity="0.9"/>`;
  }
  corpo += `<ellipse cx="${L / 2}" cy="${A * 0.72}" rx="${L * 0.44}" ry="${A * 0.24}" fill="${madeira}"/>`;
  corpo += `<ellipse cx="${L / 2}" cy="${A * 0.7}" rx="${L * 0.42}" ry="${A * 0.21}" fill="#ffffff" opacity="0.95"/>`;
  const pratos = [L * 0.3, L * 0.5, L * 0.7];
  for (const x of pratos) {
    corpo += `<ellipse cx="${x}" cy="${A * 0.7}" rx="105" ry="54" fill="#f2f2f2" stroke="#e2d8c8" stroke-width="4"/><ellipse cx="${x}" cy="${A * 0.69}" rx="68" ry="32" fill="${r.um(['#f3811d', '#ffb21f', '#1aa36b', '#e25b3c'])}" opacity="0.85"/>`;
    corpo += `<line x1="${x - 140}" y1="${A * 0.64}" x2="${x - 140}" y2="${A * 0.78}" stroke="#b9b9b9" stroke-width="7" stroke-linecap="round"/><line x1="${x + 140}" y1="${A * 0.64}" x2="${x + 140}" y2="${A * 0.78}" stroke="#b9b9b9" stroke-width="7" stroke-linecap="round"/>`;
  }
  corpo += `<path d="M${L * 0.4} ${A * 0.52} q30 -60 0 -110 M${L * 0.6} ${A * 0.52} q-30 -60 0 -110" stroke="#ffffff" stroke-width="10" fill="none" opacity="0.7" stroke-linecap="round"/>`;
  corpo += icone(
    r.um(['utensils-crossed', 'chef-hat', 'soup']),
    L * 0.5,
    A * 0.4,
    130,
    '#7a5233',
    1.4,
  );
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaBar(r: Aleatorio): string {
  const defs = degrade('por', ['#ffcf7a', '#f3811d', '#d4507a', '#4b3a8f']);
  const horizonte = A * 0.56;
  let corpo = `<rect width="${L}" height="${A}" fill="url(#por)"/>`;
  corpo += sol(L * r.entre(0.3, 0.7), horizonte - 10, 90, '#ffe08a');
  corpo += `<rect y="${horizonte}" width="${L}" height="${A - horizonte}" fill="#3a3d8f" opacity="0.85"/>`;
  for (let i = 0; i < 6; i++)
    corpo += linhaOndulada(horizonte + 20 + i * 26, 3, 60, r.entre(0, 300), '#ffcf7a', 3, 0.35);
  let luzes = `M0 ${A * 0.1}`;
  for (let x = 0; x <= L; x += 200) luzes += ` Q${x + 100} ${A * 0.2} ${x + 200} ${A * 0.1}`;
  corpo += `<path d="${luzes}" fill="none" stroke="#2b1c3f" stroke-width="3"/>`;
  for (let x = 50; x < L; x += 100)
    corpo += `<circle cx="${x}" cy="${A * 0.14 + Math.sin(x / 63) * 8}" r="11" fill="#fff3b0"/>`;
  corpo += `<rect y="${A * 0.74}" width="${L}" height="${A * 0.26}" fill="#5a3420"/><rect y="${A * 0.72}" width="${L}" height="${A * 0.04}" fill="#7a4a2c"/>`;
  const taca = (x: number, cor: string, escala: number) =>
    `<g transform="translate(${x} ${A * 0.72}) scale(${escala})"><path d="M-80 -260 L80 -260 L8 -150 L8 -30 L50 0 L-50 0 L-8 -30 L-8 -150 Z" fill="#ffffff" opacity="0.92"/><path d="M-62 -244 L62 -244 L6 -160 L-6 -160 Z" fill="${cor}"/><circle cx="55" cy="-258" r="28" fill="#ffd34d" stroke="#ffffff" stroke-width="6"/><line x1="20" y1="-330" x2="-10" y2="-200" stroke="#ff6a4d" stroke-width="8" stroke-linecap="round"/></g>`;
  corpo +=
    taca(L * 0.42, r.um(['#ff6a4d', '#f3811d', '#04b474']), 1.1) +
    taca(L * 0.62, r.um(['#3aa0e0', '#ffb21f', '#e25b8a']), 0.9);
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaCriancas(r: Aleatorio): string {
  const defs =
    degrade('ceu', ['#a8e0ff', '#e6f7ff', '#fffbe8']) + degrade('agua', ['#6fd8ec', '#22a9d9']);
  const chao = A * 0.72;
  let corpo = `<rect width="${L}" height="${A}" fill="url(#ceu)"/>`;
  corpo += sol(L * r.entre(0.7, 0.9), A * 0.16, 55);
  for (let i = 0; i < 3; i++)
    corpo += nuvem(r.entre(100, L * 0.6), r.entre(80, 260), r.entre(0.6, 1), 0.95);
  corpo += `<rect y="${chao}" width="${L}" height="${A - chao}" fill="url(#agua)"/>`;
  corpo += linhaOndulada(chao + 30, 6, 50, r.entre(0, 300), '#ffffff', 5, 0.6);
  const torreX = L * r.entre(0.18, 0.3);
  corpo += `<rect x="${torreX}" y="${A * 0.34}" width="140" height="${chao - A * 0.34}" fill="#ffb21f"/><rect x="${torreX - 20}" y="${A * 0.3}" width="180" height="40" rx="10" fill="#f3811d"/><path d="M${torreX - 10} ${A * 0.3} L${torreX + 70} ${A * 0.2} L${torreX + 150} ${A * 0.3} Z" fill="#ff6a4d"/>`;
  corpo += `<path d="M${torreX + 140} ${A * 0.36} C ${L * 0.55} ${A * 0.36}, ${L * 0.45} ${chao - 20}, ${L * 0.68} ${chao + 10}" fill="none" stroke="#0076c1" stroke-width="56" stroke-linecap="round"/><path d="M${torreX + 140} ${A * 0.36} C ${L * 0.55} ${A * 0.36}, ${L * 0.45} ${chao - 20}, ${L * 0.68} ${chao + 10}" fill="none" stroke="#7fd0ff" stroke-width="16" stroke-linecap="round" opacity="0.8"/>`;
  for (let i = 0; i < 6; i++) {
    const bx = r.entre(L * 0.55, L * 0.95);
    const by = r.entre(A * 0.2, A * 0.5);
    const cor = r.um(['#ff6a4d', '#ffb21f', '#04b474', '#0076c1', '#e25b8a']);
    corpo += `<path d="M${bx} ${by + 70} q-20 60 10 130" stroke="#7a7a7a" stroke-width="3" fill="none"/><ellipse cx="${bx}" cy="${by}" rx="46" ry="56" fill="${cor}"/><ellipse cx="${bx - 14}" cy="${by - 18}" rx="10" ry="16" fill="#ffffff" opacity="0.5"/>`;
  }
  corpo += `<circle cx="${L * 0.85}" cy="${chao + 60}" r="44" fill="#ffffff"/><path d="M${L * 0.85 - 44} ${chao + 60} a44 44 0 0 1 88 0" fill="#ff6a4d"/>`;
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaSpa(r: Aleatorio): string {
  const defs = degrade('fundo', [r.um(['#eaf6ef', '#f1ecf7', '#eef6f6']), '#cfe6db']);
  let corpo = `<rect width="${L}" height="${A}" fill="url(#fundo)"/>`;
  for (let i = 0; i < 5; i++) {
    corpo += `<ellipse cx="${L * 0.5}" cy="${A * 0.8}" rx="${180 + i * 120}" ry="${40 + i * 26}" fill="none" stroke="#ffffff" stroke-width="5" opacity="${0.7 - i * 0.12}"/>`;
  }
  const pedras = [
    [L * 0.5, A * 0.74, 230, 70, '#8f9a96'],
    [L * 0.5, A * 0.62, 180, 56, '#a9b3ae'],
    [L * 0.51, A * 0.52, 130, 44, '#bec7c2'],
    [L * 0.5, A * 0.44, 86, 32, '#d3dad6'],
  ] as const;
  for (const [x, y, rx, ry, cor] of pedras)
    corpo += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${cor}"/>`;
  const folha = (x: number, y: number, rot: number, cor: string) =>
    `<path d="M0 0 C 60 -90 180 -90 260 0 C 180 70 60 70 0 0 Z" fill="${cor}" transform="translate(${x} ${y}) rotate(${rot})"/><path d="M0 0 L250 0" stroke="#ffffff" stroke-width="4" opacity="0.5" transform="translate(${x} ${y}) rotate(${rot})"/>`;
  corpo +=
    folha(L * 0.12, A * 0.35, r.entre(-30, -10), '#5fa77d') +
    folha(L * 0.7, A * 0.28, r.entre(10, 30), '#3f8f63') +
    folha(L * 0.68, A * 0.62, r.entre(-25, 5), '#76b98f');
  corpo += `<rect x="${L * 0.22}" y="${A * 0.6}" width="70" height="120" rx="10" fill="#fff8ec"/><path d="M${L * 0.22 + 35} ${A * 0.6 - 10} q-14 -26 0 -50 q14 24 0 50" fill="#ffb21f"/>`;
  corpo += icone('flower-2', L * 0.8, A * 0.82, 120, '#e8829e', 1.5);
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaEsporte(r: Aleatorio): string {
  const defs =
    degrade('ceu', ['#a8dcfa', '#eaf7ff']) +
    degrade('quadra', [r.um(['#1aa36b', '#0076c1', '#d9824a']), '#0f7a4a']);
  const linhaFundo = A * 0.34;
  let corpo = `<rect width="${L}" height="${A}" fill="url(#ceu)"/>`;
  corpo += sol(L * r.entre(0.1, 0.9), A * 0.12, 40);
  corpo += `<path d="M${L * 0.2} ${linhaFundo} L${L * 0.8} ${linhaFundo} L${L * 1.05} ${A} L${-L * 0.05} ${A} Z" fill="url(#quadra)"/>`;
  corpo += `<path d="M${L * 0.24} ${linhaFundo + 20} L${L * 0.76} ${linhaFundo + 20} L${L * 0.95} ${A - 30} L${L * 0.05} ${A - 30} Z" fill="none" stroke="#ffffff" stroke-width="10"/>`;
  corpo += `<line x1="${L * 0.5}" y1="${linhaFundo + 20}" x2="${L * 0.5}" y2="${A - 30}" stroke="#ffffff" stroke-width="8"/>`;
  const rede = A * 0.58;
  corpo += `<line x1="${L * 0.1}" y1="${rede}" x2="${L * 0.9}" y2="${rede}" stroke="#ffffff" stroke-width="10"/><line x1="${L * 0.1}" y1="${rede}" x2="${L * 0.1}" y2="${rede - 170}" stroke="#4a4a4a" stroke-width="12"/><line x1="${L * 0.9}" y1="${rede}" x2="${L * 0.9}" y2="${rede - 170}" stroke="#4a4a4a" stroke-width="12"/>`;
  corpo += `<rect x="${L * 0.1}" y="${rede - 170}" width="${L * 0.8}" height="110" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.8"/>`;
  for (let x = L * 0.1; x < L * 0.9; x += 34)
    corpo += `<line x1="${x}" y1="${rede - 170}" x2="${x}" y2="${rede - 60}" stroke="#ffffff" stroke-width="2" opacity="0.5"/>`;
  corpo += `<line x1="${L * 0.1}" y1="${rede - 60}" x2="${L * 0.9}" y2="${rede - 60}" stroke="#ffffff" stroke-width="6"/>`;
  const bolaX = L * r.entre(0.3, 0.7);
  corpo += `<circle cx="${bolaX}" cy="${A * 0.22}" r="62" fill="#ffffff" stroke="#ffb21f" stroke-width="10"/>${icone(r.um(['volleyball', 'trophy']), bolaX, A * 0.22, 96, '#0076c1', 1.6)}`;
  corpo += `<path d="M${bolaX - 160} ${A * 0.3} q80 -60 120 -40" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.7" stroke-dasharray="14 14"/>`;
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaNoite(r: Aleatorio): string {
  const defs = degrade('ceu', ['#071a33', '#0b2f57', '#00578f']);
  let corpo = `<rect width="${L}" height="${A}" fill="url(#ceu)"/>`;
  for (let i = 0; i < 90; i++)
    corpo += `<circle cx="${r.entre(0, L)}" cy="${r.entre(0, A * 0.55)}" r="${r.entre(1.5, 4)}" fill="#ffffff" opacity="${r.entre(0.4, 1)}"/>`;
  corpo += `<circle cx="${L * r.entre(0.1, 0.3)}" cy="${A * 0.16}" r="58" fill="#fff4c9"/><circle cx="${L * r.entre(0.1, 0.3) + 26}" cy="${A * 0.14}" r="52" fill="#0b2f57" opacity="0.0"/>`;
  const palco = A * 0.66;
  for (const [x, cor] of [
    [L * 0.25, '#ffb21f'],
    [L * 0.5, '#ff6a4d'],
    [L * 0.75, '#3aa0e0'],
  ] as const) {
    corpo += `<path d="M${x} 0 L${x - 260} ${palco} L${x + 260} ${palco} Z" fill="${cor}" opacity="0.22"/>`;
  }
  corpo += `<rect y="${palco}" width="${L}" height="${A - palco}" fill="#1b1f3f"/><rect y="${palco}" width="${L}" height="26" fill="#2c3366"/>`;
  for (let x = 40; x < L; x += 90)
    corpo += `<circle cx="${x}" cy="${palco + 13}" r="8" fill="${r.um(['#ffb21f', '#ff6a4d', '#3aa0e0', '#04b474'])}"/>`;
  corpo +=
    icone('music', L * 0.38, A * 0.42, 140, '#ffffff', 1.4) +
    icone('music-2', L * 0.62, A * 0.36, 110, '#ffe08a', 1.4) +
    icone('sparkles', L * 0.5, A * 0.22, 90, '#ffffff', 1.4);
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaDestino(r: Aleatorio): string {
  const defs =
    degrade('ceu', ['#9fd6f7', '#e3f4fd', '#fff3dc']) + degrade('mar', ['#1789d4', '#2fb8d8']);
  const horizonte = A * 0.5;
  let corpo = `<rect width="${L}" height="${A}" fill="url(#ceu)"/>`;
  corpo += sol(L * r.entre(0.55, 0.85), A * 0.2, 54);
  corpo += nuvem(L * r.entre(0.15, 0.4), A * 0.14, 0.9);
  corpo += `<path d="M0 ${horizonte} Q${L * 0.15} ${horizonte - 220} ${L * 0.34} ${horizonte - 40} T ${L * 0.62} ${horizonte} Z" fill="#4f9e6c"/>`;
  corpo += `<path d="M${L * 0.2} ${horizonte} Q${L * 0.4} ${horizonte - 150} ${L * 0.55} ${horizonte} Z" fill="#3c8a5a"/>`;
  corpo += `<rect y="${horizonte}" width="${L}" height="${A - horizonte}" fill="url(#mar)"/>`;
  for (let i = 0; i < 4; i++)
    corpo += linhaOndulada(horizonte + 40 + i * 60, 5, 70, r.entre(0, 400), '#ffffff', 3, 0.4);
  corpo += `<path d="M0 ${A * 0.8} Q${L * 0.3} ${A * 0.7} ${L * 0.55} ${A * 0.86} T ${L} ${A * 0.82} L${L} ${A} L0 ${A} Z" fill="#f4d9a6"/>`;
  corpo += `<g transform="translate(${L * r.entre(0.55, 0.75)} ${horizonte + 70})"><path d="M-110 0 L110 0 L80 40 L-80 40 Z" fill="#ffffff"/><line x1="0" y1="0" x2="0" y2="-200" stroke="#7a5233" stroke-width="8"/><path d="M8 -190 L8 -20 L120 -20 Z" fill="#ffffff"/><path d="M-8 -170 L-8 -20 L-90 -20 Z" fill="#f3811d"/></g>`;
  corpo += coqueiro(L * 0.9, A + 20, A * 0.62, -110, r.um(VERDES));
  corpo += coqueiro(L * 0.08, A + 30, A * 0.5, 80, r.um(VERDES));
  return `<defs>${defs}</defs>${corpo}`;
}

function cenaFesta(r: Aleatorio): string {
  const defs = degrade(
    'fundo',
    [r.um(['#0b2f57', '#00578f', '#3a2a6b']), r.um(['#0076c1', '#c2457a', '#f3811d'])],
    false,
  );
  let corpo = `<rect width="${L}" height="${A}" fill="url(#fundo)"/>`;
  const fogos = (cx: number, cy: number, raio: number, cor: string) => {
    let raios = '';
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      raios += `<line x1="${cx + Math.cos(ang) * raio * 0.25}" y1="${cy + Math.sin(ang) * raio * 0.25}" x2="${cx + Math.cos(ang) * raio}" y2="${cy + Math.sin(ang) * raio}" stroke="${cor}" stroke-width="6" stroke-linecap="round"/><circle cx="${cx + Math.cos(ang) * raio * 1.1}" cy="${cy + Math.sin(ang) * raio * 1.1}" r="6" fill="${cor}"/>`;
    }
    return raios;
  };
  for (let i = 0; i < 4; i++)
    corpo += fogos(
      r.entre(L * 0.1, L * 0.9),
      r.entre(A * 0.12, A * 0.5),
      r.entre(90, 170),
      r.um(['#ffd34d', '#ff8a6b', '#7fe0ef', '#ffffff', '#9ff0c4']),
    );
  for (let i = 0; i < 70; i++) {
    corpo += `<rect x="${r.entre(0, L)}" y="${r.entre(A * 0.45, A)}" width="${r.entre(10, 22)}" height="${r.entre(6, 12)}" rx="2" fill="${r.um(['#ffd34d', '#ff6a4d', '#7fe0ef', '#ffffff', '#04b474'])}" transform="rotate(${r.entre(-60, 60)} ${r.entre(0, L)} ${r.entre(0, A)})" opacity="0.9"/>`;
  }
  corpo += icone(
    r.um(['party-popper', 'gift', 'sparkles']),
    L * 0.5,
    A * 0.62,
    200,
    '#ffffff',
    1.3,
  );
  return `<defs>${defs}</defs>${corpo}`;
}

const cenas: Record<TemaModelo, (r: Aleatorio) => string> = {
  praia: cenaPraia,
  piscina: cenaPiscina,
  quarto: cenaQuarto,
  restaurante: cenaRestaurante,
  bar: cenaBar,
  criancas: cenaCriancas,
  spa: cenaSpa,
  esporte: cenaEsporte,
  noite: cenaNoite,
  destino: cenaDestino,
  festa: cenaFesta,
};

export function svgModelo(chave: string, tema: TemaModelo): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">${cenas[tema](gerador(chave))}</svg>`;
}
