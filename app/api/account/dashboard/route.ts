import { NextRequest, NextResponse } from "next/server";
import { buildAccountDashboard } from "@/lib/dashboard-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const dashboard = await buildAccountDashboard(getSupabaseAdminClient(), user);
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    if (error instanceof PaymentHttpError) return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
    console.error("[KapışKapış] hesap paneli:", error);
    return NextResponse.json({ ok: false, message: "Hesap merkezi yüklenemedi." }, { status: 500 });
  }
}
