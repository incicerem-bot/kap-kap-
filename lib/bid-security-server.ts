import "server-only";

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  iyzicoRequiresResponseSignature,
  iyzicoRequiresStrictWebhook,
  refundPayment,
  retrieveCheckoutForm,
  verifyIyzicoResponseSignature,
  type IyzicoResponse,
} from "@/lib/iyzico";
import { PaymentHttpError } from "@/lib/supabase-server";
import { publicApplicationOrigin, roundMoney, sanitizedProviderSummary } from "@/lib/payment-server";

export type BidDepositAttemptRow = {
  id: string;
  user_id: string;
  listing_id: string | null;
  conversation_id: string;
  basket_id: string;
  token: string | null;
  provider_payment_id: string | null;
  provider_payment_transaction_id: string | null;
  amount: number | string;
  requested_bid_amount: number | string | null;
  requested_max_amount: number | string | null;
  required_security: number | string;
  purpose: "legacy_deposit" | "smart_guarantee" | "card_verification";
  request_ip: string | null;
  currency: string;
  status: string;
  payment_page_url: string | null;
  retrieve_verified: boolean;
  webhook_verified: boolean;
  response_signature_verified: boolean;
  failure_code: string | null;
  failure_message: string | null;
  bid_placement_started_at: string | null;
  bid_placed_at: string | null;
  bid_failure_message: string | null;
  bid_result: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
  refunded_at: string | null;
};

export function bidDepositConversationId(userId: string) {
  return `BIDSEC-${userId.slice(0, 8)}-${randomUUID()}`;
}

export function bidDepositBasketId() {
  return `BID-${randomUUID()}`;
}

export function bidSecurityOrigin(requestOrigin: string) {
  return publicApplicationOrigin(requestOrigin);
}

export async function loadBidDepositByToken(admin: SupabaseClient, token: string, optional = false) {
  const { data, error } = await admin.from("kk_bid_deposit_attempts").select("*").eq("token", token).maybeSingle();
  if (error) throw new PaymentHttpError(500, "Teklif güvencesi kaydı okunamadı.", error.code);
  if (!data && !optional) throw new PaymentHttpError(404, "Teklif güvencesi oturumu bulunamadı.");
  return (data ?? null) as BidDepositAttemptRow | null;
}

export async function loadBidDepositByConversation(admin: SupabaseClient, conversationId: string, optional = false) {
  const { data, error } = await admin.from("kk_bid_deposit_attempts").select("*").eq("conversation_id", conversationId).maybeSingle();
  if (error) throw new PaymentHttpError(500, "Teklif güvencesi kaydı okunamadı.", error.code);
  if (!data && !optional) throw new PaymentHttpError(404, "Teklif güvencesi oturumu bulunamadı.");
  return (data ?? null) as BidDepositAttemptRow | null;
}

function moneyEqual(left: unknown, right: unknown) {
  return Math.abs(roundMoney(Number(left)) - roundMoney(Number(right))) < 0.001;
}

function paymentTransactionId(result: IyzicoResponse) {
  const items = Array.isArray(result.itemTransactions) ? result.itemTransactions : [];
  const transaction = items.find((item) => item?.paymentTransactionId) ?? items[0];
  return transaction?.paymentTransactionId ? String(transaction.paymentTransactionId) : null;
}

export function verifyRetrievedBidDeposit(attempt: BidDepositAttemptRow, result: IyzicoResponse) {
  const signatureVerified = verifyIyzicoResponseSignature([
    result.paymentStatus,
    result.paymentId,
    result.currency,
    result.basketId,
    result.conversationId,
    result.paidPrice,
    result.price,
    result.token,
  ], result.signature);
  const signatureAccepted = signatureVerified || (!result.signature && !iyzicoRequiresResponseSignature());

  const valid =
    result.status === "success" &&
    result.paymentStatus === "SUCCESS" &&
    String(result.conversationId ?? "") === attempt.conversation_id &&
    String(result.basketId ?? "") === attempt.basket_id &&
    String(result.token ?? "") === String(attempt.token ?? "") &&
    String(result.currency ?? "") === attempt.currency &&
    moneyEqual(result.price, attempt.amount) &&
    moneyEqual(result.paidPrice, attempt.amount) &&
    signatureAccepted;

  return {
    valid,
    signatureVerified,
    paymentId: result.paymentId ? String(result.paymentId) : null,
    paymentTransactionId: paymentTransactionId(result),
  };
}

export async function recordBidDepositEvent(
  admin: SupabaseClient,
  attempt: BidDepositAttemptRow,
  eventType: string,
  eventKey: string,
  signatureVerified: boolean,
  payloadSummary: Record<string, unknown>,
) {
  const { error } = await admin.from("kk_bid_deposit_events").upsert({
    attempt_id: attempt.id,
    user_id: attempt.user_id,
    event_key: eventKey,
    event_type: eventType,
    signature_verified: signatureVerified,
    payload_summary: payloadSummary,
  }, { onConflict: "event_key", ignoreDuplicates: true });
  if (error && error.code !== "23505") console.error("[KapışKapış] Teklif güvencesi olayı kaydedilemedi:", error.message);
}

export async function recalculateBidAccess(admin: SupabaseClient, userId: string) {
  const { error } = await admin.rpc("kk_recalculate_bid_access", { p_user_id: userId });
  if (error) throw new PaymentHttpError(500, "Teklif güvencesi güncellenemedi.", error.code);
}

async function placePendingBid(admin: SupabaseClient, attempt: BidDepositAttemptRow) {
  if (!attempt.listing_id || !attempt.requested_bid_amount || attempt.bid_placed_at) return null;

  const claimTime = new Date().toISOString();
  const { data: claim, error: claimError } = await admin.from("kk_bid_deposit_attempts")
    .update({ bid_placement_started_at: claimTime })
    .eq("id", attempt.id)
    .is("bid_placement_started_at", null)
    .is("bid_placed_at", null)
    .select("id")
    .maybeSingle();
  if (claimError) throw new PaymentHttpError(500, "Teklif kaydı kilitlenemedi.", claimError.code);
  if (!claim) return null;

  const { data: listing, error: listingError } = await admin.from("kk_listings").select("slug").eq("id", attempt.listing_id).maybeSingle();
  if (listingError || !listing?.slug) {
    const message = "Güvence doğrulandı ancak açık artırma kaydı bulunamadı.";
    await admin.from("kk_bid_deposit_attempts").update({ bid_failure_message: message }).eq("id", attempt.id);
    return { placed: false, message };
  }

  const { data, error } = await admin.rpc("kk_place_bid_for_user", {
    p_user_id: attempt.user_id,
    p_listing_slug: String(listing.slug),
    p_amount: Number(attempt.requested_bid_amount),
    p_max_amount: attempt.requested_max_amount == null ? null : Number(attempt.requested_max_amount),
  });

  if (error) {
    const message = error.message || "Teklif otomatik olarak kaydedilemedi.";
    await admin.from("kk_bid_deposit_attempts").update({ bid_failure_message: message }).eq("id", attempt.id);
    return { placed: false, message };
  }

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  const now = new Date().toISOString();
  await admin.from("kk_bid_deposit_attempts").update({
    bid_placed_at: now,
    bid_failure_message: null,
    bid_result: row ?? {},
  }).eq("id", attempt.id).is("bid_placed_at", null);
  return { placed: true, row };
}

export async function reconcileBidDeposit(admin: SupabaseClient, attempt: BidDepositAttemptRow, source: "callback" | "webhook") {
  if ((attempt.status === "held" || attempt.status === "refunded") && attempt.bid_placed_at) {
    return { completed: true, status: attempt.status as "held" | "refunded", result: {} as IyzicoResponse, verification: null, bid: { placed: true } };
  }
  if (!attempt.token) throw new PaymentHttpError(409, "Teklif güvencesi token bilgisi bulunamadı.");

  const result = await retrieveCheckoutForm({ locale: "tr", conversationId: attempt.conversation_id, token: attempt.token });
  const verification = verifyRetrievedBidDeposit(attempt, result);
  const summary = sanitizedProviderSummary(result);

  await recordBidDepositEvent(
    admin,
    attempt,
    `iyzico_retrieve_${source}`,
    `bid-deposit-retrieve:${attempt.id}:${source}:${String(result.paymentId ?? "none")}:${String(result.status ?? "none")}`,
    verification.signatureVerified,
    summary,
  );

  if (!verification.valid || !verification.paymentId || !verification.paymentTransactionId) {
    await admin.from("kk_bid_deposit_attempts").update({
      status: "failed",
      failure_code: String(result.errorCode ?? "BID_GUARANTEE_VERIFICATION_FAILED"),
      failure_message: String(result.errorMessage ?? "Teklif güvencesi ödemesi doğrulanamadı.").slice(0, 500),
      provider_summary: summary,
    }).eq("id", attempt.id).neq("status", "held");
    return { completed: false, status: "failed" as const, result, verification, bid: null };
  }

  const webhookReady = source === "webhook" || attempt.webhook_verified;
  const completed = !iyzicoRequiresStrictWebhook() || webhookReady;
  const now = new Date().toISOString();

  const { error } = await admin.from("kk_bid_deposit_attempts").update({
    status: completed ? "held" : "awaiting_webhook",
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
  if (error) throw new PaymentHttpError(500, "Teklif güvencesi kaydı güncellenemedi.", error.code);

  let bid: Awaited<ReturnType<typeof placePendingBid>> = null;
  if (completed) {
    await admin.from("kk_bid_access").upsert({
      user_id: attempt.user_id,
      payment_verified: true,
      card_verified: true,
      payment_verified_at: now,
      card_verified_at: now,
    }, { onConflict: "user_id" });
    await recalculateBidAccess(admin, attempt.user_id);
    const refreshed = { ...attempt, status: "held", provider_payment_id: verification.paymentId, provider_payment_transaction_id: verification.paymentTransactionId };
    bid = await placePendingBid(admin, refreshed);
    await recalculateBidAccess(admin, attempt.user_id);

    if (attempt.purpose === "card_verification" && bid?.placed) {
      try {
        await refundBidDeposit(admin, {
          ...refreshed,
          status: "held",
          bid_placed_at: new Date().toISOString(),
        }, attempt.request_ip || "127.0.0.1");
        return { completed: true, status: "refunded" as const, result, verification, bid };
      } catch (refundError) {
        console.error("[KapışKapış] Kart doğrulama iadesi otomatik tamamlanamadı:", refundError);
      }
    }
  }
  return { completed, status: completed ? "held" as const : "awaiting_webhook" as const, result, verification, bid };
}

export async function loadBidSecuritySummary(admin: SupabaseClient, userId: string) {
  await admin.from("kk_bid_access").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  await recalculateBidAccess(admin, userId);
  const [{ data: accessRows, error: accessError }, { data: deposits, error: depositsError }] = await Promise.all([
    admin.rpc("kk_get_bid_access_for_user", { p_user_id: userId }),
    admin.from("kk_bid_deposit_attempts")
      .select("id,amount,currency,status,purpose,requested_bid_amount,requested_max_amount,required_security,bid_placed_at,bid_failure_message,created_at,completed_at,refunded_at,failure_message,listing_id,kk_listings(slug,title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  if (accessError) throw new PaymentHttpError(500, "Teklif güvencesi okunamadı.", accessError.code);
  if (depositsError) throw new PaymentHttpError(500, "Güvence hareketleri okunamadı.", depositsError.code);
  const access = Array.isArray(accessRows) ? accessRows[0] : accessRows;
  return {
    access: {
      paymentVerified: Boolean(access?.payment_verified),
      identityVerified: Boolean(access?.identity_verified),
      cardVerified: Boolean(access?.card_verified),
      heldSecurity: Number(access?.deposit_balance ?? 0),
      securityRequired: Number(access?.security_required ?? 0),
      refundableSecurity: Number(access?.refundable_security ?? 0),
    },
    deposits: (deposits ?? []).map((row: any) => {
      const listing = Array.isArray(row.kk_listings) ? row.kk_listings[0] : row.kk_listings;
      return {
        id: String(row.id),
        amount: Number(row.amount),
        currency: String(row.currency),
        status: String(row.status),
        purpose: String(row.purpose ?? "legacy_deposit"),
        listingSlug: listing?.slug ? String(listing.slug) : null,
        listingTitle: listing?.title ? String(listing.title) : null,
        requestedBidAmount: row.requested_bid_amount == null ? null : Number(row.requested_bid_amount),
        requestedMaxAmount: row.requested_max_amount == null ? null : Number(row.requested_max_amount),
        requiredSecurity: Number(row.required_security ?? 0),
        bidPlacedAt: row.bid_placed_at ? String(row.bid_placed_at) : null,
        bidFailureMessage: row.bid_failure_message ? String(row.bid_failure_message) : null,
        createdAt: String(row.created_at),
        completedAt: row.completed_at ? String(row.completed_at) : null,
        refundedAt: row.refunded_at ? String(row.refunded_at) : null,
        failureMessage: row.failure_message ? String(row.failure_message) : null,
      };
    }),
  };
}

export async function refundBidDeposit(admin: SupabaseClient, attempt: BidDepositAttemptRow, ip: string) {
  if (attempt.status !== "held") throw new PaymentHttpError(409, "Bu güvence iade edilmeye uygun durumda değil.");
  if (!attempt.provider_payment_transaction_id) throw new PaymentHttpError(409, "İade için ödeme işlem kimliği bulunamadı.");

  await recalculateBidAccess(admin, attempt.user_id);
  const { data: accessRows, error: accessError } = await admin.rpc("kk_get_bid_access_for_user", { p_user_id: attempt.user_id });
  if (accessError) throw new PaymentHttpError(500, "Aktif teklif riski kontrol edilemedi.", accessError.code);
  const access = Array.isArray(accessRows) ? accessRows[0] : accessRows;
  const refundable = Number(access?.refundable_security ?? 0);
  if (Number(attempt.amount) > refundable + 0.001) {
    throw new PaymentHttpError(409, "Bu güvence aktif lider tekliflerin veya ödenmemiş kazanımın için halen gerekli.");
  }

  await admin.from("kk_bid_deposit_attempts").update({ status: "refund_requested", refund_requested_at: new Date().toISOString() }).eq("id", attempt.id).eq("status", "held");
  const conversationId = `BIDREF-${attempt.id}-${randomUUID()}`;
  const result = await refundPayment({
    locale: "tr",
    conversationId,
    paymentTransactionId: attempt.provider_payment_transaction_id,
    price: Number(attempt.amount).toFixed(2),
    currency: attempt.currency,
    ip,
    reason: "other",
    description: "KapışKapış akıllı teklif güvencesi iadesi",
  });

  const signatureVerified = verifyIyzicoResponseSignature([
    result.paymentId,
    result.price,
    result.currency,
    result.conversationId,
  ], result.signature);
  const signatureAccepted = signatureVerified || (!result.signature && !iyzicoRequiresResponseSignature());
  const valid = result.status === "success" && moneyEqual(result.price, attempt.amount) && signatureAccepted;

  await recordBidDepositEvent(
    admin,
    attempt,
    "iyzico_refund",
    `bid-deposit-refund:${attempt.id}:${String(result.paymentId ?? "none")}:${String(result.status ?? "none")}`,
    signatureVerified,
    sanitizedProviderSummary(result),
  );

  if (!valid) {
    await admin.from("kk_bid_deposit_attempts").update({
      status: "held",
      failure_code: String(result.errorCode ?? "BID_GUARANTEE_REFUND_FAILED"),
      failure_message: String(result.errorMessage ?? "Güvence iadesi tamamlanamadı.").slice(0, 500),
      provider_summary: sanitizedProviderSummary(result),
    }).eq("id", attempt.id);
    throw new PaymentHttpError(502, String(result.errorMessage ?? "Güvence iadesi tamamlanamadı."), String(result.errorCode ?? "BID_GUARANTEE_REFUND_FAILED"));
  }

  const now = new Date().toISOString();
  await admin.from("kk_bid_deposit_attempts").update({
    status: "refunded",
    refunded_at: now,
    failure_code: null,
    failure_message: null,
    provider_summary: sanitizedProviderSummary(result),
  }).eq("id", attempt.id);
  await recalculateBidAccess(admin, attempt.user_id);
  return { refunded: true, refundedAt: now };
}
