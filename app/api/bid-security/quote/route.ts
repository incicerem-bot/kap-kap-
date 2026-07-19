import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  listingSlug?: string;
  bidAmount?: number;
  maxAmount?: number | null;
};

function verificationAmount() {
  const value = Number(process.env.KAPISKAPIS_CARD_VERIFICATION_AMOUNT ?? 10);
  return Number.isFinite(value) && value >= 1 && value <= 100 ? Math.round(value * 100) / 100 : 10;
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const body = await request.json() as Body;
    const listingSlug = String(body.listingSlug ?? "").trim();
    const bidAmount = Math.round(Number(body.bidAmount) * 100) / 100;
    const maxAmount = body.maxAmount == null ? null : Math.round(Number(body.maxAmount) * 100) / 100;

    if (!listingSlug) throw new PaymentHttpError(400, "Açık artırma seçilmedi.");
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) throw new PaymentHttpError(400, "Teklif tutarı geçersiz.");
    if (maxAmount != null && (!Number.isFinite(maxAmount) || maxAmount < bidAmount)) {
      throw new PaymentHttpError(400, "Otomatik teklif üst sınırı teklif tutarından düşük olamaz.");
    }

    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.rpc("kk_get_bid_security_quote_for_user", {
      p_user_id: user.id,
      p_listing_slug: listingSlug,
      p_amount: bidAmount,
      p_max_amount: maxAmount,
    });
    if (error) throw new PaymentHttpError(400, error.message, error.code);

    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    if (!row) throw new PaymentHttpError(404, "Teklif güvencesi hesaplanamadı.");

    const cardVerificationRequired = Boolean(row.card_verification_required);
    const additional = Number(row.additional_security_required ?? 0);
    const verifyAmount = cardVerificationRequired ? verificationAmount() : 0;
    const chargeAmount = Math.max(additional, verifyAmount);

    return NextResponse.json({
      ok: true,
      quote: {
        listingId: String(row.listing_id),
        listingSlug,
        listingTitle: String(row.listing_title ?? "Açık artırma"),
        riskAmount: Number(row.risk_amount ?? bidAmount),
        securityForBid: Number(row.security_for_bid ?? 0),
        committedSecurity: Number(row.committed_security ?? 0),
        totalSecurityRequired: Number(row.total_security_required ?? 0),
        heldSecurity: Number(row.held_security ?? 0),
        additionalSecurityRequired: additional,
        cardVerified: Boolean(row.card_verified),
        cardVerificationRequired,
        verificationAmount: verifyAmount,
        chargeAmount,
        requiresPayment: chargeAmount > 0,
      },
    });
  } catch (error) {
    const status = error instanceof PaymentHttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Teklif güvencesi hesaplanamadı.";
    return NextResponse.json({ ok: false, message }, { status });
  }
}
