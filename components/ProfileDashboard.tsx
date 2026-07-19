import Link from "next/link";
import { demoProducts } from "@/components/productData";
import type { ReactNode } from "react";

type IconName =
  | "shield"
  | "wallet"
  | "listing"
  | "bid"
  | "sale"
  | "eye"
  | "arrow"
  | "check"
  | "message"
  | "settings"
  | "store"
  | "plus"
  | "bank";

function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.1 7.5 9.6 4.4-1.5 7.5-5 7.5-9.6V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/></>,
    wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2v9H4a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12"/><path d="M15 11h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    listing: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    bid: <><path d="m4 14 7-7 5 5-7 7-5-5Z"/><path d="m13 5 2-2 6 6-2 2M14 20h8"/></>,
    sale: <><circle cx="9" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 8H7"/></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    store: <><path d="M4 9v11h16V9"/><path d="M3 9 5 3h14l2 6M8 20v-6h8v6"/><path d="M3 9a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    bank: <><path d="m3 9 9-5 9 5M5 10h14M6 10v7M10 10v7M14 10v7M18 10v7M4 20h16"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

const summaryCards: Array<[IconName, string, string, string]> = [
  ["listing", "Aktif ilan", "12", "3 ilan bugün bitiyor"],
  ["bid", "Devam eden teklif", "6", "2 üründe lider sensin"],
  ["sale", "Bu ay satış", "28", "Geçen aya göre +%15"],
  ["eye", "Toplam görüntülenme", "1.248", "Son 30 günde +%12"],
];

const quickActions: Array<[IconName, string, string, string]> = [
  ["plus", "Yeni ilan oluştur", "Ürününü açık artırmaya çıkar", "/ilan-olustur"],
  ["wallet", "Cüzdanı yönet", "Bakiye ve ödeme hareketleri", "/cuzdan"],
  ["message", "Mesajlara git", "Alıcı ve satıcılarla görüş", "/mesajlar"],
  ["settings", "Hesap ayarları", "Profil ve güvenlik bilgileri", "/ayarlar"],
];

const activity = [
  { title: "iPhone 15 Pro satışın tamamlandı", date: "Bugün, 14:32", amount: "+30.250 TL", positive: true },
  { title: "Banka hesabına para çekme", date: "Dün, 10:15", amount: "-10.000 TL", positive: false },
  { title: "MacBook Pro ilanına yeni teklif", date: "Dün, 08:45", amount: "80.500 TL", positive: false },
  { title: "Cüzdan bakiyesi yüklendi", date: "16 Temmuz, 17:20", amount: "+5.000 TL", positive: true },
];

export default function ProfileDashboard() {
  const activeProducts = demoProducts.slice(1, 4);

  return (
    <div className="profileDashboardV4">
      <section className="profileOverviewV4">
        <article className="profileIdentityV4">
          <div className="profileIdentityTopV4">
            <div className="profileAvatarV4" aria-hidden="true">KA</div>
            <div className="profileIdentityCopyV4">
              <div className="profileNameRowV4">
                <h2>Kemal Akar</h2>
                <span className="profileVerifiedV4"><Icon name="check" /> Doğrulanmış</span>
              </div>
              <p>@kemalakar · Mayıs 2024’ten beri üye</p>
              <div className="profileRatingV4"><strong>4,8</strong><span>★★★★★</span><small>128 değerlendirme</small></div>
            </div>
          </div>

          <div className="profileTrustV4">
            <div><strong>127</strong><span>Başarılı satış</span></div>
            <div><strong>89</strong><span>Başarılı alış</span></div>
            <div><strong>%98</strong><span>Olumlu puan</span></div>
          </div>

          <div className="profileIdentityActionsV4">
            <Link href="/ayarlar">Profili düzenle</Link>
            <button type="button"><Icon name="store" /> Mağazayı görüntüle</button>
          </div>
        </article>

        <article className="profileWalletV4">
          <div className="profileCardTitleV4"><span><Icon name="wallet" /></span><div><small>CÜZDAN BAKİYESİ</small><strong>12.450,75 TL</strong></div></div>
          <div className="profileWalletRowsV4">
            <p><span>Çekilebilir</span><b>10.100,75 TL</b></p>
            <p><span>Bekleyen ödeme</span><b>2.350,00 TL</b></p>
          </div>
          <div className="profileWalletActionsV4">
            <Link href="/cuzdan">Cüzdana git <Icon name="arrow" /></Link>
            <button type="button">Para çek</button>
          </div>
        </article>

        <article className="profileSecurityV4">
          <div className="profileCardTitleV4"><span><Icon name="shield" /></span><div><small>HESAP GÜVENLİĞİ</small><strong>Tam koruma aktif</strong></div></div>
          <div className="securityScoreV4"><div><span style={{ width: "100%" }} /></div><b>3/3 tamamlandı</b></div>
          <ul>
            <li><Icon name="check" /><span>Telefon doğrulandı</span></li>
            <li><Icon name="check" /><span>E-posta doğrulandı</span></li>
            <li><Icon name="check" /><span>Kimlik doğrulandı</span></li>
          </ul>
          <Link href="/ayarlar">Güvenlik ayarları <Icon name="arrow" /></Link>
        </article>
      </section>

      <section className="profileSummaryGridV4" aria-label="Hesap özeti">
        {summaryCards.map(([icon, label, value, helper]) => (
          <article key={label}>
            <span><Icon name={icon} /></span>
            <div><small>{label}</small><strong>{value}</strong><p>{helper}</p></div>
          </article>
        ))}
      </section>

      <section className="profileMainGridV4">
        <article className="profilePanelV4 profilePerformanceV4">
          <div className="profilePanelHeadV4">
            <div><span>PERFORMANS</span><h3>İlan istatistikleri</h3></div>
            <select aria-label="İstatistik dönemi" defaultValue="30"><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="90">Son 90 gün</option></select>
          </div>
          <div className="profileChartLegendV4">
            <div><span className="views" />Görüntülenme</div>
            <div><span className="bids" />Teklifler</div>
          </div>
          <div className="profileChartV4" aria-label="Son 30 günlük görüntülenme ve teklif grafiği">
            <div className="chartGridV4"><i/><i/><i/><i/></div>
            <svg viewBox="0 0 640 230" role="img">
              <defs>
                <linearGradient id="profileArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f6a313" stopOpacity=".28"/><stop offset="1" stopColor="#f6a313" stopOpacity="0"/></linearGradient>
              </defs>
              <path className="profileAreaPathV4" d="M10 190 C78 174 93 132 145 145 S222 178 280 105 S365 142 421 88 S510 125 630 40 L630 220 L10 220 Z" />
              <path className="profileViewsPathV4" d="M10 190 C78 174 93 132 145 145 S222 178 280 105 S365 142 421 88 S510 125 630 40" />
              <path className="profileBidsPathV4" d="M10 205 C92 198 122 180 176 185 S260 165 320 172 S410 143 465 155 S548 128 630 120" />
            </svg>
            <div className="profileChartDatesV4"><span>19 Haz</span><span>26 Haz</span><span>3 Tem</span><span>10 Tem</span><span>19 Tem</span></div>
          </div>
        </article>

        <article className="profilePanelV4 profileActiveListingsV4">
          <div className="profilePanelHeadV4"><div><span>SATIŞ MERKEZİ</span><h3>Aktif ilanlarım</h3></div><Link href="/ilanlarim">Tümünü gör</Link></div>
          <div className="profileListingRowsV4">
            {activeProducts.map((product, index) => (
              <Link href={`/urun/${product.id}`} key={product.id}>
                <img src={product.image} alt="" />
                <div><b>{product.title}</b><small>{product.bids} teklif · Güncel teklif</small><strong>{product.price}</strong></div>
                <time className={index === 0 ? "urgent" : ""}>{product.time}</time>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="profileLowerGridV4">
        <article className="profilePanelV4 profileActivityV4">
          <div className="profilePanelHeadV4"><div><span>HAREKETLER</span><h3>Son işlemler</h3></div><Link href="/cuzdan">Tüm hareketler</Link></div>
          <div>
            {activity.map((item) => (
              <div className="profileActivityRowV4" key={item.title}>
                <span className={item.positive ? "positive" : ""}><Icon name={item.positive ? "wallet" : "bank"} /></span>
                <div><b>{item.title}</b><small>{item.date}</small></div>
                <strong className={item.positive ? "positive" : ""}>{item.amount}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="profilePanelV4 profileQuickActionsV4">
          <div className="profilePanelHeadV4"><div><span>KISAYOLLAR</span><h3>Hızlı işlemler</h3></div></div>
          <div>
            {quickActions.map(([icon, title, helper, href]) => (
              <Link href={href} key={title}><span><Icon name={icon} /></span><div><b>{title}</b><small>{helper}</small></div><Icon name="arrow" /></Link>
            ))}
          </div>
        </article>
      </section>

      <section className="profileStoreBannerV4">
        <div className="profileStoreIconV4"><Icon name="store" /></div>
        <div><span>SATICI ARAÇLARI</span><h3>Mağazanı daha profesyonel göster</h3><p>Kapak görseli, mağaza açıklaması ve öne çıkan ilanlarını düzenle.</p></div>
        <button type="button">Mağazayı düzenle <Icon name="arrow" /></button>
      </section>
    </div>
  );
}
