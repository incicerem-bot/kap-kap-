import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, PaymentHttpError, requireRequestUser } from "@/lib/supabase-server";
import { loadOwnedPaymentOrder } from "@/lib/payment-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireRequestUser(request);
    const orderNo = request.nextUrl.searchParams.get("order")?.trim() ?? "";
    if (!orderNo) throw new PaymentHttpError(400, "Sipariş numarası eksik.");

    const admin = getSupabaseAdminClient();
    const order = await loadOwnedPaymentOrder(admin, user.id, orderNo);
    const { data: attempt } = await admin
      .from("kk_payment_attempts")
      .select("status,failure_message,created_at,completed_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      order: {
        orderNo: order.order_no,
        status: order.status,
        paymentStatus: order.payment_status,
        amount: Number(order.amount),
        currency: order.currency,
      },
      attempt: attempt ?? null,
    });
  } catch (error) {
    const status = error instanceof PaymentHttpError ? error.status : 500;
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Ödeme durumu okunamadı." }, { status });
  }
}
