import { NextResponse } from "next/server";
import { getKapiskapisAdminClient } from "@/lib/kapiskapis-admin";
import { retrieveCheckoutForm, verifyCheckoutResponseSignature } from "@/lib/iyzico-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || new URL(request.url).origin).replace(/\/$/, "");
}

async function readToken(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    return String(json.token || "").trim();
  }
  const form = await request.formData();
  return String(form.get("token") || "").trim();
}

export async function POST(request: Request) {
  const base = siteUrl(request);
  let sessionId = "";
  try {
    const token = await readToken(request);
    if (!token) throw new Error("iyzico ödeme tokenı bulunamadı.");

    const admin = getKapiskapisAdminClient();
    const { data: session, error: sessionError } = await admin
      .from("kk_payment_sessions")
      .select("id,conversation_id,expected_amount,status")
      .eq("provider_token", token)
      .maybeSingle();
    if (sessionError || !session) throw new Error("Ödeme oturumu bulunamadı.");
    sessionId = String(session.id);

    const result = await retrieveCheckoutForm(token, String(session.conversation_id));
    if (!verifyCheckoutResponseSignature(result)) throw new Error("iyzico yanıt imzası doğrulanamadı.");
    if (result.conversationId !== session.conversation_id || result.token !== token) {
      throw new Error("Ödeme yanıtı oturum bilgileriyle eşleşmiyor.");
    }

    const paidPrice = Number(result.paidPrice || 0);
    const expected = Number(session.expected_amount || 0);
    if (!Number.isFinite(paidPrice) || Math.abs(paidPrice - expected) > 0.01) {
      throw new Error("Tahsil edilen tutar sipariş tutarıyla eşleşmiyor.");
    }
    if (result.status !== "success" || result.paymentStatus !== "SUCCESS") {
      throw new Error(result.errorMessage || "Ödeme tamamlanamadı.");
    }

    const fraudStatus = Number(result.fraudStatus ?? 0);
    if (fraudStatus < 0) throw new Error("Ödeme güvenlik kontrolünden geçemedi.");
    const transactionId = result.itemTransactions?.[0]?.paymentTransactionId || "";

    const { error: completeError } = await admin.rpc("kk_complete_iyzico_payment_admin", {
      p_session_id: sessionId,
      p_payment_id: String(result.paymentId || ""),
      p_transaction_id: String(transactionId),
      p_paid_price: paidPrice,
      p_fraud_status: fraudStatus,
      p_installment: Number(result.installment || 1),
      p_raw_response: result,
    });
    if (completeError) throw new Error(completeError.message);

    return NextResponse.redirect(`${base}/odeme/sonuc?session=${encodeURIComponent(sessionId)}`, 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ödeme sonucu işlenemedi.";
    if (sessionId) {
      const admin = getKapiskapisAdminClient();
      await admin.rpc("kk_mark_iyzico_session_failed_admin", {
        p_session_id: sessionId,
        p_error_message: message,
        p_raw_response: null,
      });
    }
    const query = new URLSearchParams({ ...(sessionId ? { session: sessionId } : {}), error: message });
    return NextResponse.redirect(`${base}/odeme/sonuc?${query.toString()}`, 303);
  }
}

export async function GET(request: Request) {
  return NextResponse.redirect(`${siteUrl(request)}/`, 303);
}
