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

import { resolverAnalytics } from '@/lib/analytics';

/** Analytics ativo só com PUBLIC_ANALYTICS_ENABLED=true e um ID válido. */
export const analytics = resolverAnalytics({
  habilitado: PUBLIC_ANALYTICS_ENABLED,
  ga4: PUBLIC_GA4_ID,
  gtm: PUBLIC_GTM_ID,
});

/** Endereço que recebe o formulário. `null` = sem formulário (só os canais de atendimento). */
export const enderecoFormulario: string | null = PUBLIC_FORM_ENDPOINT?.trim() || null;

/**
 * Serviço que recebe o perfil do viajante (POST JSON) e o repassa aos consultores no WhatsApp.
 * `null` = modo teste (os dados ficam só no navegador).
 */
export const enderecoLeads: string | null = PUBLIC_LEADS_WEBHOOK?.trim() || null;
