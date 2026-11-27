import { describe, expect, it } from 'vitest';

import {
  ACEITAR_TODOS,
  dominiosDoCookie,
  ehCookieAnalytics,
  lerConsentimento,
  medicaoPermitida,
  registrarConsentimento,
  resolverAnalytics,
  urlScriptAnalytics,
  VERSAO_CONSENTIMENTO,
} from './analytics';

describe('medicaoPermitida', () => {
  const site = 'grandocamaragogi.resortallinclusive.com.br';

  it('libera no domínio do site e nos subdomínios dele', () => {
    expect(medicaoPermitida(site, site)).toBe(true);
    expect(medicaoPermitida(`www.${site}`, site)).toBe(true);
    expect(medicaoPermitida(site.toUpperCase(), site)).toBe(true);
  });

  it('bloqueia prévia local, homologação e cópia do site', () => {
    expect(medicaoPermitida('localhost', site)).toBe(false);
    expect(medicaoPermitida('127.0.0.1', site)).toBe(false);
    expect(medicaoPermitida('homologacao.outrodominio.com.br', site)).toBe(false);
    // Nome que só termina parecido, sem o ponto: não é subdomínio.
    expect(medicaoPermitida(`falso${site}`, site)).toBe(false);
  });

  it('libera quando o site ainda não tem domínio definido', () => {
    expect(medicaoPermitida('localhost', undefined)).toBe(true);
    expect(medicaoPermitida('localhost', '')).toBe(true);
  });
});

describe('resolverAnalytics', () => {
  it('fica desligado por padrão, mesmo com IDs', () => {
    expect(resolverAnalytics({ habilitado: false, ga4: 'G-ABC123' })).toEqual({ ativo: false });
  });

  it('usa o GA4 ou, havendo os dois, o GTM', () => {
    expect(resolverAnalytics({ habilitado: true, ga4: ' G-ABC123 ' })).toEqual({
      ativo: true,
      provedor: 'ga4',
      id: 'G-ABC123',
    });
    expect(resolverAnalytics({ habilitado: true, ga4: 'G-ABC123', gtm: 'GTM-XYZ9' })).toMatchObject(
      {
        provedor: 'gtm',
        id: 'GTM-XYZ9',
      },
    );
  });

  it('derruba o build com configuração incompleta ou inválida', () => {
    expect(() => resolverAnalytics({ habilitado: true })).toThrow(/exige PUBLIC_GA4_ID/);
    expect(() => resolverAnalytics({ habilitado: true, ga4: 'UA-1234-1' })).toThrow(
      /PUBLIC_GA4_ID inválido/,
    );
    expect(() => resolverAnalytics({ habilitado: true, gtm: 'gtm-abc' })).toThrow(
      /PUBLIC_GTM_ID inválido/,
    );
  });

  it('monta o endereço do script de cada provedor', () => {
    expect(urlScriptAnalytics('ga4', 'G-ABC123')).toBe(
      'https://www.googletagmanager.com/gtag/js?id=G-ABC123',
    );
    expect(urlScriptAnalytics('gtm', 'GTM-XYZ9')).toBe(
      'https://www.googletagmanager.com/gtm.js?id=GTM-XYZ9',
    );
  });
});

describe('consentimento', () => {
  it('guarda a escolha por categoria, com versão e data, e lê de volta', () => {
    const registro = registrarConsentimento(
      { desempenho: true, publicidade: false },
      new Date('2026-10-02T12:00:00Z'),
    );
    expect(JSON.parse(registro)).toEqual({
      versao: VERSAO_CONSENTIMENTO,
      desempenho: true,
      publicidade: false,
      data: '2026-10-02T12:00:00.000Z',
    });
    expect(lerConsentimento(registro)).toEqual({ desempenho: true, publicidade: false });
    expect(lerConsentimento(registrarConsentimento(ACEITAR_TODOS, new Date()))).toEqual(
      ACEITAR_TODOS,
    );
    const nada = { desempenho: false, publicidade: false };
    expect(lerConsentimento(registrarConsentimento(nada, new Date()))).toEqual(nada);
  });

  it('mantém a escolha da versão 1 (aceitar/recusar) como Desempenho', () => {
    expect(lerConsentimento(JSON.stringify({ versao: 1, aceito: true, data: '' }))).toEqual({
      desempenho: true,
      publicidade: false,
    });
    expect(lerConsentimento(JSON.stringify({ versao: 1, aceito: false, data: '' }))).toEqual({
      desempenho: false,
      publicidade: false,
    });
  });

  it('pede a escolha de novo sem registro, com registro corrompido ou de outra versão', () => {
    expect(lerConsentimento(null)).toBeNull();
    expect(lerConsentimento('{quebrado')).toBeNull();
    expect(lerConsentimento('"aceito"')).toBeNull();
    expect(
      lerConsentimento(
        JSON.stringify({ versao: VERSAO_CONSENTIMENTO + 1, desempenho: true, publicidade: true }),
      ),
    ).toBeNull();
    expect(
      lerConsentimento(
        JSON.stringify({ versao: VERSAO_CONSENTIMENTO, desempenho: 'sim', publicidade: false }),
      ),
    ).toBeNull();
    expect(lerConsentimento(JSON.stringify({ versao: 1, aceito: 'sim' }))).toBeNull();
  });
});

describe('cookies do Google Analytics', () => {
  it('reconhece os nomes e os domínios em que podem estar', () => {
    expect(['_ga', '_ga_ABC123', '_gid', ' _gat'].every(ehCookieAnalytics)).toBe(true);
    expect(ehCookieAnalytics('sessao')).toBe(false);
    expect(dominiosDoCookie('summerville.resortallinclusive.com.br')).toEqual([
      '.summerville.resortallinclusive.com.br',
      '.resortallinclusive.com.br',
      '.com.br',
    ]);
    expect(dominiosDoCookie('localhost')).toEqual([]);
  });
});
