import "server-only";
import { supabaseAdmin } from "./supabase/server";

const BUCKET = "pet-photos";

/** Sobe uma foto pro Storage e devolve a URL pública. */
export async function uploadFoto(prefixo: string, file: File, sufixo: string | number): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const caminho = `${prefixo}/${sufixo}-${Date.now()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(caminho, file, { contentType: file.type || undefined, upsert: true });
  if (error) throw new Error(`Falha no upload da foto: ${error.message}`);
  return supabaseAdmin.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}

/** Remove uma foto do Storage a partir da URL pública (best-effort, não lança erro). */
export async function removerFotoPorUrl(url: string): Promise<void> {
  const marcador = `/${BUCKET}/`;
  const i = url.indexOf(marcador);
  if (i === -1) return;
  const caminho = url.slice(i + marcador.length).split("?")[0];
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([caminho]);
  if (error) console.warn("Falha ao remover foto antiga do Storage:", caminho, error.message);
}
