import { NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  assinaturaYampiValida,
  extrairEmailCliente,
  extrairMetadata,
  extrairNomeCliente,
  extrairPlano,
} from "@/lib/yampi-webhook";
import { gerarSlugPersonalizado } from "@/lib/slug";
import { gerarQrCode } from "@/lib/qr";
import { dispararEntregaWhatsapp } from "@/lib/nextags";

/**
 * Webhook de pedido pago da Yampi. A mesma loja (Cayen Joias) processa
 * pedidos de joias também — a maioria dos eventos que chegam aqui não têm
 * nada a ver com o PetBio, então ignoramos (200, sem erro) tudo que não tem
 * `metadata.order_code` ou que não bate com nenhum pedido nosso. Detalhes em
 * docs/YAMPI.md e docs/WEBHOOK.md.
 */
export async function POST(request: Request) {
  const corpoBruto = await request.text();
  const assinatura = request.headers.get("x-yampi-hmac-sha256");
  const segredo = process.env.YAMPI_WEBHOOK_SECRET;

  if (!segredo) {
    console.error("YAMPI_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ error: "webhook não configurado" }, { status: 500 });
  }

  if (!assinaturaYampiValida(corpoBruto, assinatura, segredo)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const payload = JSON.parse(corpoBruto);

  if (payload.event !== "order.paid") {
    return NextResponse.json({ ok: true, ignorado: payload.event });
  }

  const orderCode = extrairMetadata(payload.resource, "order_code");
  if (!orderCode) {
    // provavelmente um pedido de joia da mesma loja — não é nosso
    return NextResponse.json({ ok: true, ignorado: "sem metadata.order_code" });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, owner_whatsapp")
    .eq("order_code", orderCode)
    .maybeSingle();

  if (!order) {
    console.warn("Webhook Yampi: order_code sem pedido correspondente:", orderCode);
    return NextResponse.json({ ok: true, ignorado: "order_code não encontrado" });
  }

  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("id, slug, identidade, is_watermarked")
    .eq("order_id", order.id)
    .maybeSingle();

  if (!card) {
    console.error("Webhook Yampi: pedido sem card:", orderCode);
    return NextResponse.json({ error: "card não encontrado" }, { status: 500 });
  }

  // idempotência: se já processamos esse pedido, não repete (evita gerar
  // um segundo slug/QR se a Yampi reentregar o mesmo evento)
  if (!card.is_watermarked) {
    return NextResponse.json({ ok: true, ja_processado: true, slug: card.slug });
  }

  const plano = extrairPlano(payload.resource);
  if (!plano) {
    console.error(
      "Webhook Yampi: não identifiquei o plano pelos SKUs do pedido:",
      orderCode,
      JSON.stringify(payload.resource?.items),
    );
    return NextResponse.json({ error: "plano não identificado" }, { status: 500 });
  }

  // e-mail e nome do cliente vêm do checkout da Yampi — usados no login por
  // código (Fase 7) e na mensagem de entrega. Ausência não bloqueia o pagamento.
  const email = extrairEmailCliente(payload.resource);
  const nomeDono = extrairNomeCliente(payload.resource);

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", plan: plano, ...(email ? { owner_email: email } : {}) })
    .eq("id", order.id);

  const slug = await gerarSlugPersonalizado(card.identidade);
  const qrUrl = await gerarQrCode(slug);

  await supabaseAdmin
    .from("cards")
    .update({ slug, is_watermarked: false, qr_url: qrUrl })
    .eq("id", card.id);

  if (order.owner_whatsapp) {
    const identidade = card.identidade as { nome?: string };
    after(() =>
      dispararEntregaWhatsapp({
        whatsapp: order.owner_whatsapp,
        orderCode,
        slug,
        qrUrl,
        nomePet: identidade?.nome ?? "seu pet",
        nomeDono: nomeDono ?? undefined,
      }),
    );
  }

  return NextResponse.json({ ok: true, slug });
}
