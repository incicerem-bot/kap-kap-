import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function authorize(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return {
      ok: false as const,
      status: 503,
      message: "CRON_SECRET ortam değişkeni tanımlı değil. Manuel görev rotası güvenlik nedeniyle kapalı.",
    };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (!constantTimeEqual(authorization, expected)) {
    return {
      ok: false as const,
      status: 401,
      message: "Yetkisiz zamanlanmış görev isteği.",
    };
  }

  return { ok: true as const };
}

async function settle(request: NextRequest) {
  const authorization = authorize(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { ok: false, message: authorization.message },
      { status: authorization.status },
    );
  }

  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.rpc("kk_run_auction_maintenance", {
      p_runner: "vercel_api",
    });

    if (error) throw error;

    const result = data && typeof data === "object"
      ? data
      : { ok: true, result: data, processedAt: new Date().toISOString() };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[KapışKapış] Açık artırma bakım görevi:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error
          ? error.message
          : "Açık artırma kapanış görevi tamamlanamadı.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return settle(request);
}

export async function POST(request: NextRequest) {
  return settle(request);
}
