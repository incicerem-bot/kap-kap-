import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

let adminClient: SupabaseClient | null = null;

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  const url = requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY");

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}

export function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireRequestUser(request: NextRequest): Promise<{ user: User; token: string }> {
  const token = getBearerToken(request);
  if (!token) throw new PaymentHttpError(401, "Oturum bulunamadı. Lütfen yeniden giriş yap.");

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new PaymentHttpError(401, "Oturum geçersiz veya süresi dolmuş.");

  const { data: profile, error: profileError } = await admin
    .from("kk_profiles")
    .select("account_status")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) throw new PaymentHttpError(503, "Yetkilendirme şeması hazır değil. Supabase rol migration dosyasını çalıştır.", profileError.code);
  if (!profile) throw new PaymentHttpError(403, "Kullanıcı profili bulunamadı.");
  if (profile.account_status === "suspended") throw new PaymentHttpError(403, "Hesabın geçici olarak kısıtlandı.", "ACCOUNT_SUSPENDED");
  if (profile.account_status === "closed") throw new PaymentHttpError(403, "Hesabın kapalı.", "ACCOUNT_CLOSED");

  return { user: data.user, token };
}

export class PaymentHttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "PaymentHttpError";
    this.status = status;
    this.code = code;
  }
}
