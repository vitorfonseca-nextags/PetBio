import { redirect } from "next/navigation";
import Link from "next/link";
import { sessaoAtual } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sair } from "./actions";

export default async function ContaPage() {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/conta/entrar");

  // Consulta a partir de `cards` (não `orders`): cards.order_id -> orders.id
  // é a direção "muitos-pra-um" garantida (mesmo padrão de app/[slug]/page.tsx)
  // — o embed inverso (orders -> cards) viraria array, já que order_id não
  // tem constraint unique no banco.
  const { data: linhas } = await supabaseAdmin
    .from("cards")
    .select("id, slug, identidade, order:orders!inner(plan, owner_email, status)")
    .eq("order.owner_email", sessao.email)
    .eq("order.status", "paid");

  const cards = (linhas ?? []).map((c) => {
    const order = c.order as unknown as { plan: string | null };
    return {
      id: c.id as string,
      slug: c.slug as string,
      identidade: c.identidade as { nome?: string },
      plano: order.plan,
    };
  });

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pt-10 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Seus cards</h1>
        <form action={sair}>
          <button type="submit" className="text-sm text-neutral-500 underline">
            Sair
          </button>
        </form>
      </div>
      <p className="mt-1 text-sm text-neutral-600">{sessao.email}</p>

      {cards.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-600">Nenhum card pago encontrado para este e-mail.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {cards.map((card) => (
            <li key={card.id} className="rounded-lg border border-neutral-200 p-4">
              <p className="font-semibold">{card.identidade?.nome ?? "Pet sem nome"}</p>
              <p className="text-sm text-neutral-500">
                /{card.slug} · plano {card.plano === "completo" ? "Completo" : "Simples"}
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <Link href={`/conta/${card.id}`} className="font-medium text-emerald-700 underline">
                  Editar
                </Link>
                <Link href={`/${card.slug}`} className="text-neutral-500 underline" target="_blank">
                  Ver card público
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
