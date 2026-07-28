import { getSupabaseBrowserClient } from "@/lib/supabase";

export type SecuritySession = {
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

export type SecurityEvent = {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  severity: "info" | "warning" | "critical";
  createdAt: string;
};

export type SecurityState = {
  sessions: SecuritySession[];
  events: SecurityEvent[];
};

function getOrCreateDeviceId() {
  const key = "kk_device_id";
  const current = window.localStorage.getItem(key);
  if (current) return current;
  const next = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, next);
  return next;
}

function deviceLabel() {
  const ua = navigator.userAgent.toLowerCase();
  const os = ua.includes("windows") ? "Windows" : ua.includes("macintosh") || ua.includes("mac os") ? "macOS" : ua.includes("android") ? "Android" : ua.includes("iphone") || ua.includes("ipad") ? "iOS" : ua.includes("linux") ? "Linux" : "Cihaz";
  const browser = ua.includes("edg/") ? "Edge" : ua.includes("opr/") ? "Opera" : ua.includes("chrome/") ? "Chrome" : ua.includes("firefox/") ? "Firefox" : ua.includes("safari/") ? "Safari" : "Tarayıcı";
  return `${browser} · ${os}`;
}

async function authorizedSecurityFetch(init?: RequestInit) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Güvenli oturum bulunamadı.");

  const response = await fetch("/api/account/security", {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-KK-Device-ID": getOrCreateDeviceId(),
      "X-KK-Device-Label": deviceLabel(),
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) throw new Error(body.message || "Güvenlik işlemi tamamlanamadı.");
  return body as SecurityState & { ok: true };
}

export async function fetchSecurityState() {
  return authorizedSecurityFetch();
}

export async function applySecurityAction(action: string, payload: Record<string, unknown> = {}) {
  return authorizedSecurityFetch({ method: "POST", body: JSON.stringify({ action, ...payload }) });
}

export async function registerSecuritySessionSilently() {
  try {
    await authorizedSecurityFetch();
  } catch {
    // Paket 33 migration'ı henüz kurulmadıysa uygulama açılışı etkilenmez.
  }
}
