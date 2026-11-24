import { describe, expect, it } from 'vitest';

import {
  dominiosDoCookie,
  ehCookieAnalytics,
  lerConsentimento,
  registrarConsentimento,
  resolverAnalytics,
  urlScriptAnalytics,
  VERSAO_CONSENTIMENTO,
} from './analytics';

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
  it('guarda a escolha com versão e data e lê de volta', () => {
    const registro = registrarConsentimento(true, new Date('2026-10-02T12:00:00Z'));
    expect(JSON.parse(registro)).toEqual({
      versao: VERSAO_CONSENTIMENTO,
      aceito: true,
      data: '2026-10-02T12:00:00.000Z',
    });
    expect(lerConsentimento(registro)).toBe(true);
    expect(lerConsentimento(registrarConsentimento(false, new Date()))).toBe(false);
  });

  it('pede a escolha de novo sem registro, com registro corrompido ou de outra versão', () => {
    expect(lerConsentimento(null)).toBeNull();
    expect(lerConsentimento('{quebrado')).toBeNull();
    expect(lerConsentimento('"aceito"')).toBeNull();
    expect(
      lerConsentimento(
        JSON.stringify({ versao: VERSAO_CONSENTIMENTO + 1, aceito: true, data: '' }),
      ),
    ).toBeNull();
    expect(
      lerConsentimento(JSON.stringify({ versao: VERSAO_CONSENTIMENTO, aceito: 'sim' })),
    ).toBeNull();
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
