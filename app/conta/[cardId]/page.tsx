import { notFound, redirect } from "next/navigation";
import { sessaoAtual } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Card, Plano } from "@/lib/types/card";
import { EditorCard } from "@/components/conta/EditorCard";

export default async function EditarCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/conta/entrar");

  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("*, order:orders(owner_email, status, plan)")
    .eq("id", cardId)
    .maybeSingle();

  const order = card?.order as unknown as { owner_email: string | null; status: string; plan: Plano | null } | null;

  if (!card || !order || order.owner_email !== sessao.email || order.status !== "paid") {
    notFound();
  }

  return <EditorCard card={card as unknown as Card} plano={order.plan} />;
}
