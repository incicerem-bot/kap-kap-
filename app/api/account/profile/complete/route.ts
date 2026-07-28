import { NextRequest, NextResponse } from "next/server";
import { completeAccountProfile, type CompleteProfileInput } from "@/lib/profile-completion-server";
import { getSupabaseAdminClient, PaymentHttpError, requireAuthenticatedRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuthenticatedRequestUser(request);
    const body = await request.json().catch(() => ({})) as CompleteProfileInput;
    const profile = await completeAccountProfile(getSupabaseAdminClient(), user, body);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    if (error instanceof PaymentHttpError) {
      return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
    }
    console.error("[KapışKapış] profil tamamlama:", error);
    return NextResponse.json({ ok: false, message: "Profil bilgileri kaydedilemedi." }, { status: 500 });
  }
}
