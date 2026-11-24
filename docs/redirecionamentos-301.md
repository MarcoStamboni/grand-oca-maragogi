# Migração de URLs: Grand Oca Maragogi Resort

> Atualizado em 24/11/2026. Mapa conferido contra o site que está no ar.

O site novo vai substituir o site atual (Wix) **no mesmo endereço**,
`grandocamaragogi.resortallinclusive.com.br`, sempre **sem www**.

## Como o mapa foi levantado

Em 24/11/2026, lidas todas as URLs do site no ar:

- `sitemap.xml` e os três sitemaps do Wix (`pages`, `blog-posts`, `blog-categories`): **43 URLs**
  (40 páginas e 3 posts; o `blog-categories` só repete o `/blog`);
- rastreamento dos links internos das 43 páginas, que revelou **13 endereços fora do sitemap**: 12
  PDFs hospedados no Wix (`/_files/ugd/*.pdf`, linkados nas páginas de lazer e da carta de bebidas)
  e o feed `/blog-feed.xml`, que aparece em todas as páginas do blog. Todos respondem 200;
- nenhuma página de tag ou de categoria no ar (`/blog/tags` e `/blog/categories` dão 404 hoje).

**Total: 56 endereços no ar.** Nenhum ficou sem destino.

| Situação                                    | Quantidade |
| ------------------------------------------- | ---------- |
| Mesmo caminho nos dois sites (nada a fazer) | 8          |
| Caminho muda, com 301                       | 48         |
| Sem destino                                 | 0          |

A conferência foi feita simulando as regras do `.htaccess` gerado no build contra os 56 endereços e
checando se a página de destino existe em `dist/`.

## 1. Mesmo caminho: nada a fazer

`/`, `/acomodacoes`, `/acomodacoes/bangalo-triplo`, `/acomodacoes/standard-comunicante`,
`/acomodacoes/duplo-deluxe-sofa-cama`, `/acomodacoes/suite-deluxe`, `/blog` e `/quem-somos`.

O site novo usa barra no fim (`/acomodacoes/`). Quem chegar sem a barra é levado à versão com barra,
num 301.

## 2. Caminho muda: 301

| Página antiga                                                                                          | Página nova                                  |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `/acomodacoes/apartamentos`                                                                            | `/acomodacoes/apartamento-standard/`         |
| `/acomodacoes/bangalo`                                                                                 | `/acomodacoes/bangalo-vista-jardim/`         |
| `/acomodacoes/suites`                                                                                  | `/acomodacoes/suite/`                        |
| `/acomodacoes/deluxe`                                                                                  | `/acomodacoes/deluxe-duas-camas-grandes/`    |
| `/acomodacoes/family-suite`, `/acomodacoes/deluxe-adaptado`                                            | `/acomodacoes/`                              |
| `/gastronomia-all-inclusive`, `/gastronomia-all-inclusive/carta-de-bebidas`                            | `/all-inclusive/`                            |
| `/gastronomia-all-inclusive/restaurantes`                                                              | `/all-inclusive/restaurantes/`               |
| `/gastronomia-all-inclusive/bares`                                                                     | `/all-inclusive/bares/`                      |
| `/o-que-fazer-grand-oca-maragogi-resort`                                                               | `/lazer/`                                    |
| `/o-que-fazer-grand-oca-maragogi-resort/lazer`                                                         | `/lazer/esportes/`                           |
| `/o-que-fazer-grand-oca-maragogi-resort/criancas`                                                      | `/lazer/criancas/`                           |
| `/o-que-fazer-grand-oca-maragogi-resort/piscina-grand-oca-maragogi`                                    | `/lazer/piscinas/`                           |
| `/localizacao`                                                                                         | `/como-chegar/`                              |
| `/reservas-grand-oca`, `/reserva-online-grand-oca`                                                     | `/reservas/`                                 |
| `/reserva-online-grand-oca/somente-hospedagem`                                                         | `/reservas/hospedagem/`                      |
| `/reserva-online-grand-oca/pacote-completo`, `/pacotes-grand-oca-maragogi-resort-all-inclusive`        | `/reservas/pacote-com-aereo/`                |
| `/reveillon`                                                                                           | `/datas-especiais/reveillon/`                |
| `/carnaval`                                                                                            | `/datas-especiais/carnaval/`                 |
| `/natal`, `/post/natal-no-grand-oca-maragogi`                                                          | `/datas-especiais/natal/`                    |
| `/feriado-de-pascoa`                                                                                   | `/datas-especiais/pascoa/`                   |
| `/feriado-21-de-abril`                                                                                 | `/datas-especiais/tiradentes/`               |
| `/feriado-dia-do-trabalho`                                                                             | `/datas-especiais/dia-do-trabalho/`          |
| `/feriado-7-de-setembro`                                                                               | `/datas-especiais/sete-de-setembro/`         |
| `/feriado-dia-das-criancas`                                                                            | `/datas-especiais/dia-das-criancas/`         |
| `/feriado-2-de-novembro`                                                                               | `/datas-especiais/finados/`                  |
| `/feriado-15-de-novembro`, `/post/feriado-da-proclamacao-da-republica-grand-oca-maragogi-2026`         | `/datas-especiais/proclamacao-da-republica/` |
| `/feriado-20-de-novembro`                                                                              | `/datas-especiais/consciencia-negra/`        |
| `/post/black-friday-2026-no-grand-oca-maragogi-garanta-suas-ferias-all-inclusive-no-caribe-brasileiro` | `/datas-especiais/`                          |
| `/1` (página de modelo do Wix, sem conteúdo do resort)                                                 | `/`                                          |

Também está na lista `/contato` → `/fale-conosco/` (não existe no Wix; cobre quem digitar o endereço).

### Arquivos do Wix fora do sitemap

| Endereço antigo                    | Página nova        | O que era                                                 |
| ---------------------------------- | ------------------ | --------------------------------------------------------- |
| `/blog-feed.xml`                   | `/blog/`           | feed RSS do blog do Wix                                   |
| 2 PDFs da carta de bebidas         | `/all-inclusive/`  | linkados em `/gastronomia-all-inclusive/carta-de-bebidas` |
| 1 PDF da recreação infantil        | `/lazer/criancas/` | linkado na página de crianças                             |
| 1 PDF da programação das piscinas  | `/lazer/piscinas/` | linkado na página da piscina                              |
| 1 PDF da programação esportiva     | `/lazer/esportes/` | linkado na página de lazer                                |
| os outros 7 PDFs (regra `/_files`) | `/lazer/`          | todos saíam da página "o que fazer"                       |

Os PDFs ficam no servidor do Wix e somem na troca; o 301 leva quem chegar por link antigo ou por
resultado de busca à página nova que trata do mesmo assunto.

## 3. Seções inteiras: rede de segurança

O Wix cria sozinho os endereços de tag e de categoria do blog, que não entram no sitemap. Hoje não há
nenhum no ar, mas o redirecionamento já pega a seção toda (`prefixo: true` em
`src/data/redirecionamentos.ts`):

| Seção antiga           | Página nova | Para quê                                                  |
| ---------------------- | ----------- | --------------------------------------------------------- |
| `/blog/tags/...`       | `/blog/`    | páginas de tag que o Wix venha a criar                    |
| `/blog/categories/...` | `/blog/`    | categorias do blog                                        |
| `/post/...`            | `/blog/`    | qualquer post antigo sem destino próprio nas regras acima |
| `/_files/...`          | `/lazer/`   | qualquer outro arquivo que o Wix sirva nessa pasta        |

As regras exatas vêm antes das de seção no `.htaccess`, então um post mapeado vai para a página do
tema dele; só o que sobra cai no `/blog/`. O teste `redirecionamentos.test.ts` garante essa ordem e
confere que nenhuma seção engole uma página do site novo.

## 4. www e HTTPS

O `.htaccess` gerado no build já traz, antes de tudo:

- `www.grandocamaragogi.resortallinclusive.com.br` (HTTP ou HTTPS) →
  `https://grandocamaragogi.resortallinclusive.com.br`, com o caminho e a query preservados;
- qualquer acesso em HTTP → HTTPS.

## 5. Sitemap no endereço antigo

O Wix publica o sitemap em `/sitemap.xml`. O Astro gera o índice em `/sitemap-index.xml`, então o
build grava também uma cópia em `/sitemap.xml` (integração `lastmod-sitemap`): quem tiver o endereço
antigo inscrito no Search Console continua sendo atendido depois da troca, sem 404. O `robots.txt`
aponta o `/sitemap-index.xml`.

## 6. Antes de trocar o site (ordem importa)

1. **Indexação já liberada:** `dominio.teste` passou para `false` em 24/11/2026, então o
   `robots.txt` sai com `Allow: /` e as páginas com `index, follow`. **O que for enviado à
   hospedagem a partir daqui entra no Google**: só suba quando for para trocar o site que está
   no ar.
2. `npm run verify` e gerar o site de novo (`npm run build`).
3. `npm run publicar` e subir o conteúdo de `publicar/grandocamaragogi.resortallinclusive.com.br/`,
   **incluindo o `.htaccess`** (é ele que faz os 301 e o www).
4. Conferir no ar, um a um: um endereço de cada grupo da tabela 2, um `/post/...`, um PDF de
   `/_files/ugd/...`, a home com www e a home em HTTP. Todos devem responder 301 e cair na página
   certa.
5. No Google Search Console: enviar `https://grandocamaragogi.resortallinclusive.com.br/sitemap.xml`
   (ou o `sitemap-index.xml`) e acompanhar o relatório de páginas por algumas semanas.

**Vale conferir também:** este mapa cobre o que o site no ar publica hoje. Se houver endereços
antigos que saíram do site mas ainda recebem visita (de anúncio, e-mail ou link de fora), eles
aparecem no Search Console em "Páginas" e no relatório de 404. Qualquer endereço assim entra na
lista do mesmo jeito.
