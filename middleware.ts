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
];

const sellerOnlyPrefixes = ["/ilan-olustur", "/ilanlarim"];
const adminOnlyPrefixes = ["/yonetim"];
const authPages = ["/giris", "/kayit"];

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

  const { data: profile, error: profileError } = await supabase
    .from("kk_profiles")
    .select("role,account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    if (needsAuth && pathname !== "/hesap-durumu") {
      return redirectWithCookies(request, response, "/hesap-durumu", { status: "profile_missing" });
    }
  } else {
    role = normalizeRole(profile.role);
    accountStatus = normalizeStatus(profile.account_status);
  }

  if (accountStatus !== "active" && pathname !== "/hesap-durumu") {
    return redirectWithCookies(request, response, "/hesap-durumu", { status: accountStatus });
  }

  if (authPages.includes(pathname)) {
    const returnTo = request.nextUrl.searchParams.get("returnTo") || request.nextUrl.searchParams.get("redirect");
    const safeReturn = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : homeForRole(role);
    return redirectWithCookies(request, response, safeReturn);
  }

  if (matches(pathname, adminOnlyPrefixes) && role !== "admin") {
    return redirectWithCookies(request, response, "/yetkisiz", { required: "admin" });
  }

  if (matches(pathname, sellerOnlyPrefixes) && role !== "seller" && role !== "admin") {
    return redirectWithCookies(request, response, "/satici-dogrulama", { required: "seller", returnTo: pathname });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
