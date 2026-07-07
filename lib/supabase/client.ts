import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client Supabase para uso no browser (componentes client).
 * Usa a anon key — respeita as RLS policies (só lê cards pagos e sem marca d'água).
 */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
