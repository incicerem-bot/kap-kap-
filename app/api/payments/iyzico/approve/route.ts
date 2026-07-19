import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { approveMarketplaceItem } from "@/lib/iyzico";
import { loadOwnedPaymentOrder, recordPaymentEvent, type PaymentAttemptRow } from "@/lib/payment-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const body = await request.json().catch(() => ({}));
    const orderNo = String(body?.orderNo ?? "").trim();
    if (!orderNo) throw new PaymentHttpError(400, "Sipariş numarası eksik.");

    const admin = getSupabaseAdminClient();
    const order = await loadOwnedPaymentOrder(admin, user.id, orderNo);
    if (order.payment_status !== "paid") throw new PaymentHttpError(409, "Ödeme doğrulanmadan teslimat onaylanamaz.");
    if (!order.provider_payment_transaction_id) throw new PaymentHttpError(409, "iyzico ödeme işlem kimliği bulunamadı.");
    if (!['shipped', 'delivered'].includes(order.status)) throw new PaymentHttpError(409, "Sipariş henüz teslimat onayına uygun değil.");
    if (order.payout_approved_at) return NextResponse.json({ ok: true, alreadyApproved: true });

    const { data: attemptData, error: attemptError } = await admin
      .from("kk_payment_attempts")
      .select("*")
      .eq("order_id", order.id)
      .eq("status", "succeeded")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (attemptError || !attemptData) throw new PaymentHttpError(409, "Başarılı ödeme kaydı bulunamadı.", attemptError?.code);
    const attempt = attemptData as PaymentAttemptRow;

    const conversationId = `approve-${orderNo}-${randomUUID()}`;
    const result = await approveMarketplaceItem({
      locale: "tr",
      conversationId,
      paymentTransactionId: order.provider_payment_transaction_id,
    });

    await recordPaymentEvent(
      admin,
      attempt,
      "iyzico_item_approve",
      `approve:${order.id}:${order.provider_payment_transaction_id}`,
      result.status === "success",
      {
        status: result.status ?? null,
        conversationId: result.conversationId ?? null,
        paymentTransactionId: result.paymentTransactionId ?? null,
        errorCode: result.errorCode ?? null,
        errorMessage: result.errorMessage ?? null,
      },
    );

    if (result.status !== "success") {
      throw new PaymentHttpError(502, String(result.errorMessage ?? "Satıcı ödeme onayı iyzico tarafından reddedildi."), String(result.errorCode ?? "IYZICO_APPROVAL_FAILED"));
    }

    const now = new Date().toISOString();
    const { error: updateError } = await admin.from("kk_orders").update({
      status: "delivered",
      delivered_at: now,
      payout_status: "approved",
      payout_approved_at: now,
    }).eq("id", order.id).eq("buyer_id", user.id);
    if (updateError) throw new PaymentHttpError(500, "Teslimat sonucu veritabanına kaydedilemedi.", updateError.code);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof PaymentHttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Teslimat onayı tamamlanamadı.";
    console.error("[KapışKapış] iyzico approve:", error);
    return NextResponse.json({ ok: false, message }, { status });
  }
}
