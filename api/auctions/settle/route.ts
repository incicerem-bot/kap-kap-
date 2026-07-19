import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function settle(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "Yetkisiz zamanlanmış görev isteği." }, { status: 401 });
  }

  try {
    const admin = getSupabaseAdminClient();
    const [{ data: finalized, error: finalizeError }, { data: reassigned, error: settlementError }] = await Promise.all([
      admin.rpc("kk_finalize_expired_auctions"),
      admin.rpc("kk_process_unpaid_auction_orders", { p_limit: 250 }),
    ]);

    if (finalizeError) throw finalizeError;
    if (settlementError) throw settlementError;

    return NextResponse.json({
      ok: true,
      finalizedAuctions: Number(finalized ?? 0),
      expiredOrReassignedOrders: Number(reassigned ?? 0),
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[KapışKapış] Açık artırma settlement görevi:", error);
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : "Açık artırma kapanış görevi tamamlanamadı.",
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return settle(request);
}

export async function POST(request: NextRequest) {
  return settle(request);
}
