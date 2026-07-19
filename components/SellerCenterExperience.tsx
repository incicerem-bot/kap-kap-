"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { demoProducts } from "@/components/productData";
import { fetchMyListings, setListingStatus, supabaseConfigured } from "@/lib/auctions";

type IconName =
  | "plus"
  | "wallet"
  | "listing"
  | "eye"
  | "bid"
  | "box"
  | "message"
  | "alert"
  | "arrow"
  | "edit"
  | "pause"
  | "play"
  | "chart"
  | "store"
  | "check"
  | "clock"
  | "truck"
  | "search"
  | "filter"
  | "more"
  | "spark"
  | "download";

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
    plus: <path d="M12 5v14M5 12h14" />,
    wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2v9H4a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12" /><path d="M15 11h5v4h-5a2 2 0 0 1 0-4Z" /></>,
    listing: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    bid: <><path d="m4 14 7-7 5 5-7 7-5-5Z" /><path d="m13 5 2-2 6 6-2 2M14 20h8" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />,
    alert: <><path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    pause: <><path d="M9 5v14M15 5v14" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    store: <><path d="M4 9v11h16V9" /><path d="M3 9 5 3h14l2 6M8 20v-6h8v6" /><path d="M3 9a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    truck: <><path d="M3 5h11v11H3zM14 9h4l3 3v4h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    filter: <path d="M4 5h16M7 12h10M10 19h4" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    spark: <><path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3Z" /><path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8Z" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

type ListingStatus = "Aktif" | "Taslak" | "Duraklatıldı" | "Tamamlandı";
type CenterTab = "ozet" | "ilanlar" | "siparisler" | "performans";

type SellerListing = {
  id: string;
  uuid?: string;
  title: string;
  image: string;
  status: ListingStatus;
  price: string;
  bids: number;
  views: number;
  watchers: number;
  ending: string;
  health: number;
};

const initialListings: SellerListing[] = [
  { id: demoProducts[1].id, title: demoProducts[1].title, image: demoProducts[1].image, status: "Aktif", price: demoProducts[1].price, bids: demoProducts[1].bids, views: demoProducts[1].views, watchers: demoProducts[1].watchers, ending: "18 dk", health: 94 },
  { id: demoProducts[3].id, title: demoProducts[3].title, image: demoProducts[3].image, status: "Aktif", price: demoProducts[3].price, bids: demoProducts[3].bids, views: demoProducts[3].views, watchers: demoProducts[3].watchers, ending: "5 sa 21 dk", health: 88 },
  { id: demoProducts[4].id, title: demoProducts[4].title, image: demoProducts[4].image, status: "Duraklatıldı", price: demoProducts[4].price, bids: demoProducts[4].bids, views: demoProducts[4].views, watchers: demoProducts[4].watchers, ending: "—", health: 76 },
  { id: demoProducts[2].id, title: demoProducts[2].title, image: demoProducts[2].image, status: "Taslak", price: demoProducts[2].price, bids: demoProducts[2].bids, views: demoProducts[2].views, watchers: demoProducts[2].watchers, ending: "Yayınlanmadı", health: 62 },
  { id: demoProducts[5].id, title: demoProducts[5].title, image: demoProducts[5].image, status: "Tamamlandı", price: demoProducts[5].price, bids: demoProducts[5].bids, views: demoProducts[5].views, watchers: demoProducts[5].watchers, ending: "17 Temmuz", health: 100 },
];

const sellerOrders = [
  { id: "KK-2026-07184", title: "iPhone 15 Pro 256 GB", buyer: "Mert K.", amount: "48.100 TL", status: "Kargolanacak", deadline: "Bugün 18:00", image: demoProducts[1].image },
  { id: "KK-2026-07155", title: "PlayStation 5 Slim", buyer: "Burak A.", amount: "18.500 TL", status: "Kargoda", deadline: "Takip aktif", image: demoProducts[2].image },
  { id: "KK-2026-07096", title: "LEGO Technic Koleksiyon", buyer: "Selin D.", amount: "9.900 TL", status: "Teslim edildi", deadline: "Ödeme 20 Temmuz", image: demoProducts[5].image },
];

const revenueBars = [42, 58, 48, 72, 67, 88, 76, 92, 86, 100, 91, 114];

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value) + " TL";
}
function endingLabel(endsAt: string | null) {
  if (!endsAt) return "—";
  const minutes = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 60000));
  if (minutes < 60) return `${minutes} dk`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`;
  return `${Math.floor(minutes / 1440)} gün`;
}

function KpiCard({ icon, label, value, change, positive = true, helper }: { icon: IconName; label: string; value: string; change: string; positive?: boolean; helper: string }) {
  return (
    <article className="sellerKpiV9">
      <span className="sellerKpiIconV9"><Icon name={icon} /></span>
      <div className="sellerKpiCopyV9">
        <small>{label}</small>
        <strong>{value}</strong>
        <p><b className={positive ? "positive" : "negative"}>{change}</b> {helper}</p>
      </div>
    </article>
  );
}

export default function SellerCenterExperience() {
  const [tab, setTab] = useState<CenterTab>("ozet");
  const [listings, setListings] = useState(initialListings);
  const [statusFilter, setStatusFilter] = useState<"Tümü" | ListingStatus>("Tümü");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    void fetchMyListings().then((rows) => {
      if (cancelled) return;
      setListings(rows.map((row) => ({
        id: row.slug,
        uuid: row.uuid,
        title: row.title,
        image: row.imageUrl,
        status: row.status === "active" ? "Aktif" : row.status === "draft" ? "Taslak" : row.status === "paused" ? "Duraklatıldı" : "Tamamlandı",
        price: money(row.currentPrice),
        bids: row.bidCount,
        views: row.viewCount,
        watchers: row.watcherCount,
        ending: row.status === "active" ? endingLabel(row.endsAt) : "—",
        health: row.status === "draft" ? 68 : row.status === "active" ? 94 : 82,
      })));
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const visibleListings = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return listings.filter((listing) => {
      const statusMatch = statusFilter === "Tümü" || listing.status === statusFilter;
      const queryMatch = !normalized || listing.title.toLocaleLowerCase("tr-TR").includes(normalized);
      return statusMatch && queryMatch;
    });
  }, [listings, query, statusFilter]);

  const counts = useMemo(() => ({
    Aktif: listings.filter((item) => item.status === "Aktif").length,
    Taslak: listings.filter((item) => item.status === "Taslak").length,
    Duraklatıldı: listings.filter((item) => item.status === "Duraklatıldı").length,
    Tamamlandı: listings.filter((item) => item.status === "Tamamlandı").length,
  }), [listings]);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const toggleListing = async (id: string) => {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;
    const nextStatus = listing.status === "Aktif" ? "Duraklatıldı" : "Aktif";

    if (listing.uuid && supabaseConfigured) {
      try {
        await setListingStatus(listing.uuid, nextStatus === "Aktif" ? "active" : "paused");
      } catch (error) {
        showNotice(error instanceof Error ? error.message : "İlan durumu güncellenemedi.");
        return;
      }
    }

    setListings((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus, ending: nextStatus === "Aktif" ? "24 sa" : "—" } : item));
    showNotice(nextStatus === "Aktif" ? "İlan yeniden yayına alındı." : "İlan duraklatıldı.");
  };

  const tabs: Array<[CenterTab, string, IconName]> = [
    ["ozet", "Genel Bakış", "chart"],
    ["ilanlar", "İlan Yönetimi", "listing"],
    ["siparisler", "Satış Siparişleri", "box"],
    ["performans", "Performans", "spark"],
  ];

  return (
    <div className="sellerCenterV9">
      {notice && <div className="sellerToastV9" role="status"><Icon name="check" />{notice}</div>}

      <section className="sellerHeroV9">
        <div>
          <span className="sellerHeroEyebrowV9"><Icon name="store" /> SATICI MERKEZİ</span>
          <h2>Satışlarını tek ekrandan yönet</h2>
          <p>İlan performansını izle, siparişlerini zamanında gönder ve kazancını büyüt.</p>
        </div>
        <div className="sellerHeroActionsV9">
          <button type="button" onClick={() => showNotice("Satış raporu hazırlanıyor.")}><Icon name="download" /> Rapor indir</button>
          <Link href="/ilan-olustur"><Icon name="plus" /> Yeni ilan oluştur</Link>
        </div>
      </section>

      <nav className="sellerTabsV9" aria-label="Satıcı merkezi bölümleri">
        {tabs.map(([value, label, icon]) => (
          <button key={value} type="button" className={tab === value ? "active" : ""} onClick={() => setTab(value)}>
            <Icon name={icon} />{label}
            {value === "siparisler" && <small>1</small>}
          </button>
        ))}
      </nav>

      {tab === "ozet" && (
        <div className="sellerOverviewV9">
          <section className="sellerKpiGridV9">
            <KpiCard icon="wallet" label="Bu ay net kazanç" value="68.420 TL" change="+%18,4" helper="geçen aya göre" />
            <KpiCard icon="listing" label="Aktif ilan" value={String(counts.Aktif)} change="2 ilan" helper="bugün sona eriyor" />
            <KpiCard icon="eye" label="İlan görüntülenmesi" value="12.840" change="+%23" helper="son 30 günde" />
            <KpiCard icon="bid" label="Satış dönüşümü" value="%14,8" change="+2,1 puan" helper="kategori ortalamasının üstünde" />
          </section>

          <section className="sellerOverviewGridV9">
            <article className="sellerPanelV9 sellerRevenueV9">
              <header className="sellerPanelHeadV9">
                <div><span>GELİR PERFORMANSI</span><h3>Satış kazancı</h3></div>
                <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Gelir dönemi">
                  <option value="7">Son 7 gün</option>
                  <option value="30">Son 30 gün</option>
                  <option value="90">Son 90 gün</option>
                </select>
              </header>
              <div className="sellerRevenueSummaryV9">
                <div><small>Toplam satış</small><strong>{period === "7" ? "21.750 TL" : period === "90" ? "184.300 TL" : "74.250 TL"}</strong></div>
                <div><small>Kesintiler sonrası</small><strong>{period === "7" ? "20.010 TL" : period === "90" ? "169.556 TL" : "68.420 TL"}</strong></div>
              </div>
              <div className="sellerBarChartV9" aria-label="Satış gelir grafiği">
                {revenueBars.map((height, index) => <i key={index} style={{ height: `${Math.min(height, 100)}%` }}><span>{money((height + index * 3) * 65)}</span></i>)}
              </div>
              <div className="sellerChartLabelsV9"><span>20 Haz</span><span>27 Haz</span><span>4 Tem</span><span>11 Tem</span><span>19 Tem</span></div>
            </article>

            <article className="sellerPanelV9 sellerTasksV9">
              <header className="sellerPanelHeadV9"><div><span>BUGÜN YAPILACAKLAR</span><h3>Öncelikli işlemler</h3></div><b>3 görev</b></header>
              <div className="sellerTaskListV9">
                <button type="button" onClick={() => setTab("siparisler")}>
                  <span className="urgent"><Icon name="truck" /></span>
                  <div><b>1 siparişi kargola</b><small>Gönderim süresi bugün 18:00’de doluyor</small></div><Icon name="arrow" />
                </button>
                <Link href="/mesajlar">
                  <span><Icon name="message" /></span>
                  <div><b>2 alıcı mesajını yanıtla</b><small>Ortalama yanıt süreni koru</small></div><Icon name="arrow" />
                </Link>
                <button type="button" onClick={() => { setTab("ilanlar"); setStatusFilter("Taslak"); }}>
                  <span><Icon name="listing" /></span>
                  <div><b>1 taslağı tamamla</b><small>Fotoğraf ve fiyat bilgisi eksik</small></div><Icon name="arrow" />
                </button>
              </div>
            </article>
          </section>

          <section className="sellerOverviewGridV9 sellerOverviewLowerV9">
            <article className="sellerPanelV9 sellerLiveListingsV9">
              <header className="sellerPanelHeadV9"><div><span>AKTİF İLANLAR</span><h3>Yakında bitecek açık artırmalar</h3></div><button type="button" onClick={() => setTab("ilanlar")}>Tümünü yönet</button></header>
              <div className="sellerCompactListingsV9">
                {listings.filter((item) => item.status === "Aktif").map((listing) => (
                  <article key={listing.id}>
                    <img src={listing.image} alt="" />
                    <div><Link href={`/urun/${listing.id}`}>{listing.title}</Link><small>{listing.bids} teklif · {listing.watchers} favori</small><strong>{listing.price}</strong></div>
                    <time className={listing.ending.includes("dk") ? "urgent" : ""}><Icon name="clock" />{listing.ending}</time>
                  </article>
                ))}
              </div>
            </article>

            <article className="sellerPanelV9 sellerScoreV9">
              <header className="sellerPanelHeadV9"><div><span>SATICI SAĞLIĞI</span><h3>Mağaza performansı</h3></div><strong>92/100</strong></header>
              <div className="sellerScoreRingV9"><div><span>92</span><small>Mükemmel</small></div></div>
              <ul>
                <li><span><Icon name="check" />Zamanında kargo</span><b>%98</b></li>
                <li><span><Icon name="check" />Olumlu değerlendirme</span><b>%97</b></li>
                <li><span><Icon name="clock" />Yanıt süresi</span><b>18 dk</b></li>
              </ul>
              <p>Bu seviyeyi korursan ilanların arama sonuçlarında daha görünür olur.</p>
            </article>
          </section>
        </div>
      )}

      {tab === "ilanlar" && (
        <section className="sellerListingsViewV9">
          <div className="sellerListingToolbarV9">
            <div className="sellerStatusFiltersV9">
              {(["Tümü", "Aktif", "Taslak", "Duraklatıldı", "Tamamlandı"] as const).map((status) => (
                <button type="button" key={status} className={statusFilter === status ? "active" : ""} onClick={() => setStatusFilter(status)}>
                  {status}<small>{status === "Tümü" ? listings.length : counts[status]}</small>
                </button>
              ))}
            </div>
            <label className="sellerSearchV9"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İlanlarda ara" /><Icon name="filter" /></label>
          </div>

          <div className="sellerListingTableV9">
            <div className="sellerListingTableHeadV9"><span>İlan</span><span>Durum</span><span>Performans</span><span>Fiyat / Teklif</span><span>Bitiş</span><span>İşlem</span></div>
            {visibleListings.length ? visibleListings.map((listing) => (
              <article key={listing.id} className="sellerListingRowV9">
                <div className="sellerListingProductV9"><img src={listing.image} alt="" /><div><Link href={`/urun/${listing.id}`}>{listing.title}</Link><small>İlan no: KK-{listing.id.slice(0, 5).toUpperCase()}</small><div className="sellerHealthV9"><i><span style={{ width: `${listing.health}%` }} /></i><em>İlan kalitesi %{listing.health}</em></div></div></div>
                <div><span className={`sellerStatusV9 status-${listing.status.toLocaleLowerCase("tr-TR").replaceAll("ı", "i").replaceAll(" ", "-")}`}>{listing.status}</span></div>
                <div className="sellerListingMetricsV9"><span><Icon name="eye" />{listing.views}</span><span><Icon name="bid" />{listing.bids}</span><span>♡ {listing.watchers}</span></div>
                <div className="sellerListingPriceV9"><strong>{listing.price}</strong><small>{listing.status === "Aktif" ? `${listing.bids} teklif` : "—"}</small></div>
                <div className="sellerListingEndingV9"><b>{listing.ending}</b><small>{listing.status === "Aktif" ? "kaldı" : listing.status}</small></div>
                <div className="sellerListingActionsV9">
                  <button type="button" title="Düzenle" onClick={() => showNotice(`${listing.title} düzenlemeye açıldı.`)}><Icon name="edit" /></button>
                  {(listing.status === "Aktif" || listing.status === "Duraklatıldı") && <button type="button" title={listing.status === "Aktif" ? "Duraklat" : "Yeniden yayınla"} onClick={() => toggleListing(listing.id)}><Icon name={listing.status === "Aktif" ? "pause" : "play"} /></button>}
                  <button type="button" title="Diğer işlemler" onClick={() => showNotice("İlan işlem menüsü açıldı.")}><Icon name="more" /></button>
                </div>
              </article>
            )) : <div className="sellerEmptyV9"><Icon name="search" /><h3>Bu filtrede ilan bulunamadı</h3><p>Arama kelimesini veya durum filtresini değiştir.</p></div>}
          </div>
        </section>
      )}

      {tab === "siparisler" && (
        <section className="sellerOrdersViewV9">
          <div className="sellerOrdersSummaryV9">
            <article><span><Icon name="alert" /></span><div><small>Kargolanacak</small><strong>1 sipariş</strong></div></article>
            <article><span><Icon name="truck" /></span><div><small>Kargoda</small><strong>1 sipariş</strong></div></article>
            <article><span><Icon name="wallet" /></span><div><small>Bekleyen ödeme</small><strong>28.400 TL</strong></div></article>
          </div>
          <div className="sellerOrderListV9">
            {sellerOrders.map((order) => (
              <article key={order.id}>
                <img src={order.image} alt="" />
                <div className="sellerOrderMainV9"><span>{order.id}</span><h3>{order.title}</h3><p>Alıcı: <b>{order.buyer}</b></p></div>
                <div className="sellerOrderAmountV9"><small>Satış tutarı</small><strong>{order.amount}</strong></div>
                <div className="sellerOrderStateV9"><span className={order.status === "Kargolanacak" ? "urgent" : order.status === "Kargoda" ? "shipping" : "done"}>{order.status}</span><small>{order.deadline}</small></div>
                <div className="sellerOrderActionsV9">
                  {order.status === "Kargolanacak" ? <Link className="sellerLogisticsLinkV13" href={`/kargo?order=${order.id}&mode=shipping`}><Icon name="truck" /> Kargo kodu oluştur</Link> : <Link href={`/kargo?order=${order.id}`}>{order.status === "Kargoda" ? "Kargoyu takip et" : "Teslimat detayı"}</Link>}
                  <Link href={`/mesajlar?order=${order.id}`}><Icon name="message" /> Alıcıya yaz</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "performans" && (
        <section className="sellerPerformanceViewV9">
          <div className="sellerPerformanceGridV9">
            <article className="sellerPanelV9 sellerFunnelV9">
              <header className="sellerPanelHeadV9"><div><span>DÖNÜŞÜM HUNİSİ</span><h3>İlanlardan satışa</h3></div><b>Son 30 gün</b></header>
              <div className="sellerFunnelRowsV9">
                <div><span>İlan görüntülenmesi</span><b>12.840</b><i><em style={{ width: "100%" }} /></i></div>
                <div><span>Ürün detayına giriş</span><b>4.260</b><i><em style={{ width: "72%" }} /></i></div>
                <div><span>Teklif veren kullanıcı</span><b>628</b><i><em style={{ width: "46%" }} /></i></div>
                <div><span>Tamamlanan satış</span><b>93</b><i><em style={{ width: "24%" }} /></i></div>
              </div>
            </article>

            <article className="sellerPanelV9 sellerInsightsV9">
              <header className="sellerPanelHeadV9"><div><span>AKILLI ÖNERİLER</span><h3>Satışını artır</h3></div><Icon name="spark" /></header>
              <div>
                <article><span>1</span><div><b>Kapak fotoğrafını iyileştir</b><p>MacBook ilanının tıklanma oranı benzer ilanlardan %18 düşük.</p><button type="button" onClick={() => setTab("ilanlar")}>İlanı düzenle</button></div></article>
                <article><span>2</span><div><b>Bitiş saatini değiştir</b><p>Telefon kategorisinde 20:00–23:00 arası ortalama %24 daha fazla teklif geliyor.</p><button type="button" onClick={() => showNotice("Önerilen saat ilan ayarlarına eklendi.")}>Öneriyi uygula</button></div></article>
                <article><span>3</span><div><b>Hızlı yanıt rozetini koru</b><p>18 dakikalık yanıt süren alıcı güvenini yükseltiyor.</p><Link href="/mesajlar">Mesajlara git</Link></div></article>
              </div>
            </article>
          </div>

          <div className="sellerPerformanceGridV9 sellerPerformanceLowerV9">
            <article className="sellerPanelV9 sellerCategoryV9">
              <header className="sellerPanelHeadV9"><div><span>KATEGORİLER</span><h3>Satış dağılımı</h3></div></header>
              <div className="sellerCategoryRowsV9">
                <div><span>Telefon</span><i><em style={{ width: "82%" }} /></i><b>34.800 TL</b></div>
                <div><span>Bilgisayar</span><i><em style={{ width: "68%" }} /></i><b>24.500 TL</b></div>
                <div><span>Oyun & Konsol</span><i><em style={{ width: "41%" }} /></i><b>10.950 TL</b></div>
                <div><span>Diğer</span><i><em style={{ width: "18%" }} /></i><b>4.000 TL</b></div>
              </div>
            </article>

            <article className="sellerPanelV9 sellerStoreCardV9">
              <div className="sellerStoreVisualV9"><Icon name="store" /><span>KA</span></div>
              <div><span>MAĞAZA GÖRÜNÜMÜ</span><h3>Kemal’in Teknoloji Mağazası</h3><p>127 başarılı satış · 4,8 puan · %98 olumlu değerlendirme</p></div>
              <button type="button" onClick={() => showNotice("Mağaza düzenleme ekranı açıldı.")}><Icon name="edit" /> Mağazayı düzenle</button>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}
