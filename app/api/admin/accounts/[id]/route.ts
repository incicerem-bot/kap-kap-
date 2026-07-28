import { NextRequest, NextResponse } from "next/server";
import { applyAdminAccountAction, type AdminAccountAction } from "@/lib/admin-accounts-server";
import { getSupabaseAdminClient, PaymentHttpError, requireAdminRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  console.error("[KapışKapış] admin account action:", error);
  return NextResponse.json({ ok: false, message: "Yönetici işlemi tamamlanamadı." }, { status: 500 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdminRequestUser(request);
    const { id } = await context.params;
    const body = await request.json() as { action?: AdminAccountAction; reason?: string };
    if (!body.action) throw new PaymentHttpError(400, "Yönetici işlemi seçilmedi.");
    await applyAdminAccountAction(getSupabaseAdminClient(), user, id, body.action, body.reason);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
