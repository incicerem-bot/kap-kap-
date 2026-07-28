import { NextRequest, NextResponse } from "next/server";
import { resubmitSellerReview } from "@/lib/seller-onboarding-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) {
    return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  }
  console.error("[KapışKapış] seller review resubmit:", error);
  return NextResponse.json({ ok: false, message: "Satıcı başvurusu yeniden incelemeye gönderilemedi." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const body = await request.json().catch(() => ({})) as { note?: string };
    const status = await resubmitSellerReview(getSupabaseAdminClient(), user, body.note);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return errorResponse(error);
  }
}
