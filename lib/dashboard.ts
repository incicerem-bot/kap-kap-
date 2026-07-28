import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { AccountDashboard } from "@/types/dashboard";

export async function fetchAccountDashboard(): Promise<AccountDashboard> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");

  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Güvenli oturum bulunamadı.");

  const response = await fetch("/api/account/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; dashboard?: AccountDashboard };
  if (!response.ok || !body.ok || !body.dashboard) throw new Error(body.message || "Hesap özeti yüklenemedi.");
  return body.dashboard;
}
