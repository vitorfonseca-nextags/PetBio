import "server-only";
import QRCode from "qrcode";
import { supabaseAdmin } from "./supabase/server";
import { urlPublica } from "./site-url";

/**
 * Gera o PNG do QR do link público do card, sobe pro Storage (mesmo bucket
 * das fotos, pasta do slug) e devolve a URL pública.
 */
export async function gerarQrCode(slug: string): Promise<string> {
  const url = urlPublica(slug);
  const buffer = await QRCode.toBuffer(url, { type: "png", width: 512, margin: 2 });
  const caminho = `${slug}/qr.png`;

  const { error } = await supabaseAdmin.storage
    .from("pet-photos")
    .upload(caminho, buffer, { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Falha ao gerar QR: ${error.message}`);

  return supabaseAdmin.storage.from("pet-photos").getPublicUrl(caminho).data.publicUrl;
}
