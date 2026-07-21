import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export type AccountRole = "buyer" | "seller" | "admin";
export type AccountStatus = "active" | "suspended" | "closed";
export type SellerStatus = "not_started" | "pending" | "active" | "rejected" | "suspended";

export type AccountProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: AccountRole;
  accountStatus: AccountStatus;
  sellerStatus: SellerStatus;
  onboardingCompleted: boolean;
  marketingOptIn: boolean;
  termsVersion: string | null;
};

type AccountRpcRow = {
  id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  account_status?: string | null;
  seller_status?: string | null;
  onboarding_completed?: boolean | null;
  marketing_opt_in?: boolean | null;
  terms_version?: string | null;
};

function normalizeRole(value: unknown): AccountRole {
  return value === "seller" || value === "admin" ? value : "buyer";
}

function normalizeAccountStatus(value: unknown): AccountStatus {
  return value === "suspended" || value === "closed" ? value : "active";
}

function normalizeSellerStatus(value: unknown): SellerStatus {
  return value === "pending" || value === "active" || value === "rejected" || value === "suspended" ? value : "not_started";
}

export function fallbackProfileFromUser(user: User): AccountProfile {
  const requestedType = String(user.user_metadata?.account_type ?? "buyer");
  return {
    id: user.id,
    fullName: String(user.user_metadata?.full_name || user.email?.split("@")[0] || "KapışKapış kullanıcısı"),
    avatarUrl: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
    // Authorization hiçbir zaman kullanıcı tarafından değiştirilebilen metadata'ya dayanmaz.
    // RPC kullanılamıyorsa güvenli varsayılan buyer rolüdür.
    role: "buyer",
    accountStatus: "active",
    sellerStatus: requestedType === "seller" ? "pending" : "not_started",
    onboardingCompleted: true,
    marketingOptIn: Boolean(user.user_metadata?.marketing_opt_in),
    termsVersion: typeof user.user_metadata?.terms_version === "string" ? user.user_metadata.terms_version : null,
  };
}

export async function fetchMyAccountProfile(user?: User | null): Promise<AccountProfile | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return user ? fallbackProfileFromUser(user) : null;

  let currentUser = user ?? null;
  if (!currentUser) {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    currentUser = data.user;
  }

  const { data, error } = await client.rpc("kk_get_my_account");
  if (error) {
    // Migration henüz kurulmadıysa kullanıcı oturumu yine çalışır; yetki kontrolleri
    // middleware ve RLS tarafında güvenli varsayılana düşer.
    return fallbackProfileFromUser(currentUser);
  }

  const row = (Array.isArray(data) ? data[0] : data) as AccountRpcRow | null;
  if (!row) return fallbackProfileFromUser(currentUser);

  return {
    id: String(row.id ?? currentUser.id),
    fullName: String(row.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "KapışKapış kullanıcısı"),
    avatarUrl: row.avatar_url ?? null,
    role: normalizeRole(row.role),
    accountStatus: normalizeAccountStatus(row.account_status),
    sellerStatus: normalizeSellerStatus(row.seller_status),
    onboardingCompleted: row.onboarding_completed !== false,
    marketingOptIn: Boolean(row.marketing_opt_in),
    termsVersion: row.terms_version ?? null,
  };
}

export function defaultRouteForRole(role: AccountRole) {
  if (role === "admin") return "/yonetim";
  if (role === "seller") return "/ilanlarim";
  return "/profil";
}

export function isSafeInternalPath(value: string | null | undefined) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"));
}
