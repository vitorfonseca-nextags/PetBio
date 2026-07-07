"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { gerarOrderCode } from "@/lib/order-code";
import { limiteFotos } from "@/lib/plano";

async function uploadFoto(orderCode: string, file: File, indice: number): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const caminho = `${orderCode}/${indice}-${Date.now()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from("pet-photos")
    .upload(caminho, file, { contentType: file.type || undefined, upsert: true });
  if (error) throw new Error(`Falha no upload da foto: ${error.message}`);
  return supabaseAdmin.storage.from("pet-photos").getPublicUrl(caminho).data.publicUrl;
}

/**
 * Cria o pedido (draft, plan=null) + card (watermarked) a partir das
 * respostas do quiz e redireciona pra prévia. O quiz não pergunta plano —
 * coleta tudo, como se fosse o Completo; o plano só é escolhido na compra e
 * gravado pelo webhook da Yampi (Fase 6). Nada de IA aqui — só validação e
 * gravação. Ver docs/QUIZ.md.
 */
export async function criarPedido(formData: FormData) {
  const whatsapp = formData.get("whatsapp");
  const dadosRaw = formData.get("dados");

  if (typeof whatsapp !== "string" || whatsapp.trim().length < 8) {
    throw new Error("Informe um WhatsApp válido.");
  }
  if (typeof dadosRaw !== "string") {
    throw new Error("Dados do quiz ausentes.");
  }

  const dados = JSON.parse(dadosRaw) as {
    identidade: Record<string, unknown> & { nome?: string; especie?: string };
    alimentacao: Record<string, unknown>;
    saude: Record<string, unknown>;
    personalidade_rotina: Record<string, unknown>;
    historico: unknown[];
  };

  if (!dados.identidade?.nome || !dados.identidade?.especie) {
    throw new Error("Nome e espécie do pet são obrigatórios.");
  }

  let orderId: string | null = null;
  let orderCode = "";

  for (let tentativa = 0; tentativa < 5 && !orderId; tentativa++) {
    orderCode = gerarOrderCode();
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_code: orderCode,
        status: "draft",
        owner_whatsapp: whatsapp.trim(),
      })
      .select("id")
      .single();

    if (!error) {
      orderId = data.id;
    } else if (error.code !== "23505") {
      throw new Error(`Falha ao criar pedido: ${error.message}`);
    }
  }
  if (!orderId) throw new Error("Não foi possível gerar um código de pedido único. Tente de novo.");

  try {
    const limite = limiteFotos(null); // quiz coleta como se fosse Completo
    const fotoPrincipalFile = formData.get("fotoPrincipal");
    const fotosFiles = formData
      .getAll("fotos")
      .filter((f): f is File => f instanceof File)
      .slice(0, limite);

    const [fotoPrincipalUrl, fotosUrls] = await Promise.all([
      fotoPrincipalFile instanceof File
        ? uploadFoto(orderCode, fotoPrincipalFile, 0)
        : Promise.resolve(undefined),
      Promise.all(fotosFiles.map((file, i) => uploadFoto(orderCode, file, i + 1))),
    ]);

    const identidade = {
      ...dados.identidade,
      ...(fotoPrincipalUrl
        ? { foto_principal: { url: fotoPrincipalUrl, alt: dados.identidade.nome } }
        : {}),
      fotos: fotosUrls.map((url, i) => ({ url, alt: `${dados.identidade.nome} ${i + 1}` })),
    };

    const { error: cardError } = await supabaseAdmin.from("cards").insert({
      order_id: orderId,
      slug: orderCode,
      is_watermarked: true,
      identidade,
      alimentacao: dados.alimentacao,
      saude: dados.saude,
      personalidade_rotina: dados.personalidade_rotina,
      historico: dados.historico,
    });

    if (cardError) throw new Error(`Falha ao criar card: ${cardError.message}`);
  } catch (err) {
    await supabaseAdmin.from("orders").delete().eq("id", orderId);
    throw err;
  }

  redirect(`/${orderCode}`);
}
