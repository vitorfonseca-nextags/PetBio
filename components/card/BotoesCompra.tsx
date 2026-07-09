import { linkCheckoutYampi } from "@/lib/yampi";

const PLANOS = [
  {
    id: "simples",
    nome: "Simples",
    preco: "R$ 10",
    env: process.env.NEXT_PUBLIC_YAMPI_CHECKOUT_SIMPLES,
  },
  {
    id: "completo",
    nome: "Completo",
    preco: "R$ 29,90",
    env: process.env.NEXT_PUBLIC_YAMPI_CHECKOUT_COMPLETO,
  },
] as const;

export function BotoesCompra({ orderCode }: { orderCode: string }) {
  return (
    <div className="mb-4 space-y-2">
      {PLANOS.map((plano) =>
        plano.env ? (
          <a
            key={plano.id}
            href={linkCheckoutYampi(plano.env, orderCode)}
            className="block rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-3 text-center text-sm font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(232,112,58,0.55)]"
          >
            Comprar {plano.nome} — {plano.preco}
          </a>
        ) : (
          <p
            key={plano.id}
            className="rounded-full border border-dashed border-line px-4 py-3 text-center text-sm text-ink-soft"
          >
            {plano.nome} ({plano.preco}) — checkout em configuração
          </p>
        ),
      )}
    </div>
  );
}
