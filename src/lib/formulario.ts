/**
 * Formulário de cotação e contato (funções puras e testadas). A mesma definição de campos
 * monta o HTML (FormularioCotacao.astro) e valida no navegador (src/scripts/formulario.ts).
 * Campos mínimos (LGPD): só o necessário para responder ao pedido. O formulário oficial do
 * pedidos de cotação acrescentam datas, hóspedes e idade das crianças (a tarifa depende da idade).
 */

export type TipoFormulario = 'contato' | 'hospedagem' | 'pacote';

export type NomeCampo =
  | 'nome'
  | 'email'
  | 'telefone'
  | 'origem'
  | 'entrada'
  | 'saida'
  | 'adultos'
  | 'criancas'
  | 'idades'
  | 'acomodacao'
  | 'mensagem';

export interface Campo {
  nome: NomeCampo;
  rotulo: string;
  tipo: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'textarea';
  obrigatorio: boolean;
  autocomplete?: string;
  dica?: string;
  min?: number;
  max?: number;
  /** Ocupa a linha inteira do formulário (os demais dividem a linha em duas colunas). */
  linhaInteira?: boolean;
}

/**
 * Campo-armadilha (honeypot): escondido de pessoas e leitores de tela; robôs costumam
 * preenchê-lo. O Formspree reconhece este nome; com outros provedores, o script descarta o envio.
 */
export const CAMPO_ARMADILHA = '_gotcha';

export type DadosFormulario = Partial<Record<NomeCampo | typeof CAMPO_ARMADILHA, string>>;
export type ErrosFormulario = Partial<Record<NomeCampo, string>>;

/** Limites de sanidade dos números de hóspedes (validação do formulário, não regra do resort). */
const MAX_HOSPEDES = 20;
const MAX_MENSAGEM = 2000;

const contato: Campo[] = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'text', obrigatorio: true, autocomplete: 'name' },
  { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true, autocomplete: 'email' },
  {
    nome: 'telefone',
    rotulo: 'Telefone ou WhatsApp',
    tipo: 'tel',
    obrigatorio: true,
    autocomplete: 'tel',
    dica: 'Com DDD, por exemplo (11) 99999-9999.',
  },
];

function camposDaViagem(tipo: Exclude<TipoFormulario, 'contato'>): Campo[] {
  const pacote = tipo === 'pacote';
  return [
    ...(pacote
      ? [
          {
            nome: 'origem',
            rotulo: 'Cidade de origem',
            tipo: 'text',
            obrigatorio: true,
            autocomplete: 'address-level2',
            dica: 'Cidade onde começa a viagem (aeroporto de embarque).',
          } satisfies Campo,
        ]
      : []),
    {
      nome: 'entrada',
      rotulo: pacote ? 'Data de ida' : 'Data de entrada',
      tipo: 'date',
      obrigatorio: true,
    },
    {
      nome: 'saida',
      rotulo: pacote ? 'Data de volta' : 'Data de saída',
      tipo: 'date',
      obrigatorio: true,
    },
    {
      nome: 'adultos',
      rotulo: 'Adultos',
      tipo: 'number',
      obrigatorio: true,
      min: 1,
      max: MAX_HOSPEDES,
    },
    {
      nome: 'criancas',
      rotulo: 'Crianças',
      tipo: 'number',
      obrigatorio: false,
      min: 0,
      max: MAX_HOSPEDES,
    },
    {
      nome: 'idades',
      rotulo: 'Idade de cada criança',
      tipo: 'text',
      obrigatorio: false,
      dica: 'Por exemplo: 3 e 8 anos. A tarifa depende da idade.',
      linhaInteira: true,
    },
    {
      nome: 'acomodacao',
      rotulo: 'Acomodação de interesse',
      tipo: 'select',
      obrigatorio: false,
      linhaInteira: true,
    },
  ];
}

/** Campos de cada tipo de formulário, na ordem de exibição. */
export function camposDoFormulario(tipo: TipoFormulario): Campo[] {
  const mensagem: Campo = {
    nome: 'mensagem',
    rotulo: tipo === 'contato' ? 'Mensagem' : 'Observações',
    tipo: 'textarea',
    obrigatorio: tipo === 'contato',
    max: MAX_MENSAGEM,
    linhaInteira: true,
  };
  return [...contato, ...(tipo === 'contato' ? [] : camposDaViagem(tipo)), mensagem];
}

/**
 * Assunto enviado junto com o pedido (identifica a origem no e-mail do provedor).
 * `resort`: nome curto do resort (site.config.ts), recebido por parâmetro para que o script do
 * navegador não carregue a configuração inteira.
 */
export function assuntoDoFormulario(tipo: TipoFormulario, resort: string): string {
  const assuntos: Record<TipoFormulario, string> = {
    contato: 'Mensagem pelo site do ' + resort,
    hospedagem: 'Pedido de cotação de hospedagem no ' + resort,
    pacote: 'Pedido de cotação de pacote com aéreo para o ' + resort,
  };
  return assuntos[tipo];
}

const vazio = (valor: string | undefined): boolean => (valor ?? '').trim() === '';
const inteiro = (valor: string | undefined): number | null =>
  /^\d+$/.test((valor ?? '').trim()) ? Number(valor) : null;
const dataValida = (valor: string | undefined): valor is string =>
  /^\d{4}-\d{2}-\d{2}$/.test(valor ?? '') && !Number.isNaN(Date.parse(valor ?? ''));

const mensagensObrigatorio: Record<NomeCampo, string> = {
  nome: 'Informe o seu nome.',
  email: 'Informe o seu e-mail.',
  telefone: 'Informe um telefone com DDD.',
  origem: 'Informe a cidade de origem.',
  entrada: 'Informe a data.',
  saida: 'Informe a data.',
  adultos: 'Informe o número de adultos.',
  criancas: 'Informe o número de crianças.',
  idades: 'Informe a idade de cada criança.',
  acomodacao: 'Escolha uma acomodação.',
  mensagem: 'Escreva a sua mensagem.',
};

/**
 * Erros por campo (vazio = tudo certo). `hoje` no formato AAAA-MM-DD, para não aceitar
 * datas no passado.
 */
export function validarFormulario(
  tipo: TipoFormulario,
  dados: DadosFormulario,
  hoje: string,
): ErrosFormulario {
  const erros: ErrosFormulario = {};
  for (const campo of camposDoFormulario(tipo)) {
    if (campo.obrigatorio && vazio(dados[campo.nome]))
      erros[campo.nome] = mensagensObrigatorio[campo.nome];
  }

  const { nome, email, telefone, entrada, saida, adultos, criancas, idades, mensagem } = dados;
  if (!erros.nome && !vazio(nome) && (nome ?? '').trim().length < 2) {
    erros.nome = 'Informe o seu nome.';
  }
  if (!erros.email && !vazio(email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email ?? '').trim())) {
    erros.email = 'Informe um e-mail válido, como nome@exemplo.com.br.';
  }
  const digitos = (telefone ?? '').replace(/\D/g, '').length;
  if (!erros.telefone && !vazio(telefone) && (digitos < 10 || digitos > 15)) {
    erros.telefone = 'Informe um telefone com DDD, como (11) 99999-9999.';
  }
  if (!vazio(mensagem) && (mensagem ?? '').length > MAX_MENSAGEM) {
    erros.mensagem = `Use no máximo ${MAX_MENSAGEM} caracteres.`;
  }
  if (tipo === 'contato') return erros;

  if (!erros.entrada && !dataValida(entrada)) erros.entrada = 'Informe uma data válida.';
  else if (!erros.entrada && dataValida(entrada) && entrada < hoje) {
    erros.entrada = 'A data não pode ser anterior a hoje.';
  }
  if (!erros.saida && !dataValida(saida)) erros.saida = 'Informe uma data válida.';
  else if (!erros.saida && dataValida(saida) && dataValida(entrada) && saida <= entrada) {
    erros.saida =
      tipo === 'pacote'
        ? 'A data de volta precisa ser depois da data de ida.'
        : 'A data de saída precisa ser depois da data de entrada.';
  }

  const totalAdultos = inteiro(adultos);
  if (
    !erros.adultos &&
    (totalAdultos === null || totalAdultos < 1 || totalAdultos > MAX_HOSPEDES)
  ) {
    erros.adultos = `Informe de 1 a ${MAX_HOSPEDES} adultos.`;
  }
  const totalCriancas = vazio(criancas) ? 0 : inteiro(criancas);
  if (totalCriancas === null || totalCriancas > MAX_HOSPEDES) {
    erros.criancas = `Informe de 0 a ${MAX_HOSPEDES} crianças.`;
  } else if (totalCriancas > 0 && vazio(idades)) {
    erros.idades = mensagensObrigatorio.idades;
  }
  return erros;
}

/** O campo-armadilha veio preenchido: envio de robô, descartado sem aviso. */
export function ehRobo(dados: DadosFormulario): boolean {
  return !vazio(dados[CAMPO_ARMADILHA]);
}

/** "2027-01-10" → "10/01/2027". */
function dataBr(valor: string | undefined): string | null {
  return dataValida(valor) ? valor.split('-').reverse().join('/') : null;
}

/**
 * Texto para continuar o pedido pelo WhatsApp quando o envio falha. Leva só os dados da
 * viagem e a mensagem (o WhatsApp já identifica quem escreve): sem e-mail nem telefone.
 */
export function mensagemWhatsApp(
  tipo: TipoFormulario,
  dados: DadosFormulario,
  resort: string,
): string {
  const abertura: Record<TipoFormulario, string> = {
    contato: `Olá! Tenho uma dúvida sobre o ${resort}.`,
    hospedagem: `Olá! Quero uma cotação de hospedagem no ${resort}.`,
    pacote: `Olá! Quero uma cotação de pacote com aéreo para o ${resort}.`,
  };
  const partes = [
    abertura[tipo],
    dados.origem?.trim() && `Origem: ${dados.origem.trim()}.`,
    dataBr(dados.entrada) && `${tipo === 'pacote' ? 'Ida' : 'Entrada'}: ${dataBr(dados.entrada)}.`,
    dataBr(dados.saida) && `${tipo === 'pacote' ? 'Volta' : 'Saída'}: ${dataBr(dados.saida)}.`,
    dados.adultos?.trim() && `Adultos: ${dados.adultos.trim()}.`,
    dados.criancas?.trim() &&
      dados.criancas.trim() !== '0' &&
      `Crianças: ${dados.criancas.trim()}${dados.idades?.trim() ? ` (${dados.idades.trim()})` : ''}.`,
    dados.acomodacao?.trim() && `Acomodação: ${dados.acomodacao.trim()}.`,
    dados.mensagem?.trim(),
  ];
  return partes
    .filter((parte): parte is string => typeof parte === 'string' && parte !== '')
    .join(' ');
}
