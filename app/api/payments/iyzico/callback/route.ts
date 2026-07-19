import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, PaymentHttpError } from "@/lib/supabase-server";
import { loadPaymentAttemptByToken, publicApplicationOrigin, retrieveAndReconcilePayment } from "@/lib/payment-server";

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

function redirect(request: NextRequest, orderNo: string, status: string, message?: string) {
  const origin = publicApplicationOrigin(request.nextUrl.origin);
  const url = new URL("/odeme-sonucu", origin);
  url.searchParams.set("order", orderNo);
  url.searchParams.set("status", status);
  if (message) url.searchParams.set("message", message.slice(0, 180));
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  let orderNo = "";
  try {
    const token = await callbackToken(request);
    if (!token) throw new PaymentHttpError(400, "iyzico callback token bilgisi eksik.");

    const admin = getSupabaseAdminClient();
    const attempt = await loadPaymentAttemptByToken(admin, token);
    orderNo = attempt.basket_id;

    if (attempt.status === "succeeded") return redirect(request, orderNo, "success");

    const reconciliation = await retrieveAndReconcilePayment(admin, attempt, "callback");
    if (reconciliation.status === "succeeded") return redirect(request, orderNo, "success");
    if (reconciliation.status === "awaiting_webhook") return redirect(request, orderNo, "processing");
    return redirect(request, orderNo, "failed", String(reconciliation.result.errorMessage ?? "Ödeme doğrulanamadı."));
  } catch (error) {
    console.error("[KapışKapış] iyzico callback:", error);
    const message = error instanceof Error ? error.message : "Ödeme sonucu işlenemedi.";
    return redirect(request, orderNo || "unknown", "failed", message);
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: false, message: "Bu adres iyzico POST callback isteği içindir." }, { status: 405 });
}
