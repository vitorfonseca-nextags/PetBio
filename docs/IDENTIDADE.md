# IDENTIDADE.md — Identidade visual (Fase 8)

Aprovada a partir de uma referência enviada pelo operador (app de pet moderno:
laranja + creme, cantos arredondados, foto real integrada à UI). Detalhes de
como chegamos aqui em `feedback_visual_direction_reference` na memória do
projeto — a referência venceu sobre as 3 direções "não óbvias" propostas
inicialmente.

## Tokens (`app/globals.css`, `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `--color-brand-50` | `#fce3d0` | fundo de chip/ícone |
| `--color-brand-400` | `#ff9d5c` | ponta clara dos gradientes |
| `--color-brand-600` | `#e8703a` | cor primária (botões, links, destaque) |
| `--color-brand-700` | `#c85a2a` | texto sobre `brand-50` |
| `--color-cream` | `#fbf2e4` | fundo das páginas |
| `--color-ink` | `#2e2018` | texto principal |
| `--color-ink-soft` | `#93816f` | texto secundário |
| `--color-line` | `#f1e1cd` | bordas/divisórias |
| `--color-sage` | `#6e8f5c` | selo semântico positivo (ex.: plano do dono) |
| `--color-sage-tint` | `#e4ebdd` | fundo do selo sage |

Usar como utilitário Tailwind normal: `bg-brand-600`, `text-ink-soft`,
`border-line`, etc. — o `@theme` do Tailwind v4 gera essas classes
automaticamente a partir das custom properties.

Tipografia: `ui-rounded` como primeira opção pra títulos/wordmark (renderiza
SF Pro Rounded no Safari/macOS/iOS), caindo pra `"SF Pro Rounded"`,
`"Quicksand"`, `"Avenir Next"`; texto corrido em `"Avenir Next"`/sistema.

## Onde foi aplicada

- **LP** (`app/(marketing)/page.tsx`): reestruturada inteira — hero com
  `HeroMotion`, prévia ao vivo, problema/solução, como funciona, vitrine de
  blocos, benefícios, quando usar, planos, FAQ (`<details>` nativo, sem JS) e
  CTA final. Estrutura inspirada na LP do Revivo
  (`presente.cayen.com.br`), copy mantida prática/utilitária (ver memória
  `feedback_petbio_paginas_separadas`).
- **Card público** (`components/card/*`): `CardView`, `BlocoExpansivel`
  (agora aceita `icone` e é um card com sombra, não só uma linha com borda),
  `Linha` (novo componente compartilhado), todos os `Bloco*`, `BotaoCompartilhar`,
  `BotoesCompra`. Chips de idade/sexo/porte (`lib/idade.ts`), rodapé com QR
  real + link + "atualizado há X" (`lib/tempo.ts`).
- **Área do cliente** (`app/conta/*`, `components/conta/*`): login, lista,
  editor — usa `Campo`/`Select` do quiz (`components/quiz/*`).
- **Quiz** (`app/criar/page.tsx`, `components/quiz/*`): Fase 8.4 — mesma
  identidade, cabeçalho com ícone por etapa (🐾 🍖 🩺 🎾 🕰️ 📱, os mesmos dos
  blocos do card), `accent-brand-600` no checkbox de medicação, botões de
  upload de foto estilizados via `file:` (Tailwind), toques de microcopy
  (ver seção abaixo).

## Decisões de conteúdo (não só visual)

- **Sem selo "em dia" automático na Saúde do card público** — cogitado no
  mockup, descartado no código real: não temos um campo estruturado
  "vacina em dia" no banco, só texto livre. Mostrar um selo verde fixo ao
  lado de qualquer texto que o dono escrever seria enganoso se ele escrever,
  por exemplo, "atrasada".
- **Sem depoimentos falsos na LP** — a loja (Cayen Joias / Yampi) ainda não
  vendeu nenhum PetBio de verdade. Seção fica pra quando houver clientes reais.
- **"Prefiro não dizer" → "Prefiro não informar"** no select de Sexo (quiz e
  editor): a frase antiga personificava o pet ("ele" preferindo não dizer);
  a nova é sobre a escolha do dono de informar ou não.
- **Ícone por etapa no quiz** reaproveita os mesmos emojis dos blocos do card
  público — reforça que o quiz e o card são "a mesma coisa" vista em dois
  momentos, sem inventar um sistema de ícones novo.

## Card de exemplo: Florentina

`scripts/seed.mjs` ganhou um terceiro card-semente (`/florentina`, plano
Completo) com dados e fotos reais (cedidas pelo operador, com autorização,
especificamente pra esse fim) — usado como vitrine na LP ("veja como fica" e
"ver um exemplo") e nas fotos do `HeroMotion`. Fotos em `public/marketing/`.
