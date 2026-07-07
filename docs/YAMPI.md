# YAMPI.md — Integração de checkout (Fase 4)

## Como o pedido chega até o webhook

A Yampi permite anexar dados customizados ("metadata") direto na URL de
compra de um produto: `{link_de_compra}?metadata[order_code]=valor`. Esses
colchetes ficam literais na URL (não são um erro de digitação). A Yampi grava
essa metadata no pedido e a **ecoa de volta em qualquer webhook `order.*`**,
dentro de `resource.metadata.data` — um array de `{ key, value }`.
Fonte: [Central de Ajuda Yampi — Metadata e UTMs](https://help.yampi.com.br/pt-BR/articles/12166025-como-usar-metadata-e-utms-na-yampi).

Por isso, cada card tem dois botões de compra na prévia (`components/card/BotoesCompra.tsx`),
um por plano, montados por `lib/yampi.ts` (`linkCheckoutYampi`) assim:

```
{NEXT_PUBLIC_YAMPI_CHECKOUT_SIMPLES}?metadata[order_code]={order_code}
{NEXT_PUBLIC_YAMPI_CHECKOUT_COMPLETO}?metadata[order_code]={order_code}
```

Na Fase 6, o webhook vai procurar `order_code` dentro de
`payload.resource.metadata.data` pra casar o pagamento com o pedido — **não
precisamos pedir nada extra pro cliente preencher no checkout**, o vínculo é
automático.

## Links de compra ainda não configurados

`NEXT_PUBLIC_YAMPI_CHECKOUT_SIMPLES` e `NEXT_PUBLIC_YAMPI_CHECKOUT_COMPLETO`
estão vazios no `.env.local`. Enquanto isso, a prévia mostra um aviso
"checkout em configuração" no lugar do botão — nada quebra, só fica claro que
falta esse passo. Passo a passo pro operador pegar os links está no resumo da
fase (README/checkpoint desta sessão).

## Webhook (fica pra Fase 6, só anotando o que já pesquisei)

- Header `X-Yampi-Hmac-SHA256`: HMAC-SHA256 do corpo da requisição usando o
  `YAMPI_WEBHOOK_SECRET`, em base64 — comparar com o header pra validar que a
  requisição é mesmo da Yampi.
- Responder em até 5 segundos com um status 2XX, senão a Yampi marca como
  falha (depois de 30 falhas seguidas, desativa o webhook automaticamente).
- Fonte: [Yampi Developer Portal — Webhooks](https://docs.yampi.com.br/api-reference/introduction-webhook).
