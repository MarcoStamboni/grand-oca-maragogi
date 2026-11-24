# Redirecionamentos 301: Grand Oca Maragogi Resort

> Atualizado em 23/11/2026.

O site anterior da agência para o resort é um Wix em `grandocamaragogi.resortallinclusive.com.br`
(mesmo domínio do novo site). As 37 URLs do `pages-sitemap.xml` dele foram mapeadas para as páginas novas
em `src/data/redirecionamentos.ts` (acomodações, gastronomia, lazer, localização, reservas e feriados).
O teste `redirecionamentos.test.ts` confere que todo destino existe.

Sem equivalente novo: `/1` e `/quem-somos` (já existe com o mesmo endereço) e as páginas de blog do Wix,
que não foram migradas.

**PENDENTE:** conferir o `blog-posts-sitemap.xml` do Wix antes da troca do site e mapear os artigos que
interessarem.
