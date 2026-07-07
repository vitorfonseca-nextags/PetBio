# SCHEMA.md — Decisões do banco (Fase 1)

SQL completo em `supabase/migrations/0001_init.sql`. Rodar colando no SQL Editor
do Supabase (dashboard do projeto → SQL Editor → New query → colar → Run).

## Blocos do card: JSON, não tabelas próprias

Os 5 blocos (`identidade`, `alimentacao`, `saude`, `personalidade_rotina`,
`historico`) são colunas `jsonb` em `cards`, como sugerido no CLAUDE.md.

**Por quê:** o formato de cada bloco ainda vai mexer nas Fases 2 e 3 (quiz e
template de renderização). Colunas JSON evitam migrations toda vez que um campo
muda, e o volume de dados por card é pequeno — não há ganho real em normalizar
em tabelas separadas neste estágio.

## RLS de `cards`: leitura pública só de `is_watermarked = false`

A anon key (usada no browser) só enxerga cards pagos e sem marca d'água — é
assim que o card público final (`/{nome-do-pet}`) vai funcionar client-side.

A **prévia** (`/{order_code}`, `is_watermarked = true`) não é lida com a anon
key. A rota `/[slug]/page.tsx` (Fase 2) é um Server Component: quando o slug
não bate com nenhum card público, ele busca de novo no servidor usando a
**service role key** (que ignora RLS) pelo `order_code`. Isso implementa "acesso
só por quem tem o link" como uma URL-capability (slug único e não listável) em
vez de tentar modelar "conhece o link" como uma regra de RLS — o Postgres não
tem como saber o que o cliente digitou na barra de endereço.

## RLS de `orders` e `login_codes`: zero acesso público

Essas tabelas têm dado sensível (WhatsApp, e-mail, código de verificação) e
nunca precisam ser lidas direto do browser. RLS ligada, sem nenhuma policy para
`anon`/`authenticated` → acesso negado por padrão. Toda leitura/escrita passa
pelas rotas de API (`/api/...`) usando a service role key no servidor.

**Pegadinha descoberta na Fase 2:** um `select("*, order:orders(...)")` feito
com a anon key, mesmo filtrando um `cards` que a policy libera, sempre volta
`order: null` — a RLS de `orders` barra o *embed*, não só a leitura direta da
tabela. `app/[slug]/page.tsx` contorna isso buscando `plan` numa segunda
consulta com a service role, só depois de confirmar (com a anon key de
verdade) que o card em questão é público.

## Autorização de escrita: na aplicação, não em RLS por dono

O login da área do cliente é por **código de verificação**, não Supabase Auth
— não existe `auth.uid()` para comparar contra um "dono" em uma policy de RLS.
Por isso todas as escritas (quiz, webhook da Yampi, edição na área do cliente)
acontecem via rotas de servidor com a service role key, e a autorização ("é
mesmo o dono deste card?") é verificada no código da rota, não no banco. Isso
será implementado na Fase 7 junto com o login por código.

## Storage: bucket `pet-photos` público

Fotos dos pets ficam num bucket público (leitura liberada para qualquer um que
tenha a URL — mesmo raciocínio de URL-capability do item acima). Upload
bloqueado para `anon` por enquanto; a Fase 3 decide o fluxo definitivo (upload
direto do browser com policy própria, ou via rota de servidor).

**Limitação conhecida:** a marca d'água é aplicada na renderização (Fase 2/8),
não gravada no arquivo da foto. Quem descobrir a URL direta do Storage vê a
foto sem marca d'água. Aceitável para o MVP; se virar problema, dá para trocar
por URLs assinadas (signed URLs) com expiração mais adiante.
