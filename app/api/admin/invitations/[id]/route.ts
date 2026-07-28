import { NextRequest, NextResponse } from "next/server";
import { revokeAdminInvitation } from "@/lib/admin-invitations-server";
import { getSupabaseAdminClient, PaymentHttpError, requireOwnerAdminRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) {
    return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  }
  console.error("[KapışKapış] admin invitation revoke:", error);
  return NextResponse.json({ ok: false, message: "Davet iptal edilemedi." }, { status: 500 });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { user } = await requireOwnerAdminRequestUser(request);
    await revokeAdminInvitation(getSupabaseAdminClient(), user, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
