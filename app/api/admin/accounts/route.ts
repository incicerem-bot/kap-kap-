import { NextRequest, NextResponse } from "next/server";
import { listAdminAccounts } from "@/lib/admin-accounts-server";
import { getSupabaseAdminClient, PaymentHttpError, requireAdminRequestUser } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PaymentHttpError) return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: error.status });
  console.error("[KapışKapış] admin accounts:", error);
  return NextResponse.json({ ok: false, message: "Kullanıcı hesapları alınamadı." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequestUser(request);
    const page = Number(request.nextUrl.searchParams.get("page") || 1);
    const perPage = Number(request.nextUrl.searchParams.get("perPage") || 100);
    const query = request.nextUrl.searchParams.get("q") || "";
    const result = await listAdminAccounts(getSupabaseAdminClient(), page, perPage, query);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
