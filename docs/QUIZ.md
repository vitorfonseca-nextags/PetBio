# QUIZ.md — Decisões da Fase 3

## O quiz não pergunta plano

Correção de rumo (2026-07-07, a pedido do operador): o quiz **não** pergunta
Simples ou Completo. Ele coleta **todas** as informações do pet — todos os
blocos, sem cortes — como se a pessoa tivesse escolhido o Completo. A escolha
do plano acontece só na hora da compra (checkout da Yampi, Fase 4/6); o
webhook da Fase 6 grava `orders.plan` a partir do que foi realmente pago.

Até a compra, `orders.plan` fica `null`. A prévia (`/{order_code}`,
`is_watermarked=true`) mostra o card **completo** — todos os blocos, todas as
fotos enviadas — porque a lógica de renderização da Fase 2
(`mostraPersonalidadeEHistorico`, `limiteFotos` em `lib/plano.ts`) já trata
`plan = null` como "não corta nada" desde o início. Esse não é mais um caso
raro simulado só no seed da Fase 2 — é o estado normal de **toda** prévia
criada pelo quiz real.

Depois da compra, se a pessoa levou o Simples, o card passa a ser renderizado
com os cortes do Simples — mas os dados de Personalidade/Histórico e as fotos
extras continuam salvos no banco (só não aparecem). Se um dia ela migrar pro
Completo, a informação já está lá.

**Nota:** isso corrige o item 3.2 do `docs/PLANO.md`, que dizia "plano Simples
não pede blocos do Completo" — texto do plano original que não refletia a
intenção real do produto. Ajustado nesta sessão.

## Geração de fotos: upload passa pelo servidor, não pelo browser

Fase 1 deixou em aberto se o upload seria direto do browser (com uma policy
de Storage pra `anon`) ou via servidor. Fase 3 decidiu: **via servidor**. O
quiz manda os arquivos como `FormData` pro server action `criarPedido`
(`app/criar/actions.ts`), que faz o upload com a service role key. Vantagem:
zero policy pública de escrita no Storage — a superfície de ataque continua
do tamanho que era na Fase 1. Custo: os arquivos passam pelo servidor da
Vercel antes de chegar no Storage, o que é irrelevante no volume esperado
(fotos de pet, poucas por pedido). Limite de fotos no quiz: o mesmo do
Completo (15) — é o teto de qualquer forma, já que o quiz coleta tudo.

## `order_code`: gerado no servidor, com retry em colisão

`lib/order-code.ts` sorteia 8 caracteres de um alfabeto sem `0/1/i/l/o` (evita
confusão visual, já que esse código vira a URL temporária da prévia). A
inserção em `orders` tenta até 5 vezes em caso de colisão (código Postgres
`23505`, unique violation) antes de desistir — na prática, a chance de colisão
com 8 caracteres é desprezível, o retry é só uma rede de segurança.

## Lógica condicional implementada

- **"Toma medicação?"** é um checkbox; a lista de medicações só aparece (e só
  é gravada) se marcado "sim" — se não, `medicacoes` vai vazio.
- Não há mais corte de passos por plano — todo mundo passa por
  Identidade → Alimentação → Saúde → Personalidade/Rotina → Histórico →
  Contato.

## "Gerar exemplo"

Botão por campo de texto livre que preenche com uma constante de
`lib/quiz/exemplos.ts` — nenhuma chamada de IA, custo zero por card (regra 9
do README).

## Testado

Rodei o quiz de ponta a ponta com Chromium headless (Playwright), com fotos,
medicação e evento de histórico, confirmando gravação correta no Supabase
(order com `plan=null`, card com todos os blocos preenchidos) e render
correto da prévia completa. Registro de teste removido depois de conferir.
