import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase-auth-server";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/profil";
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const origin = request.nextUrl.origin;

  if (!tokenHash || !type) return NextResponse.redirect(`${origin}/giris?error=invalid_confirmation_link`);

  try {
    const supabase = await createSupabaseServerAuthClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) throw error;
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "E-posta doğrulanamadı.";
    return NextResponse.redirect(`${origin}/giris?error=${encodeURIComponent(message)}`);
  }
}
