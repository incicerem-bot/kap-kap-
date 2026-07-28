"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applySecurityAction, fetchSecurityState, type SecurityEvent, type SecuritySession } from "@/lib/account-security";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Factor = { id: string; friendly_name?: string; status?: string; factor_type?: string; created_at?: string };
type Enrollment = { factorId: string; qrCode: string; secret: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function eventIcon(type: string) {
  if (type.includes("password")) return "🔑";
  if (type.includes("mfa")) return "🛡️";
  if (type.includes("device") || type.includes("session")) return "💻";
  if (type.includes("admin")) return "⚠️";
  return "✓";
}

export default function AccountSecurityPanel({ onNotify }: { onNotify: (message: string) => void }) {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [currentAal, setCurrentAal] = useState("aal1");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const notifyRef = useRef(onNotify);

  useEffect(() => { notifyRef.current = onNotify; }, [onNotify]);

  const verifiedTotp = useMemo(() => factors.find((factor) => factor.factor_type === "totp" && factor.status === "verified") ?? null, [factors]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const client = getSupabaseBrowserClient();
      if (!client) return;
      const [security, factorResult, aalResult] = await Promise.all([
        fetchSecurityState(),
        client.auth.mfa.listFactors(),
        client.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      setSessions(security.sessions ?? []);
      setEvents(security.events ?? []);
      const factorData = factorResult.data as { all?: Factor[]; totp?: Factor[] } | null;
      setFactors(factorData?.all ?? factorData?.totp ?? []);
      setCurrentAal(aalResult.data?.currentLevel ?? "aal1");
    } catch (error) {
      notifyRef.current(error instanceof Error ? error.message : "Güvenlik bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function beginEnrollment() {
    const client = getSupabaseBrowserClient();
    if (!client) return onNotify("Supabase bağlantısı yapılandırılmamış.");
    setProcessing(true);
    const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "KapışKapış Authenticator" });
    setProcessing(false);
    if (error || !data?.id || !data.totp) return onNotify(error?.message || "Authenticator kurulumu başlatılamadı.");
    setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
    setCode("");
  }

  async function verifyEnrollment() {
    const client = getSupabaseBrowserClient();
    if (!client || !enrollment) return;
    if (!/^\d{6}$/.test(code)) return onNotify("Authenticator uygulamasındaki 6 haneli kodu yaz.");
    setProcessing(true);
    const { error } = await client.auth.mfa.challengeAndVerify({ factorId: enrollment.factorId, code });
    if (!error) await applySecurityAction("mfa_enabled");
    setProcessing(false);
    if (error) return onNotify(error.message);
    setEnrollment(null);
    setCode("");
    onNotify("İki adımlı doğrulama etkinleştirildi.");
    await load();
  }

  async function removeMfa() {
    const client = getSupabaseBrowserClient();
    if (!client || !verifiedTotp) return;
    if (!window.confirm("Authenticator doğrulamasını kaldırmak istediğine emin misin?")) return;
    setProcessing(true);
    const { error } = await client.auth.mfa.unenroll({ factorId: verifiedTotp.id });
    if (!error) await applySecurityAction("mfa_disabled");
    setProcessing(false);
    if (error) return onNotify(error.message);
    onNotify("İki adımlı doğrulama kaldırıldı.");
    await load();
  }

  async function closeOtherSessions() {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    if (!window.confirm("Bu cihaz dışındaki tüm oturumlar kapatılsın mı?")) return;
    setProcessing(true);
    const { error } = await client.auth.signOut({ scope: "others" });
    if (!error) {
      const state = await applySecurityAction("close_others");
      setSessions(state.sessions);
      setEvents(state.events);
    }
    setProcessing(false);
    onNotify(error ? error.message : "Diğer cihazlardaki oturumlar kapatıldı.");
  }

  async function toggleTrusted(current: SecuritySession) {
    setProcessing(true);
    try {
      const state = await applySecurityAction("trust_current", { trusted: !current.trustedAt });
      setSessions(state.sessions);
      setEvents(state.events);
      onNotify(current.trustedAt ? "Cihaz güvenilir listesinden çıkarıldı." : "Bu cihaz güvenilir olarak işaretlendi.");
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Cihaz durumu güncellenemedi.");
    } finally {
      setProcessing(false);
    }
  }

  const currentSession = sessions.find((session) => session.current);
  const activeSessions = sessions.filter((session) => !session.revokedAt);

  return (
    <div className="accountSecurityPanelV23">
      <section className="securityMfaCardV23">
        <header><div><span>İKİ ADIMLI DOĞRULAMA</span><h4>Authenticator uygulaması</h4><p>Şifren ele geçirilse bile tek kullanımlık kod olmadan hesabına girilemez.</p></div><em className={verifiedTotp ? "active" : ""}>{verifiedTotp ? "Etkin" : "Kapalı"}</em></header>
        {verifiedTotp ? (
          <div className="securityMfaActiveV23"><div><strong>{verifiedTotp.friendly_name || "KapışKapış Authenticator"}</strong><small>Oturum güvenlik seviyesi: {currentAal.toUpperCase()}</small></div><button type="button" onClick={() => void removeMfa()} disabled={processing}>Kaldır</button></div>
        ) : enrollment ? (
          <div className="securityMfaEnrollV23">
            <img src={enrollment.qrCode} alt="Authenticator uygulaması için QR kod" />
            <div><strong>QR kodu Authenticator uygulamanla tara</strong><p>Tarama çalışmazsa bu anahtarı elle gir:</p><code>{enrollment.secret}</code><label>6 haneli doğrulama kodu<input inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" /></label><div><button type="button" onClick={() => void verifyEnrollment()} disabled={processing}>Doğrula ve etkinleştir</button><button type="button" className="secondary" onClick={() => setEnrollment(null)}>Vazgeç</button></div></div>
          </div>
        ) : <button type="button" className="securityPrimaryV23" onClick={() => void beginEnrollment()} disabled={processing}>Authenticator ekle</button>}
      </section>

      <section className="securitySessionsV23">
        <header><div><span>OTURUMLAR</span><h4>Aktif cihazlar</h4><p>Bu liste KapışKapış tarafından görülen güvenli oturum kayıtlarını gösterir.</p></div><button type="button" onClick={() => void closeOtherSessions()} disabled={processing || activeSessions.length < 2}>Diğerlerini kapat</button></header>
        {loading ? <p className="securityEmptyV23">Oturumlar yükleniyor…</p> : activeSessions.length ? activeSessions.map((session) => (
          <article key={session.id} className={session.current ? "current" : ""}>
            <span className="securityDeviceIconV23">{session.deviceName.toLowerCase().includes("mobile") || session.deviceName.toLowerCase().includes("ios") || session.deviceName.toLowerCase().includes("android") ? "▯" : "▣"}</span>
            <div><strong>{session.deviceName}</strong><small>{session.ipMasked || "IP bilgisi gizli"} · Son etkinlik {formatDate(session.lastSeenAt)}</small></div>
            <div className="securitySessionStateV23">{session.current && <em>Bu cihaz</em>}{session.trustedAt && <em className="trusted">Güvenilir</em>}</div>
          </article>
        )) : <p className="securityEmptyV23">Aktif oturum bulunamadı.</p>}
        {currentSession && <button type="button" className="securityTrustButtonV23" onClick={() => void toggleTrusted(currentSession)} disabled={processing}>{currentSession.trustedAt ? "Bu cihazı güvenilir listesinden çıkar" : "Bu cihazı güvenilir olarak işaretle"}</button>}
      </section>

      <section className="securityEventsV23">
        <header><div><span>GÜVENLİK GEÇMİŞİ</span><h4>Son hesap hareketleri</h4></div><button type="button" onClick={() => void load()} disabled={loading}>Yenile</button></header>
        {events.length ? events.slice(0, 8).map((event) => <article key={event.id} className={event.severity}><span>{eventIcon(event.eventType)}</span><div><strong>{event.title}</strong><small>{event.description || "Güvenlik işlemi kaydedildi."}</small></div><time>{formatDate(event.createdAt)}</time></article>) : <p className="securityEmptyV23">Henüz güvenlik kaydı bulunmuyor.</p>}
      </section>
    </div>
  );
}
