import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { AccountRole, AccountStatus } from "@/lib/auth";

const authOnlyPrefixes = [
  "/profil",
  "/ayarlar",
  "/favoriler",
  "/bildirimler",
  "/mesajlar",
  "/tekliflerim",
  "/siparisler",
  "/kargo",
  "/uyusmazlik",
  "/cuzdan",
  "/teklif-guvencesi",
  "/teklif-guvencesi-sonucu",
  "/degerlendirme",
  "/odeme",
  "/odeme-sonucu",
  "/satici-dogrulama",
  "/hesap-dogrulama",
  "/sifre-yenile",
  "/profil-tamamlama",
  "/mfa-dogrula",
];

const sellerOnlyPrefixes = ["/ilan-olustur", "/ilanlarim"];
const adminOnlyPrefixes = ["/yonetim"];
const authPages = ["/giris", "/kayit"];
const verificationExemptPrefixes = ["/hesap-dogrulama", "/sifre-yenile", "/hesap-durumu", "/profil-tamamlama", "/mfa-dogrula"];
const phoneRequiredPrefixes = ["/ilan-olustur", "/satici-dogrulama", "/teklif-guvencesi", "/teklif-guvencesi-sonucu"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function normalizeRole(value: unknown): AccountRole {
  return value === "seller" || value === "admin" ? value : "buyer";
}

function normalizeStatus(value: unknown): AccountStatus {
  return value === "suspended" || value === "closed" ? value : "active";
}

function homeForRole(role: AccountRole) {
  if (role === "admin") return "/yonetim";
  if (role === "seller") return "/ilanlarim";
  return "/profil";
}

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string, params?: Record<string, string>) {
  const url = new URL(pathname, request.url);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const pathname = request.nextUrl.pathname;
  const needsAuth = matches(pathname, authOnlyPrefixes) || matches(pathname, sellerOnlyPrefixes) || matches(pathname, adminOnlyPrefixes);

  if (!user) {
    if (needsAuth) {
      return redirectWithCookies(request, response, "/giris", { returnTo: `${pathname}${request.nextUrl.search}` });
    }
    return response;
  }

  let role: AccountRole = "buyer";
  let accountStatus: AccountStatus = "active";
  let profileCompletedAt: string | null = null;

  const { data: profile, error: profileError } = await supabase
    .from("kk_profiles")
    .select("role,account_status,profile_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    if (needsAuth && pathname !== "/hesap-durumu") {
      return redirectWithCookies(request, response, "/hesap-durumu", { status: "profile_missing" });
    }
  } else {
    role = normalizeRole(profile.role);
    accountStatus = normalizeStatus(profile.account_status);
    profileCompletedAt = typeof profile.profile_completed_at === "string" ? profile.profile_completed_at : null;
  }

  if (accountStatus !== "active" && pathname !== "/hesap-durumu") {
    return redirectWithCookies(request, response, "/hesap-durumu", { status: accountStatus });
  }

  const verificationExempt = matches(pathname, verificationExemptPrefixes);
  if (needsAuth && !verificationExempt && !user.email_confirmed_at) {
    return redirectWithCookies(request, response, "/hesap-dogrulama", {
      required: "email",
      returnTo: `${pathname}${request.nextUrl.search}`,
    });
  }

  if (needsAuth && !verificationExempt && !profileCompletedAt) {
    return redirectWithCookies(request, response, "/profil-tamamlama", {
      returnTo: `${pathname}${request.nextUrl.search}`,
    });
  }

  if (matches(pathname, phoneRequiredPrefixes) && !user.phone_confirmed_at) {
    return redirectWithCookies(request, response, "/hesap-dogrulama", {
      required: "phone",
      returnTo: `${pathname}${request.nextUrl.search}`,
    });
  }

  if (needsAuth && pathname !== "/mfa-dogrula") {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
      return redirectWithCookies(request, response, "/mfa-dogrula", {
        returnTo: `${pathname}${request.nextUrl.search}`,
      });
    }
  }

  if (authPages.includes(pathname)) {
    const returnTo = request.nextUrl.searchParams.get("returnTo") || request.nextUrl.searchParams.get("redirect");
    const safeReturn = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : homeForRole(role);
    return redirectWithCookies(request, response, safeReturn);
  }

  if (matches(pathname, adminOnlyPrefixes) && role !== "admin") {
    return redirectWithCookies(request, response, "/yetkisiz", { required: "admin" });
  }

  if (matches(pathname, sellerOnlyPrefixes) && role !== "seller") {
    if (role === "admin") {
      return redirectWithCookies(request, response, "/yetkisiz", { required: "seller" });
    }
    return redirectWithCookies(request, response, "/satici-dogrulama", { required: "seller", returnTo: pathname });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
