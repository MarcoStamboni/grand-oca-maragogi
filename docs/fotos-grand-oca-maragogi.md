# Fotos do Grand Oca Maragogi Resort (23/11/2026)

O site tem 72 fotos reais, sem pessoas, com o filtro Vibrance (0,8) aplicado em
`npm run imagens:preparar` (`scripts/imagens/vibrance.ts`).

## Origem

- **Pasta do cliente** (`GRAND OCA MARAGOGI ALL INCLUSIVE RESORT`: acomodações 19, crianças 8,
  entretenimento 34, gastronomia 3): 13 usadas, copiadas para `fotos/cliente/`. As fotos têm 1024 a 1280 px,
  e as de quarto aparecem em versão maior no site oficial.
- **Site oficial do Oca Hotels** (galerias por categoria de quarto, imagens de até 2100 px, `fotos/oficial/`):
  41 usadas. As acomodações foram casadas com a pasta do cliente por SIFT (Standard, Bangalô, Bangalô
  Triplo, Standard Comunicante, Deluxe, Duplo Deluxe, Suíte Deluxe e Suíte).
- **Site atual da agência** (Wix, `fotos/agencia/`): 18 usadas, para
  restaurantes (Corais, Il Giardino, La Brasa), bar noturno, academia, parque aquático e paisagens.
- A pasta `_Com_Humanos` (46 fotos) não foi usada.

## Acomodações por categoria

| Categoria            | Fotos                                                    |
| -------------------- | -------------------------------------------------------- |
| Apartamento Standard | 2 quartos, varanda, banheiro, prédio                     |
| Standard Comunicante | quarto de casal, 2 camas, escrivaninha, entrada, varanda |
| Bangalô              | fachada, 2 quartos, bangalôs à beira da piscina          |
| Bangalô Triplo       | fachada, 4 quartos                                       |
| Suíte                | prédio (oficial), quarto e sala (agência)                |
| Deluxe 2 camas       | quarto, varanda, bandeja de café, banheiro               |
| Duplo Deluxe         | varanda, quarto, camas                                   |
| Suíte Deluxe         | sala, quarto, camas, varanda, banheiro, armário          |

## Fora do site

- Todas as fotos com hóspedes, funcionários ou banhistas visíveis, mesmo pequenos (galeria oficial de
  marketing, vários quartos Deluxe, massagem, shows, Kids Club com crianças).
- As fotos do Deluxe Adaptado da agência repetem as do Deluxe; só a do quarto com mesa redonda foi usada.

## Lacunas (sem foto limpa)

Spa e Espaço Beleza (a página de bem-estar usa a academia e o nascer do sol), Ix’U, praça de alimentação,
cada bar individualmente (a foto do bar noturno aparece na galeria e nas capas, sem nome de bar), quadras,
Kids Club (só o parque aquático e o Play Zone), Esplanada Tropical e Arena Taba.

## Como refazer

```bash
npm run imagens:importar && npm run imagens:preparar -- --forcar && npm run verify
```

A lista (chave, arquivo, alt) está em `scripts/imagens/importar-pasta.ts`.
