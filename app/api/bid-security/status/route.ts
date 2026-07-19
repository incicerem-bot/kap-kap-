import { NextRequest, NextResponse } from "next/server";
import { loadBidSecuritySummary } from "@/lib/bid-security-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const summary = await loadBidSecuritySummary(getSupabaseAdminClient(), user.id);
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    const status = error instanceof PaymentHttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Teklif güvencesi okunamadı.";
    return NextResponse.json({ ok: false, message }, { status });
  }
}
