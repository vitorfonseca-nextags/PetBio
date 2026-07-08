import "server-only";
import { supabaseAdmin } from "./supabase/server";

// Marcas de acento (combining diacritical marks) que sobram depois do
// normalize("NFD") — construído via code points pra evitar caracteres
// especiais soltos no código-fonte.
const MARCAS_DE_ACENTO = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g",
);

export function normalizarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(MARCAS_DE_ACENTO, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function slugDisponivel(slug: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from("cards").select("id").eq("slug", slug).maybeSingle();
  return !data;
}

/**
 * Regra de colisão do CLAUDE.md §5: nome -> apelido -> nome+raça -> nome+número.
 */
export async function gerarSlugPersonalizado(identidade: {
  nome: string;
  apelido?: string;
  raca?: string;
}): Promise<string> {
  const candidatos = [normalizarSlug(identidade.nome)];
  if (identidade.apelido) candidatos.push(normalizarSlug(identidade.apelido));
  if (identidade.raca) candidatos.push(normalizarSlug(`${identidade.nome}-${identidade.raca}`));

  for (const candidato of candidatos) {
    if (candidato && (await slugDisponivel(candidato))) return candidato;
  }

  const base = normalizarSlug(identidade.nome) || "pet";
  for (let n = 2; ; n++) {
    const tentativa = `${base}-${n}`;
    if (await slugDisponivel(tentativa)) return tentativa;
  }
}
