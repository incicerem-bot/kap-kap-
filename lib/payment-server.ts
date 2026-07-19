import "server-only";

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  cancelPayment,
  iyzicoRequiresResponseSignature,
  iyzicoRequiresStrictWebhook,
  retrieveCheckoutForm,
  verifyIyzicoResponseSignature,
  type IyzicoResponse,
} from "@/lib/iyzico";
import { PaymentHttpError } from "@/lib/supabase-server";

export type PaymentOrderRow = {
  id: string;
  order_no: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  product_title: string;
  product_image: string | null;
  amount: number | string;
  currency: string;
  status: string;
  payment_status: string;
  payment_due_at: string | null;
  payment_expired_at: string | null;
  winner_rank: number;
  auction_offer_status: string;
  provider_payment_transaction_id: string | null;
  payout_approved_at: string | null;
  metadata: Record<string, unknown> | null;
};

export type PaymentAttemptRow = {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  conversation_id: string;
  basket_id: string;
  token: string | null;
  provider_payment_id: string | null;
  provider_payment_transaction_id: string | null;
  item_price: number | string;
  buyer_fee: number | string;
  paid_price: number | string;
  seller_commission: number | string;
  seller_payout_amount: number | string;
  currency: string;
  status: string;
  retrieve_verified: boolean;
  webhook_verified: boolean;
  response_signature_verified: boolean;
  payment_page_url: string | null;
  created_at: string;
  request_ip: string | null;
};

export type PaymentFees = {
  itemPrice: number;
  buyerFee: number;
  paidPrice: number;
  sellerCommission: number;
  sellerPayoutAmount: number;
  buyerFeeRate: number;
  sellerCommissionRate: number;
};

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function rateFromEnvironment(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value < 0 || value >= 1) return fallback;
  return value;
}

export function calculatePaymentFees(amount: number): PaymentFees {
  const buyerFeeRate = rateFromEnvironment("KAPISKAPIS_BUYER_FEE_RATE", 0.025);
  const sellerCommissionRate = rateFromEnvironment("KAPISKAPIS_SELLER_COMMISSION_RATE", 0.08);
  const itemPrice = roundMoney(amount);
  const buyerFee = roundMoney(itemPrice * buyerFeeRate);
  const sellerCommission = roundMoney(itemPrice * sellerCommissionRate);
  return {
    itemPrice,
    buyerFee,
    paidPrice: roundMoney(itemPrice + buyerFee),
    sellerCommission,
    sellerPayoutAmount: roundMoney(Math.max(0, itemPrice - sellerCommission)),
    buyerFeeRate,
    sellerCommissionRate,
  };
}

export async function loadOwnedPaymentOrder(admin: SupabaseClient, buyerId: string, orderNo: string) {
  const { data, error } = await admin
    .from("kk_orders")
    .select("id,order_no,buyer_id,seller_id,product_id,product_title,product_image,amount,currency,status,payment_status,payment_due_at,payment_expired_at,winner_rank,auction_offer_status,provider_payment_transaction_id,payout_approved_at,metadata")
    .eq("order_no", orderNo)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (error) throw new PaymentHttpError(500, "Sipariş okunamadı.", error.code);
  if (!data) throw new PaymentHttpError(404, "Bu numarayla sana ait bir sipariş bulunamadı.");
  return data as PaymentOrderRow;
}


export function auctionPaymentDeadlineExpired(order: Pick<PaymentOrderRow, "payment_due_at" | "payment_status" | "status">) {
  if (!order.payment_due_at || order.payment_status === "paid") return false;
  return order.status === "cancelled" || new Date(order.payment_due_at).getTime() <= Date.now();
}

export async function loadPaymentAttemptByToken(admin: SupabaseClient, token: string) {
  const { data, error } = await admin.from("kk_payment_attempts").select("*").eq("token", token).maybeSingle();
  if (error) throw new PaymentHttpError(500, "Ödeme kaydı okunamadı.", error.code);
  if (!data) throw new PaymentHttpError(404, "Ödeme oturumu bulunamadı.");
  return data as PaymentAttemptRow;
}

export async function loadPaymentAttemptByConversation(admin: SupabaseClient, conversationId: string) {
  const { data, error } = await admin.from("kk_payment_attempts").select("*").eq("conversation_id", conversationId).maybeSingle();
  if (error) throw new PaymentHttpError(500, "Ödeme kaydı okunamadı.", error.code);
  if (!data) throw new PaymentHttpError(404, "Ödeme oturumu bulunamadı.");
  return data as PaymentAttemptRow;
}

export function publicApplicationOrigin(requestOrigin: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return requestOrigin.replace(/\/$/, "");
}

export function paymentConversationId(orderNo: string) {
  return `${orderNo}-${randomUUID()}`;
}

function moneyEqual(left: unknown, right: unknown) {
  return Math.abs(roundMoney(Number(left)) - roundMoney(Number(right))) < 0.001;
}

export function sanitizedProviderSummary(result: IyzicoResponse) {
  return {
    status: result.status ?? null,
    paymentStatus: result.paymentStatus ?? null,
    paymentId: result.paymentId ?? null,
    conversationId: result.conversationId ?? null,
    basketId: result.basketId ?? null,
    currency: result.currency ?? null,
    price: result.price ?? null,
    paidPrice: result.paidPrice ?? null,
    errorCode: result.errorCode ?? null,
    errorMessage: result.errorMessage ?? null,
    systemTime: result.systemTime ?? null,
  };
}

function paymentTransactionId(result: IyzicoResponse) {
  const items = Array.isArray(result.itemTransactions) ? result.itemTransactions : [];
  const transaction = items.find((item) => item?.paymentTransactionId) ?? items[0];
  return transaction?.paymentTransactionId ? String(transaction.paymentTransactionId) : null;
}

export function verifyRetrievedPayment(attempt: PaymentAttemptRow, result: IyzicoResponse) {
  const signatureParts = [
    result.paymentStatus,
    result.paymentId,
    result.currency,
    result.basketId,
    result.conversationId,
    result.paidPrice,
    result.price,
    result.token,
  ];
  const signatureVerified = verifyIyzicoResponseSignature(signatureParts, result.signature);
  const signatureAccepted = signatureVerified || (!result.signature && !iyzicoRequiresResponseSignature());

  const valid =
    result.status === "success" &&
    result.paymentStatus === "SUCCESS" &&
    String(result.conversationId ?? "") === attempt.conversation_id &&
    String(result.basketId ?? "") === attempt.basket_id &&
    String(result.token ?? "") === String(attempt.token ?? "") &&
    String(result.currency ?? "") === attempt.currency &&
    moneyEqual(result.price, attempt.item_price) &&
    moneyEqual(result.paidPrice, attempt.paid_price) &&
    signatureAccepted;

  return {
    valid,
    signatureVerified,
    paymentId: result.paymentId ? String(result.paymentId) : null,
    paymentTransactionId: paymentTransactionId(result),
  };
}

export async function recordPaymentEvent(
  admin: SupabaseClient,
  attempt: PaymentAttemptRow,
  eventType: string,
  eventKey: string,
  signatureVerified: boolean,
  payloadSummary: Record<string, unknown>,
) {
  const { error } = await admin.from("kk_payment_events").upsert({
    attempt_id: attempt.id,
    order_id: attempt.order_id,
    event_key: eventKey,
    event_type: eventType,
    signature_verified: signatureVerified,
    payload_summary: payloadSummary,
  }, { onConflict: "event_key", ignoreDuplicates: true });
  if (error && error.code !== "23505") console.error("[KapışKapış] Ödeme olayı kaydedilemedi:", error.message);
}

export async function failPaymentAttempt(admin: SupabaseClient, attemptId: string, code: string, message: string, summary: Record<string, unknown> = {}) {
  await admin.from("kk_payment_attempts").update({
    status: "failed",
    failure_code: code,
    failure_message: message.slice(0, 500),
    provider_summary: summary,
  }).eq("id", attemptId).neq("status", "succeeded");
}

export async function retrieveAndReconcilePayment(admin: SupabaseClient, attempt: PaymentAttemptRow, source: "callback" | "webhook") {
  if (!attempt.token) throw new PaymentHttpError(409, "Ödeme token bilgisi bulunamadı.");

  const result = await retrieveCheckoutForm({
    locale: "tr",
    conversationId: attempt.conversation_id,
    token: attempt.token,
  });

  const verification = verifyRetrievedPayment(attempt, result);
  const summary = sanitizedProviderSummary(result);
  await recordPaymentEvent(
    admin,
    attempt,
    `iyzico_retrieve_${source}`,
    `retrieve:${attempt.id}:${source}:${String(result.paymentId ?? "none")}:${String(result.status ?? "none")}`,
    verification.signatureVerified,
    summary,
  );

  if (!verification.valid || !verification.paymentId || !verification.paymentTransactionId) {
    await failPaymentAttempt(
      admin,
      attempt.id,
      String(result.errorCode ?? "PAYMENT_VERIFICATION_FAILED"),
      String(result.errorMessage ?? "Ödeme sonucu doğrulanamadı."),
      summary,
    );
    return { completed: false, status: "failed" as const, result, verification };
  }

  const { data: currentOrder, error: currentOrderError } = await admin
    .from("kk_orders")
    .select("buyer_id,status,payment_status,auction_offer_status")
    .eq("id", attempt.order_id)
    .maybeSingle();
  if (currentOrderError) throw new PaymentHttpError(500, "Sipariş ödeme uygunluğu doğrulanamadı.", currentOrderError.code);

  const staleWinnerPayment = !currentOrder
    || String(currentOrder.buyer_id) !== attempt.buyer_id
    || currentOrder.status === "cancelled"
    || currentOrder.payment_status === "expired"
    || currentOrder.auction_offer_status === "expired";

  if (staleWinnerPayment) {
    let cancellationSummary: Record<string, unknown> = {};
    let cancellationSucceeded = false;
    try {
      const cancellation = await cancelPayment({
        locale: "tr",
        conversationId: `LATE-${attempt.conversation_id}`,
        paymentId: verification.paymentId,
        ip: attempt.request_ip || "127.0.0.1",
      });
      cancellationSummary = sanitizedProviderSummary(cancellation);
      cancellationSucceeded = cancellation.status === "success";
      await recordPaymentEvent(
        admin,
        attempt,
        "iyzico_late_payment_cancel",
        `late-cancel:${attempt.id}:${verification.paymentId}:${String(cancellation.status ?? "none")}`,
        false,
        cancellationSummary,
      );
    } catch (cancellationError) {
      cancellationSummary = { message: cancellationError instanceof Error ? cancellationError.message : "Geç ödeme iptali tamamlanamadı." };
    }

    await admin.from("kk_payment_attempts").update({
      status: cancellationSucceeded ? "cancelled" : "failed",
      retrieve_verified: true,
      response_signature_verified: verification.signatureVerified,
      provider_payment_id: verification.paymentId,
      provider_payment_transaction_id: verification.paymentTransactionId,
      failure_code: cancellationSucceeded ? "LATE_PAYMENT_CANCELLED" : "LATE_PAYMENT_MANUAL_REFUND_REQUIRED",
      failure_message: cancellationSucceeded
        ? "Ödeme süresi dolmuş kazanan siparişine ait tahsilat otomatik iptal edildi."
        : "Ödeme süresi dolmuş sipariş için tahsilat alındı; manuel iade kontrolü gerekiyor.",
      provider_summary: { retrieve: summary, cancellation: cancellationSummary },
      completed_at: new Date().toISOString(),
    }).eq("id", attempt.id);

    return { completed: false, status: "failed" as const, result, verification };
  }

  const webhookReady = source === "webhook" || attempt.webhook_verified;
  const completed = !iyzicoRequiresStrictWebhook() || webhookReady;
  const now = new Date().toISOString();

  const { error: attemptError } = await admin.from("kk_payment_attempts").update({
    status: completed ? "succeeded" : "awaiting_webhook",
    retrieve_verified: true,
    response_signature_verified: verification.signatureVerified,
    provider_payment_id: verification.paymentId,
    provider_payment_transaction_id: verification.paymentTransactionId,
    callback_received_at: source === "callback" ? now : undefined,
    webhook_received_at: source === "webhook" ? now : undefined,
    completed_at: completed ? now : null,
    failure_code: null,
    failure_message: null,
    provider_summary: summary,
  }).eq("id", attempt.id);
  if (attemptError) throw new PaymentHttpError(500, "Ödeme kaydı güncellenemedi.", attemptError.code);

  if (completed) {
    const { error: orderError } = await admin.from("kk_orders").update({
      status: "preparing",
      payment_attempt_id: attempt.id,
      payment_provider: "iyzico",
      payment_status: "paid",
      provider_payment_id: verification.paymentId,
      provider_payment_transaction_id: verification.paymentTransactionId,
      buyer_fee: Number(attempt.buyer_fee),
      seller_commission: Number(attempt.seller_commission),
      seller_payout_amount: Number(attempt.seller_payout_amount),
      paid_at: now,
      payout_status: "held",
    }).eq("id", attempt.order_id)
      .eq("buyer_id", attempt.buyer_id)
      .eq("status", "payment_pending")
      .eq("auction_offer_status", "payment_pending")
      .neq("payment_status", "paid");
    if (orderError) throw new PaymentHttpError(500, "Sipariş ödeme durumu güncellenemedi.", orderError.code);
  }

  return { completed, status: completed ? "succeeded" as const : "awaiting_webhook" as const, result, verification };
}
