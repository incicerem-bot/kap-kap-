import { NextRequest, NextResponse } from "next/server";
import { createAdminInvitation, listAdminInvitations, type InvitationRole } from "@/lib/admin-invitations-server";
import { getSupabaseAdminClient, PaymentHttpError, requireAdminRequestUser, requireOwnerAdminRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) {
    return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  }
  console.error("[KapışKapış] admin invitations:", error);
  return NextResponse.json({ ok: false, message: "Davet işlemi tamamlanamadı." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequestUser(request);
    const invitations = await listAdminInvitations(getSupabaseAdminClient());
    return NextResponse.json({ ok: true, invitations });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; fullName?: string; role?: InvitationRole };
    const role: InvitationRole = body.role === "seller" || body.role === "operator" ? body.role : "buyer";
    const { user } = role === "operator"
      ? await requireOwnerAdminRequestUser(request)
      : await requireAdminRequestUser(request);

    const result = await createAdminInvitation(getSupabaseAdminClient(), user, {
      email: body.email,
      fullName: body.fullName,
      role,
      origin: request.nextUrl.origin,
    });
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
