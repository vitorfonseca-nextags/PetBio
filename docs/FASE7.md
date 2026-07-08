# FASE7.md — Entrega no WhatsApp + área do cliente

Esta fase tem duas partes com dependências diferentes. Por pedido do operador
(ver memória do projeto), a 7.1 fica esperando a Nextags esquentar o número de
WhatsApp; o restante (7.2–7.4) foi adiantado porque não depende disso.

## 7.1 — Entrega no WhatsApp (NÃO feita agora)

Depende do número da Nextags estar pronto. Fica pendente, junto com a Fase 5
(prévia no WhatsApp). Reforçando a decisão de produto já registrada: quando
for feita, a entrega precisa ser **automática** — sem etapa de "toque para
criar acesso" — assim que o webhook da Yampi (Fase 6) processa o pagamento, a
mensagem com link + QR já sai sozinha.

## Pré-requisito que faltava desde a Fase 6: e-mail do comprador

O login por código (7.2) precisa saber pra qual e-mail mandar o código, e o
CLAUDE.md já previa isso: "o e-mail é coletado só na compra". O checkout da
Yampi já pede e-mail do cliente normalmente (não é um campo extra que
tivemos que adicionar) — só faltava o webhook gravar isso.

Testei contra a API real da Yampi (`GET /orders?include=customer`) pra
confirmar o formato exato antes de escrever o código — o e-mail vem em
`resource.customer.data.email` (o `customer` de um pedido é um objeto
singular `{ data: {...} }`, diferente de `metadata`/`items`, que vêm como
lista). `lib/yampi-webhook.ts` ganhou `extrairEmailCliente()`, e o webhook
(`app/api/webhooks/yampi/route.ts`) agora grava `orders.owner_email` junto
com `status`/`plan`. Se o campo não vier por algum motivo, o webhook não
falha — só não vai existir e-mail pra fazer login (o pagamento é processado
normalmente).

## 7.2 — Login por código de verificação (sem senha)

Fluxo em `/conta/entrar`:
1. Dono digita o e-mail. `solicitarCodigo` (`app/conta/actions.ts`) confere
   se existe algum pedido **pago** com esse `owner_email`. Se existir, gera
   um código numérico de 6 dígitos (`lib/login-code.ts`), grava em
   `login_codes` com validade de 10 minutos e manda por e-mail.
2. **A resposta é sempre a mesma mensagem genérica**, exista ou não pedido
   pago pra aquele e-mail — evita que alguém descubra por tentativa se um
   e-mail é cliente PetBio ou não.
3. Dono digita o código. `verificarCodigo` confere e-mail+código+validade,
   marca o código como usado (`used_at`) e cria uma sessão.

**Sessão:** nova tabela `sessions` (`supabase/migrations/0002_sessions.sql`,
RLS ligada e sem nenhuma policy pública — mesmo padrão de `orders`/
`login_codes`, só a service role acessa). Cookie httpOnly
(`lib/session.ts`), 30 dias, guarda só o id da sessão — o e-mail fica no
banco, nunca no cookie. `sair()` apaga a sessão do banco e o cookie.

**Provedor de e-mail escolhido: Resend.** Motivos: API bem simples (uma
chamada HTTP, sem SDK), tem remetente de teste
(`onboarding@resend.dev`) que funciona **sem verificar domínio** — importante
agora, já que o domínio próprio (`petbio.com.br`) só entra no ar na Fase 9 —
e plano gratuito generoso (100 e-mails/dia). `lib/email.ts` usa
`EMAIL_PROVIDER_API_KEY` (nome que já estava no CLAUDE.md) e um `EMAIL_FROM`
opcional pra quando o domínio for verificado.

**Passo a passo pro operador (necessário pra testar login de verdade):**
1. Criar conta em resend.com (tem plano gratuito, não pede cartão).
2. No painel, **API Keys → Create API Key** (permissão de envio já basta).
3. Colar o valor gerado em `EMAIL_PROVIDER_API_KEY` no `.env.local`.
4. (Opcional, pode pular por enquanto) **Domains → Add Domain** pra usar
   `contato@petbio.com.br` como remetente em vez do `onboarding@resend.dev`
   de teste — só funciona depois que o domínio estiver apontado (Fase 9).

## 7.3 — Área do cliente (edição)

`/conta` lista os cards pagos daquele e-mail (uma consulta a `orders` com
`owner_email` = sessão + `status = paid`, join em `cards`). `/conta/{cardId}`
abre o editor (`components/conta/EditorCard.tsx`), reaproveitando os mesmos
componentes de campo do quiz (`Campo`, `ListaMedicacoes`, `ListaHistorico`) e
o mesmo `BlocoExpansivel` usado no card público, pra manter a UI consistente.

**Decisão de produto (não estava explícita no PLANO.md, documentando aqui):**
o editor respeita os mesmos limites do plano que a renderização pública
(`lib/plano.ts`) — dono do plano **Simples** não vê/edita clínica de
emergência, medicações, personalidade/rotina nem histórico, e o limite de
fotos é o do plano contratado. Mesmo que ele já tenha preenchido esses
campos no quiz (que sempre coleta tudo, ver `docs/QUIZ.md`), o editor não
expõe o que ele não comprou. Se isso não for o comportamento desejado, é uma
mudança pequena (trocar os `plano` que chegam em `mostraPersonalidadeEHistorico`/
`saudeApenasEssencial` por `null` no editor).

**Fotos:** `components/conta/EditorFotos.tsx` lida tanto com fotos já
existentes (mostradas pela URL) quanto novas (upload). Dá pra remover,
adicionar (respeitando o limite do plano) e reordenar (setas ↑/↓). Fotos
removidas são apagadas do Storage (`lib/storage.ts` ganhou
`removerFotoPorUrl`, best-effort — se falhar, só loga, não trava o salvamento).

**Segurança:** não existe policy pública de escrita em `cards` — toda escrita
passa por `atualizarCard` (`app/conta/actions.ts`), que confere a sessão e
se `card → order.owner_email` bate com o e-mail da sessão **e** o pedido
está `paid`, antes de gravar qualquer coisa. Mesmo padrão de aplicação já
usado em `app/criar/actions.ts` (a barreira de segurança é a checagem no
código do servidor, não uma RLS policy, porque tudo passa pela service role).

## 7.4 — Visitante só visualiza

Já garantido pela arquitetura, sem código novo:
- O card público (`/[slug]`) nunca teve affordance de edição — é
  renderização pura (`components/card/CardView.tsx`).
- A única rota de escrita em `cards` é `atualizarCard`, que exige sessão +
  ownership (acima). Sem sessão válida, `/conta` e `/conta/{cardId}`
  redirecionam pra `/conta/entrar`; card de outro dono retorna 404
  (`notFound()`), não um erro que revele que o card existe.
- RLS de `cards` continua igual à Fase 1: leitura pública só de
  `is_watermarked = false`; nenhuma policy de escrita pública.

## O que falta pro operador fazer

1. Rodar `supabase/migrations/0002_sessions.sql` no SQL Editor do Supabase
   (mesmo processo da Fase 1 — colar o arquivo inteiro, Run).
2. Criar a conta no Resend e colar `EMAIL_PROVIDER_API_KEY` no `.env.local`
   (passo a passo acima).
3. Depois disso, testar de verdade: pedir código com o e-mail de um pedido
   pago, confirmar que o e-mail chega, entrar em `/conta` e editar um card.
