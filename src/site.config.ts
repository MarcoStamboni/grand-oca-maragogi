/**
 * Configuração central do site.
 *
 * Três blocos, nesta ordem:
 * 1. `modelo`: liga o modo de demonstração (conteúdo fictício, sem indexação).
 * 2. `resort`: fatos do resort (não mudam com o operador). No modelo, todos os valores são
 *    EXEMPLOS fictícios: troque tudo pelos fatos do resort real (template-resort-all-inclusive/replicar-site-resort.md).
 * 3. `operadores`: quem publica o site (agência ou resort oficial). Telefones, WhatsApp, motor de
 *    reservas, logo e aviso mudam juntos com `OPERADOR_ATIVO`.
 *
 * Componentes e páginas LEEM daqui e nunca escrevem esses dados diretamente.
 * Este arquivo não importa módulos virtuais do Astro, porque também é lido pelo astro.config.ts.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type OperadorId = 'agencia' | 'oficial';

export interface Telefone {
  rotulo: string;
  /** Como o número aparece na tela. */
  exibicao: string;
  /** Valor usado em `tel:` (só dígitos, com + e DDI quando houver). */
  href: string;
}

export interface WhatsApp {
  rotulo: string;
  exibicao: string;
  /** Número com DDI, só dígitos, para `https://wa.me/<numero>`. */
  numero: string;
  /** Texto pré-preenchido da conversa. */
  mensagemPadrao: string;
}

export interface Endereco {
  logradouro: string;
  bairro: string | null;
  cidade: string;
  uf: string;
  estado: string;
  /** ISO 3166-1 alfa-2. */
  pais: 'BR';
  /** `null` enquanto não houver confirmação. */
  cep: string | null;
}

export interface Aeroporto {
  nome: string;
  /** Cidade do aeroporto (usada na rota do Google Maps e nos textos). */
  cidade: string;
  uf: string;
  iata: string;
  distanciaKm: number;
  /** Tempo de carro até o resort. `null` = a fonte não informa. */
  tempoEstimado: string | null;
}

export interface Operador {
  id: OperadorId;
  /** Tipo principal da organização que publica o site (schema.org). */
  tipoSchema: 'TravelAgency' | 'Resort';
  nome: string;
  /** Artigo do nome nas frases ("a Resorts Online", "o Resort Modelo..."). */
  artigo: 'a' | 'o';
  razaoSocial: string | null;
  cnpj: string | null;
  descricao: string;
  /** Submarca dos sites (ex.: "Resort All Inclusive"). `null` = não exibir. */
  submarca: string | null;
  /** Data de fundação como aparece em Quem somos (ex.: "maio de 2002"). `null` = não informar. */
  fundacao: string | null;
  /** Ano de início das atividades (página Quem somos). `null` = não informar. */
  desde: number | null;
  /** Origem canônica do site publicado (sem barra final). */
  siteUrl: string;
  /** O primeiro telefone é o principal (botão "Ligar"). */
  telefones: readonly [Telefone, ...Telefone[]];
  whatsapp: WhatsApp;
  email: string | null;
  endereco: Endereco | null;
  /** Horário da central de atendimento, como aparece na tela. `null` = não informar. */
  horarioAtendimento: string | null;
  /** Site institucional da empresa. `null` = não linkar. */
  siteInstitucional: string | null;
  /** Perfil oficial no Instagram. `null` = não linkar. */
  instagram: string | null;
  reservas: {
    /** Motor de reservas de hospedagem. `null` = reserva só pela central (sem motor online). */
    hospedagemUrl: string | null;
    /** Se o motor pode ser incorporado em iframe nas páginas de reserva. */
    hospedagemIncorporavel: boolean;
    /** Produto hotel + aéreo. `null` quando o operador não tem link próprio. */
    pacoteComAereoUrl: string | null;
    /** Se o motor do pacote pode ser incorporado em iframe na página do pacote com aéreo. */
    pacoteIncorporavel: boolean;
    /**
     * Condições de pagamento divulgadas pelo operador, para hospedagem e pacote com aéreo
     * (parcelas sem juros no cartão de crédito e desconto à vista no Pix). `null` = não informar.
     */
    pagamento: { parcelasSemJuros: number; descontoPixPct: number } | null;
  };
  /** Aviso exibido no rodapé e em /quem-somos/. `null` quando não se aplica. */
  aviso: string | null;
  /**
   * Logo horizontal do operador (cabeçalho, rodapé e JSON-LD), gerada por `npm run icones` em
   * public/: `<caminho>.webp` (tela), `<caminho>-claro.webp` (fundo escuro, rodapé) e
   * `<caminho>.png` (JSON-LD). `null` = só a marca do resort.
   */
  logo: { caminho: string; alt: string; largura: number; altura: number } | null;
  /** Encarregado de dados (LGPD). */
  encarregadoDados: { nome: string; email: string } | null;
}

// ---------------------------------------------------------------------------
// 1. Modo modelo (demonstração)
// ---------------------------------------------------------------------------

/**
 * Enquanto `ativo` for `true`: todas as páginas saem com `noindex`, o robots.txt bloqueia tudo e
 * uma faixa avisa que o conteúdo é fictício. Para publicar o site de um resort real, troque o
 * conteúdo, as fotos e a marca e mude para `false` (o build recusa publicar com sobras do modelo:
 * ver src/integrations/auditar-paginas.ts).
 */
export const modelo = {
  ativo: false,
  aviso: 'Site-modelo de demonstração: o resort, os dados, os preços e as imagens são fictícios.',
} as const;

// ---------------------------------------------------------------------------
// Domínio de publicação
// ---------------------------------------------------------------------------

/**
 * Domínio canônico do site publicado (sem barra final). `null` enquanto não estiver definido:
 * o build usa um endereço provisório reservado (.invalid), marca todas as páginas com `noindex`
 * e o robots.txt bloqueia os robôs. Ao definir o domínio, preencha aqui e gere o site de novo.
 */
export const dominio = {
  url: 'https://grandocamaragogi.resortallinclusive.com.br' as string | null,
  /**
   * Endereço de teste (homologação): links e sitemap com o domínio real, mas fora dos buscadores
   * (robots.txt bloqueia e as páginas levam noindex). Use `false` no endereço definitivo.
   * Liberado para os buscadores em 24/11/2026, com os 301 do site anterior (Wix) mapeados e
   * conferidos — ver docs/redirecionamentos-301.md. A partir daqui, o que for enviado à
   * hospedagem entra no Google: só suba quando for para trocar o site que está no ar.
   */
  teste: false,
  /**
   * Endereço de validação do parceiro (sem https). O site abre nele, mas o .htaccess manda
   * "noindex" só para esse host; no domínio oficial nada muda. `null` = sem validação.
   */
  validacao: null as string | null,
  provisorio: 'https://dominio-pendente.invalid',
} as const;

/**
 * Recursos opcionais do modelo. `outrosResorts` lista os outros portais da rede Resort All
 * Inclusive (*.resortallinclusive.com.br), na página /outros-resorts/ e na seção da home.
 * Ligado a pedido do cliente (19/10/2026): exceção à regra do Prompt Mestre sobre referências a
 * outras propriedades, por serem sites do mesmo universo Resort All Inclusive.
 */
export const recursos = {
  outrosResorts: true,
} as const;

/**
 * Faixa da Black Friday no topo do cabeçalho de todas as páginas
 * (src/components/sections/FaixaBlackFriday.astro), no padrão do site hoteisemolimpia.com.br:
 * contagem regressiva até o `inicio` (`chamada`) e, durante a campanha, a frase `depois` com a
 * contagem até o `fim` (`chamadaFim`). Depois do `fim`, a faixa some sozinha no navegador e deixa
 * de ser gerada no próximo build. Enquanto a faixa aparece, o cabeçalho, os submenus e o menu do
 * celular ficam pretos (#0B0B0B), com letras e logos brancas. Horários de Brasília (-03:00).
 * Para desligar tudo, use `ativo: false`.
 * Período confirmado pelo cliente em 19/11/2026: de 27/11 a 30/11/2026.
 */
export const blackFriday = {
  ativo: true,
  inicio: '2026-11-27T00:00:00-03:00',
  fim: '2026-11-30T23:59:59-03:00',
  rotulo: 'Black Friday',
  chamada: 'as ofertas começam em',
  chamadaFim: 'as ofertas terminam em',
  depois: 'Black Friday no ar: ofertas em todas as hospedagens',
  cta: 'Ver hospedagens',
  /** Página de reserva de hospedagem (rota `reservasHospedagem`). */
  ctaHref: '/reservas/hospedagem/',
  /**
   * Pop-up da campanha (PopupBlackFriday.astro): a arte da Black Friday da agência, com o botão
   * de reserva sobre a faixa vazia do meio. `botaoTopoPct` é a posição do centro do botão na
   * arte, em % da altura: a faixa vazia vai de 68% a 90%. Tempos em segundos.
   * O cupom PARTIUBLACK e os 7% no Pix da arte valem para o Grand Oca Maragogi (confirmado pelo
   * cliente em 24/11/2026). São condições da campanha; fora dela, o site segue com os 5% no Pix
   * de `operador.reservas.pagamento`.
   */
  popup: {
    ativo: true,
    /**
     * Arte em public/ (900×1200): não passa pelo pipeline de imagens do site. Reduzida do
     * original de 1086×1448 (237 kB → 104 kB) em 24/11/2026, para não pesar no PageSpeed; o
     * original fica em scripts/campanhas/black-friday-original.webp.
     */
    imagem: '/campanhas/black-friday.webp',
    largura: 900,
    altura: 1200,
    alt: 'Black Friday no Grand Oca Maragogi Resort: cupom PARTIUBLACK, Pix com 7% de desconto e parcelamento em até 10x sem juros. Oferta válida até 30/11 ou enquanto houver disponibilidade.',
    cta: 'Quero reservar',
    /** Hub de reservas, na âncora das modalidades (rota `reservas`). */
    ctaHref: '/reservas/#modalidades',
    botaoTopoPct: 78,
    /** Segundos até o pop-up abrir sozinho, depois de a página carregar. */
    segundosParaAbrir: 5,
    /**
     * Segundos até voltar depois de fechado. **0 = não volta mais**: quem fechou (no X, no Esc,
     * clicando fora ou indo para "Quero reservar") não vê o pop-up abrir sozinho de novo, nem ao
     * trocar de página, nem numa visita seguinte — a escolha fica guardada no navegador. O botão
     * da faixa do topo continua abrindo quando a pessoa clica nele.
     */
    segundosParaReabrir: 0,
  },
} as const;

/** Indexação liberada só com o domínio definido, fora do teste e fora do modo modelo. */
export const indexacaoLiberada = dominio.url !== null && !dominio.teste && !modelo.ativo;

// ---------------------------------------------------------------------------
// Decisão 1: quem opera o site
// ---------------------------------------------------------------------------

/** Para trocar o operador (agência ↔ site oficial do resort), altere só esta linha. */
export const OPERADOR_ATIVO: OperadorId = 'agencia';

// ---------------------------------------------------------------------------
// 2. Entidade: o resort (não muda com o operador)
// ---------------------------------------------------------------------------

/**
 * Grand Oca Maragogi Beach & Leisure Resort. Fatos coletados em 23/11/2026
 * (docs/conteudo-grand-oca-maragogi.md): o que a fonte não confirma fica `null` e o bloco
 * correspondente some.
 */
export const resort = {
  nome: 'Grand Oca Maragogi Resort',
  nomeCurto: 'Grand Oca Maragogi',
  nomesAlternativos: [
    'Grand Oca Maragogi Beach & Leisure Resort',
    'Grand Oca Maragogi All Inclusive Resort',
    'Grand Oca Resort',
    'Grand Oca Maragogi',
  ],
  descricao:
    'Resort all inclusive pé na areia na Praia de Ponta de Mangue, em Maragogi (AL), com 420 unidades de hospedagem, várias piscinas, quatro restaurantes, sete bares e Kids Club.',
  /** Frase curta do topo da home (o que é, onde fica, para quem). */
  slogan:
    'Resort all inclusive pé na areia na Praia de Ponta de Mangue, em Maragogi, com piscinas, parque aquático, quatro restaurantes, Kids Club e nove categorias de acomodação para casais e famílias.',
  /**
   * Foto principal do resort (chave do imagens.yaml): compartilhamento em redes sociais e
   * imagem padrão das páginas sem foto própria.
   */
  imagemPadrao: 'grand-oca/resort/vista-aerea-resort.jpg',
  /** Logo do resort no cabeçalho (lado esquerdo), em public/marca/. */
  logo: {
    caminho: '/marca/grand-oca-maragogi',
    alt: 'Grand Oca Maragogi Beach & Leisure Resort',
    largura: 280,
    altura: 100,
  } as { caminho: string; alt: string; largura: number; altura: number } | null,
  /** Marca, rede ou grupo hoteleiro. `null` = não informar. */
  rede: 'Oca Hotels' as string | null,
  /** Ano e mês de inauguração (ISO 8601 parcial). `null` = não informar. */
  inauguracao: null as string | null,
  /** Total de unidades de hospedagem. */
  unidades: 420 as number | null,
  categoriasAcomodacao: 9,
  /** Área total aproximada, em m²: a fonte não informa. */
  areaAproximadaM2: null as number | null,
  regime: 'All Inclusive',
  /** Pelo menos um ponto de consumo aberto 24 horas: a fonte da agência informa 24 horas. */
  servico24h: false,
  /** Perfil de público, como aparece na ficha rápida. */
  perfil: 'Famílias e casais',
  /** Referência de localização usada nas frases ("à beira da Praia de Ponta de Mangue"). */
  praia: 'Praia de Ponta de Mangue',
  /** "Pé na areia": o resort fica de frente para o mar (a praia fica a cerca de 10 m). */
  peNaAreia: true,
  regiao: 'Costa dos Corais, Alagoas',
  /** Destino do guia (/<slug>/). */
  destino: {
    nome: 'Maragogi',
    slug: 'maragogi',
    /** Preposição do nome nas frases ("em Maragogi"). */
    em: 'em',
  },
  endereco: {
    logradouro: 'Rodovia AL-101 Norte, s/n, Ponta de Mangue',
    bairro: 'Ponta de Mangue',
    cidade: 'Maragogi',
    uf: 'AL',
    estado: 'Alagoas',
    pais: 'BR',
    cep: '57955-000',
  } satisfies Endereco,
  /** Marcador do resort no Google Maps (consultado em 23/11/2026). */
  geo: { latitude: -8.9595767, longitude: -35.176979 },
  /** Fuso horário do resort (widget "Agora no resort" e datas das ofertas). */
  fusoHorario: 'America/Maceio',
  horarios: {
    checkIn: '15:00',
    checkOut: '12:00',
    /** Texto sobre early check-in / late check-out. `null` = não informar. */
    earlyLate:
      'Early check-in e late check-out dependem de disponibilidade e das regras da reserva.' as
        string | null,
  },
  /** Aeroporto principal (o mais usado para chegar ao resort). */
  aeroporto: {
    nome: 'Aeroporto Internacional do Recife/Guararapes',
    cidade: 'Recife',
    uf: 'PE',
    iata: 'REC',
    /** Distância rodoviária informada pelo resort. */
    distanciaKm: 126,
    /** Tempo de estrada: as fontes divergem, então não é publicado. */
    tempoEstimado: null,
  } satisfies Aeroporto as Aeroporto,
  /** Outros aeroportos possíveis (tabela "É melhor chegar por X ou por Y?"). */
  aeroportosAlternativos: [
    {
      nome: 'Aeroporto Internacional Zumbi dos Palmares',
      cidade: 'Maceió',
      uf: 'AL',
      iata: 'MCZ',
      distanciaKm: 136,
      tempoEstimado: null,
    },
  ] satisfies Aeroporto[] as readonly Aeroporto[],
  criancas: {
    /** A tarifa das crianças sempre aparece com esta ressalva. */
    ressalva:
      'Tarifas e gratuidades de crianças variam conforme o período e a acomodação. Confirme no momento da reserva.',
  },
  naoFumantes: false,
  estacionamento: null as string | null,
  /**
   * Canais oficiais do resort, usados só no perfil 'oficial' (OPERADOR_ATIVO). Neste site, da
   * agência, os contatos do hotel não são publicados: os valores abaixo são marcadores vazios.
   */
  oficial: {
    siteUrl: 'https://www.ocahotels.com/pt/hoteis/hotel-grand-oca-maragogi-beach-leisure-resort',
    motorReservasUrl: null as string | null,
    centralReservas: {
      rotulo: 'Central de Reservas do resort',
      exibicao: '(00) 0000-0000',
      href: '+550000000000',
    } satisfies Telefone,
    email: null as string | null,
    whatsappNumero: '550000000000',
  },
  /** Redes oficiais do resort. `null` = não linkar. */
  redes: {
    instagram: null as string | null,
    youtube: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },
  /**
   * Nota de terceiro (Tripadvisor), exibida com data e link. Nunca vai para AggregateRating.
   * `null` = sem bloco de avaliação.
   */
  tripadvisor: null as {
    url: string;
    nota: number;
    escala: number;
    totalAvaliacoes: number;
    consultadoEm: string;
  } | null,
} as const;

// ---------------------------------------------------------------------------
// 3. Operadores possíveis
// ---------------------------------------------------------------------------

const mensagemWhatsApp = `Olá! Gostaria de informações sobre o ${resort.nome}.`;

/** Dados reais da agência (os mesmos em todos os sites `<resort>.resortallinclusive.com.br`). */
const agencia: Operador = {
  id: 'agencia',
  tipoSchema: 'TravelAgency',
  nome: 'Resorts Online',
  artigo: 'a',
  razaoSocial: 'Resorts Online Viagens e Turismo',
  cnpj: null, // TODO: CNPJ da agência.
  descricao: 'Operadora de turismo que vende hospedagem e pacotes para resorts all inclusive.',
  submarca: 'Resort All Inclusive',
  fundacao: 'maio de 2002',
  desde: 2002,
  // Domínio ainda não definido: ver `dominio` no topo deste arquivo.
  siteUrl: dominio.url ?? dominio.provisorio,
  telefones: [
    { rotulo: 'Central de Reservas', exibicao: '0800 737 6787', href: '08007376787' },
    { rotulo: 'São Paulo', exibicao: '(11) 5555-5696', href: '+551155555696' },
  ],
  whatsapp: {
    rotulo: 'WhatsApp',
    exibicao: '(11) 93920-1897',
    numero: '5511939201897',
    mensagemPadrao: mensagemWhatsApp,
  },
  email: 'reservas@resortallinclusive.com.br',
  endereco: {
    logradouro: 'Rua Vergueiro, 2253, Cj. 1216',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    uf: 'SP',
    estado: 'São Paulo',
    pais: 'BR',
    cep: '04101-100',
  },
  horarioAtendimento: 'Segunda a sexta, das 10h às 18h · Sábados, das 10h às 13h',
  siteInstitucional: 'https://www.resortsonline.com.br',
  instagram: 'https://www.instagram.com/resortsonline/',
  reservas: {
    // Motor de hospedagem da agência para o Grand Oca Maragogi: motor 94 (motordereservas.app.br), em iframe.
    hospedagemUrl: 'https://motordereservas.app.br/motor/reservas/100' as string | null,
    hospedagemIncorporavel: true,
    // Motor do pacote hotel + aéreo: PENDENTE (id ainda não informado).
    pacoteComAereoUrl: 'https://motordereservas.app.br/motor/abas/reservas/28' as string | null,
    pacoteIncorporavel: true,
    // 10x sem juros no cartão de crédito ou 5% de desconto à vista no Pix (mesmas condições
    // dos demais sites da agência), para hospedagem e pacote com aéreo.
    pagamento: { parcelasSemJuros: 10, descontoPixPct: 5 } as Operador['reservas']['pagamento'],
  },
  aviso: `Este é um site da agência de viagens Resorts Online, que vende hospedagem e pacotes para o ${resort.nome}.`,
  logo: {
    caminho: '/marca/resort-all-inclusive',
    alt: 'Resort All Inclusive by Resorts Online',
    largura: 320,
    altura: 81,
  },
  encarregadoDados: null, // TODO: encarregado (DPO) da agência.
};

export const operadores: Readonly<Record<OperadorId, Operador>> = {
  agencia,
  /** Site oficial do resort (contatos e motor do próprio resort). */
  oficial: {
    id: 'oficial',
    tipoSchema: 'Resort',
    nome: resort.nome,
    artigo: 'o',
    razaoSocial: null,
    cnpj: null,
    descricao: resort.descricao,
    submarca: null,
    fundacao: null,
    desde: null,
    siteUrl: resort.oficial.siteUrl,
    telefones: [resort.oficial.centralReservas],
    whatsapp: {
      rotulo: 'WhatsApp',
      exibicao: resort.oficial.centralReservas.exibicao,
      numero: resort.oficial.whatsappNumero,
      mensagemPadrao: mensagemWhatsApp,
    },
    email: resort.oficial.email,
    endereco: resort.endereco,
    horarioAtendimento: null,
    siteInstitucional: null,
    instagram: resort.redes.instagram,
    reservas: {
      hospedagemUrl: resort.oficial.motorReservasUrl,
      hospedagemIncorporavel: false,
      pacoteComAereoUrl: null,
      pacoteIncorporavel: false,
      pagamento: null,
    },
    aviso: null,
    logo: null,
    encarregadoDados: null,
  },
};

export const operador: Operador = operadores[OPERADOR_ATIVO];

// ---------------------------------------------------------------------------
// Configuração do site (derivada do operador ativo)
// ---------------------------------------------------------------------------

export const site = {
  url: operador.siteUrl,
  nome: resort.nome,
  idioma: 'pt-BR',
  locale: 'pt_BR',
  fusoHorario: resort.fusoHorario,
  /** Modelo de <title>: "%s" é substituído pelo H1 da página (title = H1 + central de reservas). */
  modeloTitulo: `%s | Reservas ${operador.telefones[0].exibicao}`,
  /** Final de toda meta description (a descrição de cada página vem antes, até 150 caracteres no total). */
  fimDescricao: `Reservas ${operador.telefones[0].exibicao}`,
  descricaoPadrao: resort.descricao,
  /** Data da coleta dos fatos na fonte. */
  dataColetaFonte: '2026-11-12',
} as const;

/** Link de WhatsApp com mensagem pré-preenchida. */
export function linkWhatsApp(mensagem: string = operador.whatsapp.mensagemPadrao): string {
  return `https://wa.me/${operador.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Link `tel:` para um telefone da configuração. */
export function linkTelefone(telefone: Telefone): string {
  return `tel:${telefone.href}`;
}

/** Link do Google Maps para as coordenadas do resort. */
export const linkMapa = `https://www.google.com/maps/search/?api=1&query=${resort.geo.latitude},${resort.geo.longitude}`;

/**
 * Rota de um aeroporto até o resort, pelos nomes: com coordenadas, o Google Maps às vezes rotula
 * o destino com o nome de um vizinho.
 */
function rotaAte(aeroporto: Aeroporto, formato: 'link' | 'mapa'): string {
  const origem = encodeURIComponent(`${aeroporto.nome}, ${aeroporto.cidade} - ${aeroporto.uf}`);
  const destino = encodeURIComponent(
    `${resort.nome}, ${resort.endereco.cidade} - ${resort.endereco.uf}`,
  );
  return formato === 'link'
    ? `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`
    : `https://www.google.com/maps?saddr=${origem}&daddr=${destino}&output=embed`;
}

/** Google Maps com a rota de carro de um aeroporto (padrão: o principal) até o resort. */
export function linkRotaDoAeroporto(aeroporto: Aeroporto = resort.aeroporto): string {
  return rotaAte(aeroporto, 'link');
}

/** Rota do aeroporto principal até o resort. */
export const linkRotaAeroporto = linkRotaDoAeroporto();

/** Mesma rota no mapa incorporado (carregado sob demanda em /como-chegar/). */
export const incorporacaoRotaAeroporto = rotaAte(resort.aeroporto, 'mapa');
