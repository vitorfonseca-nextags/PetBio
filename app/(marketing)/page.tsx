import Link from "next/link";
import { HeroMotion } from "@/components/marketing/HeroMotion";

const PASSOS = [
  {
    titulo: "Responda o quiz",
    texto: "Identidade, alimentação, saúde, personalidade e histórico do seu pet — sem enrolação.",
  },
  {
    titulo: "Receba a prévia grátis",
    texto: "Na hora, no seu WhatsApp: um link temporário com o card completo do seu jeito.",
  },
  {
    titulo: "Escolha o plano e compre",
    texto: "Gostou? Escolha Simples ou Completo e finalize a compra com segurança.",
  },
  {
    titulo: "Link + QR Code na mão",
    texto: "Compartilhe com quem cuida do seu pet, ou guarde só pra você.",
  },
];

const BLOCOS = [
  { icone: "🐾", nome: "Identidade", desc: "Nome, raça, porte, fotos" },
  { icone: "🍖", nome: "Alimentação", desc: "Ração, horários, proibidos" },
  { icone: "🩺", nome: "Saúde", desc: "Vet, vacinas, medicações" },
  { icone: "🎾", nome: "Personalidade", desc: "Temperamento, manias, rotina" },
  { icone: "🕰️", nome: "Histórico", desc: "Linha do tempo do seu pet" },
];

const BENEFICIOS = [
  { icone: "↻", titulo: "Sempre atualizado", texto: "Edite quando quiser, sem refazer nada do zero." },
  { icone: "🔗", titulo: "Um link só", texto: "Sem app pra instalar, sem PDF perdido no WhatsApp." },
  { icone: "▦", titulo: "QR físico", texto: "Cole na coleira, na casinha ou na porta do canil." },
  { icone: "R$", titulo: "Pagamento único", texto: "Sem mensalidade, sem surpresa na fatura." },
];

const USOS = [
  { emoji: "✈️", titulo: "Viagem", texto: "Pet sitter com tudo em mãos" },
  { emoji: "🏨", titulo: "Creche/hotel", texto: "Ficha completa na entrada" },
  { emoji: "👵", titulo: "Vovó ou vizinho", texto: "Cuidando por alguns dias" },
  { emoji: "🩺", titulo: "Veterinário", texto: "Histórico organizado na consulta" },
];

const PLANOS = [
  {
    nome: "Simples",
    preco: "R$ 10",
    itens: ["Identidade completa", "Alimentação", "Saúde essencial", "Até 3 fotos"],
  },
  {
    nome: "Completo",
    preco: "R$ 29,90",
    itens: ["Tudo do Simples", "Personalidade e rotina", "Histórico (linha do tempo)", "Até 15 fotos"],
    destaque: true,
  },
];

const FAQ = [
  { pergunta: "É assinatura?", resposta: "Não. Pagamento único — o card fica pra sempre no plano que você escolher." },
  { pergunta: "Quanto tempo leva pra criar?", resposta: "Uns 5 minutos. É um quiz rápido, sem enrolação e sem IA — você mesmo preenche." },
  { pergunta: "Como eu recebo?", resposta: "No WhatsApp, com o link do card. Depois da compra, vem também o QR Code pra colar onde quiser." },
  { pergunta: "Dá pra editar depois de comprar?", resposta: "Sim, na área do cliente — sem precisar refazer o quiz." },
  { pergunta: "Funciona pra qualquer bicho?", resposta: "Sim, qualquer espécie. O quiz pede espécie e raça como texto livre." },
];

export default function HomePage() {
  return (
    <main className="moldura-desktop mx-auto w-full max-w-md bg-cream pb-16">
      <header className="flex items-center justify-between px-4 py-6">
        <span className="text-lg font-extrabold text-ink">
          pet<span className="text-brand-600">bio</span>
        </span>
        <Link href="/criar" className="text-sm font-bold text-brand-600">
          Criar agora
        </Link>
      </header>

      <section className="space-y-4 px-4 py-2 text-center">
        <HeroMotion />
        <h1 className="text-3xl font-extrabold text-balance text-ink">
          Todos os dados do seu pet em um só lugar
        </h1>
        <p className="text-ink-soft">
          Pra guardar como registro pessoal ou compartilhar com quem divide os
          cuidados — família, pet sitter, creche, hospedagem.
        </p>
        <Link
          href="/criar"
          className="inline-block rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_24px_-12px_rgba(232,112,58,0.55)]"
        >
          Criar meu PetBio grátis
        </Link>
        <Link href="/florentina" className="block text-sm font-bold text-brand-600">
          Ver um exemplo →
        </Link>
        <p className="text-xs text-ink-soft">
          O quiz é grátis. Você só paga se quiser liberar o link compartilhável e o QR Code.
        </p>
      </section>

      <section className="px-4 py-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-600">Veja como fica</p>
        <Link
          href="/florentina"
          className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_10px_24px_-16px_rgba(46,32,24,0.25)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marketing/florentina-colo.jpg"
            alt="Florentina"
            className="h-14 w-14 shrink-0 rounded-2xl object-cover object-[15%_48%]"
          />
          <div>
            <p className="font-extrabold text-ink">Florentina 🐾</p>
            <p className="text-[11.5px] text-ink-soft">Pug · identidade, alimentação, saúde, rotina e histórico</p>
          </div>
        </Link>
      </section>

      <section className="px-4 py-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-600">Por que existe</p>
        <h2 className="mb-3 text-lg font-extrabold text-balance text-ink">
          Toda vez que alguém cuida do seu pet, você explica tudo de novo
        </h2>
        <div className="space-y-2">
          {[
            "A ração é essa, mas a quantidade certa é...",
            "Ele toma remédio, mas esqueci o horário",
            "O telefone do veterinário tá em algum print",
          ].map((item) => (
            <p key={item} className="flex gap-2 text-sm text-ink-soft">
              <span className="font-bold text-brand-600">×</span> {item}
            </p>
          ))}
        </div>
        <p className="mt-3 font-bold text-ink">O PetBio é isso tudo num link só — sempre atualizado.</p>
        <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs text-ink-soft">
          Não tem relação com pet perdido, não é retrospectiva, não é storytelling. É um
          documento vivo, prático e bonito.
        </p>
      </section>

      <section className="px-4 py-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-600">Como funciona</p>
        <h2 className="mb-4 text-lg font-extrabold text-ink">4 passos</h2>
        <ol className="space-y-4">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-ink">{passo.titulo}</p>
                <p className="text-sm text-ink-soft">{passo.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 py-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-600">O que tem no seu PetBio</p>
        <h2 className="mb-4 text-lg font-extrabold text-ink">5 blocos de informação</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {BLOCOS.map((bloco, i) => (
            <div
              key={bloco.nome}
              className={`rounded-2xl bg-white p-3 shadow-[0_8px_18px_-14px_rgba(46,32,24,0.25)] ${i === BLOCOS.length - 1 && BLOCOS.length % 2 === 1 ? "col-span-2" : ""}`}
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm">
                {bloco.icone}
              </div>
              <p className="text-[13px] font-bold text-ink">{bloco.nome}</p>
              <p className="text-[11px] text-ink-soft">{bloco.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-600">Por que o PetBio</p>
        <div className="space-y-0.5">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="flex gap-3 border-t border-line py-2.5 first:border-t-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-tint text-xs text-sage">
                {b.icone}
              </div>
              <div>
                <p className="text-[13px] font-bold text-ink">{b.titulo}</p>
                <p className="text-[11.5px] text-ink-soft">{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-6">
        <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wide text-brand-600">Quando usar</p>
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-1">
          {USOS.map((u) => (
            <div
              key={u.titulo}
              className="w-36 shrink-0 rounded-2xl bg-white p-3 shadow-[0_8px_18px_-14px_rgba(46,32,24,0.25)]"
            >
              <span className="text-xl">{u.emoji}</span>
              <p className="mt-1.5 text-xs font-bold text-ink">{u.titulo}</p>
              <p className="text-[10.5px] text-ink-soft">{u.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-6">
        <h2 className="mb-4 text-lg font-extrabold text-ink">Planos</h2>
        <div className="flex gap-2.5">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={`relative flex-1 rounded-2xl bg-white p-4 shadow-[0_10px_24px_-18px_rgba(46,32,24,0.25)] ${
                plano.destaque ? "border-2 border-brand-600" : "border-2 border-transparent"
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-2.5 py-0.5 text-[9.5px] font-extrabold text-white">
                  Mais escolhido
                </span>
              )}
              <p className="text-[11px] font-bold uppercase text-ink-soft">{plano.nome}</p>
              <p className="text-xl font-extrabold text-ink">{plano.preco}</p>
              <ul className="mt-2 space-y-1 text-[11px] text-ink-soft">
                {plano.itens.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-ink-soft">
          Você escolhe o plano depois de ver a prévia gerada com as informações do seu pet.
        </p>
      </section>

      <section className="px-4 py-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-600">Perguntas frequentes</p>
        <div>
          {FAQ.map((f) => (
            <details key={f.pergunta} className="group border-t border-line py-3 first:border-t-0">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-bold text-ink">
                {f.pergunta}
                <span className="text-brand-600 group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-2 text-[12.5px] text-ink-soft">{f.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 py-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 p-6 text-center">
          <h2 className="text-lg font-extrabold text-white">Pronto pro PetBio do seu pet?</h2>
          <p className="mt-1 text-[12.5px] text-white/90">Leva menos de 5 minutos, e a prévia é grátis.</p>
          <Link
            href="/criar"
            className="mt-4 inline-block rounded-full bg-white px-6 py-3 text-sm font-extrabold text-brand-600"
          >
            Criar meu PetBio grátis
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-ink-soft">PetBio</footer>
    </main>
  );
}
