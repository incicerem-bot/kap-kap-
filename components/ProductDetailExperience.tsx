"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Bid = {
  id: string;
  amount: number;
  createdAt: string;
  bidderLabel: string;
  isMine: boolean;
};

type Seller = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  location: string;
  logoPath: string | null;
  verified: boolean;
  successfulSalesCount: number;
  responseRate: number;
  responseTimeMinutes: number;
};

type Viewer = {
  signedIn: boolean;
  isOwner: boolean;
  isWatching: boolean;
  myHighestBid: number | null;
  isHighestBidder: boolean;
  isWinner: boolean;
};

type Listing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  saleType: "auction" | "fixed";
  category: string;
  subcategory: string;
  condition: string;
  brand: string;
  model: string;
  location: string;
  warrantyStatus: string;
  boxContents: string;
  shippingMethod: string;
  shippingPayer: string;
  specifications: Record<string, unknown>;
  status: string;
  startPrice: number;
  currentPrice: number;
  minimumBid: number;
  minIncrement: number;
  buyNowPrice: number | null;
  stock: number;
  reservedStock: number;
  availableStock: number;
  bidCount: number;
  watchersCount: number;
  startsAt: string | null;
  endsAt: string | null;
  reserveMet: boolean | null;
  winningBid: number | null;
  settlementStatus: string;
  images: string[];
  bids: Bid[];
  seller: Seller;
  viewer: Viewer;
};

type IconName = "gavel" | "heart" | "shield" | "truck" | "clock" | "eye" | "store" | "check" | "arrow" | "image" | "tag" | "box" | "refresh" | "lock" | "minus" | "plus";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const icons: Record<IconName, ReactNode> = {
    gavel: <><path d="m14 5 5 5"/><path d="m12 7 5 5"/><path d="m4 20 8-8"/><path d="m9 4 4-2 6 6-2 4Z"/><path d="M3 21h10"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
    truck: <><path d="M3 6h11v10H3Z"/><path d="M14 9h4l3 3v4h-7Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    store: <><path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6"/><path d="M8 20v-6h8v6"/><path d="M3 10c0 2 3 2 4 0 1 2 4 2 5 0 1 2 4 2 5 0 1 2 4 2 4 0"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 3 3 3-4 5 6"/></>,
    tag: <><path d="M20 13 13 20l-9-9V4h7Z"/><circle cx="8.5" cy="8.5" r="1"/></>,
    box: <><path d="m4 7 8-4 8 4-8 4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4Z"/><path d="M12 11v10"/></>,
    refresh: <><path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6.8 6.2L4 11M5.5 15A7 7 0 0 0 17.2 17.8L20 13"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    minus: <path d="M5 12h14"/>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  };
  return <svg {...common}>{icons[name]}</svg>;
}

function n(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown) {
  return value == null ? "" : String(value);
}

function normalize(raw: unknown): Listing | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const sellerRaw = (value.seller ?? {}) as Record<string, unknown>;
  const viewerRaw = (value.viewer ?? {}) as Record<string, unknown>;
  const bidsRaw = Array.isArray(value.bids) ? value.bids : [];
  return {
    id: text(value.id), slug: text(value.slug), title: text(value.title), description: text(value.description),
    saleType: value.saleType === "fixed" ? "fixed" : "auction",
    category: text(value.category), subcategory: text(value.subcategory), condition: text(value.condition),
    brand: text(value.brand), model: text(value.model), location: text(value.location),
    warrantyStatus: text(value.warrantyStatus), boxContents: text(value.boxContents),
    shippingMethod: text(value.shippingMethod), shippingPayer: text(value.shippingPayer),
    specifications: value.specifications && typeof value.specifications === "object" && !Array.isArray(value.specifications) ? value.specifications as Record<string, unknown> : {},
    status: text(value.status), startPrice: n(value.startPrice), currentPrice: n(value.currentPrice),
    minimumBid: n(value.minimumBid), minIncrement: n(value.minIncrement),
    buyNowPrice: value.buyNowPrice == null ? null : n(value.buyNowPrice), stock: n(value.stock),
    reservedStock: n(value.reservedStock), availableStock: n(value.availableStock), bidCount: n(value.bidCount),
    watchersCount: n(value.watchersCount), startsAt: value.startsAt ? text(value.startsAt) : null,
    endsAt: value.endsAt ? text(value.endsAt) : null, reserveMet: value.reserveMet == null ? null : Boolean(value.reserveMet),
    winningBid: value.winningBid == null ? null : n(value.winningBid), settlementStatus: text(value.settlementStatus),
    images: Array.isArray(value.images) ? value.images.map(text).filter(Boolean) : [],
    bids: bidsRaw.map((item) => {
      const bid = item as Record<string, unknown>;
      return { id: text(bid.id), amount: n(bid.amount), createdAt: text(bid.createdAt), bidderLabel: text(bid.bidderLabel), isMine: Boolean(bid.isMine) };
    }),
    seller: {
      id: text(sellerRaw.id), slug: text(sellerRaw.slug), name: text(sellerRaw.name), initials: text(sellerRaw.initials),
      tagline: text(sellerRaw.tagline), location: text(sellerRaw.location), logoPath: sellerRaw.logoPath ? text(sellerRaw.logoPath) : null,
      verified: Boolean(sellerRaw.verified), successfulSalesCount: n(sellerRaw.successfulSalesCount),
      responseRate: n(sellerRaw.responseRate), responseTimeMinutes: n(sellerRaw.responseTimeMinutes),
    },
    viewer: {
      signedIn: Boolean(viewerRaw.signedIn), isOwner: Boolean(viewerRaw.isOwner), isWatching: Boolean(viewerRaw.isWatching),
      myHighestBid: viewerRaw.myHighestBid == null ? null : n(viewerRaw.myHighestBid),
      isHighestBidder: Boolean(viewerRaw.isHighestBidder), isWinner: Boolean(viewerRaw.isWinner),
    },
  };
}

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function dateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function timeLeft(endsAt: string | null, now: number) {
  if (!endsAt) return { done: true, label: "Süre yok", urgent: false };
  const distance = new Date(endsAt).getTime() - now;
  if (distance <= 0) return { done: true, label: "Sona erdi", urgent: true };
  const seconds = Math.floor(distance / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const label = days > 0 ? `${days}g ${hours}s ${minutes}dk` : hours > 0 ? `${hours}s ${minutes}dk ${secs}sn` : `${minutes}dk ${secs}sn`;
  return { done: false, label, urgent: seconds <= 300 };
}

const conditionLabels: Record<string, string> = { new: "Sıfır", like_new: "Yeni gibi", good: "İyi", fair: "Kullanılmış" };
const warrantyLabels: Record<string, string> = { none: "Garanti yok", invoice: "Faturalı", manufacturer: "Üretici garantili", seller: "Satıcı garantili" };

export default function ProductDetailExperience({ slug }: { slug: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data, error: rpcError } = await client.rpc("kk_get_public_listing", { p_slug: slug });
      if (rpcError) throw rpcError;
      const next = normalize(data);
      if (!next) throw new Error("İlan bulunamadı veya artık görüntülenemiyor.");
      setListing(next);
      setBidAmount((current) => current || String(next.minimumBid));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "İlan yüklenemedi.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(clock);
  }, []);
  useEffect(() => {
    if (!listing || listing.status !== "active") return;
    const poll = window.setInterval(() => void load(true), 5000);
    return () => window.clearInterval(poll);
  }, [listing?.id, listing?.status, load]);
  useEffect(() => {
    if (listing && Number(bidAmount) < listing.minimumBid) setBidAmount(String(listing.minimumBid));
  }, [listing?.minimumBid]);

  const countdown = useMemo(() => timeLeft(listing?.endsAt ?? null, now), [listing?.endsAt, now]);
  const imageUrls = useMemo(() => {
    const client = getSupabaseBrowserClient();
    return listing?.images.map((path) => client?.storage.from("listing-assets").getPublicUrl(path).data.publicUrl ?? "").filter(Boolean) ?? [];
  }, [listing?.images]);
  const sellerLogo = useMemo(() => {
    if (!listing?.seller.logoPath) return "";
    return getSupabaseBrowserClient()?.storage.from("seller-assets").getPublicUrl(listing.seller.logoPath).data.publicUrl ?? "";
  }, [listing?.seller.logoPath]);

  async function toggleWatch() {
    if (!listing) return;
    if (!listing.viewer.signedIn) { router.push(`/giris?redirect=/urun/${listing.slug}`); return; }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setWorking(true); setError("");
    try {
      const { data, error: rpcError } = await client.rpc("kk_toggle_listing_watch", { p_listing_id: listing.id });
      if (rpcError) throw rpcError;
      const result = data as { watching?: boolean; watchersCount?: number } | null;
      setListing((current) => current ? { ...current, watchersCount: Number(result?.watchersCount ?? current.watchersCount), viewer: { ...current.viewer, isWatching: Boolean(result?.watching) } } : current);
    } catch (watchError) {
      setError(watchError instanceof Error ? watchError.message : "Takip işlemi tamamlanamadı.");
    } finally { setWorking(false); }
  }

  async function placeBid() {
    if (!listing) return;
    if (!listing.viewer.signedIn) { router.push(`/giris?redirect=/urun/${listing.slug}`); return; }
    const amount = Number(String(bidAmount).replace(",", "."));
    if (!Number.isFinite(amount) || amount < listing.minimumBid) {
      setError(`Minimum teklif ${money(listing.minimumBid)} olmalıdır.`); return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setWorking(true); setError(""); setNotice("Teklifin güvenli şekilde işleniyor…");
    try {
      const { data, error: rpcError } = await client.rpc("kk_place_listing_bid", { p_listing_id: listing.id, p_amount: amount });
      if (rpcError) throw rpcError;
      const result = data as { extended?: boolean } | null;
      setNotice(result?.extended ? "Teklifin kabul edildi. Son saniye koruması süreyi 2 dakika uzattı." : "Teklifin kabul edildi ve lider teklif oldun.");
      await load(true);
    } catch (bidError) {
      setNotice("");
      setError(bidError instanceof Error ? bidError.message : "Teklif verilemedi.");
      await load(true);
    } finally { setWorking(false); }
  }

  async function reservePurchase() {
    if (!listing) return;
    if (!listing.viewer.signedIn) { router.push(`/giris?redirect=/urun/${listing.slug}`); return; }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setWorking(true); setError(""); setNotice("Ürün senin için rezerve ediliyor…");
    try {
      const { data, error: rpcError } = await client.rpc("kk_create_purchase_intent", { p_listing_id: listing.id, p_quantity: quantity });
      if (rpcError) throw rpcError;
      const result = data as { checkoutPath?: string } | null;
      if (!result?.checkoutPath) throw new Error("Ödeme yönlendirmesi oluşturulamadı.");
      router.push(result.checkoutPath);
    } catch (purchaseError) {
      setNotice("");
      setError(purchaseError instanceof Error ? purchaseError.message : "Satın alma rezervasyonu oluşturulamadı.");
      await load(true);
      setWorking(false);
    }
  }

  if (loading) return <section className="productRoomLoadingV28"><span/><strong>Canlı ilan hazırlanıyor</strong><p>Fiyat, süre ve teklif geçmişi yükleniyor.</p></section>;
  if (!listing) return <section className="productRoomEmptyV28"><Icon name="gavel"/><h2>İlan görüntülenemiyor</h2><p>{error || "İlan kaldırılmış veya yayından alınmış olabilir."}</p><Link href="/">Ana sayfaya dön</Link></section>;

  const selectedUrl = imageUrls[selectedImage] || imageUrls[0] || "";
  const auctionOpen = listing.saleType === "auction" && listing.status === "active" && !countdown.done;
  const fixedOpen = listing.saleType === "fixed" && listing.status === "active" && !countdown.done && listing.availableStock > 0;
  const displayPrice = listing.saleType === "fixed" ? (listing.buyNowPrice ?? listing.currentPrice) : listing.currentPrice;

  return (
    <div className="productRoomV28">
      {notice && <button type="button" className="productNoticeV28" onClick={() => setNotice("")}>{notice}</button>}
      {error && <div className="productErrorV28"><strong>İşlem tamamlanamadı</strong><span>{error}</span><button type="button" onClick={() => setError("")}>Kapat</button></div>}

      <div className="productRoomGridV28">
        <section className="productGalleryV28">
          <div className="productHeroImageV28">
            {selectedUrl ? <img src={selectedUrl} alt={listing.title}/> : <Icon name="image"/>}
            <span className={listing.saleType}><Icon name={listing.saleType === "auction" ? "gavel" : "tag"}/>{listing.saleType === "auction" ? "Canlı açık artırma" : "Sabit fiyat"}</span>
            <button type="button" className={listing.viewer.isWatching ? "active" : ""} onClick={() => void toggleWatch()} disabled={working} aria-label="İlanı takip et"><Icon name="heart"/></button>
          </div>
          {imageUrls.length > 1 && <div className="productThumbsV28">{imageUrls.map((url, index) => <button type="button" className={selectedImage === index ? "active" : ""} key={url} onClick={() => setSelectedImage(index)}><img src={url} alt={`${listing.title} ${index + 1}`}/></button>)}</div>}

          <article className="productDescriptionV28">
            <header><div><span>ÜRÜN AÇIKLAMASI</span><h2>Satıcının ürün notları</h2></div><small>İlan no: {listing.id.slice(0, 8).toUpperCase()}</small></header>
            <p>{listing.description}</p>
            <dl>
              <div><dt>Marka</dt><dd>{listing.brand || "Belirtilmedi"}</dd></div>
              <div><dt>Model</dt><dd>{listing.model || "Belirtilmedi"}</dd></div>
              <div><dt>Durum</dt><dd>{conditionLabels[listing.condition] ?? listing.condition}</dd></div>
              <div><dt>Garanti</dt><dd>{warrantyLabels[listing.warrantyStatus] ?? listing.warrantyStatus}</dd></div>
              <div><dt>Konum</dt><dd>{listing.location || "Belirtilmedi"}</dd></div>
              <div><dt>Kargo</dt><dd>{listing.shippingPayer === "seller" ? "Satıcı öder" : "Alıcı öder"}</dd></div>
            </dl>
            {listing.boxContents && <div className="productBoxContentsV28"><Icon name="box"/><div><strong>Kutu içeriği</strong><p>{listing.boxContents}</p></div></div>}
          </article>
        </section>

        <aside className="productActionColumnV28">
          <section className="productHeadlineV28">
            <div className="productBreadcrumbV28"><span>{listing.category}</span><i>/</i><span>{listing.subcategory || "Ürün"}</span></div>
            <h1>{listing.title}</h1>
            <div className="productSignalV28"><span><Icon name="eye"/>{listing.watchersCount} takipçi</span><span><Icon name="gavel"/>{listing.bidCount} teklif</span><button type="button" onClick={() => void load(true)}><Icon name="refresh"/> Yenile</button></div>
          </section>

          <section className={`productCommerceV28 ${listing.saleType}`}>
            <div className="productPriceTopV28">
              <div><span>{listing.saleType === "auction" ? "Güncel teklif" : "Satış fiyatı"}</span><strong>{money(displayPrice)}</strong>{listing.saleType === "auction" && <small>Başlangıç {money(listing.startPrice)}</small>}</div>
              <div className={countdown.urgent ? "urgent" : ""}><Icon name="clock"/><span>{listing.status === "active" ? "Kalan süre" : "İlan durumu"}</span><strong>{listing.status === "active" ? countdown.label : listing.status === "ended" ? "Sona erdi" : listing.status}</strong><small>{dateTime(listing.endsAt)}</small></div>
            </div>

            {listing.viewer.isHighestBidder && auctionOpen && <div className="productLeaderV28"><Icon name="check"/><div><strong>Şu anda lider sensin</strong><span>Başka teklif gelirse ekran otomatik güncellenecek.</span></div></div>}
            {listing.viewer.isWinner && listing.status === "ended" && <div className="productLeaderV28 winner"><Icon name="gavel"/><div><strong>Açık artırmayı kazandın</strong><span>Güvenli ödeme adımı sipariş merkezinde açılacak.</span></div></div>}

            {listing.saleType === "auction" ? (
              auctionOpen ? <div className="productBidFormV28">
                <label><span>Teklif tutarın</span><div><b>₺</b><input inputMode="decimal" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} aria-label="Teklif tutarı"/></div><small>Minimum teklif: {money(listing.minimumBid)} · Artış: {money(listing.minIncrement)}</small></label>
                <div className="productQuickBidsV28">{[1,2,5].map((multiplier) => <button type="button" key={multiplier} onClick={() => setBidAmount(String(listing.minimumBid + listing.minIncrement * multiplier))}>+{money(listing.minIncrement * multiplier)}</button>)}</div>
                <button type="button" className="primary" onClick={() => void placeBid()} disabled={working || listing.viewer.isOwner}>{working ? "Teklif işleniyor…" : listing.viewer.isOwner ? "Kendi ilanına teklif veremezsin" : "Teklifi gönder"}<Icon name="arrow"/></button>
                <p><Icon name="shield"/> Teklifler sunucuda sıra kilidiyle işlenir. Son 60 saniyedeki teklif süreyi 2 dakika uzatır.</p>
              </div> : <div className="productClosedV28"><Icon name="gavel"/><strong>Açık artırma tamamlandı</strong><span>{listing.winningBid ? `Kazanan teklif ${money(listing.winningBid)}` : "Gizli taban fiyat karşılanmadı veya teklif gelmedi."}</span></div>
            ) : (
              fixedOpen ? <div className="productBuyFormV28">
                <div className="productStockV28"><span>Kullanılabilir stok</span><strong>{listing.availableStock}</strong></div>
                <div className="productQuantityV28"><span>Adet</span><div><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Icon name="minus"/></button><strong>{quantity}</strong><button type="button" onClick={() => setQuantity((value) => Math.min(Math.min(10, listing.availableStock), value + 1))}><Icon name="plus"/></button></div></div>
                <button type="button" className="primary" onClick={() => void reservePurchase()} disabled={working || listing.viewer.isOwner}>{working ? "Rezerve ediliyor…" : listing.viewer.isOwner ? "Kendi ürününü satın alamazsın" : `${money((listing.buyNowPrice ?? 0) * quantity)} · Satın al`}<Icon name="arrow"/></button>
                <p><Icon name="lock"/> Ürün ödeme sırasında 15 dakika senin adına stoktan ayrılır.</p>
              </div> : <div className="productClosedV28"><Icon name="box"/><strong>Ürün şu anda satın alınamıyor</strong><span>Stok tükenmiş veya ilan sona ermiş olabilir.</span></div>
            )}
          </section>

          <section className="productSellerV28">
            <header><span>SATICI</span><Link href={`/magaza/${listing.seller.slug}`}>Mağazaya git <Icon name="arrow"/></Link></header>
            <div className="productSellerIdentityV28">{sellerLogo ? <img src={sellerLogo} alt={listing.seller.name}/> : <b>{listing.seller.initials || listing.seller.name.slice(0,2).toUpperCase()}</b>}<div><h2>{listing.seller.name}{listing.seller.verified && <Icon name="check"/>}</h2><p>{listing.seller.tagline || listing.seller.location}</p></div></div>
            <div className="productSellerStatsV28"><div><strong>{listing.seller.successfulSalesCount}</strong><span>Başarılı satış</span></div><div><strong>%{listing.seller.responseRate}</strong><span>Yanıt oranı</span></div><div><strong>{listing.seller.responseTimeMinutes || "—"}</strong><span>Dk. yanıt</span></div></div>
          </section>

          <section className="productTrustV28"><div><Icon name="shield"/><p><strong>KapışKapış Güvencesi</strong><span>Ödeme, ürün teslim akışına göre satıcıya aktarılır.</span></p></div><div><Icon name="truck"/><p><strong>Takipli teslimat</strong><span>Kargo ve teslim durumu sipariş merkezinden izlenir.</span></p></div><div><Icon name="lock"/><p><strong>Gizli bilgiler</strong><span>Kart ve kimlik bilgileri satıcıyla paylaşılmaz.</span></p></div></section>

          {listing.saleType === "auction" && <section className="productBidHistoryV28"><header><div><span>CANLI AKIŞ</span><h2>Son teklifler</h2></div><small>{listing.bidCount} toplam</small></header>{listing.bids.length ? <ol>{listing.bids.map((bid, index) => <li key={bid.id} className={bid.isMine ? "mine" : ""}><b>{index + 1}</b><div><strong>{bid.bidderLabel}{bid.isMine ? " · Sen" : ""}</strong><span>{dateTime(bid.createdAt)}</span></div><em>{money(bid.amount)}</em></li>)}</ol> : <div className="productNoBidsV28"><Icon name="gavel"/><span>İlk teklifi sen ver.</span></div>}</section>}
        </aside>
      </div>
    </div>
  );
}
