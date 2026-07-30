import { NextResponse } from "next/server";
import { getKapiskapisAdminClient, requireRequestUser } from "@/lib/kapiskapis-admin";
import { initializeCheckoutForm } from "@/lib/iyzico-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PrepareResult = {
  sessionId: string;
  conversationId: string;
  intentId: string;
  listingId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  price: number;
  paidPrice: number;
  sellerPayoutAmount: number;
  subMerchantKey: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    registrationDate: string;
  };
  address: {
    contactName: string;
    city: string;
    district: string;
    country: string;
    zipCode: string;
    address: string;
  };
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function siteUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let sessionId = "";
  try {
    const user = await requireRequestUser(request);
    const body = (await request.json()) as Record<string, unknown>;
    const intentId = text(body.intentId);
    const addressId = text(body.addressId);
    const identityNumber = text(body.identityNumber).replace(/\D/g, "");

    if (!/^[0-9a-f-]{36}$/i.test(intentId) || !/^[0-9a-f-]{36}$/i.test(addressId)) {
      return NextResponse.json({ error: "Ödeme veya adres bilgisi geçersiz." }, { status: 400 });
    }
    if (!/^\d{11}$/.test(identityNumber)) {
      return NextResponse.json({ error: "iyzico doğrulaması için 11 haneli T.C. kimlik numarası gereklidir." }, { status: 400 });
    }

    const commissionRate = Math.max(0, Math.min(0.5, Number(process.env.KAPISKAPIS_COMMISSION_RATE || "0.08") || 0.08));
    const conversationId = `KK-${Date.now()}-${intentId.slice(0, 8)}`;
    const admin = getKapiskapisAdminClient();
    const { data, error } = await admin.rpc("kk_prepare_iyzico_checkout_admin", {
      p_intent_id: intentId,
      p_buyer_id: user.id,
      p_address_id: addressId,
      p_conversation_id: conversationId,
      p_commission_rate: commissionRate,
    });
    if (error) throw new Error(error.message);

    const prepared = data as PrepareResult | null;
    if (!prepared?.sessionId || !prepared.subMerchantKey) throw new Error("Ödeme hazırlığı tamamlanamadı.");
    sessionId = prepared.sessionId;

    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const buyerIp = forwarded || request.headers.get("x-real-ip") || "127.0.0.1";
    const callbackUrl = `${siteUrl(request)}/api/payments/iyzico/callback`;
    const price = Number(prepared.price).toFixed(2);
    const sellerPayout = Number(prepared.sellerPayoutAmount).toFixed(2);

    const iyzico = await initializeCheckoutForm({
      locale: "tr",
      conversationId: prepared.conversationId,
      price,
      paidPrice: Number(prepared.paidPrice).toFixed(2),
      currency: "TRY",
      basketId: prepared.intentId,
      paymentGroup: "PRODUCT",
      callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9, 12],
      buyer: {
        id: prepared.buyer.id,
        name: prepared.buyer.name,
        surname: prepared.buyer.surname,
        identityNumber,
        email: prepared.buyer.email,
        gsmNumber: prepared.buyer.gsmNumber.startsWith("+") ? prepared.buyer.gsmNumber : `+90${prepared.buyer.gsmNumber.replace(/^0/, "")}`,
        registrationDate: prepared.buyer.registrationDate,
        lastLoginDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        registrationAddress: prepared.address.address,
        city: prepared.address.city,
        country: prepared.address.country,
        zipCode: prepared.address.zipCode || "00000",
        ip: buyerIp,
      },
      shippingAddress: {
        contactName: prepared.address.contactName,
        city: prepared.address.city,
        country: prepared.address.country,
        zipCode: prepared.address.zipCode || "00000",
        address: prepared.address.address,
      },
      billingAddress: {
        contactName: prepared.address.contactName,
        city: prepared.address.city,
        country: prepared.address.country,
        zipCode: prepared.address.zipCode || "00000",
        address: prepared.address.address,
      },
      basketItems: [
        {
          id: prepared.listingId,
          name: prepared.productTitle.slice(0, 100),
          category1: "KapışKapış Pazaryeri",
          category2: "Teknoloji ve Oyun",
          itemType: "PHYSICAL",
          price,
          subMerchantKey: prepared.subMerchantKey,
          subMerchantPrice: sellerPayout,
        },
      ],
    });

    if (!iyzico.token || !iyzico.paymentPageUrl) throw new Error("iyzico ödeme sayfası oluşturulamadı.");

    const { error: recordError } = await admin.rpc("kk_record_iyzico_initialize_admin", {
      p_session_id: prepared.sessionId,
      p_token: iyzico.token,
      p_payment_page_url: iyzico.paymentPageUrl,
      p_raw_response: iyzico,
    });
    if (recordError) throw new Error(recordError.message);

    return NextResponse.json({
      ok: true,
      sessionId: prepared.sessionId,
      paymentPageUrl: iyzico.paymentPageUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ödeme başlatılamadı.";
    if (sessionId) {
      const admin = getKapiskapisAdminClient();
      await admin.rpc("kk_mark_iyzico_session_failed_admin", {
        p_session_id: sessionId,
        p_error_message: message,
        p_raw_response: null,
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
