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

const PLANOS = [
  {
    nome: "Simples",
    preco: "R$ 10",
    descricao: "pagamento único",
    itens: ["Identidade completa", "Alimentação", "Saúde essencial", "Até 3 fotos"],
  },
  {
    nome: "Completo",
    preco: "R$ 29,90",
    descricao: "pagamento único",
    itens: [
      "Tudo do Simples",
      "Personalidade e rotina",
      "Histórico (linha do tempo)",
      "Até 15 fotos",
    ],
    destaque: true,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <span className="text-lg font-bold">PetBio</span>
        <Link href="/criar" className="text-sm font-medium underline underline-offset-2">
          Criar agora
        </Link>
      </header>

      <section className="space-y-4 py-6 text-center">
        <HeroMotion />
        <h1 className="text-3xl font-bold text-balance">
          Todos os dados do seu pet em um só lugar
        </h1>
        <p className="text-neutral-600">
          Pra guardar como registro pessoal ou compartilhar com quem divide os
          cuidados — família, pet sitter, creche, hospedagem.
        </p>
        <Link
          href="/criar"
          className="inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Criar meu PetBio grátis
        </Link>
        <p className="text-xs text-neutral-400">
          O quiz é grátis. Você só paga se quiser liberar o link compartilhável e o QR Code.
        </p>
      </section>

      <section className="space-y-3 py-6">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          O que o PetBio não é
        </p>
        <p className="text-sm text-neutral-600">
          Não tem relação com pet perdido, não é retrospectiva, não é
          storytelling. É um documento vivo, prático e bonito — um pet por
          card, cada um com link e QR Code próprios.
        </p>
      </section>

      <section className="space-y-4 py-6">
        <h2 className="text-lg font-bold">Como funciona</h2>
        <ol className="space-y-4">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{passo.titulo}</p>
                <p className="text-sm text-neutral-600">{passo.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4 py-6">
        <h2 className="text-lg font-bold">Planos</h2>
        <div className="space-y-4">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={`rounded-xl border p-4 ${
                plano.destaque ? "border-emerald-700 ring-1 ring-emerald-700" : "border-neutral-300"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{plano.nome}</p>
                <p className="text-sm text-neutral-500">{plano.descricao}</p>
              </div>
              <p className="text-2xl font-bold">{plano.preco}</p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                {plano.itens.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400">
          Você escolhe o plano depois de ver a prévia gerada com as
          informações do seu pet.
        </p>
        <Link
          href="/criar"
          className="block rounded-full bg-neutral-900 px-6 py-3 text-center text-sm font-semibold text-white"
        >
          Criar meu PetBio grátis
        </Link>
      </section>

      <footer className="py-8 text-center text-xs text-neutral-400">PetBio</footer>
    </main>
  );
}
