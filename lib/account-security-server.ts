import "server-only";

import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PaymentHttpError } from "@/lib/supabase-server";

export type SecuritySessionRow = {
  id: string;
  sessionId: string;
  deviceId: string;
  deviceName: string;
  ipMasked: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  trustedAt: string | null;
  revokedAt: string | null;
  current: boolean;
};

export type SecurityEventRow = {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  severity: "info" | "warning" | "critical";
  createdAt: string;
};

type JwtClaims = {
  session_id?: string;
  aal?: string;
  sub?: string;
};

type SessionDbRow = {
  id: string;
  session_id: string;
  device_id: string;
  device_name: string;
  ip_masked: string | null;
  first_seen_at: string;
  last_seen_at: string;
  trusted_at: string | null;
  revoked_at: string | null;
};

type EventDbRow = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  severity: string;
  created_at: string;
};

export function decodeVerifiedJwtClaims(token: string): JwtClaims {
  try {
    const payload = token.split(".")[1];
    if (!payload) throw new Error("JWT payload eksik.");
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtClaims;
  } catch {
    throw new PaymentHttpError(401, "Oturum bilgisi okunamadı.", "INVALID_SESSION_TOKEN");
  }
}

function cleanHeader(value: string | null, max = 240) {
  return (value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "";
}

function maskIp(ip: string) {
  if (!ip) return null;
  if (ip.includes(".")) {
    const parts = ip.split(".");
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.x` : null;
  }
  const parts = ip.split(":").filter(Boolean);
  return parts.length ? `${parts.slice(0, 3).join(":")}:…` : null;
}

function hashIp(ip: string) {
  if (!ip) return null;
  const secret = process.env.SESSION_FINGERPRINT_SECRET?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) return null;
  return createHmac("sha256", secret).update(ip).digest("hex");
}

function inferDeviceName(userAgent: string) {
  const ua = userAgent.toLowerCase();
  const os = ua.includes("windows") ? "Windows" : ua.includes("mac os") || ua.includes("macintosh") ? "macOS" : ua.includes("android") ? "Android" : ua.includes("iphone") || ua.includes("ipad") ? "iOS" : ua.includes("linux") ? "Linux" : "Bilinmeyen sistem";
  const browser = ua.includes("edg/") ? "Edge" : ua.includes("opr/") ? "Opera" : ua.includes("chrome/") ? "Chrome" : ua.includes("firefox/") ? "Firefox" : ua.includes("safari/") ? "Safari" : "Tarayıcı";
  return `${browser} · ${os}`;
}

async function insertSecurityEvent(
  admin: SupabaseClient,
  userId: string,
  eventType: string,
  title: string,
  description: string,
  severity: SecurityEventRow["severity"],
  sessionId: string | null,
  metadata: Record<string, unknown> = {},
  actorUserId: string | null = null,
) {
  const { error } = await admin.from("kk_security_events").insert({
    user_id: userId,
    actor_user_id: actorUserId,
    event_type: eventType,
    title,
    description,
    severity,
    session_id: sessionId,
    metadata,
  });
  if (error && error.code !== "42P01") console.error("[KapışKapış] güvenlik olayı kaydedilemedi:", error.message);
}

async function createNewDeviceNotification(admin: SupabaseClient, userId: string, deviceName: string, ipMasked: string | null) {
  const { error } = await admin.from("kk_notifications").insert({
    user_id: userId,
    kind: "account",
    event_type: "new_device_login",
    event_key: `new-device-${userId}-${Date.now()}`,
    title: "Yeni cihazdan giriş yapıldı",
    description: `${deviceName}${ipMasked ? ` · ${ipMasked}` : ""}. Bu giriş sana ait değilse diğer oturumları kapat ve şifreni değiştir.`,
    href: "/ayarlar?tab=security",
    action_label: "Güvenliği kontrol et",
    important: true,
  });
  if (error && error.code !== "42P01") console.error("[KapışKapış] yeni cihaz bildirimi oluşturulamadı:", error.message);
}

export async function registerCurrentSecuritySession(
  admin: SupabaseClient,
  request: NextRequest,
  user: User,
  token: string,
) {
  const claims = decodeVerifiedJwtClaims(token);
  const sessionId = cleanHeader(claims.session_id ?? "", 64);
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) throw new PaymentHttpError(401, "Geçerli oturum kimliği bulunamadı.");

  const deviceIdHeader = cleanHeader(request.headers.get("x-kk-device-id"), 100);
  const deviceId = deviceIdHeader || `session-${sessionId}`;
  const userAgent = cleanHeader(request.headers.get("user-agent"), 600);
  const requestedLabel = cleanHeader(request.headers.get("x-kk-device-label"), 120);
  const deviceName = requestedLabel || inferDeviceName(userAgent);
  const ip = getClientIp(request);
  const ipMasked = maskIp(ip);

  const [{ data: existingSession, error: existingError }, { count: knownDeviceCount, error: countError }] = await Promise.all([
    admin.from("kk_account_sessions")
      .select("id,device_id,revoked_at")
      .eq("user_id", user.id)
      .eq("session_id", sessionId)
      .maybeSingle(),
    admin.from("kk_account_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("device_id", deviceId),
  ]);
  if (existingError && existingError.code !== "42P01") throw new PaymentHttpError(503, "Oturum güvenliği şeması okunamadı.", existingError.code);
  if (countError && countError.code !== "42P01") throw new PaymentHttpError(503, "Cihaz kayıtları okunamadı.", countError.code);

  if (existingSession && typeof existingSession.revoked_at === "string") {
    throw new PaymentHttpError(401, "Bu cihaz oturumu güvenlik merkezinden kapatılmış. Yeniden giriş yapmalısın.", "SESSION_REVOKED");
  }

  const isNewDevice = !existingSession && (knownDeviceCount ?? 0) === 0;
  const { error: upsertError } = await admin.from("kk_account_sessions").upsert({
    user_id: user.id,
    session_id: sessionId,
    device_id: deviceId,
    device_name: deviceName,
    user_agent: userAgent || null,
    ip_hash: hashIp(ip),
    ip_masked: ipMasked,
    last_seen_at: new Date().toISOString(),
    revoked_at: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,session_id" });
  if (upsertError) throw new PaymentHttpError(503, "Oturum güvenliği şeması hazır değil. Paket 33 SQL dosyasını çalıştır.", upsertError.code);

  if (isNewDevice) {
    const { count: allSessions } = await admin.from("kk_account_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((allSessions ?? 0) > 1) {
      await insertSecurityEvent(admin, user.id, "new_device_login", "Yeni cihazdan giriş", `${deviceName}${ipMasked ? ` · ${ipMasked}` : ""}`, "warning", sessionId, { deviceId, deviceName, ipMasked });
      await createNewDeviceNotification(admin, user.id, deviceName, ipMasked);
    } else {
      await insertSecurityEvent(admin, user.id, "first_device_registered", "İlk güvenli cihaz kaydedildi", deviceName, "info", sessionId, { deviceId, deviceName });
    }
  }

  return sessionId;
}

export async function getSecurityState(admin: SupabaseClient, userId: string, currentSessionId: string) {
  const [{ data: sessions, error: sessionsError }, { data: events, error: eventsError }] = await Promise.all([
    admin.from("kk_account_sessions")
      .select("id,session_id,device_id,device_name,ip_masked,first_seen_at,last_seen_at,trusted_at,revoked_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false })
      .limit(20),
    admin.from("kk_security_events")
      .select("id,event_type,title,description,severity,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  if (sessionsError) throw new PaymentHttpError(503, "Oturum kayıtları okunamadı.", sessionsError.code);
  if (eventsError) throw new PaymentHttpError(503, "Güvenlik kayıtları okunamadı.", eventsError.code);

  return {
    sessions: ((sessions ?? []) as SessionDbRow[]).map((row): SecuritySessionRow => ({
      id: row.id,
      sessionId: row.session_id,
      deviceId: row.device_id,
      deviceName: row.device_name,
      ipMasked: row.ip_masked,
      firstSeenAt: row.first_seen_at,
      lastSeenAt: row.last_seen_at,
      trustedAt: row.trusted_at,
      revokedAt: row.revoked_at,
      current: row.session_id === currentSessionId,
    })),
    events: ((events ?? []) as EventDbRow[]).map((row): SecurityEventRow => ({
      id: row.id,
      eventType: row.event_type,
      title: row.title,
      description: row.description,
      severity: row.severity === "critical" || row.severity === "warning" ? row.severity : "info",
      createdAt: row.created_at,
    })),
  };
}

export async function applySecurityAction(
  admin: SupabaseClient,
  user: User,
  token: string,
  action: string,
  trusted?: boolean,
) {
  const claims = decodeVerifiedJwtClaims(token);
  const sessionId = String(claims.session_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) throw new PaymentHttpError(401, "Geçerli oturum kimliği bulunamadı.");

  if (action === "close_others") {
    const now = new Date().toISOString();
    const { error } = await admin.from("kk_account_sessions")
      .update({ revoked_at: now, updated_at: now })
      .eq("user_id", user.id)
      .neq("session_id", sessionId)
      .is("revoked_at", null);
    if (error) throw new PaymentHttpError(503, "Diğer oturum kayıtları kapatılamadı.", error.code);
    await insertSecurityEvent(admin, user.id, "other_sessions_closed", "Diğer cihaz oturumları kapatıldı", "Geçerli cihaz dışındaki yenilenebilir oturumlar sonlandırıldı.", "warning", sessionId);
  } else if (action === "trust_current") {
    const value = trusted === false ? null : new Date().toISOString();
    const { error } = await admin.from("kk_account_sessions")
      .update({ trusted_at: value, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("session_id", sessionId);
    if (error) throw new PaymentHttpError(503, "Cihaz güven durumu güncellenemedi.", error.code);
    await insertSecurityEvent(admin, user.id, trusted === false ? "device_untrusted" : "device_trusted", trusted === false ? "Cihaz güvenilir listesinden çıkarıldı" : "Cihaz güvenilir olarak işaretlendi", "Geçerli cihazın güven durumu güncellendi.", "info", sessionId);
  } else if (action === "password_changed") {
    await admin.from("kk_profiles").update({ last_password_changed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", user.id);
    await insertSecurityEvent(admin, user.id, "password_changed", "Hesap şifresi değiştirildi", "Şifre değişikliğinden sonra diğer cihaz oturumları kapatıldı.", "warning", sessionId);
  } else if (action === "mfa_enabled" || action === "mfa_disabled") {
    await insertSecurityEvent(admin, user.id, action, action === "mfa_enabled" ? "İki adımlı doğrulama etkinleştirildi" : "İki adımlı doğrulama kaldırıldı", action === "mfa_enabled" ? "Authenticator uygulaması hesabına bağlandı." : "Authenticator uygulaması hesabından kaldırıldı.", action === "mfa_enabled" ? "info" : "warning", sessionId);
  } else {
    throw new PaymentHttpError(400, "Geçersiz güvenlik işlemi.");
  }

  return sessionId;
}

export async function logAdminRoleSecurityEvent(
  admin: SupabaseClient,
  targetUserId: string,
  actorUserId: string,
  eventType: "admin_granted" | "admin_revoked",
  description: string,
) {
  await insertSecurityEvent(admin, targetUserId, eventType, eventType === "admin_granted" ? "Yönetici yetkisi verildi" : "Yönetici yetkisi kaldırıldı", description, "critical", null, {}, actorUserId);
}
