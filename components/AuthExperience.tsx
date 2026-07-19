"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Mode = "login" | "register";
type IconName = "shield" | "check" | "mail" | "lock" | "user" | "eye" | "eyeOff" | "arrow" | "gavel";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.1 7.5 9.6 4.4-1.5 7.5-5 7.5-9.6V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="m3 3 18 18"/><path d="M10.6 10.7a2 2 0 0 0 2.7 2.7M9.8 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-2.2 3M6.6 6.6C3.9 8.5 2.5 12 2.5 12s3.5 7 9.5 7a10.5 10.5 0 0 0 3.5-.6"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    gavel: <><path d="m14 5 5 5M12 7l5 5M5 14l5 5M7 12l5 5M9 14l6-6M3 21h10"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function AuthExperience({ mode }: { mode: Mode }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const strength = useMemo(() => {
    let value = 0;
    if (password.length >= 8) value++;
    if (/[A-ZÇĞİÖŞÜ]/.test(password)) value++;
    if (/\d/.test(password)) value++;
    if (/[^\w\s]/.test(password)) value++;
    return value;
  }, [password]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "register" && !accepted) {
      setMessage({ type: "error", text: "Üyelik Sözleşmesi ve Platform Kuralları’nı kabul etmelisin." });
      return;
    }

    setLoading(true);
    setMessage(null);
    const client = getSupabaseBrowserClient();

    if (!client) {
      window.setTimeout(() => {
        setLoading(false);
        setMessage({ type: "success", text: mode === "login" ? "Demo giriş başarılı. Supabase anahtarları eklendiğinde gerçek oturum açılacak." : "Demo hesap oluşturuldu. Supabase anahtarları eklendiğinde e-posta doğrulaması gönderilecek." });
      }, 550);
      return;
    }

    try {
      if (mode === "login") {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const returnTo = new URLSearchParams(window.location.search).get("returnTo");
        window.location.assign(returnTo?.startsWith("/") ? returnTo : "/profil");
      } else {
        const { error } = await client.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim(), marketing_opt_in: marketingOptIn, terms_version: "2026.07" } } });
        if (error) throw error;
        setMessage({ type: "success", text: "Hesabın oluşturuldu. E-posta adresine gönderilen doğrulama bağlantısını aç." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "İşlem tamamlanamadı. Bilgilerini kontrol edip tekrar dene." });
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setMessage({ type: "error", text: "Şifre yenileme bağlantısı için önce e-posta adresini yaz." });
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) {
      setMessage({ type: "success", text: "Demo modunda şifre yenileme talebi oluşturuldu." });
      return;
    }
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/ayarlar?reset=1` });
    setMessage(error ? { type: "error", text: error.message } : { type: "success", text: "Şifre yenileme bağlantısı e-posta adresine gönderildi." });
  }

  return (
    <main className="authPageV8">
      <Link href="/" className="authBrandV8" aria-label="KapışKapış ana sayfa"><img src="/kapiskapis-logo.png" alt="KapışKapış" /></Link>
      <section className="authShellV8">
        <aside className="authTrustV8">
          <div className="authTrustGlowV8" />
          <span className="authTrustLabelV8"><Icon name="gavel" /> GÜVENLİ AÇIK ARTIRMA</span>
          <h1>{mode === "login" ? "Tekliflerine kaldığın yerden devam et." : "Güvenli alım ve satış dünyasına katıl."}</h1>
          <p>Teklif limiti, güvenli ödeme ve doğrulanmış kullanıcı sistemiyle teknoloji ve oyun ürünlerinde kontrollü alışveriş.</p>
          <div className="authBenefitsV8">
            <article><span><Icon name="shield" /></span><div><b>Güvenli ödeme koruması</b><small>Ödeme, teslimat onayına kadar güvenli hesapta tutulur.</small></div></article>
            <article><span><Icon name="check" /></span><div><b>Doğrulanmış kullanıcılar</b><small>Telefon, e-posta, kimlik ve kart doğrulama katmanları.</small></div></article>
            <article><span><Icon name="gavel" /></span><div><b>Kontrollü teklif limiti</b><small>Kart limiti ve risk kontrolüne göre teklif hakkı.</small></div></article>
          </div>
          <div className="authTrustFooterV8"><strong>KapışKapış Koruması</strong><span>3D Secure · Kimlik doğrulama · Uyuşmazlık desteği</span></div>
        </aside>

        <section className="authFormPanelV8">
          <div className="authModeTabsV8"><Link href="/giris" className={mode === "login" ? "active" : ""}>Giriş yap</Link><Link href="/kayit" className={mode === "register" ? "active" : ""}>Kayıt ol</Link></div>
          <header><span>{mode === "login" ? "TEKRAR HOŞ GELDİN" : "YENİ HESAP"}</span><h2>{mode === "login" ? "Hesabına giriş yap" : "KapışKapış hesabını oluştur"}</h2><p>{mode === "login" ? "Tekliflerini, siparişlerini ve satışlarını yönet." : "Üyelik birkaç dakikada tamamlanır; doğrulamaları daha sonra da yapabilirsin."}</p></header>

          <form className="authFormV8" onSubmit={submit}>
            {mode === "register" && <label>Ad soyad<div><Icon name="user"/><input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Adın ve soyadın" required minLength={3}/></div></label>}
            <label>E-posta adresi<div><Icon name="mail"/><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="ornek@email.com" required/></div></label>
            <label>Şifre<div><Icon name="lock"/><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "login" ? "Şifren" : "En az 8 karakter"} required minLength={mode === "login" ? 6 : 8}/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}><Icon name={showPassword ? "eyeOff" : "eye"}/></button></div></label>

            {mode === "register" && <div className="passwordStrengthV8"><div>{[1,2,3,4].map((item) => <span key={item} className={strength >= item ? "active" : ""}/>)}</div><small>{strength <= 1 ? "Zayıf şifre" : strength === 2 ? "Orta seviye" : strength === 3 ? "Güçlü" : "Çok güçlü"}</small></div>}

            {mode === "login" ? <div className="authFormOptionsV8"><label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}/><span/>Beni hatırla</label><button type="button" onClick={resetPassword}>Şifremi unuttum</button></div> : <div className="authConsentStackV8">
              <p className="authTermsCopyV8">Hesap oluşturmadan önce <Link href="/hukuk?doc=gizlilik" target="_blank">KVKK Aydınlatma Metni</Link> kapsamında kişisel verilerinin nasıl işlendiğini inceleyebilirsin.</p>
              <label className="authTermsV8"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)}/><span/><span><Link href="/hukuk?doc=uyelik" target="_blank">Üyelik Sözleşmesi</Link> ve <Link href="/hukuk?doc=acik-artirma" target="_blank">Platform / Açık Artırma Kuralları</Link>’nı kabul ediyorum.</span></label>
              <label className="authMarketingV8"><input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)}/><span/><span>Kampanya ve ürün önerileri almak istiyorum.<small>İsteğe bağlıdır; üyelik için zorunlu değildir.</small></span></label>
            </div>}

            {message && <div className={`authMessageV8 ${message.type}`}><Icon name={message.type === "success" ? "check" : "shield"}/><span>{message.text}</span></div>}
            <button className="authSubmitV8" type="submit" disabled={loading}>{loading ? "İşleniyor..." : mode === "login" ? "Giriş yap" : "Ücretsiz hesap oluştur"}<Icon name="arrow"/></button>
          </form>

          <p className="authSwitchV8">{mode === "login" ? "Henüz hesabın yok mu?" : "Zaten hesabın var mı?"} <Link href={mode === "login" ? "/kayit" : "/giris"}>{mode === "login" ? "Hemen kayıt ol" : "Giriş yap"}</Link></p>
          <footer className="authLegalV8"><Link href="/yardim">Yardım</Link><Link href="/hukuk">Hukuk ve Güven</Link><Link href="/hukuk?doc=gizlilik">KVKK</Link><span>© 2026 KapışKapış</span></footer>
        </section>
      </section>
    </main>
  );
}
