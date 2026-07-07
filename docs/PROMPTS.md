# PROMPTS.md — Prompts de execução (Claude Code)

Cole estes prompts no **Claude Code**, **um de cada vez**, na ordem. Cada prompt
executa uma fase do `PLANO.md`. Ao terminar uma fase, o Claude Code deve parar,
resumir, listar o que você precisa fazer manualmente e **perguntar se pode seguir**.

**Regra permanente:** todo prompt assume que o Claude Code releu `README.md` (regras)
e `CLAUDE.md` (stack) antes de executar. O **Prompt 0** já força isso.

> Se o Claude Code pedir uma chave/URL/decisão, confira o valor duas vezes antes de
> colar. O erro mais comum do vibe coder é mandar a informação trocada.

---

## PROMPT 0 — Onboarding + Fase 0 (fundação)

```
Você é o engenheiro deste projeto (PetBio). Antes de escrever qualquer código,
leia por completo os arquivos README.md e CLAUDE.md deste repositório e me devolva,
em 8 a 12 linhas, a prova de que entendeu: o que é o produto, o fluxo do funil, os
dois planos, a stack, e as 10 regras de trabalho. NÃO escreva código ainda nesta
resposta — só a confirmação.

Depois que eu responder "pode seguir", execute a FASE 0 do docs/PLANO.md:
- 0.1 inicializar Next.js (App Router) + TypeScript + Tailwind rodando em localhost;
- 0.2 criar a estrutura de pastas da seção 6 do CLAUDE.md, o .env.example com todas
  as chaves vazias e o .gitignore cobrindo .env.local;
- 0.3 inicializar git e primeiro commit; e então me dar o passo a passo clicável
  para eu criar o repositório no GitHub e subir.

Trabalhe só a Fase 0. Ao terminar, pare, resuma, liste o que eu preciso fazer, e
pergunte se pode seguir para a Fase 1.
```

---

## PROMPT 1 — Fase 1 (banco Supabase)

```
Releia README.md e CLAUDE.md. Execute a FASE 1 do docs/PLANO.md (banco Supabase).
- 1.1 me dê o passo a passo clicável para criar conta e projeto no Supabase e me
  diga exatamente quais 3 chaves colar no .env.local (URL, anon key, service role).
  Espere eu colar antes de prosseguir com o que depender delas.
- 1.2 crie os clients Supabase (browser e servidor) em /lib.
- 1.3 crie as tabelas orders, cards e login_codes e o bucket de Storage para fotos,
  seguindo o modelo de dados do CLAUDE.md. Decida blocos como JSON em cards (padrão)
  ou tabelas próprias e documente a escolha. Como eu NÃO mexo em banco manualmente,
  ou execute o SQL via service role, ou me diga com precisão onde colar/rodar.
- 1.4 defina e aplique as RLS policies descritas no CLAUDE.md e teste com uma linha
  de exemplo.

Lembre-se: sem segredo no código, tudo via env. Ao terminar, pare, resuma, liste o
que eu preciso fazer e pergunte se pode seguir para a Fase 2.
```

---

## PROMPT 2 — Fase 2 (template/blocos do card)

```
Releia README.md e CLAUDE.md. Execute a FASE 2 do docs/PLANO.md (renderização do
card em blocos; ainda sem quiz).
- 2.1 tipos TypeScript dos blocos (Identidade, Alimentação, Saúde,
  Personalidade/Rotina, Histórico).
- 2.2 rota /[slug]/page.tsx que busca o card pelo slug e renderiza.
- 2.3 componentes dos blocos: Identidade SEMPRE aberta; os demais expansíveis
  (abre/fecha); Histórico como timeline; tudo mobile-first.
- 2.4 regras de plano na renderização (Simples = Identidade + Alimentação + Saúde
  essencial, menos fotos; Completo = todos + mais fotos). Defina os limites de fotos
  e documente.
- 2.5 camada de marca d'água: is_watermarked=true renderiza com marca d'água e
  desabilita compartilhamento. Crie um card-semente (seed) para testar.

Estrutura funcional já basta; o capricho visual fica para a Fase 8. Ao terminar,
pare, resuma e pergunte se pode seguir para a Fase 3.
```

---

## PROMPT 3 — Fase 3 (quiz sem IA)

```
Releia README.md e CLAUDE.md. Execute a FASE 3 do docs/PLANO.md (quiz de
preenchimento, SEM IA).
- 3.1 rota /criar com o quiz em etapas, mapeando 1:1 os campos dos blocos. É um
  formulário que coleta e grava — nada de IA.
- 3.2 lógica condicional (ex.: "não toma remédio" pula medicação; plano Simples não
  pede blocos do Completo) e botões de "gerar exemplo" com textos-modelo
  pré-escritos como constantes no código (não IA) nos campos de texto livre.
- 3.3 upload de fotos ao Supabase Storage respeitando o limite do plano; gravar URLs.
- 3.4 ao concluir: criar orders (status=draft, order_code único) e cards
  (is_watermarked=true, slug=order_code), e coletar o WhatsApp do dono. Redirecionar
  para a prévia em /{order_code}.

Ao terminar, pare, resuma e pergunte se pode seguir para a Fase 4.
```

---

## PROMPT 4 — Fase 4 (prévia + LP de venda)

```
Releia README.md e CLAUDE.md. Execute a FASE 4 do docs/PLANO.md (LP + prévia).
- 4.1 LP de venda em / com estrutura e copy provisórios: proposta de valor, como
  funciona, os planos (R$10 e R$29,90) e CTA para /criar.
- 4.2 página de prévia /{order_code}: card com marca d'água + aviso de que é preciso
  comprar para liberar link compartilhável, QR e edição + botão de compra que leva
  ao checkout externo da Yampi.
- 4.3 ao ir para a Yampi, passe o identificador do pedido (order_code) e o plano
  escolhido, para o webhook casar o pagamento depois. Me diga como devo cadastrar os
  produtos (Simples e Completo) na Yampi e onde pegar os links de checkout; espere eu
  colar os links.

Copy definitiva fica para a Fase 8. Ao terminar, pare, resuma, liste o que eu preciso
fazer na Yampi e pergunte se pode seguir para a Fase 5.
```

---

## PROMPT 5 — Fase 5 (WhatsApp: prévia)

```
Releia README.md e CLAUDE.md. Execute a FASE 5 do docs/PLANO.md (disparo da prévia
no WhatsApp via Nextags/n8n).
- 5.1 rota /api/whatsapp que envia mensagem via Nextags/n8n; me dê o passo a passo
  para pegar NEXTAGS_WEBHOOK_URL e NEXTAGS_API_TOKEN e espere eu colar no .env.local.
- 5.2 ao concluir o quiz (3.4), acionar o disparo da PRÉVIA: link /{order_code} +
  mensagem explicando que é preciso comprar para liberar o resto.
- 5.3 tratar falha de envio (retry/log) sem travar o fluxo do usuário.

Ao terminar, pare, resuma e pergunte se pode seguir para a Fase 6.
```

---

## PROMPT 6 — Fase 6 (webhook da Yampi)

```
Releia README.md e CLAUDE.md. Execute a FASE 6 do docs/PLANO.md (pós-compra via
webhook da Yampi).
- 6.1 rota /api/webhooks/yampi que recebe o evento de pedido pago e valida a
  assinatura com YAMPI_WEBHOOK_SECRET; me dê o passo a passo para cadastrar a URL do
  webhook na Yampi e pegar o segredo; espere eu colar.
- 6.2 ao receber pagamento: casar pelo order_code, status=paid, definir plan,
  is_watermarked=false.
- 6.3 gerar o slug personalizado aplicando a regra de colisão do CLAUDE.md
  (nome → apelido → nome+raça → nome+número) e gravar em cards.slug.
- 6.4 gerar o QR Code do link personalizado, salvar a imagem no Storage e gravar
  qr_url.

Valide com um pedido de teste. Ao terminar, pare, resuma e pergunte se pode seguir
para a Fase 7.
```

---

## PROMPT 7 — Fase 7 (entrega no WhatsApp + área do cliente)

```
Releia README.md e CLAUDE.md. Execute a FASE 7 do docs/PLANO.md (entrega + edição).
- 7.1 após o webhook, disparar a ENTREGA no WhatsApp: link personalizado
  /{nome-do-pet} + imagem do QR (enviar ao Nextags a URL do QR).
- 7.2 login por código de verificação (sem senha): coletar/confirmar e-mail, enviar
  código, validar e criar sessão; me dê o passo a passo se for preciso um provedor
  de e-mail e espere eu colar a chave.
- 7.3 área do cliente /conta: dono vê seu(s) card(s), edita e adiciona informações
  em todos os blocos e gerencia fotos respeitando o plano.
- 7.4 garantir que visitantes só visualizam e que o card pago é publicamente legível
  no slug personalizado.

Ao terminar, pare, resuma e pergunte se pode seguir para a Fase 8.
```

---

## PROMPT 8 — Fase 8 (refino visual e copy)

```
Releia README.md e CLAUDE.md. Execute a FASE 8 do docs/PLANO.md (refino visual/copy).
Agora que tudo funciona, vamos deixar bonito. Trabalharemos PÁGINA POR PÁGINA e eu
vou te enviar referências (prints) ao longo do caminho.
- 8.1 proponha uma identidade visual (paleta, tipografia, wordmark) coerente com o
  tom "prático e utilitário com leve toque emocional" e espere meu ok.
- 8.2 refine a LP (copy de venda, prova, planos, CTA).
- 8.3 refine o card e a prévia (hierarquia dos blocos, capricho, animação de
  abrir/fechar) e a área do cliente.
- 8.4 ajuste responsividade e a microcopy do quiz.

Faça uma subetapa de cada vez e me mostre antes de ir para a próxima. Ao terminar,
pare, resuma e pergunte se pode seguir para a Fase 9.
```

---

## PROMPT 9 — Fase 9 (publicação)

```
Releia README.md e CLAUDE.md. Execute a FASE 9 do docs/PLANO.md (deploy) — lembrando
que NADA vai a produção sem minha autorização explícita.
- 9.1 faça deploy em ambiente de teste (preview na Vercel) e valide o fluxo ponta a
  ponta com um pedido de teste; me dê o passo a passo do que eu preciso fazer.
- 9.2 me dê o passo a passo para apontar o domínio petbio.com.br na Vercel.
- 9.3 só depois que eu escrever explicitamente que autorizo, faça o deploy de
  produção e me instrua a reapontar o webhook da Yampi e as URLs do WhatsApp para
  produção.
- 9.4 rode o checklist final: env de produção completa, RLS ativa, marca d'água
  correta, e uma compra real de teste concluída.

Ao terminar, pare e me entregue o resumo final do que está no ar.
```

---

### Dicas de operação (método vibe coder)
- Execute o plano **na ordem, sem parar para mexer no visual** até a Fase 8. Deixe
  "feião mas funcionando"; o refino é depois.
- Se uma fase falhar, não pule: peça ao Claude Code para explicar e corrigir dentro
  da própria fase antes de seguir.
- Faça **commit** ao fim de cada fase (a regra 8 do README já pede). Assim dá para
  voltar atrás se algo quebrar.
- Ao colar chaves/URLs pedidas, confira duas vezes — informação trocada é o erro
  mais comum.
