import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabase/server";

const COOKIE_NAME = "petbio_sessao";
const SESSAO_DIAS = 30;

/** Cria a sessão no banco e grava o cookie httpOnly com o id dela. */
export async function criarSessao(email: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSAO_DIAS * 24 * 60 * 60 * 1000);
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .insert({ email, expires_at: expiresAt.toISOString() })
    .select("id")
    .single();
  if (error || !data) throw new Error("Não foi possível criar a sessão de login.");

  const store = await cookies();
  store.set(COOKIE_NAME, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Lê o cookie de sessão e confirma que ainda é válida. `null` se não logado. */
export async function sessaoAtual(): Promise<{ email: string } | null> {
  const store = await cookies();
  const sessionId = store.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const { data } = await supabaseAdmin
    .from("sessions")
    .select("email, expires_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (!data || new Date(data.expires_at) < new Date()) return null;
  return { email: data.email };
}

/** Apaga a sessão do banco e o cookie. */
export async function encerrarSessao(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(COOKIE_NAME)?.value;
  if (sessionId) {
    await supabaseAdmin.from("sessions").delete().eq("id", sessionId);
  }
  store.delete(COOKIE_NAME);
}
