import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

export function getKapiskapisAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;
  adminClient = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return adminClient;
}

export function readBearerToken(request: Request): string {
  const value = request.headers.get("authorization") ?? "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) throw new Error("Oturum anahtarı bulunamadı.");
  return match[1].trim();
}

export async function requireRequestUser(request: Request): Promise<User> {
  const token = readBearerToken(request);
  const admin = getKapiskapisAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("Oturum geçersiz veya süresi dolmuş.");
  return data.user;
}
