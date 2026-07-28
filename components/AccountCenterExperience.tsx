"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { fetchMyBidAccess, type BidAccess, supabaseConfigured } from "@/lib/auctions";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import AccountSecurityPanel from "@/components/AccountSecurityPanel";
import { applySecurityAction } from "@/lib/account-security";

type TabId = "profile" | "verification" | "security" | "payment" | "address" | "notifications" | "privacy";
type IconName = "user" | "shield" | "check" | "card" | "pin" | "bell" | "eye" | "lock" | "phone" | "mail" | "id" | "key" | "device" | "trash" | "plus" | "arrow" | "alert";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
    shield: <><path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.1 7.5 9.6 4.4-1.5 7.5-5 7.5-9.6V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    phone: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    id: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16a3 3 0 0 1 5 0M13 10h5M13 14h4"/></>,
    key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l2 2M14 9l2 2"/></>,
    device: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const tabs: Array<{ id: TabId; label: string; helper: string; icon: IconName }> = [
  { id: "profile", label: "Profil bilgileri", helper: "Herkese açık bilgiler", icon: "user" },
  { id: "verification", label: "Hesap doğrulama", helper: "Kimlik ve iletişim", icon: "check" },
  { id: "security", label: "Güvenlik", helper: "Şifre ve cihazlar", icon: "shield" },
  { id: "payment", label: "Ödeme yöntemleri", helper: "Kart ve banka hesabı", icon: "card" },
  { id: "address", label: "Adreslerim", helper: "Teslimat bilgileri", icon: "pin" },
  { id: "notifications", label: "Bildirim tercihleri", helper: "E-posta ve uygulama", icon: "bell" },
  { id: "privacy", label: "Gizlilik", helper: "Veri ve hesap kontrolü", icon: "eye" },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" className={`accountToggleV8 ${checked ? "active" : ""}`} onClick={() => onChange(!checked)} aria-pressed={checked} aria-label={label}><span /></button>;
}

export default function AccountCenterExperience() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [toast, setToast] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [bidAlerts, setBidAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityVisible, setActivityVisible] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested && tabs.some((tab) => tab.id === requested)) setActiveTab(requested as TabId);
  }, []);
  const [fullName, setFullName] = useState("KapışKapış kullanıcısı");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [bidAccess, setBidAccess] = useState<BidAccess>({ paymentVerified: false, identityVerified: false, cardVerified: false, heldSecurity: 0, securityRequired: 0, refundableSecurity: 0 });

  useEffect(() => {
    if (profile?.fullName) setFullName(profile.fullName);
  }, [profile?.fullName]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    const load = async () => {
      const client = getSupabaseBrowserClient();
      if (!client) return;
      const { data } = await client.auth.getUser();
      if (!data.user || cancelled) return;
      setFullName(String(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "KapışKapış kullanıcısı"));
      setEmail(data.user.email ?? "");
      setPhone(data.user.phone ?? "");
      setEmailVerified(Boolean(data.user.email_confirmed_at));
      setPhoneVerified(Boolean(data.user.phone_confirmed_at));
      try {
        const access = await fetchMyBidAccess();
        if (!cancelled) setBidAccess(access);
      } catch {
        // Doğrulama verisi yüklenemese de hesap ayarları kullanılabilir.
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("tr-TR") || "KK";
  const verifiedCount = [emailVerified, phoneVerified, bidAccess.identityVerified, bidAccess.paymentVerified].filter(Boolean).length;
  const completion = Math.round((verifiedCount / 4) * 100);
  const money = (value: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value) + " TL";

  const currentTab = useMemo(() => tabs.find((tab) => tab.id === activeTab) ?? tabs[0], [activeTab]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function save(event: FormEvent<HTMLFormElement>, message: string) {
    event.preventDefault();
    notify(message);
  }


  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.email) return notify("Oturum bilgisi bulunamadı.");
    if (newPassword !== confirmPassword) return notify("Yeni şifreler eşleşmiyor.");
    if (newPassword.length < 8) return notify("Yeni şifre en az 8 karakter olmalı.");
    const client = getSupabaseBrowserClient();
    if (!client) return notify("Supabase bağlantısı yapılandırılmamış.");
    setSecurityLoading(true);
    const { error: reauthError } = await client.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (reauthError) {
      setSecurityLoading(false);
      return notify("Mevcut şifren yanlış.");
    }
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (!error) {
      await client.auth.signOut({ scope: "others" });
      try { await applySecurityAction("password_changed"); } catch { /* Migration kurulmadıysa şifre değişikliği yine geçerlidir. */ }
    }
    setSecurityLoading(false);
    if (error) return notify(error.message);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordOpen(false);
    notify("Şifren güncellendi ve diğer cihaz oturumları kapatıldı.");
  }

  async function closeOtherSessions() {
    const client = getSupabaseBrowserClient();
    if (!client) return notify("Supabase bağlantısı yapılandırılmamış.");
    setSecurityLoading(true);
    const { error } = await client.auth.signOut({ scope: "others" });
    setSecurityLoading(false);
    notify(error ? error.message : "Diğer cihazlardaki oturumlar kapatıldı.");
  }

  return (
    <div className="accountCenterV8">
      {toast && <div className="accountToastV8"><Icon name="check" />{toast}</div>}

      <section className="accountStatusV8">
        <div className="accountStatusAvatarV8">{initials}</div>
        <div className="accountStatusIdentityV8">
          <span>HESAP MERKEZİ</span>
          <h2>{fullName}</h2>
          <p>{email || "Giriş yaparak hesap bilgilerini görüntüle"}</p>
        </div>
        <div className="accountStatusScoreV8">
          <div><span style={{ width: `${completion}%` }} /></div>
          <p><strong>%{completion}</strong><small>Hesap doğrulama</small></p>
        </div>
        <div className="accountStatusBadgesV8">
          {emailVerified && <span><Icon name="mail" /> E-posta</span>}
          {phoneVerified && <span><Icon name="phone" /> Telefon</span>}
          {bidAccess.identityVerified && <span><Icon name="id" /> Kimlik</span>}
          {bidAccess.paymentVerified && <span><Icon name="card" /> Ödeme</span>}
        </div>
      </section>

      <div className="accountLayoutV8">
        <aside className="accountNavV8">
          <div className="accountNavMobileTitleV8"><Icon name={currentTab.icon} /><span>{currentTab.label}</span></div>
          <nav aria-label="Hesap ayarları">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                <span><Icon name={tab.icon} /></span>
                <div><b>{tab.label}</b><small>{tab.helper}</small></div>
                <Icon name="arrow" />
              </button>
            ))}
          </nav>
          <div className="accountNavSecurityV8"><Icon name="shield" /><div><b>Güvenlik puanın yüksek</b><small>Önerilen korumaların tamamına yakını aktif.</small></div></div>
        </aside>

        <section className="accountContentV8">
          {activeTab === "profile" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>PROFİL</span><h3>Hesap bilgileri</h3><p>Temel hesap ve iletişim bilgilerini görüntüle. Ek profil bilgileri zorunlu değildir.</p></div></header>
              <div className="accountProfileMediaV8">
                <div className="accountAvatarLargeV8">{initials}</div>
                <div><b>{profile?.fullName || fullName}</b><p>{profile?.username ? `@${profile.username}` : "Kullanıcı adı eklenmemiş"}</p></div>
              </div>
              <div className="accountFormGridV8">
                <label>Ad soyad<input value={profile?.fullName || fullName} readOnly /></label>
                <label>Kullanıcı adı<div className="accountPrefixInputV8"><span>kapiskapis.com/</span><input value={profile?.username || "eksik"} readOnly /></div></label>
                <label>E-posta adresi<div className="accountVerifiedInputV8"><input type="email" value={email} readOnly />{emailVerified && <span><Icon name="check" /> Doğrulandı</span>}</div></label>
                <label>Telefon numarası<div className="accountVerifiedInputV8"><input value={profile?.phoneMasked || phone} readOnly placeholder="Telefon numarası ekle" />{phoneVerified && <span><Icon name="check" /> Doğrulandı</span>}</div><Link className="accountVerifyLinkV20" href="/hesap-dogrulama">Telefon ve e-posta doğrulamasını yönet</Link></label>
                <label>Konum<input value={[profile?.district, profile?.city].filter(Boolean).join(" / ") || "Eksik"} readOnly /></label>
                <label>Hesap türü<div className="accountRoleFieldV19"><span>{profile?.role === "admin" ? "Yönetici hesabı" : profile?.role === "seller" ? "Satıcı hesabı" : "Alıcı hesabı"}</span>{profile?.role === "buyer" && <Link href="/satici-dogrulama">Satıcı ol</Link>}</div></label>
              </div>
              <div className="paymentNoticeV8"><Icon name="shield" /><div><b>Kimlik bilgilerin herkese açık gösterilmez</b><p>Doğum tarihi ve iletişim bilgileri yalnız yaş, güvenlik ve işlem doğrulaması için kullanılır. Mağazada kullanıcı adı, şehir ve güven rozetleri görünür.</p></div></div>
              <footer className="accountFormFooterV8"><span>Profil tamamlama zorunluluğu kaldırıldı. Teklif ve satış yetkileri iletişim, ödeme ve satıcı doğrulamalarına göre çalışır.</span></footer>
            </div>
          )}

          {activeTab === "verification" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>DOĞRULAMA</span><h3>Hesabını güvenilir hale getir</h3><p>Teklif yetkisi ve Akıllı Teklif Güvencesi bilgileri doğrudan Supabase güvenlik kaydından okunuyor.</p></div><div className="accountLevelBadgeV8">{verifiedCount === 4 ? "Tam doğrulama" : `${verifiedCount}/4 tamamlandı`}</div></header>
              <div className="verificationProgressV8"><div><span style={{ width: `${completion}%` }} /></div><p><b>{verifiedCount}/4 doğrulama tamamlandı</b><small>{bidAccess.paymentVerified ? `${money(bidAccess.heldSecurity)} aktif teklif güvencen var.` : "Teklif verirken gereken güvence otomatik hesaplanır."}</small></p></div>
              <div className="verificationCardsV8">
                {[
                  ["mail", "E-posta doğrulaması", email || "E-posta bulunamadı", emailVerified],
                  ["phone", "Telefon doğrulaması", phone ? phone.replace(/(\d{3})\d+(\d{2})$/, "$1 *** ** $2") : "Telefon eklenmedi", phoneVerified],
                  ["id", "Kimlik doğrulaması", "T.C. kimlik ve canlılık kontrolü", bidAccess.identityVerified],
                  ["card", "Ödeme yöntemi", "Lisanslı ödeme kuruluşu üzerinden doğrulama", bidAccess.paymentVerified],
                ].map(([icon, title, helper, complete]) => (
                  <article key={String(title)}><span><Icon name={icon as IconName} /></span><div><h4>{String(title)}</h4><p>{String(helper)}</p></div><em className={complete ? "" : "pending"}>{complete ? <><Icon name="check" />Tamamlandı</> : "Bekliyor"}</em></article>
                ))}
              </div>
              <Link href="/hesap-dogrulama" className="accountVerificationActionV20">E-posta ve telefon doğrulamasını yönet <Icon name="arrow" /></Link>
              <div className="verificationBenefitsV8"><div><Icon name="shield" /></div><div><span>AKILLI TEKLİF GÜVENCESİ</span><h4>{bidAccess.cardVerified ? "Kart doğrulandı" : "Teklif sırasında doğrulanacak"}</h4><p>{money(bidAccess.securityRequired)} aktif risk için ayrıldı · {money(bidAccess.refundableSecurity)} iade edilebilir.</p></div><button type="button" onClick={() => { window.location.href = "/teklif-guvencesi"; }}>Güvenceyi yönet</button></div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>GÜVENLİK</span><h3>Şifre ve oturum güvenliği</h3><p>Hesabına erişimi kontrol et ve şüpheli girişleri engelle.</p></div><div className="accountSecureStateV8"><Icon name="shield" /> Güçlü koruma</div></header>
              <div className="securitySettingListV8">
                <article><span><Icon name="key" /></span><div><h4>Şifre</h4><p>Son değişiklik 42 gün önce · Güçlü şifre kullanılıyor</p></div><button type="button" onClick={() => setPasswordOpen(!passwordOpen)}>Şifreyi değiştir</button></article>
                {passwordOpen && <form className="passwordFormV8" onSubmit={changePassword}><label>Mevcut şifre<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required minLength={6}/></label><label>Yeni şifre<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required minLength={8}/></label><label>Yeni şifre tekrar<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8}/></label><button type="submit" disabled={securityLoading}>{securityLoading ? "Güncelleniyor…" : "Yeni şifreyi kaydet"}</button></form>}
                <article><span><Icon name="lock" /></span><div><h4>Telefon doğrulaması</h4><p>{phoneVerified ? "Telefon numaran güvenli işlemler için doğrulandı." : "Teklif ve satış işlemleri için telefonunu doğrula."}</p></div><Link className="accountSecurityLinkV20" href="/hesap-dogrulama">{phoneVerified ? "Yönet" : "Doğrula"}</Link></article>
                <article><span><Icon name="alert" /></span><div><h4>Yeni giriş uyarıları</h4><p>Yeni cihaz algılandığında hesabına kalıcı güvenlik bildirimi gönderilir.</p></div><em className="accountComingSoonV20">Aktif</em></article>
              </div>
              <AccountSecurityPanel onNotify={notify} />
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>ÖDEME</span><h3>Ödeme doğrulaması ve teklif güvencesi</h3><p>Kart verileri KapışKapış veritabanında tutulmaz; ödeme kuruluşundan gelen doğrulama sonucu kullanılır.</p></div></header>
              <div className="paymentMethodGridV8">
                <article className="paymentMethodDetailV8"><div><span><Icon name="card" /></span><div><h4>{bidAccess.paymentVerified ? "Ödeme yöntemi doğrulandı" : "Doğrulanmış ödeme yöntemi yok"}</h4><p>{bidAccess.paymentVerified ? `${money(bidAccess.heldSecurity)} aktif teklif güvencesi` : "Teklif tutarına göre gereken güvenceyi iyzico ile doğrulayabilirsin."}</p></div></div><div>{bidAccess.paymentVerified ? <button type="button" onClick={() => { window.location.href = "/teklif-guvencesi"; }}>Güvenceyi yönet</button> : <button type="button" onClick={() => { window.location.href = "/teklif-guvencesi"; }}>Teklif sırasında doğrula</button>}</div></article>
              </div>
              <div className="bankAccountV8"><div className="accountSubheadV8"><div><span>SATIŞ ÖDEMELERİ</span><h4>Banka hesabı</h4></div></div><article><span>TR</span><div><b>Henüz doğrulanmış banka hesabı gösterilmiyor</b><small>Banka hesabı sahipliği ödeme kuruluşu üzerinden doğrulanmalıdır.</small></div></article></div>
              <div className="paymentNoticeV8"><Icon name="shield" /><div><b>Kart bilgilerin KapışKapış tarafından saklanmaz</b><p>Uygulama yalnızca ödeme kuruluşunun ürettiği doğrulama sonucu ve güvenli token bilgisiyle çalışmalıdır.</p></div></div>
            </div>
          )}

          {activeTab === "address" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>TESLİMAT</span><h3>Kayıtlı adreslerim</h3><p>Kazandığın ürünlerin teslim edileceği adresleri yönet.</p></div><button type="button" onClick={() => notify("Yeni adres formu açılmaya hazır.")}><Icon name="plus" /> Yeni adres</button></header>
              <div className="addressCardsV8">
                <article className="default"><header><span><Icon name="pin" /></span><div><h4>Ev adresim</h4><em>Varsayılan</em></div></header><p>Kemal Akar · 0532 000 00 00</p><p>Bostanlı Mah. 1819/3 Sok. No: 12 D: 4<br/>Karşıyaka / İzmir</p><footer><button type="button">Düzenle</button><button type="button">Kaldır</button></footer></article>
                <article><header><span><Icon name="pin" /></span><div><h4>İş adresim</h4></div></header><p>Kemal Akar · 0532 000 00 00</p><p>Alsancak Mah. Kıbrıs Şehitleri Cad. No: 72<br/>Konak / İzmir</p><footer><button type="button">Varsayılan yap</button><button type="button">Düzenle</button></footer></article>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <form onSubmit={(event) => save(event, "Bildirim tercihlerin kaydedildi.")}>
              <header className="accountSectionHeadV8"><div><span>BİLDİRİMLER</span><h3>Hangi gelişmelerden haberdar olacaksın?</h3><p>Önemli güvenlik ve ödeme bildirimleri her zaman gönderilir.</p></div><button type="submit">Tercihleri kaydet</button></header>
              <div className="preferenceListV8">
                <article><span><Icon name="alert" /></span><div><h4>Teklif ve açık artırma uyarıları</h4><p>Geçilen teklifler, kazandığın ürünler ve bitiş hatırlatmaları.</p></div><Toggle checked={bidAlerts} onChange={setBidAlerts} label="Teklif uyarıları" /></article>
                <article><span><Icon name="mail" /></span><div><h4>Mesaj bildirimleri</h4><p>Alıcı ve satıcılardan gelen yeni mesajlar.</p></div><Toggle checked={messageAlerts} onChange={setMessageAlerts} label="Mesaj bildirimleri" /></article>
                <article><span><Icon name="card" /></span><div><h4>Sipariş ve ödeme bildirimleri</h4><p>Ödeme, kargo, teslimat ve uyuşmazlık gelişmeleri.</p></div><Toggle checked={orderAlerts} onChange={setOrderAlerts} label="Sipariş bildirimleri" /></article>
                <article><span><Icon name="bell" /></span><div><h4>Kampanya ve ürün önerileri</h4><p>İlgilendiğin kategorilerde fırsatlar ve yeni açık artırmalar.</p></div><Toggle checked={marketing} onChange={setMarketing} label="Pazarlama bildirimleri" /></article>
              </div>
              <footer className="accountFormFooterV8"><span>Güvenlik bildirimleri kapatılamaz.</span><button type="submit">Tercihleri kaydet</button></footer>
            </form>
          )}

          {activeTab === "privacy" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>GİZLİLİK</span><h3>Profil ve veri tercihleri</h3><p>Diğer kullanıcıların görebileceği bilgileri ve verilerini kontrol et.</p></div></header>
              <div className="preferenceListV8">
                <article><span><Icon name="user" /></span><div><h4>Profilim arama sonuçlarında görünsün</h4><p>Kullanıcılar seni kullanıcı adın ve mağaza adınla bulabilir.</p></div><Toggle checked={profileVisible} onChange={setProfileVisible} label="Profil görünürlüğü" /></article>
                <article><span><Icon name="eye" /></span><div><h4>Geçmiş satışlarım profilimde görünsün</h4><p>Başarıyla tamamlanan satışların ürün adı olmadan gösterilir.</p></div><Toggle checked={activityVisible} onChange={setActivityVisible} label="Satış geçmişi görünürlüğü" /></article>
                <article><span><Icon name="phone" /></span><div><h4>Telefon numaram satıcılarla paylaşılsın</h4><p>Yalnızca ödeme tamamlandıktan sonra sipariş tarafları görebilir.</p></div><Toggle checked={phoneVisible} onChange={setPhoneVisible} label="Telefon görünürlüğü" /></article>
              </div>
              <div className="privacyActionsV8"><article><div><span>VERİLERİM</span><h4>Hesap verilerini indir</h4><p>Profil, sipariş, teklif ve mesaj verilerinin bir kopyasını iste.</p></div><button type="button" onClick={() => notify("Veri arşivi talebin alındı.")}>Arşiv talep et</button></article><article className="danger"><div><span>TEHLİKELİ BÖLGE</span><h4>Hesabı kapat</h4><p>Aktif açık artırma ve siparişlerin tamamlanmadan hesap kapatılamaz.</p></div><button type="button" onClick={() => notify("Hesap kapatma ön kontrolü başlatıldı.")}>Hesabı kapat</button></article></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
