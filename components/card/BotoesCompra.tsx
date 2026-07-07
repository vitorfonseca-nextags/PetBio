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
            className="block rounded-lg bg-emerald-700 px-4 py-3 text-center text-sm font-medium text-white"
          >
            Comprar {plano.nome} — {plano.preco}
          </a>
        ) : (
          <p
            key={plano.id}
            className="rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-center text-sm text-neutral-400"
          >
            {plano.nome} ({plano.preco}) — checkout em configuração
          </p>
        ),
      )}
    </div>
  );
}
