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

## Setup automático dos produtos (API de administração)

A Yampi tem uma API REST separada pra gerenciar a loja (catálogo, cupons,
pedidos) — diferente da URL de checkout. Usada só localmente, via script, nunca
no app em produção.

- **Base URL:** `https://api.dooki.com.br/v2/{alias}` (Dooki é o backend por
  trás da Yampi).
- **Autenticação:** headers `User-Token` e `User-Secret-Key`. Gerados em
  **Painel Yampi → avatar (canto superior direito) → Credenciais de API**
  — a mesma tela mostra o **Alias** da loja.
- **Criar marca:** `POST /catalog/brands`.
- **Criar produto (com SKU inline, sem chamada separada):** `POST /catalog/products`.
- **Criar cupom:** `POST /pricing/promocodes`.
- Fontes: [Yampi Developer Portal — Auth](https://docs.yampi.com.br/api-reference/auth/auth-user-token.md),
  [Criar produto](https://docs.yampi.com.br/api-reference/catalogo/produtos/criar-produto.md),
  [Criar cupom](https://docs.yampi.com.br/api-reference/promocoes/cupons/criar-cupom.md).

`scripts/yampi-setup.mjs` (`npm run yampi:setup`) usa essa API pra criar a
marca "PetBio" e os produtos "PetBio Simples" (R$10) e "PetBio Completo"
(R$29,90) — de forma idempotente (não duplica se already existir) e sempre
com `active: false` (rascunho): por segurança, nada fica comprável de verdade
sem o operador revisar e ativar manualmente no painel.

**Limitação encontrada:** não achei um campo de resposta da API que devolva o
"link de compra" direto do produto criado — pelos artigos de ajuda da Yampi,
esse link só aparece no painel (Produtos → produto → aba Resumo → "Link de
compra", formato `seguro.SEUDOMINIO.com.br/r/AABBJJ`). Por isso o script cria
os produtos, mas copiar o link final ainda é um passo manual de ~30s por
produto.

**Pegadinhas descobertas rodando de verdade (a doc não deixava isso claro):**
- `/auth/me` é **global** — não leva o alias da loja na URL (diferente de
  todo o resto da API, que é `/{alias}/...`).
- `skus[].price_cost` é **obrigatório** nessa loja, mesmo a doc listando como
  opcional — o script manda `0`.
- O parâmetro `?search=` nas listagens (`/catalog/brands`, `/catalog/products`)
  **não filtra nada** — devolve a página inteira ignorando o valor. Pra achar
  algo existente por nome é preciso paginar (`?page=N`) e comparar no
  cliente.
- Catálogos grandes (essa loja tem dezenas de páginas de produtos) fazem essa
  paginação estourar rate limit (`429 Too Many Attempts`) rápido. Por isso o
  script só pagina pra achar a **marca** (poucas), e pra **produto** tenta
  criar direto e trata erro 422 de "nome/slug já em uso" como "já existe,
  ignora" — mais barato que paginar um catálogo grande.

## Webhook (fica pra Fase 6, só anotando o que já pesquisei)

- Header `X-Yampi-Hmac-SHA256`: HMAC-SHA256 do corpo da requisição usando o
  `YAMPI_WEBHOOK_SECRET`, em base64 — comparar com o header pra validar que a
  requisição é mesmo da Yampi.
- Responder em até 5 segundos com um status 2XX, senão a Yampi marca como
  falha (depois de 30 falhas seguidas, desativa o webhook automaticamente).
- Fonte: [Yampi Developer Portal — Webhooks](https://docs.yampi.com.br/api-reference/introduction-webhook).
