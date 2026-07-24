# CLAUDE.md — Stack, Integrações e Convenções

> **Este arquivo é leitura obrigatória antes de qualquer execução.** Ele define a
> stack, as integrações externas, as convenções de código e o modelo de dados.
> Se algo aqui conflitar com um prompt, avise antes de prosseguir.

---

## 1. Stack técnica

| Camada | Ferramenta | Papel |
|---|---|---|
| Framework/App | **Next.js (App Router) + React + TypeScript** | LP, quiz, página do card, área do cliente, rotas de API/webhook |
| Estilo | **Tailwind CSS** | Interface em blocos, bonita, responsiva (mobile-first) |
| Banco de dados | **Supabase** (Postgres + Storage) | Pedidos, cards, fotos, sessões de login por código |
| Versionamento | **GitHub** | Histórico e possibilidade de reverter |
| Checkout | **Yampi** (externo) | Pagamento. NÃO geramos checkout; integramos via webhook |
| WhatsApp/Automação | **NexTags AI** | Dispara prévia e entrega (link + QR) via API + Flow |
| Geração de QR | Biblioteca de QR no servidor (ex.: `qrcode`) | Gera o QR do link personalizado após a compra |
| Hospedagem | **Vercel** | Deploy do Next.js (justificativa na seção 8) |

> **Por que Next.js e não HTML/CSS/JS puro numa hospedagem comum:** o produto tem
> rotas dinâmicas (`/{slug}`), rotas de API (webhook da Yampi, disparo de WhatsApp),
> acesso a banco e geração de QR no servidor. Hospedagem comum (Hostinger etc.) só
> serve HTML/CSS/JS/WordPress estático e não roda o backend que este produto exige.

### Premissas sobre o operador
- Vibe coder, não programador. **Não mexe no banco manualmente.**
- Toda ação externa (criar conta, projeto, pegar chave/token/URL) precisa de
  **passo a passo clicável**, e o valor volta para ser colado em `.env.local`.

---

## 2. Variáveis de ambiente (`.env.local`, nunca commitar)

Manter um `.env.example` espelhando estas chaves (sem os valores reais):

```
# App
NEXT_PUBLIC_APP_URL=            # ex.: https://petbio.cayen.com.br
APP_BASE_DOMAIN=petbio.cayen.com.br

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # uso só no servidor

# Yampi (webhook)
YAMPI_WEBHOOK_SECRET=           # segredo para validar a assinatura do webhook

# NexTags AI (WhatsApp)
NEXTAGS_API_KEY=                     # painel NexTags > Configurações > API (header X-ACCESS-TOKEN)
NEXTAGS_FLOW_PREVIA=                 # ID do Flow com o modelo aprovado da prévia
NEXTAGS_FLOW_ENTREGA=                # ID do Flow com o modelo aprovado da entrega

# Login por código (e-mail), caso use provedor de e-mail
EMAIL_PROVIDER_API_KEY=
```

> As chaves acima são **placeholders**. Cada uma será preenchida na fase que a
> introduz, com passo a passo. Não invente valores.

---

## 3. Integrações externas — como cada uma entra

### 3.1 Supabase (banco + storage de fotos)
- Guarda pedidos, cards, blocos, fotos e sessões de login.
- O operador cria a conta e o projeto (passo a passo na Fase 1) e cola as chaves.
- Fotos dos pets vão no **Supabase Storage**; o banco guarda a URL.

### 3.2 Yampi (checkout externo — via webhook)
- **Não geramos o checkout.** O botão de compra leva ao checkout hospedado na Yampi.
- A Yampi dispara um **webhook de pedido pago** para uma rota de API nossa
  (`/api/webhooks/yampi`). Nessa rota o sistema:
  1. valida a assinatura do webhook (`YAMPI_WEBHOOK_SECRET`);
  2. localiza o pedido/card pelo identificador que passamos ao checkout;
  3. marca o card como **pago**, define o **plano** (Simples/Completo);
  4. gera o **slug personalizado** e o **QR Code**;
  5. remove a marca d'água;
  6. aciona o disparo de entrega no WhatsApp (Nextags/n8n).
- **Documentação a consultar (o operador buscará quando a fase pedir):** painel da
  Yampi → seção de Webhooks/Integrações (evento de pedido pago) e a referência da
  API para o formato do payload. O Claude Code deve dizer exatamente **onde clicar
  para pegar o segredo do webhook e cadastrar a URL** `.../api/webhooks/yampi`.

### 3.3 NexTags AI (WhatsApp)
- Dois disparos no fluxo:
  1. **Prévia:** logo após o quiz, manda no WhatsApp o link temporário
     (`/{codigo-do-pedido}`) com a mensagem de que é preciso comprar para liberar
     link compartilhável + QR + edição.
  2. **Entrega:** após o webhook da Yampi confirmar o pagamento, manda o link
     personalizado (`/{nome-do-pet}`) **e a imagem do QR Code**.
- **Mecanismo real da API** (descoberto na Fase 5/7.1, `lib/nextags.ts`): a API é
  orientada a contato. Endpoints livres de texto/arquivo (`send/text`, `send/file`)
  só entregam pra quem já mandou mensagem pro número nas últimas 24h — como o dono
  do pet nunca falou com a gente antes, esses disparos exigem um **modelo de
  mensagem WhatsApp aprovado** (categoria Utilidade), montado como um **Flow** no
  painel visual da NexTags. Fluxo de envio: cria/acha o contato pelo telefone
  (`POST /contacts`) → seta os "custom fields" do contato com os dados dinâmicos
  (campos próprios do PetBio, nomes claros — `nome_tutor`, `nome_pet`,
  `link_card_pet`, `link_editar_pet`, `qr_code_pet`, `numero_pedido`; IDs fixos em
  `lib/nextags.ts`; **não** reaproveitam os genéricos `name_a`/`access_url`/etc. do
  Revivo, mesmo os Flows tendo sido clonados de lá) → dispara o Flow
  (`POST /contacts/{id}/send/{flow_id}`), que usa o modelo aprovado referenciando
  esses campos. `nome_tutor` só fica disponível a partir do checkout da Yampi (na
  prévia, pré-compra, fica vazio).
- **Entrega (Fase 7.1) é um único Flow** (`NEXTAGS_FLOW_ENTREGA`), já 100% adaptado
  pro PetBio e com o modelo aprovado: avisa "pedido aprovado", e ao tocar em
  "Criar Acesso" (sem sair do WhatsApp, sem link externo — o slug já é automático)
  entrega o link do card, o link de edição (área do cliente) e o QR Code.
- O operador precisa criar o Flow de **prévia** (ainda não existe) e colar o ID em
  `NEXTAGS_FLOW_PREVIA`.
- O QR é gerado no nosso backend; ao NexTags enviamos a **URL da imagem do QR**
  (padrão que já funciona no fluxo do Revivo: manda-se a variável da imagem, não só
  o link).

---

## 4. Modelo de dados (orientação inicial — refinar na Fase 1)

Tabelas mínimas no Supabase:

**`orders`** (o pedido/rascunho que nasce no quiz)
- `id` (uuid)
- `order_code` (texto curto único — vira o slug temporário `/{codigo-do-pedido}`)
- `status` (`draft` | `preview_sent` | `paid`)
- `plan` (`null` | `simples` | `completo`)
- `owner_whatsapp` (texto)
- `owner_email` (texto, preenchido só na compra)
- `created_at`, `updated_at`

**`cards`** (o card em si, 1:1 com pedido pago)
- `id` (uuid)
- `order_id` (fk → orders)
- `slug` (texto único — o `/{nome-do-pet}` personalizado)
- `is_watermarked` (bool — `true` na prévia, `false` após pagar)
- `qr_url` (texto — URL da imagem do QR no Storage)
- dados dos blocos (ver abaixo)
- `created_at`, `updated_at`

**Blocos do card** (podem ser colunas JSON em `cards` ou tabelas próprias —
decidir na Fase 1; JSON tende a ser mais simples para este escopo):
- `identidade` (sempre presente): nome, apelido, especie, raca, sexo,
  nascimento/idade, porte, cores, marcas_distintivas, foto_principal, fotos[]
- `alimentacao`: racao_marca_tipo, quantidade, horarios, petiscos, proibidos, onde_fica
- `saude`: vet_nome, vet_telefone, clinica_emergencia, vacinas, condicoes, medicacoes[]
- `personalidade_rotina`: temperamento, medos, manias, comandos, rotina_passeio,
  rotina_sono, brinquedos, lugares_favoritos
- `historico`: lista cronológica de eventos { data, titulo, descricao }

**`login_codes`** (login sem senha por código de verificação)
- `id`, `order_id` (ou `email`), `code`, `expires_at`, `used_at`

> **Segurança do Supabase:** ativar RLS (Row Level Security). Leitura pública apenas
> do card **já pago e sem marca d'água** (visualização). Edição só pelo dono
> autenticado por código. A prévia com marca d'água é acessível só por quem tem o
> link temporário. O Claude Code deve propor as policies na Fase 1.

---

## 5. Regras de negócio (fechadas)

### Planos (pagamento único, página permanente para ambos)
- **Simples — R$10:** bloco **Identidade** + **Alimentação** + **Saúde essencial**.
  Menos fotos (definir limite na Fase 2, ex.: até 3 fotos).
- **Completo — R$29,90:** tudo do Simples + **Personalidade/Rotina** + **Histórico
  (timeline)** + **mais fotos** (ex.: até 15).
- O plano é definido no checkout da Yampi e confirmado pelo webhook.

### Regra do slug personalizado (nome repetido)
Slug base = nome do pet **normalizado** (minúsculas, sem acento, espaços→hífen,
remover caracteres inválidos). Se já existir, resolver **nesta ordem**:
1. **apelido** do pet (normalizado) → ex.: `fred`
2. **nome + raça** → ex.: `frederico-golden`
3. **nome + número curto** → ex.: `frederico-2`, `frederico-3`…

Enquanto não pago, o card vive no **slug temporário** = `order_code`
(`/{codigo-do-pedido}`). O slug personalizado só é atribuído após o pagamento.

### Marca d'água
- Prévia (`status != paid`): card renderizado **com marca d'água** e sem QR
  compartilhável; ações de compartilhar desabilitadas.
- Pós-pagamento: marca d'água removida, slug personalizado ativo, QR gerado.

### Login da área do cliente
- **Sem senha.** Código de verificação enviado ao e-mail (e/ou WhatsApp). O e-mail
  é coletado só na compra (não no funil), para não adicionar atrito no quiz.

---

## 6. Convenções de código

- **TypeScript** em tudo. Componentes funcionais React.
- **Tailwind** para estilo; nada de CSS solto quando um utilitário resolve.
- Estrutura de pastas sugerida (App Router):
  ```
  /app
    /(marketing)/page.tsx        # LP de venda
    /criar/...                   # quiz
    /[slug]/page.tsx             # card público (prévia com marca d'água OU final)
    /conta/...                   # área do cliente (login por código + edição)
    /api/webhooks/yampi/route.ts # recebe pedido pago
  /lib                           # supabase client, slug, qr, nextags, validações
  /components                    # blocos do card, componentes do quiz
  /docs                          # PLANO.md, PROMPTS.md
  ```
- **Sem segredos no código** — só via env. Manter `.env.example`.
- **Mobile-first**: a maioria vai abrir no celular (o link chega pelo WhatsApp).
- Acessibilidade básica: contraste, foco visível, textos alternativos nas imagens.

---

## 7. Estados do card (resumo visual)

```
[quiz preenchido] --> orders.status = draft, cria card com is_watermarked=true, slug=order_code
        |
        v
[prévia no WhatsApp] --> orders.status = preview_sent (link temporário /{order_code})
        |
        v
[compra na Yampi] --> webhook: status=paid, define plan, gera slug personalizado,
                      is_watermarked=false, gera qr_url, dispara entrega no WhatsApp
        |
        v
[área do cliente] --> dono edita/adiciona; visitantes só visualizam
```

---

## 8. Hospedagem — recomendação

**Vercel.** Motivos:
- É a plataforma nativa do Next.js (deploy, rotas de API/serverless e preview
  automático por commit funcionam sem configuração extra).
- Preview URLs por branch facilitam validar em ambiente de teste antes de produção
  (atende à regra 4 do README).
- Domínio próprio se aponta facilmente — decidido na Fase 9.2: subdomínio
  `petbio.cayen.com.br` (mesmo domínio já usado pela Cayen Joias/Revivo em
  `presente.cayen.com.br`), em vez de um domínio `petbio.com.br` dedicado.
- Alternativa: Cloudflare (Pages/Workers) é viável, mas exige mais ajuste para o
  runtime do Next. Hostinger **não** serve (só estático/WordPress).

> Decisão de deploy e apontamento de domínio ficam para a fase de publicação, com
> passo a passo. Nada vai ao ar sem autorização explícita do operador.
