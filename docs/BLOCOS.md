# BLOCOS.md — Decisões de renderização por plano (Fase 2)

Regras implementadas em `lib/plano.ts` e aplicadas em `components/card/CardView.tsx`.

## Limite de fotos

| Plano | Limite |
|---|---|
| Simples | 3 |
| Completo | 15 |

Valores exatos dos "ex.:" do CLAUDE.md. O limite corta na renderização
(`Galeria` recebe `fotos.slice(0, limite)`) — fotos extras enviadas no quiz
continuam salvas no banco, só não aparecem no card.

## Blocos visíveis por plano

| Bloco | Simples | Completo |
|---|---|---|
| Identidade | sim | sim |
| Alimentação | sim | sim |
| Saúde | sim (essencial) | sim (completa) |
| Personalidade/Rotina | não | sim |
| Histórico | não | sim |

**Saúde essencial (Simples):** veterinário, telefone, vacinas, condições de
saúde. **Saúde completa (Completo)** soma: clínica de emergência e a lista de
medicações. Ver `components/card/BlocoSaude.tsx` (prop `essencial`).

## Plano ainda não definido (`plan = null`)

**Atualização da Fase 3:** o quiz real sempre pergunta o plano no primeiro
passo e já grava em `orders.plan` desde o `status=draft` (motivo em
`docs/QUIZ.md`) — então, na prática, `plan = null` só acontece nos cards-
semente da Fase 2 que simulam esse estado de propósito. A lógica abaixo
continua valendo como comportamento definido do sistema, só raramente exercida
com dados reais.

Antes da compra, `orders.plan` podia ficar `null` (o plano só é escolhido no
checkout da Yampi — regra do CLAUDE.md §5). Nesse estado, que só existe durante a **prévia**
(`is_watermarked = true`), a renderização **não corta nada**: mostra todos os
blocos e fotos preenchidos no quiz, como um "gostinho" do produto completo.
O corte por plano só entra em vigor depois do pagamento, quando o webhook
grava `plan = 'simples' | 'completo'` (Fase 6).

## Marca d'água e compartilhamento

`is_watermarked = true` → overlay de texto repetido (`MarcaDagua.tsx`) + aviso
de que é preciso comprar + botão "Compartilhar" desabilitado
(`BotaoCompartilhar.tsx`). `is_watermarked = false` → sem overlay, botão
habilitado (copia o link atual pra área de transferência — a integração com
QR Code e WhatsApp é da Fase 6/7).

## Card-semente (seed)

`npm run seed` cria/atualiza 3 pedidos + cards de teste (idempotente):

- `/rex` — plano completo, pago, sem marca d'água, 5 fotos, todos os blocos.
- `/bidu` — plano simples, pago, sem marca d'água, 4 fotos cadastradas mas só
  3 aparecem (limite do plano), sem Personalidade/Histórico/clínica de
  emergência.
- `/seed-previa` — `plan = null`, com marca d'água, tudo visível, compartilhar
  bloqueado.

Fotos são SVGs locais em `public/seed/` (sem dependência de rede).
