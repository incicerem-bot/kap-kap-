"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { canStartPhoneVerification, maskPhone, normalizeTurkishPhone, syncMyVerification } from "@/lib/auth-verification";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isSafeInternalPath } from "@/lib/auth";

type Message = { type: "success" | "error"; text: string } | null;

export default function AccountVerificationExperience() {
  const searchParams = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [pendingPhone, setPendingPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    setFullName(profile?.fullName ?? "");
    if (user?.phone) setPhone(user.phone);
  }, [profile?.fullName, user?.phone]);

  useEffect(() => {
    if (!user) return;
    void syncMyVerification().then(() => refreshProfile()).catch(() => undefined);
  }, [user, refreshProfile]);

  const emailVerified = profile?.emailVerified ?? Boolean(user?.email_confirmed_at);
  const phoneVerified = profile?.phoneVerified ?? Boolean(user?.phone_confirmed_at);
  const profileComplete = Boolean(profile?.profileCompletedAt || fullName.trim().length >= 3);
  const completed = [emailVerified, phoneVerified, profileComplete].filter(Boolean).length;
  const returnToRaw = searchParams.get("returnTo");
  const returnTo = isSafeInternalPath(returnToRaw) ? returnToRaw! : profile?.role === "seller" ? "/ilanlarim" : "/profil";
  const required = searchParams.get("required");

  const headline = useMemo(() => {
    if (required === "phone") return "Bu işlem için telefon doğrulaması gerekiyor";
    if (required === "email") return "Önce e-posta adresini doğrulamalısın";
    return "Hesabını tamamla ve güvenli işlemleri aç";
  }, [required]);

  async function resendEmail() {
    if (!user?.email) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setMessage(null);
    const { error } = await client.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/hesap-dogrulama?verified=email")}` },
    });
    setLoading(false);
    setMessage(error ? { type: "error", text: error.message } : { type: "success", text: "Doğrulama e-postası yeniden gönderildi." });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = fullName.trim();
    if (name.length < 3) {
      setMessage({ type: "error", text: "Ad soyad en az 3 karakter olmalı." });
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setMessage(null);
    const { error } = await client.rpc("kk_complete_my_profile", { p_full_name: name });
    if (!error) await client.auth.updateUser({ data: { full_name: name } });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    await refreshProfile();
    setMessage({ type: "success", text: "Profil bilgilerin tamamlandı." });
  }

  async function startPhoneVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeTurkishPhone(phone);
    if (!normalized) {
      setMessage({ type: "error", text: "Geçerli bir telefon numarası yaz. Örnek: 0532 123 45 67" });
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setMessage(null);
    try {
      const permission = await canStartPhoneVerification(normalized);
      if (!permission.allowed) throw new Error(permission.message);
      const { data, error } = await client.auth.updateUser({ phone: normalized });
      if (error) throw error;
      if (data.user?.phone_confirmed_at) {
        await syncMyVerification();
        await refreshProfile();
        setMessage({ type: "success", text: "Telefon numaran doğrulandı." });
      } else {
        setPendingPhone(normalized);
        setOtpSent(true);
        setMessage({ type: "success", text: "Telefonuna 6 haneli doğrulama kodu gönderildi." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Telefon doğrulaması başlatılamadı." });
    } finally {
      setLoading(false);
    }
  }

  async function verifyPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setMessage({ type: "error", text: "6 haneli doğrulama kodunu yaz." });
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setMessage(null);
    const { error } = await client.auth.verifyOtp({ phone: pendingPhone, token: otp, type: "phone_change" });
    if (error) {
      setLoading(false);
      setMessage({ type: "error", text: error.message });
      return;
    }
    await syncMyVerification();
    await refreshProfile();
    setLoading(false);
    setOtpSent(false);
    setOtp("");
    setPhone(pendingPhone);
    setMessage({ type: "success", text: "Telefon numaran başarıyla doğrulandı." });
  }

  async function resendPhone() {
    const client = getSupabaseBrowserClient();
    if (!client || !pendingPhone) return;
    setLoading(true);
    const { error } = await client.auth.resend({ type: "phone_change", phone: pendingPhone });
    setLoading(false);
    setMessage(error ? { type: "error", text: error.message } : { type: "success", text: "Yeni doğrulama kodu gönderildi." });
  }

  return (
    <div className="verificationCenterV20">
      <section className="verificationHeroV20">
        <div><span>HESAP AKTİVASYONU</span><h2>{headline}</h2><p>E-posta ve telefon doğrulaması hesap güvenliğini artırır; satıcı ve teklif işlemleri için gerçek kullanıcı bağlantısı sağlar.</p></div>
        <div className="verificationScoreV20"><strong>{completed}/3</strong><span>temel adım tamamlandı</span><i><b style={{ width: `${(completed / 3) * 100}%` }} /></i></div>
      </section>

      {message && <div className={`verificationMessageV20 ${message.type}`} aria-live="polite">{message.text}</div>}

      <section className="verificationGridV20">
        <article className={emailVerified ? "complete" : ""}>
          <header><i>1</i><div><small>E-POSTA</small><h3>{emailVerified ? "E-posta doğrulandı" : "E-posta doğrulaması bekleniyor"}</h3></div><em>{emailVerified ? "Tamamlandı" : "Zorunlu"}</em></header>
          <p>{user?.email || "Hesap e-postası bulunamadı"}</p>
          {!emailVerified && <button type="button" onClick={() => void resendEmail()} disabled={loading}>Doğrulama e-postasını yeniden gönder</button>}
        </article>

        <article className={phoneVerified ? "complete" : ""}>
          <header><i>2</i><div><small>TELEFON</small><h3>{phoneVerified ? "Telefon doğrulandı" : "Telefon numaranı doğrula"}</h3></div><em>{phoneVerified ? "Tamamlandı" : "Teklif ve satış"}</em></header>
          {phoneVerified ? <p>{maskPhone(profile?.phoneMasked || user?.phone)}</p> : otpSent ? (
            <form className="verificationInlineFormV20" onSubmit={verifyPhone}>
              <label>SMS doğrulama kodu<input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required /></label>
              <button type="submit" disabled={loading}>Kodu doğrula</button>
              <button type="button" className="secondary" onClick={() => void resendPhone()} disabled={loading}>Kodu yeniden gönder</button>
            </form>
          ) : (
            <form className="verificationInlineFormV20" onSubmit={startPhoneVerification}>
              <label>Telefon numarası<input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="0532 123 45 67" required /></label>
              <button type="submit" disabled={loading}>SMS kodu gönder</button>
            </form>
          )}
        </article>

        <article className={profileComplete ? "complete" : ""}>
          <header><i>3</i><div><small>PROFİL</small><h3>{profileComplete ? "Profil bilgileri tamamlandı" : "Ad soyad bilgisini tamamla"}</h3></div><em>{profileComplete ? "Tamamlandı" : "Gerekli"}</em></header>
          <form className="verificationInlineFormV20" onSubmit={saveProfile}>
            <label>Ad soyad<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>
            <button type="submit" disabled={loading}>Profili kaydet</button>
          </form>
        </article>
      </section>

      <section className="verificationRoleV20">
        <div><span>HESAP TÜRÜ</span><h3>{profile?.role === "admin" ? "Yönetici hesabı" : profile?.role === "seller" ? "Satıcı hesabı" : "Alıcı hesabı"}</h3><p>{profile?.role === "seller" ? "Satış yapabilmek için iyzico alt üye ve banka hesabı doğrulamasını tamamla." : "Alıcı hesabınla teklif verebilir; daha sonra satıcı hesabına geçebilirsin."}</p></div>
        {profile?.role === "seller" ? <Link href="/satici-dogrulama">Satıcı doğrulamaya git</Link> : profile?.role !== "admin" ? <Link href="/satici-dogrulama">Satıcı ol</Link> : null}
      </section>

      <footer className="verificationFooterV20">
        <span>{emailVerified && phoneVerified && profileComplete ? "Temel hesap aktivasyonun tamamlandı." : "Eksik adımları tamamladığında korumalı işlemler açılır."}</span>
        <Link href={returnTo} className={emailVerified && phoneVerified && profileComplete ? "ready" : ""}>Devam et</Link>
      </footer>
    </div>
  );
}
