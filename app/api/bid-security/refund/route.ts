import { NextRequest, NextResponse } from "next/server";
import { refundBidDeposit } from "@/lib/bid-security-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const body = await request.json().catch(() => ({}));
    const depositId = String(body?.depositId ?? "").trim();
    if (!depositId) throw new PaymentHttpError(400, "İade edilecek teminat seçilmedi.");

    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.from("kk_bid_deposit_attempts").select("*").eq("id", depositId).eq("user_id", user.id).maybeSingle();
    if (error) throw new PaymentHttpError(500, "Güvence kaydı okunamadı.", error.code);
    if (!data) throw new PaymentHttpError(404, "Güvence kaydı bulunamadı.");

    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1").trim();
    const result = await refundBidDeposit(admin, data as any, ip);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const status = error instanceof PaymentHttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Güvence iadesi tamamlanamadı.";
    console.error("[KapışKapış] teklif teminatı iadesi:", error);
    return NextResponse.json({ ok: false, message }, { status });
  }
}
