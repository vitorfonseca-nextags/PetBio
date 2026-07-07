# QUIZ.md — Decisões da Fase 3

## Por que o quiz pergunta o plano, se "o plano é definido no checkout da Yampi"

O CLAUDE.md (§5) diz que o plano é definido no checkout e confirmado pelo
webhook — e isso continua verdade: `orders.plan` só é **garantido/definitivo**
depois do pagamento (Fase 6). Mas o PLANO.md pede explicitamente, na própria
Fase 3 (item 3.2), que o quiz já não peça os blocos do Completo pra quem
está no Simples — ou seja, o quiz precisa saber o plano *antes* de perguntar
os blocos.

Solução: o quiz pergunta o plano como primeiro passo (só pra decidir quais
perguntas fazer e qual limite de fotos vale) e grava essa escolha em
`orders.plan` já no `status=draft`. Nada impede isso — o `CHECK` da coluna só
valida o valor, não exige `status=paid`. Se o cliente mudar de ideia e comprar
um plano diferente na Yampi, o webhook da Fase 6 sobrescreve `plan` com o que
foi realmente pago — a compra manda, a escolha do quiz é só um ponto de
partida. Consequência prática: diferente do card-semente da Fase 2 (que tinha
`plan = null` pra simular "ainda não decidiu"), toda prévia criada pelo quiz
real já nasce com um plano definido, então o corte de blocos por plano
(`docs/BLOCOS.md`) já vale desde a prévia, não só depois de pago.

## Geração de fotos: upload passa pelo servidor, não pelo browser

Fase 1 deixou em aberto se o upload seria direto do browser (com uma policy
de Storage pra `anon`) ou via servidor. Fase 3 decidiu: **via servidor**. O
quiz manda os arquivos como `FormData` pro server action `criarPedido`
(`app/criar/actions.ts`), que faz o upload com a service role key. Vantagem:
zero policy pública de escrita no Storage — a superfície de ataque continua
do tamanho que era na Fase 1. Custo: os arquivos passam pelo servidor da
Vercel antes de chegar no Storage, o que é irrelevante no volume esperado
(fotos de pet, poucas por pedido).

## `order_code`: gerado no servidor, com retry em colisão

`lib/order-code.ts` sorteia 8 caracteres de um alfabeto sem `0/1/i/l/o` (evita
confusão visual, já que esse código vira a URL temporária da prévia). A
inserção em `orders` tenta até 5 vezes em caso de colisão (código Postgres
`23505`, unique violation) antes de desistir — na prática, a chance de colisão
com 8 caracteres é desprezível, o retry é só uma rede de segurança.

## Lógica condicional implementada

- **Plano Simples não pergunta** Personalidade/Rotina nem Histórico (passos
  nem aparecem no wizard) e, dentro de Saúde, não pergunta Clínica de
  emergência nem a lista de medicações (fica igual à visualização "essencial"
  da Fase 2).
- **"Toma medicação?"** é um checkbox; a lista de medicações só aparece (e só
  é gravada) se marcado "sim" — se não, `medicacoes` vai vazio.
- **Limite de fotos** do plano é aplicado já no seletor de arquivos (não deixa
  escolher mais que o limite) e de novo no servidor (`slice`), como
  segunda barreira caso alguém contorne o client.

## "Gerar exemplo"

Botão por campo de texto livre que preenche com uma constante de
`lib/quiz/exemplos.ts` — nenhuma chamada de IA, custo zero por card (regra 9
do README).

## Testado

Rodei o quiz duas vezes de ponta a ponta com Chromium headless (Playwright):
uma vez plano completo (com fotos, medicação e evento de histórico) e uma vez
plano simples (confirmando que os passos extras nem aparecem e que o seletor
de fotos trava em 3). Os dois criaram o pedido e o card no Supabase
corretamente e redirecionaram pra prévia com os dados certos; removi os dois
registros de teste depois de conferir.
