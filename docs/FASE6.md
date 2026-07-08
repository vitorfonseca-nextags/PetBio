# FASE6.md — Webhook da Yampi (pós-compra)

## Fluxo implementado

`app/api/webhooks/yampi/route.ts` recebe `POST` da Yampi no evento
**`order.paid`** (confirmado na doc: [Listar eventos de webhook](https://docs.yampi.com.br/api-reference/webhooks/listar-eventos-de-webhooks-disponiveis.md)).
Passo a passo:

1. Valida a assinatura (`X-Yampi-Hmac-SHA256`, HMAC-SHA256 do corpo bruto com
   `YAMPI_WEBHOOK_SECRET`, em base64) — `lib/yampi-webhook.ts`.
2. Ignora (200, sem erro) qualquer evento que não seja `order.paid`.
3. Lê `order_code` de `resource.metadata.data` — o mesmo mecanismo do botão
   de compra (`docs/YAMPI.md`).
4. **Se não achar `order_code`, ignora (200)** — é um pedido de outra coisa
   da mesma loja (joia da Cayen Joias, não PetBio). Ver seção abaixo.
5. Identifica o plano pelo `item_sku` do pedido (`PETBIO-SIMPLES` /
   `PETBIO-COMPLETO`, os SKUs criados em `scripts/yampi-setup.mjs`).
6. Marca `orders.status='paid'` e `orders.plan`.
7. Gera o slug personalizado (`lib/slug.ts`) e o QR Code (`lib/qr.ts`,
   `qrcode` + upload no Storage), grava em `cards` e remove a marca d'água.

## Por que ignorar pedidos sem `order_code` é essencial aqui

A loja usada (Cayen Joias, ver memória do projeto) processa pedidos de joias
de verdade, não só do PetBio. Um webhook `order.paid` dispara pra **qualquer**
pedido pago da loja — sem essa checagem, cada venda de joia tentaria (e
falharia, por falta de card correspondente) ser processada como se fosse um
PetBio. A checagem de `order_code` ausente filtra isso de forma barata, sem
precisar de nenhuma configuração extra na Yampi.

## Idempotência

Se a Yampi reentregar o mesmo evento (comum em sistemas de webhook), o
handler não reprocessa: a checagem é `card.is_watermarked === false` (não
`orders.status`), porque essa é a última coisa que o fluxo grava — se o
processo cair no meio (ex.: gerou o slug mas falhou ao subir o QR), uma
reentrega vai **retomar do zero** em vez de ficar travada num estado
inconsistente. Testado explicitamente (reenviar o mesmo payload não gera um
segundo slug nem um segundo QR).

## Slug personalizado: regra de colisão testada

`lib/slug.ts` segue a ordem do CLAUDE.md §5: nome → apelido → nome+raça →
nome+número. Testado de verdade: criei um pedido de teste com o pet chamado
"Rex" (nome que já existe no card-semente da Fase 2) e confirmei que a
colisão foi resolvida corretamente caindo pra `rex-labrador` (nome+raça).

## Por que o webhook ainda NÃO está cadastrado na Yampi

Duas razões pra não cadastrar isso agora (mesmo já tendo acesso de API pra
fazer isso):

1. **Não temos URL pública ainda** — o app só roda em `localhost`, e o
   deploy é Fase 9. A Yampi precisa conseguir alcançar a URL pra chamar o
   webhook.
2. **A loja é compartilhada com as joias.** Um webhook `order.paid` dispara
   pra toda venda da Cayen Joias. Se cadastrássemos agora com uma URL que
   ainda não existe, cada venda de joia geraria uma tentativa de entrega
   falhada — e a Yampi **desativa o webhook automaticamente depois de 30
   falhas seguidas**. Numa loja com movimento, isso pode acontecer em
   poucos dias, antes mesmo de existir uma URL de verdade pra registrar.

**Testado com payload simulado** (evento, assinatura e estrutura exatamente
como documentado pela Yampi), cobrindo: fluxo completo, idempotência,
assinatura inválida (401), pedido de outro produto da loja ignorado (200),
e colisão de slug. O teste de ponta a ponta com um pagamento real da Yampi
fica pra quando tivermos uma URL pública (Fase 9, ou antes disso se você
quiser testar via túnel tipo ngrok).

## Passo a passo pra quando cadastrar de verdade (Fase 9 ou quando quiser testar antes)

1. Painel da Yampi → **Configurações → Webhooks** (ou via API,
   `POST /webhooks`, já que temos as credenciais de admin).
2. Evento: **Pedido aprovado** (`order.paid`).
3. URL: `https://SEUDOMINIO/api/webhooks/yampi`.
4. Copiar o **segredo** gerado e colar em `YAMPI_WEBHOOK_SECRET` no ambiente
   de produção (Vercel) — nunca commitar.
