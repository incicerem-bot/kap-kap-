import { NextRequest, NextResponse } from "next/server";
import { bidSecurityOrigin, loadBidDepositByToken, reconcileBidDeposit } from "@/lib/bid-security-server";
import { getSupabaseAdminClient, PaymentHttpError } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function callbackToken(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return String(body?.token ?? "").trim();
  }
  const form = await request.formData().catch(() => null);
  return String(form?.get("token") ?? "").trim();
}

function redirect(request: NextRequest, status: string, message?: string) {
  const url = new URL("/teklif-guvencesi-sonucu", bidSecurityOrigin(request.nextUrl.origin));
  url.searchParams.set("status", status);
  if (message) url.searchParams.set("message", message.slice(0, 180));
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  try {
    const token = await callbackToken(request);
    if (!token) throw new PaymentHttpError(400, "iyzico callback token bilgisi eksik.");
    const admin = getSupabaseAdminClient();
    const attempt = await loadBidDepositByToken(admin, token);
    if (!attempt) throw new PaymentHttpError(404, "Teklif güvencesi oturumu bulunamadı.");
    if (attempt.status === "held") return redirect(request, "success");

    const reconciliation = await reconcileBidDeposit(admin, attempt, "callback");
    if (reconciliation.status === "held" || reconciliation.status === "refunded") return redirect(request, "success");
    if (reconciliation.status === "awaiting_webhook") return redirect(request, "processing");
    return redirect(request, "failed", String(reconciliation.result.errorMessage ?? "Teklif güvencesi doğrulanamadı."));
  } catch (error) {
    console.error("[KapışKapış] teklif güvencesi callback:", error);
    return redirect(request, "failed", error instanceof Error ? error.message : "Teklif güvencesi sonucu işlenemedi.");
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, message: "Bu adres iyzico POST callback isteği içindir." }, { status: 405 });
}
