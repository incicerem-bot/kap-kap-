import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PaymentHttpError } from "@/lib/supabase-server";

export type CompleteProfileInput = {
  fullName?: unknown;
  username?: unknown;
  birthDate?: unknown;
  city?: unknown;
  district?: unknown;
};

export type CompletedProfile = {
  id: string;
  fullName: string;
  username: string;
  birthDate: string;
  city: string;
  district: string | null;
  profileCompletedAt: string;
};

function text(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeUsername(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (letter) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[letter] ?? letter)
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);
}

function parseBirthDate(value: unknown) {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new PaymentHttpError(400, "Doğum tarihini gün, ay ve yıl olarak seç.", "INVALID_BIRTH_DATE");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new PaymentHttpError(400, "Doğum tarihi geçerli görünmüyor.", "INVALID_BIRTH_DATE");
  }

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const adultCutoff = new Date(Date.UTC(todayUtc.getUTCFullYear() - 18, todayUtc.getUTCMonth(), todayUtc.getUTCDate()));
  const oldestCutoff = new Date(Date.UTC(todayUtc.getUTCFullYear() - 100, todayUtc.getUTCMonth(), todayUtc.getUTCDate()));

  if (date > adultCutoff) throw new PaymentHttpError(400, "KapışKapış hesabı için 18 yaşını doldurmuş olmalısın.", "AGE_REQUIRED");
  if (date < oldestCutoff) throw new PaymentHttpError(400, "Doğum tarihi geçerli görünmüyor.", "INVALID_BIRTH_DATE");
  return raw;
}

function databaseError(error: { code?: string; message?: string }) {
  if (error.code === "23505") return new PaymentHttpError(409, "Bu kullanıcı adı başka bir hesap tarafından kullanılıyor.", "USERNAME_TAKEN");
  if (error.code === "42P01" || error.code === "42703") {
    return new PaymentHttpError(503, "Profil veritabanı hazır değil. Paket 36 profil onarım SQL dosyasını çalıştır.", error.code);
  }
  return new PaymentHttpError(500, "Profil bilgileri kaydedilemedi.", error.code);
}

export async function completeAccountProfile(
  admin: SupabaseClient,
  user: User,
  input: CompleteProfileInput,
): Promise<CompletedProfile> {
  const fullName = text(input.fullName, 120);
  const username = normalizeUsername(input.username);
  const birthDate = parseBirthDate(input.birthDate);
  const city = text(input.city, 80);
  const district = text(input.district, 80) || null;

  if (fullName.length < 3) throw new PaymentHttpError(400, "Ad soyad en az 3 karakter olmalıdır.", "INVALID_FULL_NAME");
  if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(username)) {
    throw new PaymentHttpError(400, "Kullanıcı adı 3-30 karakter olmalı; küçük harf, rakam, nokta, alt çizgi veya tire içerebilir.", "INVALID_USERNAME");
  }
  if (city.length < 2) throw new PaymentHttpError(400, "Şehir bilgisini eksiksiz gir.", "INVALID_CITY");

  const { data: existing, error: existingError } = await admin
    .from("kk_profiles")
    .select("id,role,account_status,seller_status,marketing_opt_in,terms_version")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) throw databaseError(existingError);
  if (existing?.account_status === "suspended") throw new PaymentHttpError(403, "Hesabın geçici olarak kısıtlandı.", "ACCOUNT_SUSPENDED");
  if (existing?.account_status === "closed") throw new PaymentHttpError(403, "Hesabın kapalı.", "ACCOUNT_CLOSED");

  const profileCompletedAt = new Date().toISOString();
  const allowedUpdate = {
    full_name: fullName,
    username,
    birth_date: birthDate,
    city,
    district,
    profile_completed_at: profileCompletedAt,
    onboarding_completed: true,
    updated_at: profileCompletedAt,
  };

  if (existing) {
    const { error } = await admin.from("kk_profiles").update(allowedUpdate).eq("id", user.id);
    if (error) throw databaseError(error);
  } else {
    const requestedRole = String(user.user_metadata?.account_type ?? "buyer").toLowerCase() === "seller" ? "seller" : "buyer";
    const { error } = await admin.from("kk_profiles").insert({
      id: user.id,
      ...allowedUpdate,
      role: requestedRole,
      account_status: "active",
      seller_status: requestedRole === "seller" ? "pending" : "not_started",
      marketing_opt_in: Boolean(user.user_metadata?.marketing_opt_in),
      terms_version: typeof user.user_metadata?.terms_version === "string" ? user.user_metadata.terms_version : null,
    });
    if (error) throw databaseError(error);
  }

  const { data: saved, error: savedError } = await admin
    .from("kk_profiles")
    .select("id,full_name,username,birth_date,city,district,profile_completed_at")
    .eq("id", user.id)
    .single();
  if (savedError) throw databaseError(savedError);
  if (!saved?.profile_completed_at) throw new PaymentHttpError(500, "Profil kaydı doğrulanamadı.");

  const metadata = { ...(user.user_metadata ?? {}), full_name: fullName, username };
  const { error: authUpdateError } = await admin.auth.admin.updateUserById(user.id, { user_metadata: metadata });
  if (authUpdateError) console.warn("[KapışKapış] profil Auth metadata senkronu:", authUpdateError.message);

  return {
    id: String(saved.id),
    fullName: String(saved.full_name),
    username: String(saved.username),
    birthDate: String(saved.birth_date),
    city: String(saved.city),
    district: saved.district ? String(saved.district) : null,
    profileCompletedAt: String(saved.profile_completed_at),
  };
}
