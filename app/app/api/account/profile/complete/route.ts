import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompleteProfileBody = {
  fullName?: unknown;
  username?: unknown;
  birthDate?: unknown;
  city?: unknown;
  district?: unknown;
};

type ProfileRpcRow = {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  birth_date?: string | null;
  city?: string | null;
  district?: string | null;
  profile_completed_at?: string | null;
};

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function requiredPublicEnvironment(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

function profileErrorMessage(error: { code?: string; message?: string; details?: string; hint?: string }) {
  const raw = `${error.message ?? ""} ${error.details ?? ""}`.trim();

  if (error.code === "23505" || /duplicate key|unique/i.test(raw)) {
    return { status: 409, code: "USERNAME_TAKEN", message: "Bu kullanıcı adı başka bir hesap tarafından kullanılıyor." };
  }
  if (error.code === "42501" || /Oturum bulunamadı|permission denied|JWT/i.test(raw)) {
    return { status: 401, code: "SESSION_REQUIRED", message: "Oturumun doğrulanamadı. Çıkış yapıp tekrar giriş yap." };
  }
  if (error.code === "22023") {
    return { status: 400, code: "INVALID_PROFILE", message: error.message || "Profil bilgilerini kontrol et." };
  }
  if (error.code === "PGRST202" || error.code === "42883" || /kk_complete_my_profile_v3/i.test(raw)) {
    return {
      status: 503,
      code: "PROFILE_MIGRATION_REQUIRED",
      message: "Profil kayıt fonksiyonu hazır değil. Paket 37 SQL dosyasını Supabase SQL Editor'da çalıştır.",
    };
  }
  if (error.code === "42P01" || error.code === "42703") {
    return {
      status: 503,
      code: "PROFILE_SCHEMA_REQUIRED",
      message: "Profil veritabanı eksik. Paket 37 SQL dosyasını Supabase SQL Editor'da çalıştır.",
    };
  }

  return {
    status: 500,
    code: error.code || "PROFILE_SAVE_FAILED",
    message: error.message || "Profil bilgileri Supabase'e kaydedilemedi.",
  };
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { ok: false, code: "SESSION_REQUIRED", message: "Oturum bulunamadı. Lütfen yeniden giriş yap.", requestId },
        { status: 401 },
      );
    }

    let body: CompleteProfileBody;
    try {
      body = await request.json() as CompleteProfileBody;
    } catch {
      return NextResponse.json(
        { ok: false, code: "INVALID_JSON", message: "Gönderilen profil bilgileri okunamadı.", requestId },
        { status: 400 },
      );
    }

    const url = requiredPublicEnvironment("NEXT_PUBLIC_SUPABASE_URL");
    const anonKey = requiredPublicEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const client = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: authData, error: authError } = await client.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json(
        { ok: false, code: "SESSION_INVALID", message: "Oturum geçersiz veya süresi dolmuş. Çıkış yapıp tekrar giriş yap.", requestId },
        { status: 401 },
      );
    }

    const { data, error } = await client.rpc("kk_complete_my_profile_v3", {
      p_full_name: String(body.fullName ?? ""),
      p_username: String(body.username ?? ""),
      p_birth_date: String(body.birthDate ?? "") || null,
      p_city: String(body.city ?? ""),
      p_district: body.district == null ? null : String(body.district),
    });

    if (error) {
      const mapped = profileErrorMessage(error);
      console.error("[KapışKapış] profil tamamlama RPC", { requestId, code: error.code, message: error.message });
      return NextResponse.json({ ok: false, ...mapped, requestId }, { status: mapped.status });
    }

    const row = (Array.isArray(data) ? data[0] : data) as ProfileRpcRow | null;
    if (!row?.profile_completed_at) {
      console.error("[KapışKapış] profil tamamlama boş sonuç", { requestId, userId: authData.user.id, data });
      return NextResponse.json(
        { ok: false, code: "PROFILE_NOT_CONFIRMED", message: "Profil kaydı tamamlandı olarak doğrulanamadı.", requestId },
        { status: 500 },
      );
    }

    // Profil yetkisi veritabanından okunur. Auth metadata yalnız kullanıcı deneyimi için güncellenir.
    const metadata = {
      ...(authData.user.user_metadata ?? {}),
      full_name: String(row.full_name ?? ""),
      username: String(row.username ?? ""),
    };
    const { error: metadataError } = await client.auth.updateUser({ data: metadata });
    if (metadataError) {
      console.warn("[KapışKapış] profil metadata senkronu", { requestId, message: metadataError.message });
    }

    return NextResponse.json({
      ok: true,
      requestId,
      profile: {
        id: String(row.id ?? authData.user.id),
        fullName: String(row.full_name ?? ""),
        username: String(row.username ?? ""),
        birthDate: String(row.birth_date ?? ""),
        city: String(row.city ?? ""),
        district: row.district ? String(row.district) : null,
        profileCompletedAt: String(row.profile_completed_at),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profil bilgileri kaydedilemedi.";
    console.error("[KapışKapış] profil tamamlama beklenmeyen hata", { requestId, error });
    return NextResponse.json(
      { ok: false, code: "PROFILE_ROUTE_ERROR", message, requestId },
      { status: 500 },
    );
  }
}
