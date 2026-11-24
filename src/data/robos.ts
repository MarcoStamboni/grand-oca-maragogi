/**
 * Robôs de IA listados explicitamente no robots.txt (GEO).
 * Decisão do usuário (02/10/2026): liberar todos, inclusive os de treinamento.
 * Para bloquear uma categoria, troque o valor dela em `politicaRobos` para `false`.
 * Buscadores tradicionais (Googlebot, Bingbot, Applebot) seguem a regra geral `User-agent: *`.
 */
export type CategoriaRobo = 'busca' | 'assistente' | 'treinamento';

/** `true` = pode ler o site. */
export const politicaRobos: Readonly<Record<CategoriaRobo, boolean>> = {
  /** Indexam páginas para respostas com citação (busca com IA). */
  busca: true,
  /** Leem uma página quando o usuário pede ao assistente. */
  assistente: true,
  /** Coletam conteúdo para treinar modelos. */
  treinamento: true,
};

export interface RoboIa {
  /** Nome exato do `User-agent` publicado pela empresa. */
  agente: string;
  empresa: string;
  categoria: CategoriaRobo;
}

export const robosIa: readonly RoboIa[] = [
  { agente: 'OAI-SearchBot', empresa: 'OpenAI', categoria: 'busca' },
  { agente: 'ChatGPT-User', empresa: 'OpenAI', categoria: 'assistente' },
  { agente: 'GPTBot', empresa: 'OpenAI', categoria: 'treinamento' },
  { agente: 'Claude-SearchBot', empresa: 'Anthropic', categoria: 'busca' },
  { agente: 'Claude-User', empresa: 'Anthropic', categoria: 'assistente' },
  { agente: 'ClaudeBot', empresa: 'Anthropic', categoria: 'treinamento' },
  { agente: 'PerplexityBot', empresa: 'Perplexity', categoria: 'busca' },
  { agente: 'Perplexity-User', empresa: 'Perplexity', categoria: 'assistente' },
  { agente: 'DuckAssistBot', empresa: 'DuckDuckGo', categoria: 'busca' },
  { agente: 'MistralAI-User', empresa: 'Mistral', categoria: 'assistente' },
  { agente: 'Google-Extended', empresa: 'Google', categoria: 'treinamento' },
  { agente: 'Applebot-Extended', empresa: 'Apple', categoria: 'treinamento' },
  { agente: 'meta-externalagent', empresa: 'Meta', categoria: 'treinamento' },
  { agente: 'CCBot', empresa: 'Common Crawl', categoria: 'treinamento' },
];
