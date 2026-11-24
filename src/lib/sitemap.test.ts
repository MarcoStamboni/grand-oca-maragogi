import { describe, expect, it } from 'vitest';

import { aplicarLastmod } from './sitemap';

const xml =
  '<?xml version="1.0"?><urlset><url><loc>https://x.br/</loc><lastmod>2026-01-01T00:00:00.000Z</lastmod></url><url><loc>https://x.br/a/</loc></url><url><loc>https://x.br/b/</loc></url></urlset>';

describe('aplicarLastmod', () => {
  it('troca ou acrescenta a data de cada página', () => {
    const datas = new Map([
      ['https://x.br/', '2026-09-30'],
      ['https://x.br/a/', '2026-10-01'],
    ]);
    const { xml: novo, semData } = aplicarLastmod(xml, datas);
    expect(novo).toContain('<url><loc>https://x.br/</loc><lastmod>2026-09-30</lastmod></url>');
    expect(novo).toContain('<url><loc>https://x.br/a/</loc><lastmod>2026-10-01</lastmod></url>');
    expect(novo).toContain('<url><loc>https://x.br/b/</loc></url>');
    expect(semData).toEqual(['https://x.br/b/']);
  });
});
