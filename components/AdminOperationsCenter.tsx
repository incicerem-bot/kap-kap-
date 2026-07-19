"use client";

import { useMemo, useState, type ReactNode } from "react";

type Section = "overview" | "moderation" | "users" | "payments" | "risk";
type ListingStatus = "pending" | "review" | "approved" | "removed";
type UserStatus = "verified" | "review" | "limited";
type PaymentStatus = "held" | "ready" | "disputed" | "paid";

type ModerationItem = {
  id: string;
  title: string;
  seller: string;
  reason: string;
  reports: number;
  price: number;
  category: string;
  status: ListingStatus;
  age: string;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  level: string;
  sales: number;
  volume: number;
  risk: number;
  status: UserStatus;
  lastSeen: string;
};

type PaymentItem = {
  id: string;
  order: string;
  product: string;
  buyer: string;
  seller: string;
  amount: number;
  status: PaymentStatus;
  deadline: string;
};

type RiskItem = {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  source: string;
  time: string;
  resolved: boolean;
};

const moderationSeed: ModerationItem[] = [
  { id: "MOD-1048", title: "PlayStation 5 Slim + 2 Kol", seller: "GameArena", reason: "Fiyat ve ürün fotoğrafları uyuşmuyor", reports: 4, price: 22900, category: "Oyun & Konsol", status: "pending", age: "8 dk" },
  { id: "MOD-1047", title: "iPhone 15 Pro 256 GB", seller: "Mert Teknoloji", reason: "IMEI doğrulama belgesi eksik", reports: 2, price: 48500, category: "Telefon", status: "review", age: "24 dk" },
  { id: "MOD-1046", title: "Rolex Submariner 2021", seller: "SaatKoleksiyon", reason: "Orijinallik belgesi manuel incelemede", reports: 1, price: 312000, category: "Saat", status: "pending", age: "41 dk" },
  { id: "MOD-1045", title: "RTX 4090 Gaming OC", seller: "PC Market", reason: "Seri numarası doğrulandı", reports: 1, price: 73900, category: "Bilgisayar", status: "approved", age: "1 sa" },
];

const userSeed: UserItem[] = [
  { id: "USR-8214", name: "Mert Yalçın", email: "mert@example.com", level: "Tam doğrulanmış", sales: 148, volume: 1284500, risk: 8, status: "verified", lastSeen: "Şimdi" },
  { id: "USR-8213", name: "GameArena Mağaza", email: "operasyon@gamearena.com", level: "Kurumsal inceleme", sales: 63, volume: 874000, risk: 74, status: "review", lastSeen: "6 dk önce" },
  { id: "USR-8212", name: "Selin Aksoy", email: "selin@example.com", level: "Kimlik doğrulandı", sales: 12, volume: 96500, risk: 22, status: "verified", lastSeen: "18 dk önce" },
  { id: "USR-8211", name: "HızlıTekno", email: "destek@hizlitekno.com", level: "Limitli hesap", sales: 27, volume: 218000, risk: 86, status: "limited", lastSeen: "1 sa önce" },
];

const paymentSeed: PaymentItem[] = [
  { id: "PAY-5781", order: "KP-2026-8412", product: "MacBook Pro M3", buyer: "Deniz K.", seller: "AppleHub", amount: 68400, status: "held", deadline: "Teslimata 1 gün" },
  { id: "PAY-5780", order: "KP-2026-8411", product: "Steam Deck OLED", buyer: "Kerem A.", seller: "GameArena", amount: 24900, status: "ready", deadline: "Bugün aktarılabilir" },
  { id: "PAY-5779", order: "KP-2026-8407", product: "iPhone 14 Pro", buyer: "Ece T.", seller: "MobilDükkan", amount: 39250, status: "disputed", deadline: "İnceleme sürüyor" },
  { id: "PAY-5778", order: "KP-2026-8402", product: "Sony A7 IV", buyer: "Bora Y.", seller: "FotoPro", amount: 71100, status: "paid", deadline: "18 Temmuz 2026" },
];

const riskSeed: RiskItem[] = [
  { id: "RSK-301", title: "Aynı kartla çoklu hesap denemesi", detail: "Son 30 dakikada aynı kart iziyle 4 farklı hesap doğrulama isteği oluşturuldu.", severity: "high", source: "Ödeme güvenliği", time: "3 dk", resolved: false },
  { id: "RSK-300", title: "Olağandışı teklif artışı", detail: "Bir açık artırmada iki hesap arasında çok kısa aralıklarla 19 teklif verildi.", severity: "high", source: "Teklif motoru", time: "14 dk", resolved: false },
  { id: "RSK-299", title: "Yeni satıcıda yüksek değerli ilan", detail: "Hesap yaşı 2 gün olan satıcı 180.000 TL değerinde saat ilanı oluşturdu.", severity: "medium", source: "İlan güvenliği", time: "36 dk", resolved: false },
  { id: "RSK-298", title: "Kargo teslimat gecikmesi", detail: "Üç siparişte taşıyıcı hareketi 48 saattir güncellenmedi.", severity: "low", source: "Kargo takibi", time: "1 sa", resolved: true },
];

const sectionLabels: Record<Section, string> = {
  overview: "Genel Bakış",
  moderation: "İlan Denetimi",
  users: "Kullanıcılar",
  payments: "Ödemeler",
  risk: "Risk Merkezi",
};

function Icon({ name }: { name: "dashboard" | "shield" | "users" | "wallet" | "alert" | "search" | "check" | "close" | "eye" | "clock" | "trend" | "box" | "refresh" }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const icons: Record<string, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    wallet: <><path d="M4 5h14a2 2 0 0 1 2 2v12H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M16 11h6v5h-6a2.5 2.5 0 0 1 0-5Z"/></>,
    alert: <><path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>,
    box: <><path d="m21 8-9 5-9-5 9-5z"/><path d="m3 8 9 5 9-5v8l-9 5-9-5z"/><path d="M12 13v8"/></>,
    refresh: <><path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6.7 5.7L4 8M5.5 15A7 7 0 0 0 17.3 18.3L20 16"/></>,
  };
  return <svg {...common}>{icons[name]}</svg>;
}

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

export default function AdminOperationsCenter() {
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [moderation, setModeration] = useState(moderationSeed);
  const [users, setUsers] = useState(userSeed);
  const [payments, setPayments] = useState(paymentSeed);
  const [risks, setRisks] = useState(riskSeed);
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const overview = useMemo(() => ({
    grossVolume: payments.reduce((sum, item) => sum + item.amount, 0) * 18,
    protectedBalance: payments.filter((item) => item.status === "held" || item.status === "disputed").reduce((sum, item) => sum + item.amount, 0),
    pendingModeration: moderation.filter((item) => item.status === "pending" || item.status === "review").length,
    openRisks: risks.filter((item) => !item.resolved).length,
  }), [moderation, payments, risks]);

  const filteredModeration = moderation.filter((item) => `${item.title} ${item.seller} ${item.reason}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const filteredUsers = users.filter((item) => `${item.name} ${item.email} ${item.level}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const filteredPayments = payments.filter((item) => `${item.order} ${item.product} ${item.buyer} ${item.seller}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const filteredRisks = risks.filter((item) => `${item.title} ${item.detail} ${item.source}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));

  const resolveModeration = (id: string, status: ListingStatus) => {
    setModeration((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    showToast(status === "removed" ? "İlan yayından kaldırıldı." : status === "approved" ? "İlan onaylandı." : "İlan incelemeye alındı.");
  };

  const updateUser = (id: string, status: UserStatus) => {
    setUsers((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    showToast(status === "limited" ? "Hesaba geçici işlem limiti uygulandı." : status === "verified" ? "Kullanıcı doğrulandı." : "Kullanıcı manuel incelemeye alındı.");
  };

  const updatePayment = (id: string, status: PaymentStatus) => {
    setPayments((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    showToast(status === "paid" ? "Ödeme satıcıya aktarılmış olarak işaretlendi." : "Ödeme güvenli bekleme alanına alındı.");
  };

  const navItems: Array<[Section, "dashboard" | "shield" | "users" | "wallet" | "alert", number | null]> = [
    ["overview", "dashboard", null],
    ["moderation", "shield", overview.pendingModeration],
    ["users", "users", users.filter((item) => item.status !== "verified").length],
    ["payments", "wallet", payments.filter((item) => item.status === "disputed").length],
    ["risk", "alert", overview.openRisks],
  ];

  return (
    <div className="kkAdminShell">
      {toast && <div className="kkAdminToast"><Icon name="check" />{toast}</div>}

      <aside className="kkAdminNav" aria-label="Yönetim bölümleri">
        <div className="kkAdminRole">
          <span>KA</span>
          <div><strong>Kurucu hesabı</strong><small>Tam yetkili yönetici</small></div>
        </div>
        <nav>
          {navItems.map(([key, icon, count]) => (
            <button key={key} type="button" className={section === key ? "active" : ""} onClick={() => { setSection(key); setQuery(""); }}>
              <Icon name={icon} />
              <span>{sectionLabels[key]}</span>
              {count !== null && count > 0 && <small>{count}</small>}
            </button>
          ))}
        </nav>
        <div className="kkAdminSystemHealth">
          <div><span>Sistem durumu</span><strong><i />Çalışıyor</strong></div>
          <p>Son kontrol: birkaç saniye önce</p>
        </div>
      </aside>

      <section className="kkAdminMain">
        <header className="kkAdminToolbar">
          <div>
            <span>YÖNETİM / {sectionLabels[section].toLocaleUpperCase("tr-TR")}</span>
            <h2>{sectionLabels[section]}</h2>
          </div>
          {section !== "overview" && (
            <label className="kkAdminSearch">
              <Icon name="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kayıtlarda ara" />
            </label>
          )}
          <button className="kkAdminRefresh" type="button" onClick={() => showToast("Yönetim verileri yenilendi.")}><Icon name="refresh" />Yenile</button>
        </header>

        {section === "overview" && (
          <div className="kkAdminOverview">
            <section className="kkAdminMetricGrid">
              <article><div className="kkAdminMetricIcon"><Icon name="trend" /></div><span>30 günlük işlem hacmi</span><strong>{money(overview.grossVolume)}</strong><small className="positive">↑ %18,4 önceki döneme göre</small></article>
              <article><div className="kkAdminMetricIcon"><Icon name="wallet" /></div><span>Koruma altında bakiye</span><strong>{money(overview.protectedBalance)}</strong><small>{payments.filter((item) => item.status === "held" || item.status === "disputed").length} işlem güvenli beklemede</small></article>
              <article><div className="kkAdminMetricIcon"><Icon name="shield" /></div><span>Bekleyen ilan incelemesi</span><strong>{overview.pendingModeration}</strong><small>Hedef ilk yanıt: 15 dakika</small></article>
              <article><div className="kkAdminMetricIcon alert"><Icon name="alert" /></div><span>Açık risk sinyali</span><strong>{overview.openRisks}</strong><small className="danger">{risks.filter((item) => !item.resolved && item.severity === "high").length} yüksek öncelikli</small></article>
            </section>

            <section className="kkAdminOverviewGrid">
              <article className="kkAdminPanel kkAdminPerformance">
                <div className="kkAdminPanelHead"><div><span>PLATFORM PERFORMANSI</span><h3>Son 7 gün</h3></div><small>Canlı veri örneği</small></div>
                <div className="kkAdminChart" aria-label="Son yedi günlük işlem hacmi grafiği">
                  {[42, 58, 51, 72, 67, 86, 94].map((height, index) => <div key={index}><span style={{ height: `${height}%` }} /><small>{["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"][index]}</small></div>)}
                </div>
                <div className="kkAdminMiniStats"><div><span>Başarılı satış</span><strong>1.284</strong></div><div><span>Yeni kullanıcı</span><strong>3.620</strong></div><div><span>Teklif dönüşümü</span><strong>%7,8</strong></div></div>
              </article>

              <article className="kkAdminPanel kkAdminQueue">
                <div className="kkAdminPanelHead"><div><span>ÖNCELİKLİ KUYRUK</span><h3>Şimdi ilgilenilmesi gerekenler</h3></div></div>
                <button type="button" onClick={() => setSection("risk")}><i className="critical" /><div><strong>2 yüksek risk sinyali</strong><span>Teklif ve ödeme davranışlarını incele</span></div><b>İncele</b></button>
                <button type="button" onClick={() => setSection("moderation")}><i className="warning" /><div><strong>{overview.pendingModeration} ilan doğrulama bekliyor</strong><span>Belge ve ürün bilgisi kontrolü gerekli</span></div><b>Aç</b></button>
                <button type="button" onClick={() => setSection("payments")}><i className="info" /><div><strong>1 uyuşmazlıklı ödeme</strong><span>Para aktarımı güvenli biçimde durduruldu</span></div><b>Görüntüle</b></button>
              </article>
            </section>

            <section className="kkAdminOverviewGrid bottom">
              <article className="kkAdminPanel">
                <div className="kkAdminPanelHead"><div><span>İŞLEM DAĞILIMI</span><h3>Kategori performansı</h3></div></div>
                <div className="kkAdminCategoryRows">
                  {[["Telefon", 36, "₺4,8 Mn"], ["Bilgisayar", 27, "₺3,6 Mn"], ["Oyun & Konsol", 19, "₺2,1 Mn"], ["Saat", 11, "₺1,9 Mn"], ["Diğer", 7, "₺0,8 Mn"]].map(([name, rate, value]) => <div key={name as string}><div><strong>{name}</strong><span>{value}</span></div><p><i style={{ width: `${rate}%` }} /></p><small>%{rate}</small></div>)}
                </div>
              </article>
              <article className="kkAdminPanel kkAdminProtection">
                <div className="kkAdminPanelHead"><div><span>GÜVEN ÖZETİ</span><h3>Alıcı ve satıcı koruması</h3></div></div>
                <div className="kkAdminTrustScore"><strong>96,8</strong><span>/100 güven puanı</span></div>
                <ul><li><Icon name="check" />Ödemelerin %99,4'ü sorunsuz tamamlandı</li><li><Icon name="check" />Kimlik doğrulama başarısı %92</li><li><Icon name="check" />Ortalama uyuşmazlık çözümü 9,4 saat</li></ul>
              </article>
            </section>
          </div>
        )}

        {section === "moderation" && (
          <section className="kkAdminTablePanel">
            <div className="kkAdminTableIntro"><div><span>İLAN GÜVENLİĞİ</span><h3>Bildirim ve doğrulama kuyruğu</h3><p>Yüksek değerli veya kullanıcılar tarafından bildirilen ilanları inceleyin.</p></div><div className="kkAdminLegend"><span><i className="pending" />Bekliyor</span><span><i className="review" />İncelemede</span><span><i className="approved" />Onaylı</span></div></div>
            <div className="kkAdminCards">
              {filteredModeration.map((item) => (
                <article className="kkAdminModerationCard" key={item.id}>
                  <div className="kkAdminCardTop"><span className={`kkAdminStatus ${item.status}`}>{item.status === "pending" ? "Bekliyor" : item.status === "review" ? "İncelemede" : item.status === "approved" ? "Onaylandı" : "Kaldırıldı"}</span><small>{item.id} · {item.age}</small></div>
                  <h4>{item.title}</h4><p>{item.reason}</p>
                  <dl><div><dt>Satıcı</dt><dd>{item.seller}</dd></div><div><dt>Kategori</dt><dd>{item.category}</dd></div><div><dt>Güncel fiyat</dt><dd>{money(item.price)}</dd></div><div><dt>Bildirim</dt><dd>{item.reports} kullanıcı</dd></div></dl>
                  <div className="kkAdminCardActions"><button type="button" onClick={() => showToast(`${item.id} ilan önizlemesi açıldı.`)}><Icon name="eye" />İlanı incele</button>{item.status !== "approved" && <button type="button" onClick={() => resolveModeration(item.id, "approved")}><Icon name="check" />Onayla</button>}{item.status !== "removed" && <button className="danger" type="button" onClick={() => resolveModeration(item.id, "removed")}><Icon name="close" />Kaldır</button>}</div>
                </article>
              ))}
            </div>
          </section>
        )}

        {section === "users" && (
          <section className="kkAdminTablePanel">
            <div className="kkAdminTableIntro"><div><span>HESAP DENETİMİ</span><h3>Kullanıcı ve satıcı doğrulama</h3><p>Risk puanı, işlem geçmişi ve doğrulama seviyesine göre hesapları yönetin.</p></div></div>
            <div className="kkAdminUserTable">
              <div className="kkAdminTableRow head"><span>Kullanıcı</span><span>Doğrulama</span><span>Satış / Hacim</span><span>Risk</span><span>Durum</span><span>İşlem</span></div>
              {filteredUsers.map((item) => <div className="kkAdminTableRow" key={item.id}><span className="kkAdminUserCell"><b>{item.name.slice(0, 2).toUpperCase()}</b><em><strong>{item.name}</strong><small>{item.email}<br/>{item.lastSeen}</small></em></span><span>{item.level}</span><span><strong>{item.sales} satış</strong><small>{money(item.volume)}</small></span><span><b className={`kkAdminRiskNumber ${item.risk >= 70 ? "high" : item.risk >= 35 ? "medium" : "low"}`}>{item.risk}/100</b></span><span><i className={`kkAdminUserStatus ${item.status}`}>{item.status === "verified" ? "Doğrulanmış" : item.status === "review" ? "İncelemede" : "Limitli"}</i></span><span className="kkAdminRowActions"><button type="button" onClick={() => showToast(`${item.name} hesap özeti açıldı.`)}>Detay</button>{item.status !== "verified" && <button type="button" onClick={() => updateUser(item.id, "verified")}>Onayla</button>}{item.status !== "limited" && <button className="danger" type="button" onClick={() => updateUser(item.id, "limited")}>Limit koy</button>}</span></div>)}
            </div>
          </section>
        )}

        {section === "payments" && (
          <section className="kkAdminTablePanel">
            <div className="kkAdminTableIntro"><div><span>GÜVENLİ ÖDEME</span><h3>Para transferi ve bloke yönetimi</h3><p>Teslimat onayı, uyuşmazlık ve satıcı aktarım durumlarını takip edin.</p></div><strong className="kkAdminProtectedTotal"><Icon name="shield" /><span>Korunan toplam</span>{money(overview.protectedBalance)}</strong></div>
            <div className="kkAdminPaymentCards">
              {filteredPayments.map((item) => <article key={item.id}><div className="kkAdminPaymentTop"><span className={`kkAdminStatus ${item.status}`}>{item.status === "held" ? "Güvenli beklemede" : item.status === "ready" ? "Aktarıma hazır" : item.status === "disputed" ? "Uyuşmazlık" : "Ödendi"}</span><small>{item.id}</small></div><h4>{item.product}</h4><p>{item.order}</p><dl><div><dt>Alıcı</dt><dd>{item.buyer}</dd></div><div><dt>Satıcı</dt><dd>{item.seller}</dd></div><div><dt>Tutar</dt><dd>{money(item.amount)}</dd></div><div><dt>Takvim</dt><dd>{item.deadline}</dd></div></dl><div className="kkAdminCardActions"><button type="button" onClick={() => showToast(`${item.order} işlem detayları açıldı.`)}>İşlemi aç</button>{item.status === "ready" && <button type="button" onClick={() => updatePayment(item.id, "paid")}><Icon name="check" />Satıcıya aktar</button>}{item.status !== "held" && item.status !== "paid" && <button className="danger" type="button" onClick={() => updatePayment(item.id, "held")}>Aktarımı durdur</button>}</div></article>)}
            </div>
          </section>
        )}

        {section === "risk" && (
          <section className="kkAdminTablePanel">
            <div className="kkAdminTableIntro"><div><span>RİSK MOTORU</span><h3>Şüpheli hareket sinyalleri</h3><p>Teklif manipülasyonu, hesap kötüye kullanımı ve ödeme risklerini inceleyin.</p></div></div>
            <div className="kkAdminRiskList">
              {filteredRisks.map((item) => <article key={item.id} className={item.resolved ? "resolved" : ""}><div className={`kkAdminRiskIcon ${item.severity}`}><Icon name="alert" /></div><div className="kkAdminRiskBody"><div><span className={`kkAdminSeverity ${item.severity}`}>{item.severity === "high" ? "Yüksek" : item.severity === "medium" ? "Orta" : "Düşük"}</span><small>{item.id} · {item.source} · {item.time}</small></div><h4>{item.title}</h4><p>{item.detail}</p></div><div className="kkAdminRiskActions"><button type="button" onClick={() => showToast(`${item.id} risk ayrıntıları açıldı.`)}><Icon name="eye" />İncele</button><button type="button" disabled={item.resolved} onClick={() => { setRisks((list) => list.map((risk) => risk.id === item.id ? { ...risk, resolved: true } : risk)); showToast("Risk sinyali çözüldü olarak işaretlendi."); }}><Icon name="check" />{item.resolved ? "Çözüldü" : "Çöz"}</button></div></article>)}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
