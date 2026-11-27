/**
 * Configurações que vêm do ambiente de build (astro:env, modelo em .env.example).
 * Todas são públicas (vão para o HTML); nenhuma credencial fica no repositório.
 */
import {
  PUBLIC_ANALYTICS_ENABLED,
  PUBLIC_FORM_ENDPOINT,
  PUBLIC_LEADS_WEBHOOK,
  PUBLIC_GA4_ID,
  PUBLIC_GTM_ID,
} from 'astro:env/client';

import { origemMedicao, resolverAnalytics } from '@/lib/analytics';
import { dominio, medicao } from '@/site.config';

/**
 * Código do Google: o de produção vem de site.config.ts (`medicao`); um ID no .env tem
 * preferência (testes). Em qualquer caso, só carrega depois do consentimento (aviso de cookies).
 */
const entradaMedicao = origemMedicao(
  { habilitado: PUBLIC_ANALYTICS_ENABLED, ga4: PUBLIC_GA4_ID, gtm: PUBLIC_GTM_ID },
  medicao,
);

export const analytics = resolverAnalytics(entradaMedicao);

/**
 * Domínio em que o código de produção pode carregar (`undefined` = qualquer um, para o código de
 * teste do .env). Fora dele o aviso aparece e guarda a escolha, mas o Google não é carregado.
 */
export const hostDaMedicao: string | undefined =
  entradaMedicao.travarDominio && dominio.url ? new URL(dominio.url).hostname : undefined;

/** Endereço que recebe o formulário. `null` = sem formulário (só os canais de atendimento). */
export const enderecoFormulario: string | null = PUBLIC_FORM_ENDPOINT?.trim() || null;

/**
 * Serviço que recebe o perfil do viajante (POST JSON) e o repassa aos consultores no WhatsApp.
 * `null` = modo teste (os dados ficam só no navegador).
 */
export const enderecoLeads: string | null = PUBLIC_LEADS_WEBHOOK?.trim() || null;
