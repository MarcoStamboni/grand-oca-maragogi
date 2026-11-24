import { describe, expect, it } from 'vitest';

import { politicaRobos, robosIa } from '@/data/robos';

import { gerarRobotsTxt } from './robots';

const siteUrl = 'https://exemplo.com.br';

describe('robôs de IA', () => {
  it('não repetem agentes e usam nomes sem espaço', () => {
    const agentes = robosIa.map((robo) => robo.agente);
    expect(new Set(agentes).size).toBe(agentes.length);
    for (const agente of agentes) expect(agente).toMatch(/^[A-Za-z][\w-]*$/);
  });

  it('cobrem as três categorias', () => {
    const categorias = new Set(robosIa.map((robo) => robo.categoria));
    expect([...categorias].sort()).toEqual(['assistente', 'busca', 'treinamento']);
  });
});

describe('gerarRobotsTxt', () => {
  it('libera todos os buscadores e aponta o sitemap', () => {
    const texto = gerarRobotsTxt({ siteUrl, robos: robosIa, politica: politicaRobos });
    expect(texto.startsWith('# Buscadores em geral\nUser-agent: *\nAllow: /\n')).toBe(true);
    expect(texto).toContain(`Sitemap: ${siteUrl}/sitemap-index.xml`);
    for (const { agente } of robosIa) expect(texto).toContain(`User-agent: ${agente}\n`);
  });

  it('decisão atual: nenhum robô bloqueado', () => {
    const texto = gerarRobotsTxt({ siteUrl, robos: robosIa, politica: politicaRobos });
    expect(texto).not.toContain('Disallow');
  });

  it('bloqueia só a categoria desligada', () => {
    const texto = gerarRobotsTxt({
      siteUrl,
      robos: robosIa,
      politica: { busca: true, assistente: true, treinamento: false },
    });
    const [liberados = '', bloqueados = ''] = texto.split('# Robôs de IA bloqueados');
    expect(bloqueados).toContain('User-agent: GPTBot');
    expect(bloqueados).toContain('Disallow: /');
    expect(bloqueados).not.toContain('OAI-SearchBot');
    expect(liberados).toContain('User-agent: OAI-SearchBot');
    expect(liberados).not.toContain('GPTBot');
  });
});
