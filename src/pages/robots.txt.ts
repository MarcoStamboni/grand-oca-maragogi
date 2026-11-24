/**
 * robots.txt gerado a partir da URL do operador ativo (site.config) e da política de robôs
 * de IA (src/data/robos.ts).
 */
import type { APIRoute } from 'astro';

import { politicaRobos, robosIa } from '@/data/robos';
import { gerarRobotsTxt } from '@/lib/robots';
import { indexacaoLiberada, site } from '@/site.config';

export const GET: APIRoute = () =>
  new Response(
    gerarRobotsTxt({
      siteUrl: site.url,
      robos: robosIa,
      politica: politicaRobos,
      bloquearTudo: !indexacaoLiberada,
    }),
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
