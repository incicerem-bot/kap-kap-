import { NextRequest, NextResponse } from "next/server";
import { initializeCheckoutForm, iyzicoRequiresResponseSignature, verifyIyzicoResponseSignature } from "@/lib/iyzico";
import {
  calculatePaymentFees,
  loadOwnedPaymentOrder,
  paymentConversationId,
  publicApplicationOrigin,
  sanitizedProviderSummary,
} from "@/lib/payment-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = {
  orderNo?: string;
  buyer?: {
    name?: string;
    surname?: string;
    identityNumber?: string;
    gsmNumber?: string;
    email?: string;
    address?: string;
    city?: string;
    zipCode?: string;
  };
};

function text(value: unknown, maxLength = 255) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+9${digits}`;
  if (digits.length === 10) return `+90${digits}`;
  return value.startsWith("+") ? value : `+${digits}`;
}

function enabledInstallments() {
  const configured = (process.env.IYZIPAY_ENABLED_INSTALLMENTS ?? "1")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12);
  return configured.length ? [...new Set(configured)] : [1];
}

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) {
    return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Ödeme oturumu oluşturulamadı.";
  console.error("[KapışKapış] iyzico initialize:", error);
  return NextResponse.json({ ok: false, message }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const body = await request.json() as CheckoutBody;
    const orderNo = text(body.orderNo, 80);
    if (!orderNo) throw new PaymentHttpError(400, "Sipariş numarası eksik.");

    const buyer = body.buyer ?? {};
    const name = text(buyer.name, 100);
    const surname = text(buyer.surname, 100);
    const identityNumber = text(buyer.identityNumber, 20).replace(/\D/g, "");
    const gsmNumber = normalizePhone(text(buyer.gsmNumber, 30));
    const email = text(buyer.email || user.email, 200);
    const address = text(buyer.address, 255);
    const city = text(buyer.city, 80);
    const zipCode = text(buyer.zipCode, 20);

    if (name.length < 2 || surname.length < 2) throw new PaymentHttpError(400, "Ad ve soyad bilgilerini eksiksiz gir.");
    if (!/^\d{11}$/.test(identityNumber)) throw new PaymentHttpError(400, "T.C. kimlik numarası 11 haneli olmalıdır.");
    if (!/^\+90\d{10}$/.test(gsmNumber)) throw new PaymentHttpError(400, "Telefon numarasını Türkiye formatında gir.");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new PaymentHttpError(400, "Geçerli bir e-posta adresi gir.");
    if (address.length < 10 || city.length < 2) throw new PaymentHttpError(400, "Fatura ve teslimat adresini eksiksiz gir.");

    const admin = getSupabaseAdminClient();
    const order = await loadOwnedPaymentOrder(admin, user.id, orderNo);
    if (order.status !== "payment_pending" || order.payment_status === "paid") {
      throw new PaymentHttpError(409, "Bu sipariş ödeme almaya uygun durumda değil.");
    }

    const amount = Number(order.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new PaymentHttpError(409, "Sipariş tutarı geçersiz.");

    const { data: existing } = await admin
      .from("kk_payment_attempts")
      .select("id,status,payment_page_url,created_at")
      .eq("order_id", order.id)
      .in("status", ["pending", "awaiting_webhook", "succeeded"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.status === "succeeded") {
      return NextResponse.json({ ok: true, alreadyPaid: true, redirectUrl: `/odeme-sonucu?order=${encodeURIComponent(orderNo)}&status=success` });
    }
    if (existing?.status === "pending" && existing.payment_page_url) {
      const age = Date.now() - new Date(existing.created_at).getTime();
      if (age < 20 * 60 * 1000) return NextResponse.json({ ok: true, paymentPageUrl: existing.payment_page_url, reused: true });
    }

    const { data: seller, error: sellerError } = await admin.from("kk_sellers").select("id,slug,name").eq("id", order.seller_id).single();
    if (sellerError || !seller) throw new PaymentHttpError(409, "Satıcı hesabı bulunamadı.");

    const { data: payout, error: payoutError } = await admin
      .from("kk_seller_payout_accounts")
      .select("submerchant_key,onboarding_status")
      .eq("seller_id", order.seller_id)
      .maybeSingle();
    if (payoutError) throw new PaymentHttpError(500, "Satıcı ödeme hesabı kontrol edilemedi.", payoutError.code);
    if (!payout || payout.onboarding_status !== "active" || !payout.submerchant_key) {
      throw new PaymentHttpError(409, "Satıcının iyzico alt üye hesabı henüz aktif değil.", "SELLER_PAYOUT_NOT_READY");
    }

    const fees = calculatePaymentFees(amount);
    const conversationId = paymentConversationId(orderNo);
    const origin = publicApplicationOrigin(request.nextUrl.origin);
    const callbackUrl = `${origin}/api/payments/iyzico/callback`;
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1").trim();

    const { data: attempt, error: attemptError } = await admin.from("kk_payment_attempts").insert({
      order_id: order.id,
      buyer_id: user.id,
      seller_id: order.seller_id,
      conversation_id: conversationId,
      basket_id: orderNo,
      currency: "TRY",
      item_price: fees.itemPrice,
      buyer_fee: fees.buyerFee,
      paid_price: fees.paidPrice,
      seller_commission: fees.sellerCommission,
      seller_payout_amount: fees.sellerPayoutAmount,
      status: "initializing",
    }).select("id").single();
    if (attemptError || !attempt) throw new PaymentHttpError(500, "Ödeme kaydı oluşturulamadı.", attemptError?.code);

    await admin.from("kk_orders").update({ payment_status: "initializing", payment_attempt_id: attempt.id, payment_provider: "iyzico" }).eq("id", order.id);

    const result = await initializeCheckoutForm({
      locale: "tr",
      conversationId,
      price: fees.itemPrice.toFixed(2),
      paidPrice: fees.paidPrice.toFixed(2),
      currency: "TRY",
      basketId: orderNo,
      paymentGroup: "PRODUCT",
      callbackUrl,
      forceThreeDS: 1,
      enabledInstallments: enabledInstallments(),
      buyer: {
        id: user.id,
        name,
        surname,
        gsmNumber,
        email,
        identityNumber,
        registrationAddress: address,
        ip,
        city,
        country: "Turkey",
        zipCode,
      },
      shippingAddress: { contactName: `${name} ${surname}`, city, country: "Turkey", address, zipCode },
      billingAddress: { contactName: `${name} ${surname}`, city, country: "Turkey", address, zipCode },
      basketItems: [{
        id: order.product_id || order.id,
        name: order.product_title,
        category1: "Açık Artırma",
        category2: "KapışKapış",
        itemType: "PHYSICAL",
        price: fees.itemPrice.toFixed(2),
        subMerchantKey: payout.submerchant_key,
        subMerchantPrice: fees.sellerPayoutAmount.toFixed(2),
      }],
    });

    const signatureVerified = verifyIyzicoResponseSignature([result.conversationId, result.token], result.signature);
    const signatureAccepted = signatureVerified || (!result.signature && !iyzicoRequiresResponseSignature());
    if (result.status !== "success" || !result.token || !result.paymentPageUrl || !signatureAccepted) {
      await admin.from("kk_payment_attempts").update({
        status: "failed",
        response_signature_verified: signatureVerified,
        failure_code: String(result.errorCode ?? "IYZICO_INITIALIZE_FAILED"),
        failure_message: String(result.errorMessage ?? "iyzico ödeme formu başlatılamadı."),
        provider_summary: sanitizedProviderSummary(result),
      }).eq("id", attempt.id);
      await admin.from("kk_orders").update({ payment_status: "failed" }).eq("id", order.id);
      throw new PaymentHttpError(502, String(result.errorMessage ?? "iyzico ödeme formu başlatılamadı."), String(result.errorCode ?? "IYZICO_INITIALIZE_FAILED"));
    }

    const { error: updateError } = await admin.from("kk_payment_attempts").update({
      token: String(result.token),
      payment_page_url: String(result.paymentPageUrl),
      status: "pending",
      response_signature_verified: signatureVerified,
      provider_summary: sanitizedProviderSummary(result),
    }).eq("id", attempt.id);
    if (updateError) throw new PaymentHttpError(500, "Ödeme oturumu kaydedilemedi.", updateError.code);
    await admin.from("kk_orders").update({ payment_status: "pending" }).eq("id", order.id);

    return NextResponse.json({ ok: true, paymentPageUrl: String(result.paymentPageUrl), fees });
  } catch (error) {
    return errorResponse(error);
  }
}
