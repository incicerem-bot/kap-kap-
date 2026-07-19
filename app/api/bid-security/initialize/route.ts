import { NextRequest, NextResponse } from "next/server";
import { initializeCheckoutForm, iyzicoRequiresResponseSignature, verifyIyzicoResponseSignature } from "@/lib/iyzico";
import { bidDepositBasketId, bidDepositConversationId, bidSecurityOrigin } from "@/lib/bid-security-server";
import { sanitizedProviderSummary } from "@/lib/payment-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  listingSlug?: string;
  bidAmount?: number;
  maxAmount?: number | null;
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

function text(value: unknown, max = 255) {
  return String(value ?? "").trim().slice(0, max);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+9${digits}`;
  if (digits.length === 10) return `+90${digits}`;
  return value.startsWith("+") ? value : `+${digits}`;
}

function verificationAmount() {
  const value = Number(process.env.KAPISKAPIS_CARD_VERIFICATION_AMOUNT ?? 10);
  return Number.isFinite(value) && value >= 1 && value <= 100 ? Math.round(value * 100) / 100 : 10;
}

function enabledInstallments() {
  const configured = (process.env.IYZIPAY_ENABLED_INSTALLMENTS ?? "1")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12);
  return configured.length ? [...new Set(configured)] : [1];
}

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  const message = error instanceof Error ? error.message : "Teklif güvencesi başlatılamadı.";
  console.error("[KapışKapış] akıllı teklif güvencesi initialize:", error);
  return NextResponse.json({ ok: false, message }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const body = await request.json() as Body;
    const listingSlug = text(body.listingSlug, 160);
    const bidAmount = Math.round(Number(body.bidAmount) * 100) / 100;
    const maxAmount = body.maxAmount == null ? null : Math.round(Number(body.maxAmount) * 100) / 100;

    if (!listingSlug) throw new PaymentHttpError(400, "Açık artırma seçilmedi.");
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) throw new PaymentHttpError(400, "Teklif tutarı geçersiz.");
    if (maxAmount != null && (!Number.isFinite(maxAmount) || maxAmount < bidAmount)) throw new PaymentHttpError(400, "Otomatik teklif üst sınırı geçersiz.");

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
    if (address.length < 10 || city.length < 2) throw new PaymentHttpError(400, "Fatura adresini eksiksiz gir.");

    const admin = getSupabaseAdminClient();
    const { data: quoteRows, error: quoteError } = await admin.rpc("kk_get_bid_security_quote_for_user", {
      p_user_id: user.id,
      p_listing_slug: listingSlug,
      p_amount: bidAmount,
      p_max_amount: maxAmount,
    });
    if (quoteError) throw new PaymentHttpError(400, quoteError.message, quoteError.code);
    const quoteRow = (Array.isArray(quoteRows) ? quoteRows[0] : quoteRows) as Record<string, unknown> | undefined;
    if (!quoteRow) throw new PaymentHttpError(404, "Teklif güvencesi hesaplanamadı.");

    const cardVerificationRequired = Boolean(quoteRow.card_verification_required);
    const additionalSecurityRequired = Number(quoteRow.additional_security_required ?? 0);
    const amount = Math.max(additionalSecurityRequired, cardVerificationRequired ? verificationAmount() : 0);
    if (amount <= 0) throw new PaymentHttpError(409, "Bu teklif için ek güvence gerekmiyor. Teklif ekranına dönüp işlemi tamamlayabilirsin.");

    const purpose = cardVerificationRequired && additionalSecurityRequired <= 0 ? "card_verification" : "smart_guarantee";
    const listingId = String(quoteRow.listing_id);
    const listingTitle = String(quoteRow.listing_title ?? "Açık artırma");

    const { data: existing } = await admin.from("kk_bid_deposit_attempts")
      .select("id,status,payment_page_url,created_at")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .eq("requested_bid_amount", bidAmount)
      .eq("requested_max_amount", maxAmount ?? bidAmount)
      .in("status", ["pending", "awaiting_webhook"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.payment_page_url) {
      const age = Date.now() - new Date(existing.created_at).getTime();
      if (age < 20 * 60 * 1000) return NextResponse.json({ ok: true, paymentPageUrl: existing.payment_page_url, amount, reused: true });
    }

    const conversationId = bidDepositConversationId(user.id);
    const basketId = bidDepositBasketId();
    const origin = bidSecurityOrigin(request.nextUrl.origin);
    const callbackUrl = `${origin}/api/bid-security/callback`;
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1").trim();

    const { data: attempt, error: attemptError } = await admin.from("kk_bid_deposit_attempts").insert({
      user_id: user.id,
      listing_id: listingId,
      conversation_id: conversationId,
      basket_id: basketId,
      amount,
      currency: "TRY",
      status: "initializing",
      requested_bid_amount: bidAmount,
      requested_max_amount: maxAmount ?? bidAmount,
      required_security: Number(quoteRow.total_security_required ?? 0),
      purpose,
      request_ip: ip,
    }).select("id").single();
    if (attemptError || !attempt) throw new PaymentHttpError(500, "Teklif güvencesi kaydı oluşturulamadı.", attemptError?.code);

    const result = await initializeCheckoutForm({
      locale: "tr",
      conversationId,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: "TRY",
      basketId,
      paymentGroup: "LISTING",
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
        id: attempt.id,
        name: purpose === "card_verification" ? "KapışKapış kart doğrulaması" : `${listingTitle} teklif güvencesi`,
        category1: "Açık Artırma",
        category2: "Akıllı Teklif Güvencesi",
        itemType: "VIRTUAL",
        price: amount.toFixed(2),
      }],
    });

    const signatureVerified = verifyIyzicoResponseSignature([result.conversationId, result.token], result.signature);
    const signatureAccepted = signatureVerified || (!result.signature && !iyzicoRequiresResponseSignature());
    if (result.status !== "success" || !result.token || !result.paymentPageUrl || !signatureAccepted) {
      await admin.from("kk_bid_deposit_attempts").update({
        status: "failed",
        response_signature_verified: signatureVerified,
        failure_code: String(result.errorCode ?? "IYZICO_SMART_GUARANTEE_INITIALIZE_FAILED"),
        failure_message: String(result.errorMessage ?? "iyzico teklif güvencesi formu başlatılamadı."),
        provider_summary: sanitizedProviderSummary(result),
      }).eq("id", attempt.id);
      throw new PaymentHttpError(502, String(result.errorMessage ?? "iyzico teklif güvencesi formu başlatılamadı."), String(result.errorCode ?? "IYZICO_SMART_GUARANTEE_INITIALIZE_FAILED"));
    }

    const { error: updateError } = await admin.from("kk_bid_deposit_attempts").update({
      token: String(result.token),
      payment_page_url: String(result.paymentPageUrl),
      status: "pending",
      response_signature_verified: signatureVerified,
      provider_summary: sanitizedProviderSummary(result),
    }).eq("id", attempt.id);
    if (updateError) throw new PaymentHttpError(500, "Teklif güvencesi oturumu kaydedilemedi.", updateError.code);

    return NextResponse.json({
      ok: true,
      paymentPageUrl: String(result.paymentPageUrl),
      amount,
      quote: {
        listingId,
        listingSlug,
        listingTitle,
        riskAmount: Number(quoteRow.risk_amount ?? bidAmount),
        securityForBid: Number(quoteRow.security_for_bid ?? 0),
        committedSecurity: Number(quoteRow.committed_security ?? 0),
        totalSecurityRequired: Number(quoteRow.total_security_required ?? 0),
        heldSecurity: Number(quoteRow.held_security ?? 0),
        additionalSecurityRequired,
        cardVerified: Boolean(quoteRow.card_verified),
        cardVerificationRequired,
        verificationAmount: cardVerificationRequired ? verificationAmount() : 0,
        chargeAmount: amount,
        requiresPayment: true,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
