import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client Supabase com a anon key — respeita as RLS policies (só lê cards
 * pagos e sem marca d'água). Usado tanto no browser quanto em Server
 * Components que precisam ler exatamente o que um visitante público leria.
 * Sem sessão do Supabase Auth (login é por código, não usamos Auth), então
 * persistSession/autoRefreshToken ficam desligados — evita tentativa de usar
 * localStorage quando este client roda no servidor.
 */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
