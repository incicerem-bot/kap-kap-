import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabaseUrl = rawSupabaseUrl.trim();
const supabaseAnonKey = rawSupabaseAnonKey.trim();

function validateSupabaseConfiguration() {
  if (!supabaseUrl && !supabaseAnonKey) {
    return { valid: false, error: null as string | null };
  }

  if (!supabaseUrl) return { valid: false, error: "NEXT_PUBLIC_SUPABASE_URL eksik." };
  if (!supabaseAnonKey) return { valid: false, error: "NEXT_PUBLIC_SUPABASE_ANON_KEY eksik." };

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return { valid: false, error: "NEXT_PUBLIC_SUPABASE_URL http:// veya https:// ile başlamalı." };
    }
  } catch {
    return { valid: false, error: "NEXT_PUBLIC_SUPABASE_URL geçerli bir adres değil." };
  }

  return { valid: true, error: null as string | null };
}

const configuration = validateSupabaseConfiguration();

export const supabaseConfigured = configuration.valid;
export const supabaseConfigurationError = configuration.error;

let browserClient: SupabaseClient | null = null;
let clientCreationFailed = false;
let warningShown = false;

function reportConfigurationProblem(message: string) {
  if (warningShown || typeof window === "undefined") return;
  warningShown = true;
  console.error(`[KapışKapış] Supabase bağlantısı devre dışı: ${message}`);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseConfigured || clientCreationFailed) {
    if (supabaseConfigurationError) reportConfigurationProblem(supabaseConfigurationError);
    return null;
  }
  if (browserClient) return browserClient;

  try {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return browserClient;
  } catch (error) {
    clientCreationFailed = true;
    reportConfigurationProblem(error instanceof Error ? error.message : "Supabase istemcisi oluşturulamadı.");
    return null;
  }
}
