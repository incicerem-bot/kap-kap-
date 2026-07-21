import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase-auth-server";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/profil";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/giris?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Oturum doğrulanamadı.";
    return NextResponse.redirect(`${origin}/giris?error=${encodeURIComponent(message)}`);
  }
}
