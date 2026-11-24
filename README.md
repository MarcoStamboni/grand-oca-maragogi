# Grand Oca Maragogi Resort

Site do **Grand Oca Maragogi Resort** (Grand Oca Maragogi Beach & Leisure Resort, Praia de Ponta de
Mangue, Maragogi, AL), da **Rede Resort All Inclusive** (Resorts Online), com domínio
`grandocamaragogi.resortallinclusive.com.br` (hoje ocupado pelo site em Wix; o novo site fica fora dos
buscadores, `dominio.teste = true`, até a troca). Astro 7 estático + TypeScript (strict) + Tailwind CSS 4, a
partir do template da série de resorts all inclusive.

Estado (23/11/2026): conteúdo reescrito para o Grand Oca Maragogi, com 72 fotos sem pessoas e com filtro
Vibrance nas seções do site (origem e lacunas em
[`docs/fotos-grand-oca-maragogi.md`](docs/fotos-grand-oca-maragogi.md); fatos em
[`docs/conteudo-grand-oca-maragogi.md`](docs/conteudo-grand-oca-maragogi.md)). Pendentes: motores de
reserva e Infotravel, publicação no domínio definitivo e conferência de alguns dados com o cliente
(lista no fim de `docs/conteudo-grand-oca-maragogi.md`).

O passo a passo de replicação da série fica fora desta pasta, em
`Desktop\Sites\Resorts All Inclusive\Esqueleto resort all inclusive\Prompt resortallinclusive.md`.

## Modo modelo

Enquanto `modelo.ativo = true` em [`src/site.config.ts`](src/site.config.ts):

- todas as páginas saem com `noindex, nofollow` e o `robots.txt` bloqueia todos os robôs;
- uma faixa no topo avisa que o resort, os dados, os preços e as imagens são fictícios;
- as imagens são ilustrações geradas por `npm run imagens:modelo` (pasta `modelo/`).

Com `modelo.ativo = false` (site real), o build **recusa publicar** se ainda houver ilustração de
modelo ou um dos nomes fictícios ("Resort Modelo", "Praia Modelo", "Cidade Modelo", "Litoral Modelo")
em qualquer página.

## Requisitos

- Node.js 22.19 ou superior (recomendado: 24 LTS, ver `.nvmrc`). Os scripts em `scripts/` são
  TypeScript executado direto pelo Node.
- npm 10 ou superior

## Comandos

| Comando                    | O que faz                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm install`              | Instala as dependências                                                                                              |
| `npm run dev`              | Servidor local em `http://localhost:4321`                                                                            |
| `npm run build`            | Gera o site estático em `dist/` (com validação do JSON-LD, `llms.txt` e auditoria das páginas)                       |
| `npm run preview`          | Serve o `dist/` localmente                                                                                           |
| `npm run check`            | Checagem de tipos (Astro + TypeScript) e validação das coleções                                                      |
| `npm run lint`             | ESLint (TypeScript estrito + acessibilidade `jsx-a11y` no markup)                                                    |
| `npm run format`           | Formata o código com Prettier (`format:check` só confere)                                                            |
| `npm run test`             | Testes unitários (Vitest)                                                                                            |
| `npm run verify`           | Roda `check`, `lint`, `format:check`, `test` e `build`                                                               |
| `npm run publicar`         | Monta `publicar/<domínio>/`, a pasta pronta para enviar à hospedagem (sem os arquivos de Netlify)                    |
| `npm run imagens:modelo`   | Gera as ilustrações de demonstração (`--folha` monta uma folha de contato, `--forcar` regera tudo)                   |
| `npm run imagens:baixar`   | Baixa as fotos do site anterior do resort (CSV em `docs/anexos/`) para `.cache/imagens/`                             |
| `npm run imagens:folhas`   | Gera folhas de contato para revisar fotos e escrever os `alt`                                                        |
| `npm run imagens:preparar` | Otimiza as imagens registradas para `src/assets/imagens/`                                                            |
| `npm run icones`           | Gera favicon, ícones do celular e versões da logo a partir dos originais em `scripts/marca/`                         |
| `npm run formulario:mock`  | Endpoint de teste do formulário em `localhost:4330`                                                                  |
| `npm run lighthouse`       | Lighthouse em 8 páginas (celular e desktop) contra `npm run preview -- --port 4322`; resumo em `reports/lighthouse/` |

## Páginas

```
/                                   Home (topo com ficha, tarifas, feriados, acomodações...)
/o-resort/  /o-resort/servicos/
/acomodacoes/  /acomodacoes/comparativo/  /acomodacoes/<categoria>/
/all-inclusive/  /all-inclusive/restaurantes/  /all-inclusive/restaurantes/<restaurante>/  (cardápio em janela)
/all-inclusive/bares/  (carrossel com detalhes em janela)
/lazer/  /lazer/piscinas/  /lazer/criancas/  /lazer/esportes/  /lazer/programacao/  (abas por dia)
/bem-estar/  /experiencias/
/datas-especiais/  /datas-especiais/<feriado>/  (data calculada no build, preço "a partir de" opcional)
/<destino>/  /<destino>/<guia>/     (slug do destino em resort.destino.slug)
/fotos/  (galeria com filtros)      /blog/  /blog/<artigo>/
/como-chegar/  (aeroportos com âncoras #via-<iata>, rotas, transporte, mapa e hora local)
/outros-resorts/  /reservas/  /reservas/hospedagem/  /reservas/pacote-com-aereo/   (só no perfil agência)
/perguntas-frequentes/  (busca)     /fale-conosco/  /quem-somos/  /politica-de-hospedagem/
/politica-de-privacidade/  /termos-de-uso/  /politica-de-cookies/  404
```

## Onde mudar o quê

| O quê                                                     | Onde                                                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Fatos do resort (nome, endereço, aeroportos, horários...) | objeto `resort` em [`src/site.config.ts`](src/site.config.ts)                                        |
| Quem opera o site (agência ou site oficial)               | `OPERADOR_ATIVO` e `operadores` no mesmo arquivo                                                     |
| Título, descrição, H1 e resposta direta de cada página    | [`src/data/paginas.ts`](src/data/paginas.ts) (testado: tamanhos e citação do resort)                 |
| Textos da home                                            | [`src/data/home.ts`](src/data/home.ts)                                                               |
| Acomodações, restaurantes, bares, lazer, feriados, guia   | coleções em `src/content/` (schemas Zod em `src/content.config.ts`)                                  |
| Programação, blog, FAQ, outros resorts                    | `src/content/programacao/`, `blog/`, `faq/`, `outros-resorts/`                                       |
| Como chegar, reservas e política de hospedagem            | [`src/data/como-chegar.ts`](src/data/como-chegar.ts), [`src/data/reservas.ts`](src/data/reservas.ts) |
| Piscina, faixas etárias, serviços                         | `src/data/piscina.ts`, `faixas-etarias.ts`, `comodidades.ts`                                         |
| Fotos gerais da galeria                                   | [`src/data/fotos.ts`](src/data/fotos.ts) (as demais categorias vêm das coleções)                     |
| Rotas, menu e breadcrumbs                                 | [`src/data/rotas.ts`](src/data/rotas.ts) e [`src/lib/menu.ts`](src/lib/menu.ts)                      |
| Cores, raios, sombras e tipografia                        | tokens em [`src/styles/global.css`](src/styles/global.css) (paleta Grand Oca, contraste AA)          |
| Redirecionamentos 301 do site anterior                    | [`src/data/redirecionamentos.ts`](src/data/redirecionamentos.ts)                                     |
| Robôs de IA no `robots.txt`                               | [`src/data/robos.ts`](src/data/robos.ts)                                                             |

## Estrutura

```
src/
  site.config.ts        Modo modelo, resort, operadores, contatos e links de reserva
  content.config.ts     Coleções de conteúdo tipadas (schemas Zod)
  content/              Conteúdo em Markdown/YAML, separado do layout
  data/                 Textos das páginas, tabelas e registros auxiliares
  lib/                  Utilitários (datas, formatação, JSON-LD, auditoria, fotos, blog...) e testes
  components/
    ui/                 Peças reutilizáveis (botão, cartão, tabelas, FAQ, galeria, janela, widgets)
    sections/           Blocos de página (cabeçalho, rodapé, topo, busca de tarifas, CTA, motor...)
    seo/                Metadados (SEO) e dados estruturados (JsonLd)
  integrations/         Passos do build: sitemap, .htaccess/_headers, limpeza, JSON-LD, llms.txt, auditoria
  layouts/              BaseLayout (estrutura global) e PaginaLayout (página interna padrão)
  scripts/              JavaScript do cliente (menu, galeria, abas, filtros, busca da FAQ, formulário...)
  assets/imagens/       Imagens otimizadas (geradas pelos scripts de imagem)
  pages/                Rotas (URLs em minúsculas, sem acento, com barra final)
  styles/               CSS global e tokens do Tailwind
scripts/                Imagens (inclusive as ilustrações do modelo), ícones, Lighthouse, mock do formulário
docs/                   Plano do modelo, guia de replicação e checklist de publicação
```

## SEO, GEO e AEO

- **Metadados**: title, description, canonical, robots, Open Graph e Twitter, com imagem social gerada no build.
- **JSON-LD** por página (WebSite, TravelAgency, Resort, WebPage, BreadcrumbList, FAQPage só na FAQ
  central, HotelRoom, Restaurant, BarOrPub e BlogPosting), validado no build: JSON válido, `@id`
  coerentes, conteúdo visível e nenhum `AggregateRating`, `Review`, `Offer`, preço ou `starRating`.
- **Respostas diretas** de 40 a 60 palavras no topo de cada página, citando o resort ou o destino,
  e títulos de seção em forma de pergunta.
- **`llms.txt` e `llms-full.txt`** gerados a partir do HTML publicado; **`robots.txt`** com os robôs de
  IA por categoria (bloqueia tudo no modo modelo).
- **Sitemap** com `lastmod` real de cada página.
- **Auditoria no build**: um H1, títulos sem saltos, imagens com `alt`, ids únicos, links e âncoras
  válidos, title e description nas faixas e únicos, resposta direta e data de atualização. Erro derruba
  o build; o relatório fica em `reports/auditoria-paginas.md`.
- **Perguntas frequentes**: cada página indexável mostra exatamente 15 perguntas, e pelo menos 10
  delas são exclusivas daquela página (conferido por `src/lib/faq-paginas.test.ts` e pelo script de
  análise). A página `/perguntas-frequentes/` reúne as principais de cada tema
  (`PERGUNTAS_POR_TEMA` em `src/lib/faq.ts`) e aponta para a página do assunto.

## Desempenho

Medido com o Lighthouse contra um servidor local que imita a hospedagem (brotli e os mesmos
cabeçalhos de cache do `.htaccess`); o `astro preview` não comprime, então mede pior que o ar.

O que mantém as notas altas, além do que já vinha do modelo (WebP, CSS embutido, fontes locais):

- **Motor de reservas sob demanda**: o iframe de outro domínio (centenas de kB de JavaScript) só
  carrega quando o quadro está perto de aparecer (`data-src` + IntersectionObserver em
  `CartaoMotor.astro`). Era ele que derrubava a home e as páginas de feriado.
- **Preload da foto de capa** (`preloadDaCapa` em `src/lib/imagens.ts`, usado pelo `BaseLayout`):
  o `<link rel="preload">` usa exatamente o mesmo `srcset` do `<img>`, senão o navegador baixaria
  dois arquivos. Quem mexer nas opções do componente `Imagem` precisa mexer nas duas pontas.
- **Renderização sob demanda** (`content-visibility`, no fim do `global.css`): seções abaixo da
  primeira tela e itens fechados da FAQ.
- A arte da campanha em `public/campanhas/` entra com `loading="lazy"` e já vem reduzida (o
  original fica em `scripts/campanhas/`).

## Variáveis de ambiente

Copie `.env.example` para `.env` (ou configure no host) e gere o site de novo. **Sem nada preenchido,
o site não tem formulário nem aviso de cookies e não carrega nada de terceiros.**

| Variável                   | Uso                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `PUBLIC_FORM_ENDPOINT`     | URL que recebe o formulário de cotação/contato. Vazio = só os canais de atendimento.                 |
| `PUBLIC_ANALYTICS_ENABLED` | `true` liga o aviso de cookies e a medição de audiência. Exige um dos IDs abaixo.                    |
| `PUBLIC_GA4_ID`            | ID do GA4 (`G-...`), carregado só depois do "Aceitar".                                               |
| `PUBLIC_GTM_ID`            | ID do Google Tag Manager (`GTM-...`), carregado só depois do "Aceitar". Com os dois IDs, vale o GTM. |

## Regras de conteúdo

1. **Nada é inventado.** No site real, todo fato vem da fonte do resort; onde ela não informa, o campo
   fica ausente (`null`) e o bloco some.
2. **Sem preços inventados.** O "a partir de" das datas especiais é opcional, tem validade e nunca vai
   para o JSON-LD. Sem depoimentos, prêmios ou notas sem fonte.
3. **Sem link para o site oficial do hotel** nem notas de "segundo o resort".
4. **Sem fotos com rosto de pessoas** (`rosto: true` no `imagens.yaml`) e **sem imagens "ChatGPT-Image"**:
   o build e os testes recusam as duas.

## Deploy

O `dist/` é 100% estático e sobe em qualquer host (Apache, Nginx, Netlify, Cloudflare Pages, Vercel):

1. `npm ci` e `npm run verify`. Com o verify verde, a pasta `dist/` está pronta.
2. Configure as variáveis de ambiente no host, se for ligar formulário ou medição, e gere de novo.
3. Publique a pasta `dist/`: ela já traz `.htaccess`, `_redirects` e `_headers` (301, 404, cache,
   compressão e cabeçalhos de segurança).
4. Com o HTTPS ativo em todo o domínio, ative o redirecionamento para HTTPS e o HSTS em
   `src/integrations/arquivos-servidor.ts`.
5. **Agende um rebuild diário ou semanal**: as datas dos feriados e as ofertas "a partir de" são
   calculadas no build.

### HostGator (endereço deste site)

`npm run publicar` monta `publicar/grandocamaragogi.resortallinclusive.com.br/` com exatamente o
que vai para o ar: o mesmo nome da pasta do site no servidor, já que na HostGator cada site é uma
pasta com o nome do domínio na home (fora de `public_html`).

- **Antes de publicar, tire o site do modo de homologação** (`dominio.teste: false` em
  `src/site.config.ts`) e gere de novo. Em 24/11/2026 o site está com `teste: true`: o build sai com
  `noindex` e com o `robots.txt` bloqueando tudo.
- Vai junto o **`.htaccess`**, que é quem faz os 301, o www → sem www, o HTTPS, a página 404, o
  cache e a compressão. É um arquivo oculto: confira se o seu programa de FTP está mostrando
  arquivos ocultos, senão ele fica para trás e os redirecionamentos não funcionam.
- Ficam de fora `_redirects` e `_headers`, que só servem a Netlify e Cloudflare Pages.
- São cerca de 1.300 arquivos e 166 MB, quase tudo fotos em `_astro/` (uma versão por tamanho de
  tela). O envio demora; não interrompa no meio.
- Depois de subir, confira os 301 e o sitemap como está em `docs/redirecionamentos-301.md`.
- `npm run zip` continua disponível para quem prefere enviar um `.zip` pelo cPanel.
