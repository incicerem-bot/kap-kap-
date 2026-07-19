import { NextRequest, NextResponse } from "next/server";
import { getSafePayoutStatus, submitSellerOnboarding, type SellerOnboardingInput } from "@/lib/seller-onboarding-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) {
    return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Satıcı doğrulama işlemi tamamlanamadı.";
  console.error("[KapışKapış] seller onboarding:", error);
  return NextResponse.json({ ok: false, message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const status = await getSafePayoutStatus(getSupabaseAdminClient(), user);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const body = await request.json() as SellerOnboardingInput;
    const status = await submitSellerOnboarding(getSupabaseAdminClient(), user, body);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return errorResponse(error);
  }
}
