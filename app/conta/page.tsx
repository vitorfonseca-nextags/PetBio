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
    const identidade = c.identidade as { nome?: string; foto_principal?: { url: string } };
    return {
      id: c.id as string,
      slug: c.slug as string,
      nome: identidade?.nome ?? "Pet sem nome",
      fotoUrl: identidade?.foto_principal?.url,
      plano: order.plan,
    };
  });

  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream px-4 pt-8 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-ink">Seus cards</h1>
        <form action={sair}>
          <button type="submit" className="text-[13px] font-bold text-ink-soft">
            Sair
          </button>
        </form>
      </div>
      <p className="mt-1 text-[13px] text-ink-soft">{sessao.email}</p>

      {cards.length === 0 ? (
        <p className="mt-8 text-[13px] text-ink-soft">Nenhum card pago encontrado para este e-mail.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_10px_24px_-18px_rgba(46,32,24,0.25)]"
            >
              <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600">
                {card.fotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.fotoUrl} alt={card.nome} className="h-full w-full object-cover object-[50%_25%]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-ink">{card.nome}</p>
                <span className="mt-0.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[9.5px] font-extrabold text-brand-700">
                  {card.plano === "completo" ? "Completo" : "Simples"}
                </span>
                <div className="mt-1.5 flex gap-3 text-[12px] font-bold">
                  <Link href={`/conta/${card.id}`} className="text-brand-600">
                    Editar
                  </Link>
                  <Link href={`/${card.slug}`} className="text-ink-soft" target="_blank">
                    Ver card público
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
