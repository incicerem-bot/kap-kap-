import { NextRequest, NextResponse } from "next/server";
import { syncSellerOnboarding } from "@/lib/seller-onboarding-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const status = await syncSellerOnboarding(getSupabaseAdminClient(), user);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    if (error instanceof PaymentHttpError) {
      return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Başvuru durumu yenilenemedi.";
    console.error("[KapışKapış] seller onboarding sync:", error);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
