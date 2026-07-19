"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";

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
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [toast, setToast] = useState("");
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [bidAlerts, setBidAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityVisible, setActivityVisible] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const currentTab = useMemo(() => tabs.find((tab) => tab.id === activeTab) ?? tabs[0], [activeTab]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function save(event: FormEvent<HTMLFormElement>, message: string) {
    event.preventDefault();
    notify(message);
  }

  return (
    <div className="accountCenterV8">
      {toast && <div className="accountToastV8"><Icon name="check" />{toast}</div>}

      <section className="accountStatusV8">
        <div className="accountStatusAvatarV8">KA</div>
        <div className="accountStatusIdentityV8">
          <span>HESAP MERKEZİ</span>
          <h2>Kemal Akar</h2>
          <p>@kemalakar · Satıcı hesabı</p>
        </div>
        <div className="accountStatusScoreV8">
          <div><span style={{ width: "92%" }} /></div>
          <p><strong>%92</strong><small>Hesap tamamlanma</small></p>
        </div>
        <div className="accountStatusBadgesV8">
          <span><Icon name="mail" /> E-posta</span>
          <span><Icon name="phone" /> Telefon</span>
          <span><Icon name="id" /> Kimlik</span>
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
            <form onSubmit={(event) => save(event, "Profil bilgilerin kaydedildi.")}>
              <header className="accountSectionHeadV8"><div><span>PROFİL</span><h3>Herkese açık profil bilgileri</h3><p>Alıcıların ve satıcıların profilinde görebileceği bilgileri düzenle.</p></div><button type="submit">Değişiklikleri kaydet</button></header>
              <div className="accountProfileMediaV8">
                <div className="accountAvatarLargeV8">KA</div>
                <div><b>Profil fotoğrafı</b><p>JPG, PNG veya WEBP · En fazla 5 MB</p><div><label>Yeni fotoğraf seç<input type="file" accept="image/jpeg,image/png,image/webp" /></label><button type="button">Kaldır</button></div></div>
              </div>
              <div className="accountFormGridV8">
                <label>Ad soyad<input defaultValue="Kemal Akar" required /></label>
                <label>Kullanıcı adı<div className="accountPrefixInputV8"><span>kapiskapis.com/</span><input defaultValue="kemalakar" required /></div></label>
                <label>E-posta adresi<div className="accountVerifiedInputV8"><input type="email" defaultValue="kemal@example.com" required /><span><Icon name="check" /> Doğrulandı</span></div></label>
                <label>Telefon numarası<div className="accountVerifiedInputV8"><input defaultValue="+90 532 000 00 00" required /><span><Icon name="check" /> Doğrulandı</span></div></label>
                <label>Şehir<select defaultValue="İzmir"><option>İzmir</option><option>İstanbul</option><option>Ankara</option><option>Bursa</option></select></label>
                <label>Hesap türü<select defaultValue="seller"><option value="user">Standart kullanıcı</option><option value="seller">Satıcı hesabı</option></select></label>
              </div>
              <label className="accountFullFieldV8">Hakkımda<textarea rows={5} maxLength={500} defaultValue="Teknoloji ürünleri, oyun ekipmanları ve koleksiyon parçaları satıyorum."/><small>En fazla 500 karakter</small></label>
              <footer className="accountFormFooterV8"><span>Son güncelleme: 19 Temmuz 2026, 10:42</span><button type="submit">Değişiklikleri kaydet</button></footer>
            </form>
          )}

          {activeTab === "verification" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>DOĞRULAMA</span><h3>Hesabını güvenilir hale getir</h3><p>Doğrulamalar teklif limitini artırır ve satıcı rozetini güçlendirir.</p></div><div className="accountLevelBadgeV8">Seviye 3 · Tam doğrulama</div></header>
              <div className="verificationProgressV8"><div><span style={{ width: "100%" }} /></div><p><b>4/4 doğrulama tamamlandı</b><small>Hesabın açık artırmalarda tam teklif limitine sahip.</small></p></div>
              <div className="verificationCardsV8">
                {[
                  ["mail", "E-posta doğrulaması", "kemal@example.com", "Tamamlandı"],
                  ["phone", "Telefon doğrulaması", "+90 532 *** ** 00", "Tamamlandı"],
                  ["id", "Kimlik doğrulaması", "T.C. kimlik ve canlılık kontrolü", "Onaylandı"],
                  ["card", "Ödeme yöntemi", "3D Secure destekli kart", "Doğrulandı"],
                ].map(([icon, title, helper, status]) => (
                  <article key={title}><span><Icon name={icon as IconName} /></span><div><h4>{title}</h4><p>{helper}</p></div><em><Icon name="check" />{status}</em></article>
                ))}
              </div>
              <div className="verificationBenefitsV8"><div><Icon name="shield" /></div><div><span>TAM DOĞRULANMIŞ HESAP</span><h4>30.000 TL’ye kadar teklif limiti aktif</h4><p>Teklif limiti, doğrulanmış ödeme yönteminin kullanılabilir limiti ve risk kontrollerine göre güncellenir.</p></div><button type="button" onClick={() => notify("Limit inceleme talebin oluşturuldu.")}>Limit artışı iste</button></div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>GÜVENLİK</span><h3>Şifre ve oturum güvenliği</h3><p>Hesabına erişimi kontrol et ve şüpheli girişleri engelle.</p></div><div className="accountSecureStateV8"><Icon name="shield" /> Güçlü koruma</div></header>
              <div className="securitySettingListV8">
                <article><span><Icon name="key" /></span><div><h4>Şifre</h4><p>Son değişiklik 42 gün önce · Güçlü şifre kullanılıyor</p></div><button type="button" onClick={() => setPasswordOpen(!passwordOpen)}>Şifreyi değiştir</button></article>
                {passwordOpen && <form className="passwordFormV8" onSubmit={(event) => { save(event, "Şifren başarıyla güncellendi."); setPasswordOpen(false); }}><label>Mevcut şifre<input type="password" required minLength={6}/></label><label>Yeni şifre<input type="password" required minLength={8}/></label><label>Yeni şifre tekrar<input type="password" required minLength={8}/></label><button type="submit">Yeni şifreyi kaydet</button></form>}
                <article><span><Icon name="lock" /></span><div><h4>İki adımlı doğrulama</h4><p>Giriş yaparken telefonuna gönderilen ek kod istenir.</p></div><Toggle checked={twoFactor} onChange={setTwoFactor} label="İki adımlı doğrulama" /></article>
                <article><span><Icon name="alert" /></span><div><h4>Yeni giriş uyarıları</h4><p>Tanımadığımız bir cihazdan giriş yapıldığında bildirim gönderilir.</p></div><Toggle checked={loginAlerts} onChange={setLoginAlerts} label="Yeni giriş uyarıları" /></article>
              </div>
              <div className="activeSessionsV8"><div className="accountSubheadV8"><div><span>OTURUMLAR</span><h4>Aktif cihazlar</h4></div><button type="button" onClick={() => notify("Diğer tüm oturumlar kapatıldı.")}>Diğerlerini kapat</button></div><article><span><Icon name="device" /></span><div><b>Windows · Chrome</b><small>İzmir, Türkiye · Şu an aktif</small></div><em>Bu cihaz</em></article><article><span><Icon name="phone" /></span><div><b>iPhone · Safari</b><small>İzmir, Türkiye · 2 saat önce</small></div><button type="button" aria-label="Oturumu kapat" onClick={() => notify("Mobil cihaz oturumu kapatıldı.")}><Icon name="trash" /></button></article></div>
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              <header className="accountSectionHeadV8"><div><span>ÖDEME</span><h3>Kartlar ve banka hesapları</h3><p>Teklif, satın alma ve satış ödemelerinde kullanılacak yöntemleri yönet.</p></div><button type="button" onClick={() => notify("Yeni ödeme yöntemi formu açılmaya hazır.")}><Icon name="plus" /> Yeni ekle</button></header>
              <div className="paymentMethodGridV8">
                <article className="paymentCardVisualV8"><div><span>VISA</span><em>VARSAYILAN</em></div><strong>•••• •••• •••• 4242</strong><p><span>KEMAL AKAR</span><span>08/29</span></p></article>
                <article className="paymentMethodDetailV8"><div><span><Icon name="card" /></span><div><h4>Akbank kredi kartı</h4><p>3D Secure doğrulandı · Teklif limiti için aktif</p></div></div><div><button type="button">Varsayılan</button><button type="button" onClick={() => notify("Kart kaldırma işlemi için doğrulama istendi.")}>Kaldır</button></div></article>
              </div>
              <div className="bankAccountV8"><div className="accountSubheadV8"><div><span>SATIŞ ÖDEMELERİ</span><h4>Kayıtlı banka hesabı</h4></div><button type="button">Hesabı düzenle</button></div><article><span>TR</span><div><b>Akbank · Kemal Akar</b><small>TR12 0004 6000 1234 5678 9012 34</small></div><em><Icon name="check" /> Doğrulandı</em></article></div>
              <div className="paymentNoticeV8"><Icon name="shield" /><div><b>Kart bilgilerin KapışKapış tarafından saklanmaz</b><p>Ödeme bilgileri lisanslı ödeme kuruluşunun güvenli altyapısında token olarak tutulur.</p></div></div>
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
