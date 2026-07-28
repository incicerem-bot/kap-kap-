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
    if (!user.email_confirmed_at) {
      throw new PaymentHttpError(403, "Satıcı başvurusu için e-posta adresini doğrulamalısın.", "EMAIL_NOT_VERIFIED");
    }
    if (!user.phone_confirmed_at) {
      throw new PaymentHttpError(403, "Satıcı başvurusu için telefon numaranı doğrulamalısın.", "PHONE_NOT_VERIFIED");
    }
    const admin = getSupabaseAdminClient();
    const body = await request.json() as SellerOnboardingInput;
    const status = await submitSellerOnboarding(admin, user, body);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return errorResponse(error);
  }
}
