# PetBio

Card digital do pet: uma página bonita, organizada em blocos, que reúne todas as
informações de cuidado de um animal num só lugar — para o dono **guardar** como
registro pessoal e **compartilhar** com quem divide os cuidados (família, pet
sitter, creche, hospedagem).

Um pet por card, cada um com **link e QR Code próprios**.

> **O que o PetBio NÃO é:** não tem relação com pet perdido, não é retrospectiva,
> não é storytelling. É um documento vivo, prático e bonito.

**Posicionamento:** "Todos os dados do seu pet em um só lugar, para guardar ou
compartilhar."
**Tom:** prático e utilitário, com um leve toque emocional — "cuidar do pet do
jeito que só o dono sabe".

---

## Como este repositório funciona

Este é o **repositório base**: o esqueleto que guia toda a construção. Ele contém
o plano completo dividido em fases e os prompts prontos para executá-lo.

- **`README.md`** (este arquivo) — visão geral e **regras de trabalho**.
- **`CLAUDE.md`** — stack técnica, integrações e convenções. **Leitura obrigatória
  antes de qualquer execução.**
- **`docs/PLANO.md`** — o projeto quebrado em fases (0, 1, 2…) e etapas pequenas.
- **`docs/PROMPTS.md`** — os prompts prontos, um por fase, para colar no Claude Code.

### Fluxo de trabalho do operador (Vitoro)

1. Salvar este repositório base numa pasta e subir no GitHub.
2. Abrir a pasta no VS Code com o Claude Code.
3. Colar os prompts de `docs/PROMPTS.md` **um de cada vez**, na ordem.
4. Ao fim de cada fase, revisar, autorizar publicação (quando aplicável) e seguir.

---

## REGRAS DE TRABALHO (para o Claude Code — leia antes de cada execução)

Estas regras são inegociáveis e valem em toda sessão. **Antes de executar qualquer
etapa, releia este bloco e o `CLAUDE.md`.**

1. **Trabalhe por fases e etapas.** Execute exatamente a etapa pedida no prompt
   atual. Não pule adiante, não antecipe fases futuras.

2. **Uma fase por vez, com checkpoint.** Ao concluir uma fase, PARE. Escreva um
   resumo do que foi feito, liste o que EU (operador) preciso fazer manualmente
   (criar conta, colar chave, testar algo) e **pergunte se pode seguir para a
   próxima fase**. Só continue após meu "pode seguir".

3. **Nunca publique no ar sem minha autorização explícita.** Deploy para produção
   só acontece quando eu disser, com todas as letras, que autorizo o deploy.

4. **Alterações sensíveis vão primeiro para ambiente de teste.** Qualquer mudança
   que possa quebrar o que já está no ar deve ser feita/validada em ambiente de
   teste (preview/staging) antes de ir para produção.

5. **Quando precisar de algo externo, me dê o passo a passo.** Sou vibe coder, não
   programador. Se precisar que eu crie uma conta, um projeto, ou pegue uma chave
   de API/token/URL, escreva o passo a passo clicável (onde entrar, onde clicar, o
   que copiar, o que colar de volta). **Eu não mexo em banco de dados manualmente.**

6. **Confirme antes de assumir.** Se faltar uma informação (uma URL, uma chave, uma
   decisão), pergunte — não invente valor nem chute credencial.

7. **Segredos nunca no código.** Chaves, tokens e URLs sensíveis vão em variáveis de
   ambiente (`.env.local`), nunca commitados. Mantenha um `.env.example` atualizado.

8. **Commits pequenos e descritivos.** A cada etapa concluída, um commit com mensagem
   clara. Isso permite voltar atrás se algo quebrar.

9. **O quiz não usa IA.** É um formulário que grava respostas no banco e monta o
   template. Custo de IA por card = zero. Não introduza chamadas de IA no fluxo do
   quiz nem na geração do card.

10. **Foco no escopo desta fase.** Sem upsell, sem produto físico. Só o produto que
    a pessoa acessa e compra: LP → quiz → prévia → (compra externa Yampi) → link
    personalizado + QR + WhatsApp → área do cliente.

---

## Escopo desta primeira entrega (o que está DENTRO)

- **LP de venda** do PetBio.
- **Quiz** de preenchimento dos blocos (sem IA, com lógica condicional e botões de
  "gerar exemplo").
- **Prévia com marca d'água** em domínio temporário (`/{codigo-do-pedido}`).
- **Entrega da prévia no WhatsApp** (via Nextags/n8n).
- **Integração com o webhook da Yampi** (checkout é externo — NÃO geramos checkout).
- **Pós-compra:** conversão para domínio personalizado (`/{nome-do-pet}`), remoção
  da marca d'água, geração do QR Code, disparo da entrega no WhatsApp.
- **Área do cliente:** login por código de verificação (sem senha); dono edita e
  adiciona informações; quem recebe o link só visualiza.

### O que está FORA (não fazer agora)

- Upsell / order bump / downsell.
- Qualquer produto físico ou integração de logística/rastreio.
- Checkout próprio (usamos o da Yampi).
