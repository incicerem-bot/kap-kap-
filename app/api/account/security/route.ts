import { NextRequest, NextResponse } from "next/server";
import { applySecurityAction, getSecurityState, registerCurrentSecuritySession } from "@/lib/account-security-server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  console.error("[KapışKapış] account security:", error);
  return NextResponse.json({ ok: false, message: "Güvenlik bilgileri işlenemedi." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { user, token } = await requireRequestUser(request);
    const admin = getSupabaseAdminClient();
    const sessionId = await registerCurrentSecuritySession(admin, request, user, token);
    const state = await getSecurityState(admin, user.id, sessionId);
    return NextResponse.json({ ok: true, ...state });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, token } = await requireRequestUser(request);
    const admin = getSupabaseAdminClient();
    await registerCurrentSecuritySession(admin, request, user, token);
    const body = await request.json().catch(() => ({})) as { action?: string; trusted?: boolean };
    const sessionId = await applySecurityAction(admin, user, token, String(body.action ?? ""), body.trusted);
    const state = await getSecurityState(admin, user.id, sessionId);
    return NextResponse.json({ ok: true, ...state });
  } catch (error) {
    return errorResponse(error);
  }
}
