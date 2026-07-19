import { NextRequest, NextResponse } from "next/server";
import { verifyIyzicoWebhookSignature } from "@/lib/iyzico";
import { loadPaymentAttemptByConversation, loadPaymentAttemptByToken, recordPaymentEvent, retrieveAndReconcilePayment } from "@/lib/payment-server";
import { getSupabaseAdminClient, PaymentHttpError } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const signature = request.headers.get("x-iyz-signature-v3");
    const signatureVerified = verifyIyzicoWebhookSignature(payload, signature);
    if (!signatureVerified) return NextResponse.json({ ok: false, message: "Webhook imzası geçersiz." }, { status: 401 });

    const token = String(payload.token ?? "").trim();
    const conversationId = String(payload.paymentConversationId ?? "").trim();
    if (!token && !conversationId) throw new PaymentHttpError(400, "Webhook ödeme referansı eksik.");

    const admin = getSupabaseAdminClient();
    const attempt = token
      ? await loadPaymentAttemptByToken(admin, token)
      : await loadPaymentAttemptByConversation(admin, conversationId);

    if (conversationId && conversationId !== attempt.conversation_id) {
      throw new PaymentHttpError(409, "Webhook conversationId eşleşmedi.");
    }
    if (token && token !== attempt.token) throw new PaymentHttpError(409, "Webhook token eşleşmedi.");

    await recordPaymentEvent(
      admin,
      attempt,
      "iyzico_webhook",
      `webhook:${attempt.id}:${String(payload.iyziPaymentId ?? "none")}:${String(payload.status ?? "none")}`,
      true,
      {
        iyziEventType: payload.iyziEventType ?? null,
        iyziPaymentId: payload.iyziPaymentId ?? null,
        paymentConversationId: payload.paymentConversationId ?? null,
        status: payload.status ?? null,
      },
    );

    await admin.from("kk_payment_attempts").update({
      webhook_verified: true,
      webhook_received_at: new Date().toISOString(),
      provider_payment_id: String(payload.iyziPaymentId ?? attempt.provider_payment_id ?? "") || null,
    }).eq("id", attempt.id);

    const updatedAttempt = { ...attempt, webhook_verified: true };
    const reconciliation = await retrieveAndReconcilePayment(admin, updatedAttempt, "webhook");
    return NextResponse.json({ ok: reconciliation.status !== "failed", status: reconciliation.status });
  } catch (error) {
    const status = error instanceof PaymentHttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Webhook işlenemedi.";
    console.error("[KapışKapış] iyzico webhook:", error);
    return NextResponse.json({ ok: false, message }, { status });
  }
}
