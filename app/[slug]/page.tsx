import { notFound } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { CardComPedido } from "@/lib/types/card";
import { CardView } from "@/components/card/CardView";

const CARD_SELECT = "*, order:orders(order_code, status, plan)";

/**
 * Busca em duas etapas, refletindo a RLS de verdade (docs/SCHEMA.md):
 * 1. Como um visitante público leria — anon key, só cards sem marca d'água.
 * 2. Se não achou, é candidato a prévia: busca de novo no servidor com a
 *    service role (ignora RLS), pelo mesmo slug (que na prévia = order_code).
 *
 * `orders` não tem nenhuma policy pública (tem WhatsApp/e-mail do dono), então
 * o join embutido `order:orders(...)` na consulta com a anon key sempre volta
 * null — a RLS barra o embed, não só a leitura direta da tabela. Por isso,
 * quando o card público é encontrado, buscamos o `plan` à parte com a service
 * role (nunca expondo owner_whatsapp/owner_email pro anon).
 */
async function buscarCard(slug: string): Promise<CardComPedido | null> {
  const { data: publico } = await supabaseBrowser
    .from("cards")
    .select("*")
    .eq("slug", slug)
    .eq("is_watermarked", false)
    .maybeSingle();

  if (publico) {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("order_code, status, plan")
      .eq("id", publico.order_id)
      .single();
    return { ...publico, order } as unknown as CardComPedido;
  }

  const { data: previa } = await supabaseAdmin
    .from("cards")
    .select(CARD_SELECT)
    .eq("slug", slug)
    .eq("is_watermarked", true)
    .maybeSingle();

  return (previa as unknown as CardComPedido) ?? null;
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = await buscarCard(slug);

  if (!card) notFound();

  return <CardView card={card} />;
}
