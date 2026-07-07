# PLANO.md — PetBio (produto digital, primeira entrega)

Plano de construção dividido em fases. Cada fase termina num **checkpoint**: o
Claude Code para, resume o que fez, lista o que o operador precisa fazer
manualmente, e pergunta se pode seguir. Os prompts para executar cada fase estão em
`docs/PROMPTS.md` (um prompt por fase).

**Ordem de leitura obrigatória antes de qualquer execução:** `README.md` (regras) e
`CLAUDE.md` (stack, integrações, modelo de dados, regras de negócio).

> Refinamento visual (copy e design página por página) fica para a **Fase 8**,
> depois da estrutura de pé. Nas fases 1–7, "feião mas funcionando" é o esperado.

---

## FASE 0 — Fundação do projeto
Objetivo: esqueleto Next.js rodando localmente, versionado no GitHub.

- **0.1** Inicializar Next.js (App Router) + TypeScript + Tailwind. Rodar em
  `localhost` com uma home placeholder.
- **0.2** Criar estrutura de pastas conforme `CLAUDE.md` (seção 6). Criar
  `.env.example` com todas as chaves (vazias) e `.gitignore` cobrindo `.env.local`.
- **0.3** Inicializar git, primeiro commit, e instruir o operador (passo a passo) a
  criar o repositório no GitHub e subir.

**Critério de conclusão:** app abre em `localhost` sem erro; repositório no GitHub
com o primeiro commit; `.env.example` presente; `.env.local` ignorado.
**Operador faz:** cria conta/repo no GitHub e cola a URL do repo quando pedido.

---

## FASE 1 — Banco de dados (Supabase)
Objetivo: banco pronto, com tabelas, storage de fotos e RLS.

- **1.1** Passo a passo para o operador criar conta e projeto no Supabase e colar
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
  `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`.
- **1.2** Criar client Supabase em `/lib` (um para browser, um para servidor).
- **1.3** Criar as tabelas (`orders`, `cards`, `login_codes`) e o bucket de Storage
  para fotos. Decidir blocos como JSON em `cards` (padrão) vs tabelas próprias, e
  documentar a escolha. Fornecer o SQL e **instruir onde o operador cola/executa**
  (ou executar via service role, sem o operador tocar no banco).
- **1.4** Definir e aplicar as **RLS policies**: leitura pública só de card pago e
  sem marca d'água; edição só pelo dono autenticado; prévia acessível só via link.

**Critério de conclusão:** tabelas e bucket criados; client conecta; policies
ativas e testadas com uma linha de exemplo.
**Operador faz:** cria projeto Supabase, cola as 3 chaves, executa o SQL se pedido.

---

## FASE 2 — Domínio do card: blocos e template de renderização
Objetivo: dado um registro de card, renderizar a página em blocos (sem quiz ainda).

- **2.1** Definir os tipos TypeScript dos blocos (Identidade, Alimentação, Saúde,
  Personalidade/Rotina, Histórico) conforme `CLAUDE.md`.
- **2.2** Rota `/[slug]/page.tsx` que busca o card pelo slug e o renderiza.
- **2.3** Componentes dos blocos: **Identidade sempre aberta**; demais
  **expansíveis** (abre/fecha). Timeline para o Histórico. Mobile-first.
- **2.4** Regras de plano na renderização: Simples mostra Identidade + Alimentação +
  Saúde essencial; Completo mostra todos + mais fotos. Definir limites de fotos
  (ex.: 3 no Simples, 15 no Completo).
- **2.5** Camada de marca d'água: se `is_watermarked=true`, renderizar com marca
  d'água e desabilitar compartilhamento. Usar um card de exemplo (seed) para testar.

**Critério de conclusão:** abrir `/{slug}` de um card-semente mostra os blocos
corretos por plano, Identidade aberta, demais expansíveis, marca d'água on/off
funcionando.
**Operador faz:** nada além de revisar visualmente.

---

## FASE 3 — Quiz de preenchimento (sem IA)
Objetivo: formulário que cria o pedido/card e grava tudo no banco.

- **3.1** Rota `/criar` com o fluxo do quiz em etapas, mapeando 1:1 os campos dos
  blocos. **Sem IA** — só coleta e grava.
- **3.2** Lógica condicional (ex.: "não toma remédio" → pula medicação; plano
  Simples não pede blocos do Completo). Botões de **"gerar exemplo"** com textos-
  modelo pré-escritos (constantes no código, não IA) nos campos de texto livre.
- **3.3** Upload de fotos para o Supabase Storage (respeitando o limite do plano) e
  gravação das URLs.
- **3.4** Ao concluir o quiz: criar `orders` (`status=draft`, `order_code` único) e
  `cards` (`is_watermarked=true`, `slug=order_code`); coletar o **WhatsApp** do dono.

**Critério de conclusão:** preencher o quiz cria pedido + card no banco e leva à
prévia em `/{order_code}` com marca d'água.
**Operador faz:** testar preenchendo o quiz.

---

## FASE 4 — Prévia + LP de venda
Objetivo: a porta de entrada do funil e a prévia funcionando.

- **4.1** LP de venda em `/` (estrutura e blocos de copy provisórios): proposta de
  valor, como funciona, planos (R$10 / R$29,90), CTA para `/criar`.
- **4.2** Página de prévia (`/{order_code}`): mostra o card com marca d'água,
  explica que é preciso comprar para liberar link compartilhável + QR + edição, e
  traz o **botão de compra que leva ao checkout da Yampi** (link externo).
- **4.3** Passar ao checkout da Yampi o identificador do pedido (`order_code`) e o
  **plano escolhido**, de modo que o webhook consiga casar o pagamento com o card.

**Critério de conclusão:** fluxo `LP → /criar → prévia` roda ponta a ponta; o botão
de compra abre o checkout da Yampi já vinculado ao pedido e ao plano.
**Operador faz:** criar o(s) produto(s) na Yampi (Simples e Completo) e colar os
links de checkout; passo a passo fornecido nesta fase.

---

## FASE 5 — WhatsApp: disparo da prévia (Nextags/n8n)
Objetivo: ao terminar o quiz, o dono recebe a prévia no WhatsApp.

- **5.1** Rota `/api/whatsapp` que envia mensagem via Nextags/n8n. Passo a passo
  para o operador pegar `NEXTAGS_WEBHOOK_URL` e `NEXTAGS_API_TOKEN`.
- **5.2** Ao concluir o quiz (Fase 3.4), acionar o disparo da **prévia**: link
  `/{order_code}` + mensagem de que é preciso comprar para liberar o resto.
- **5.3** Tratar falha de envio (retry/log) sem travar o fluxo do usuário.

**Critério de conclusão:** terminar o quiz dispara a mensagem de prévia no WhatsApp
com o link temporário.
**Operador faz:** pegar URL/token do Nextags e testar recebendo a mensagem.

---

## FASE 6 — Webhook da Yampi (pós-compra)
Objetivo: pagamento confirmado transforma a prévia em card final.

- **6.1** Rota `/api/webhooks/yampi` que recebe o evento de pedido pago e **valida a
  assinatura** (`YAMPI_WEBHOOK_SECRET`). Passo a passo para o operador cadastrar a
  URL do webhook na Yampi e pegar o segredo.
- **6.2** Ao receber pagamento: casar pelo `order_code`, marcar `status=paid`,
  definir `plan`, remover marca d'água (`is_watermarked=false`).
- **6.3** Gerar o **slug personalizado** aplicando a regra de colisão
  (nome → apelido → nome+raça → nome+número). Gravar em `cards.slug`.
- **6.4** Gerar o **QR Code** do link personalizado (rota `/api/qr` ou geração
  direta), salvar a imagem no Storage e gravar `qr_url`.

**Critério de conclusão:** um pagamento de teste na Yampi promove o card a pago,
gera slug personalizado único e QR; `/{nome-do-pet}` abre sem marca d'água.
**Operador faz:** cadastrar webhook na Yampi, colar o segredo, fazer um pedido teste.

---

## FASE 7 — WhatsApp: entrega + Área do cliente
Objetivo: fechar o ciclo — entrega final e edição pelo dono.

- **7.1** Após o webhook (Fase 6), disparar a **entrega** no WhatsApp: link
  personalizado `/{nome-do-pet}` + **imagem do QR** (enviar a URL do QR ao Nextags).
- **7.2** Login por **código de verificação** (sem senha): coletar/confirmar e-mail,
  enviar código, validar, criar sessão. Passo a passo para provedor de e-mail se
  necessário.
- **7.3** Área do cliente (`/conta`): dono vê seu(s) card(s), **edita e adiciona**
  informações em todos os blocos, troca/reordena fotos (respeitando o plano).
- **7.4** Garantir que **visitantes só visualizam** (sem edição) e que o card pago é
  publicamente legível no slug personalizado.

**Critério de conclusão:** dono recebe link + QR no WhatsApp, faz login por código,
edita o card e as mudanças aparecem no link público; visitante não consegue editar.
**Operador faz:** testar login e edição; configurar e-mail se pedido.

---

## FASE 8 — Refinamento visual e copy
Objetivo: deixar bonito e vendedor, agora que tudo funciona.

- **8.1** Identidade visual do PetBio (paleta, tipografia, logo/wordmark).
- **8.2** Refinar a LP (copy de venda, prova, planos, CTA) — página por página, com
  referências que o operador colar (prints).
- **8.3** Refinar o card e a prévia (hierarquia dos blocos, capricho visual,
  animação de abrir/fechar) e a área do cliente.
- **8.4** Ajustes de responsividade e microcopy do quiz.

**Critério de conclusão:** LP, card, prévia e área do cliente com aparência
caprichada e coerente; textos revisados.
**Operador faz:** enviar referências visuais e revisar copy.

---

## FASE 9 — Publicação (deploy)
Objetivo: colocar no ar, com segurança.

- **9.1** Deploy em **ambiente de teste** (preview na Vercel) e validação ponta a
  ponta com pedido real de teste.
- **9.2** Passo a passo para apontar o domínio `petbio.com.br` na Vercel.
- **9.3** Deploy em **produção** — **somente após autorização explícita** do
  operador. Reapontar o webhook da Yampi e as URLs do WhatsApp para produção.
- **9.4** Checklist final: env de produção completa, RLS ativa, marca d'água
  correta, fluxo de compra real testado uma vez.

**Critério de conclusão:** produto no ar, compra real de teste concluída com sucesso
(prévia → compra → link + QR → edição).
**Operador faz:** autorizar deploy, apontar domínio, fazer a compra real de teste.

---

### Resumo das fases
0. Fundação • 1. Banco (Supabase) • 2. Template/blocos • 3. Quiz • 4. Prévia + LP •
5. WhatsApp (prévia) • 6. Webhook Yampi • 7. Entrega + Área do cliente •
8. Refino visual/copy • 9. Publicação.
