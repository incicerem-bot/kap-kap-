"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  formatPrice,
  parsePrice,
  secondsToTime,
  timeToSeconds,
  type Product,
} from "@/components/productData";
import { sellerSlugForName } from "@/components/sellerData";
import { COMPARE_STORAGE_KEY, FAVORITES_STORAGE_KEY, defaultCompareIds, defaultFavoriteIds, useStoredIds } from "@/components/useMarketplaceCollections";
import {
  fetchPublicBidHistory,
  fetchPublicListing,
  finalizeExpiredAuctions,
  placeAuctionBid,
  secondsUntil,
  subscribeToListingLive,
  supabaseConfigured,
} from "@/lib/auctions";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type IconName =
  | "arrow"
  | "heart"
  | "share"
  | "eye"
  | "shield"
  | "truck"
  | "check"
  | "store"
  | "clock"
  | "info"
  | "bolt"
  | "card"
  | "compare";

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
    arrow: <><path d="m15 18-6-6 6-6" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.8 2.8 8.1 7 10 4.2-1.9 7-5.2 7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    store: <><path d="M4 10v10h16V10M3 4h18l-1 6H4z" /><path d="M9 20v-6h6v6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6z" />,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
    compare: <><path d="M8 3 4 7l4 4" /><path d="M4 7h12a4 4 0 0 1 4 4v1" /><path d="m16 21 4-4-4-4" /><path d="M20 17H8a4 4 0 0 1-4-4v-1" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

type BidHistoryItem = {
  id: string | number;
  bidder: string;
  amount: number;
  time: string;
  mine?: boolean;
};

function createInitialHistory(product: Product): BidHistoryItem[] {
  const current = parsePrice(product.price);
  return [
    { id: 1, bidder: "k***7", amount: current, time: "2 dk önce" },
    { id: 2, bidder: "a***2", amount: Math.max(0, current - product.increment), time: "4 dk önce" },
    { id: 3, bidder: "m***9", amount: Math.max(0, current - product.increment * 2), time: "7 dk önce" },
    { id: 4, bidder: "s***4", amount: Math.max(0, current - product.increment * 3), time: "11 dk önce" },
  ];
}

function placeholderProduct(slug: string): Product {
  return {
    id: slug,
    title: "Açık artırma yükleniyor",
    category: "Diğer",
    price: "0 TL",
    next: "0 TL",
    bids: 0,
    time: "00:00:00",
    image: "/kapiskapis-promo.jpg",
    gallery: ["/kapiskapis-promo.jpg"],
    live: false,
    verified: false,
    condition: "Bilgi bekleniyor",
    increment: 100,
    seller: "KapışKapış satıcısı",
    sellerInitials: "KK",
    sellerRating: 0,
    sellerSales: 0,
    location: "Türkiye",
    watchers: 0,
    views: 0,
    description: "İlan bilgileri yükleniyor.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [],
  };
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Şimdi";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} sa önce`;
  return `${Math.floor(seconds / 86400)} gün önce`;
}

type Props = { productSlug: string; fallbackProduct?: Product | null };

export default function ProductDetailExperience({ productSlug, fallbackProduct }: Props) {
  const initialProduct = fallbackProduct ?? placeholderProduct(productSlug);
  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const favorites = useStoredIds(FAVORITES_STORAGE_KEY, defaultFavoriteIds);
  const compare = useStoredIds(COMPARE_STORAGE_KEY, defaultCompareIds);
  const favorite = favorites.ids.includes(product.id);
  const compared = compare.ids.includes(product.id);
  const [currentPrice, setCurrentPrice] = useState(() => parsePrice(initialProduct.price));
  const [bidCount, setBidCount] = useState(initialProduct.bids);
  const [bidAmount, setBidAmount] = useState(() => String(parsePrice(initialProduct.price) + initialProduct.increment));
  const [autoBid, setAutoBid] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState("");
  const [remaining, setRemaining] = useState(() => initialProduct.endsAt ? secondsUntil(initialProduct.endsAt) : timeToSeconds(initialProduct.time));
  const [history, setHistory] = useState<BidHistoryItem[]>(() => createInitialHistory(initialProduct));
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping">("description");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const finalizingRef = useRef(false);

  const minimumBid = bidCount === 0 ? currentPrice : currentPrice + product.increment;
  const ended = remaining <= 0 || product.status === "ended" || product.status === "sold";
  const quickBidValues = useMemo(
    () => [minimumBid, minimumBid + product.increment, minimumBid + product.increment * 4],
    [minimumBid, product.increment]
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;

    const syncHistory = async () => {
      try {
        const rows = await fetchPublicBidHistory(productSlug);
        if (!cancelled) {
          setHistory(rows.map((item) => ({
            id: item.id,
            bidder: item.bidder,
            amount: item.amount,
            time: relativeTime(item.createdAt),
            mine: item.mine,
          })));
        }
      } catch {
        // İlan görünmeye devam eder; yalnızca teklif geçmişi yenilenemez.
      }
    };

    const load = async () => {
      try {
        const liveProduct = await fetchPublicListing(productSlug);
        if (!cancelled && liveProduct) {
          setProduct(liveProduct);
          setSelectedImage(0);
          setCurrentPrice(parsePrice(liveProduct.price));
          setBidCount(liveProduct.bids);
          setRemaining(liveProduct.endsAt ? secondsUntil(liveProduct.endsAt) : timeToSeconds(liveProduct.time));
          await syncHistory();
        } else if (!cancelled && !fallbackProduct) {
          setNotice("Bu ilan bulunamadı veya yayından kaldırılmış olabilir.");
        }
      } catch {
        if (!cancelled && !fallbackProduct) setNotice("İlan verileri yüklenemedi.");
      }
    };

    void load();
    const channel = subscribeToListingLive(productSlug, (payload) => {
      setCurrentPrice(payload.currentPrice);
      setBidCount(payload.bidCount);
      setRemaining(payload.endsAt ? secondsUntil(payload.endsAt) : 0);
      setProduct((current) => ({ ...current, endsAt: payload.endsAt, status: payload.status, price: formatPrice(payload.currentPrice), bids: payload.bidCount }));
      void syncHistory();
    });
    const client = getSupabaseBrowserClient();

    return () => {
      cancelled = true;
      if (channel && client) void client.removeChannel(channel);
    };
  }, [fallbackProduct, productSlug]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setBidAmount(String(minimumBid));
  }, [minimumBid]);

  useEffect(() => {
    if (remaining > 0 || product.source !== "supabase" || product.status !== "active" || finalizingRef.current) return;
    finalizingRef.current = true;
    void finalizeExpiredAuctions()
      .then(() => fetchPublicListing(productSlug))
      .then((latest) => {
        if (!latest) return;
        setProduct(latest);
        setCurrentPrice(parsePrice(latest.price));
        setBidCount(latest.bids);
        setRemaining(latest.endsAt ? secondsUntil(latest.endsAt) : 0);
      })
      .catch(() => undefined)
      .finally(() => { finalizingRef.current = false; });
  }, [product.source, product.status, productSlug, remaining]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 5200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function submitBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(bidAmount);

    if (ended) {
      setNotice("Bu açık artırma sona erdi.");
      return;
    }
    if (!Number.isFinite(value) || value < minimumBid) {
      setNotice(`Teklif en az ${formatPrice(minimumBid)} olmalı.`);
      return;
    }
    if (autoBid && Number(autoBidMax) < value) {
      setNotice("Otomatik teklif üst sınırı, vereceğin tekliften düşük olamaz.");
      return;
    }

    if (product.source !== "supabase" || !supabaseConfigured) {
      setCurrentPrice(value);
      setBidCount((count) => count + 1);
      setHistory((items) => [
        { id: Date.now(), bidder: "Sen", amount: value, time: "Şimdi", mine: true },
        ...items.map((item) => ({ ...item, mine: false })),
      ].slice(0, 8));
      setNotice("Demo teklifin ekranda güncellendi. Supabase SQL'i çalıştırıldığında gerçek teklif olarak kaydedilir.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeAuctionBid(product.id, value, autoBid ? Number(autoBidMax) : null);
      setCurrentPrice(result.currentPrice);
      setBidCount(result.bidCount);
      setRemaining(result.endsAt ? secondsUntil(result.endsAt) : remaining);
      const rows = await fetchPublicBidHistory(product.id);
      setHistory(rows.map((item) => ({ id: item.id, bidder: item.bidder, amount: item.amount, time: relativeTime(item.createdAt), mine: item.mine })));
      setNotice(result.isLeading ? "Teklifin kaydedildi. Şu anda lider sensin." : "Teklifin kaydedildi; otomatik teklif nedeniyle lider değişmedi.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Teklif kaydedilemedi.";
      setNotice(message.includes("JWT") || message.includes("Oturum") || message.includes("giriş") ? "Teklif vermek için hesabına giriş yapmalısın." : message);
    } finally {
      setSubmitting(false);
    }
  }

  async function shareProduct() {
    const shareData = { title: product.title, text: `${product.title} KapışKapış açık artırmasında.`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setNotice("Ürün bağlantısı panoya kopyalandı.");
      }
    } catch {
      // Kullanıcı paylaşım penceresini kapatmış olabilir.
    }
  }

  const [hours, minutes, seconds] = secondsToTime(remaining).split(":");

  return (
    <div className="productExperienceV5">
      {notice && <div className="productToastV5" role="status"><Icon name="check" /> {notice}</div>}

      <nav className="productBreadcrumbV5" aria-label="Sayfa yolu">
        <Link href="/"><Icon name="arrow" /> Ana sayfa</Link>
        <span>/</span>
        <Link href={`/kategori/${product.category.toLocaleLowerCase("tr").replaceAll(" ", "-").replaceAll("&", "")}`}>{product.category}</Link>
        <span>/</span>
        <b>{product.title}</b>
      </nav>

      <section className="productHeroV5">
        <div className="productGalleryV5">
          <div className="productMainImageV5">
            <img src={product.gallery[selectedImage] ?? product.image} alt={`${product.title} ürün fotoğrafı ${selectedImage + 1}`} />
            <div className="productImageBadgesV5">
              {product.live && <span className="live"><i /> CANLI AÇIK ARTIRMA</span>}
              <span>{product.condition}</span>
            </div>
            <div className="productImageActionsV5">
              <button className={favorite ? "active" : ""} type="button" onClick={() => favorites.toggle(product.id)} aria-pressed={favorite}>
                <Icon name="heart" /> {favorite ? "Favorilerde" : "Favoriye ekle"}
              </button>
              <button className={compared ? "active" : ""} type="button" onClick={() => { const result = compare.toggle(product.id, 3); setNotice(result === "limit" ? "En fazla 3 ürünü karşılaştırabilirsin." : result === "added" ? "Ürün karşılaştırmaya eklendi." : "Ürün karşılaştırmadan çıkarıldı."); }} aria-pressed={compared}><Icon name="compare" /> {compared ? "Karşılaştırmada" : "Karşılaştır"}</button>
              <button type="button" onClick={shareProduct}><Icon name="share" /> Paylaş</button>
            </div>
          </div>

          <div className="productThumbnailsV5" aria-label="Ürün fotoğrafları">
            {product.gallery.map((image, index) => (
              <button
                key={image}
                type="button"
                className={selectedImage === index ? "active" : ""}
                onClick={() => setSelectedImage(index)}
                aria-label={`${index + 1}. fotoğrafı göster`}
              >
                <img src={image} alt="" />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
            <div className="productGalleryInfoV5">
              <Icon name="eye" />
              <div><b>{product.views.toLocaleString("tr-TR")}</b><span>görüntülenme</span></div>
            </div>
          </div>
        </div>

        <aside className="productBidCardV5">
          <div className="productTitleBlockV5">
            <div>
              <span>{product.category}</span>
              <b>İlan no: KK-{product.id.slice(0, 4).toUpperCase()}26</b>
            </div>
            <h1>{product.title}</h1>
            <p>{product.location} · {product.shipping}</p>
          </div>

          <section className="productPriceBlockV5">
            <div>
              <span>Güncel teklif</span>
              <strong>{formatPrice(currentPrice)}</strong>
              <small>{bidCount} teklif · {product.watchers} kişi takip ediyor</small>
            </div>
            <div className={ended ? "ended" : remaining < 1200 ? "urgent" : ""}>
              <span>Kalan süre</span>
              <strong>{ended ? "Sona erdi" : `${hours}:${minutes}:${seconds}`}</strong>
              <small>{product.live ? "Canlı teklif odası açık" : "Süre dolunca en yüksek teklif kazanır"}</small>
            </div>
          </section>

          <form className="productBidFormV5" onSubmit={submitBid}>
            <div className="productBidInputV5">
              <label htmlFor="bidAmountV5">Teklif tutarın</label>
              <div>
                <input
                  id="bidAmountV5"
                  type="number"
                  inputMode="numeric"
                  min={minimumBid}
                  step={product.increment}
                  value={bidAmount}
                  onChange={(event) => setBidAmount(event.target.value)}
                  disabled={ended}
                />
                <span>TL</span>
              </div>
              <small>Minimum yeni teklif: <b>{formatPrice(minimumBid)}</b></small>
            </div>

            <div className="productQuickBidsV5">
              {quickBidValues.map((value, index) => (
                <button type="button" key={value} onClick={() => setBidAmount(String(value))} disabled={ended}>
                  <span>{index === 0 ? "Minimum" : index === 1 ? "+2 artış" : "+5 artış"}</span>
                  <b>{formatPrice(value)}</b>
                </button>
              ))}
            </div>

            <section className={autoBid ? "productAutoBidV5 active" : "productAutoBidV5"}>
              <label>
                <input type="checkbox" checked={autoBid} onChange={(event) => setAutoBid(event.target.checked)} disabled={ended} />
                <span><Icon name="bolt" /></span>
                <div><b>Otomatik teklif</b><small>Belirlediğin üst sınıra kadar minimum artışla senin adına teklif verir.</small></div>
              </label>
              {autoBid && (
                <div className="productAutoBidLimitV5">
                  <label htmlFor="autoBidMaxV5">Gizli üst sınır</label>
                  <div><input id="autoBidMaxV5" type="number" min={minimumBid} value={autoBidMax} onChange={(event) => setAutoBidMax(event.target.value)} placeholder={String(minimumBid + product.increment * 5)} /><span>TL</span></div>
                </div>
              )}
            </section>

            <button className="productBidSubmitV5" type="submit" disabled={submitting || ended || Number(bidAmount) < minimumBid}>
              {submitting ? "Teklif doğrulanıyor..." : ended ? "Açık artırma sona erdi" : product.live ? "KAPIŞ! — Canlı teklif ver" : "KAPIŞ! — Teklifini gönder"}
            </button>
          </form>

          <div className="productPaymentNoteV5">
            <Icon name="card" />
            <div><b>Teklif öncesi ödeme doğrulaması</b><span>Yalnızca doğrulanmış ödeme yöntemi ve yeterli teklif limiti olan hesaplar teklif verebilir.</span></div>
          </div>

          <section className="productSellerV5">
            <div className="productSellerAvatarV5">{product.sellerInitials}</div>
            <div>
              <span>Satıcı</span>
              <b>{product.seller} {product.verified && <i><Icon name="check" /></i>}</b>
              <small>{product.sellerRating.toLocaleString("tr-TR")} puan · {product.sellerSales} başarılı satış</small>
            </div>
            <Link href={`/magaza/${product.sellerSlug ?? sellerSlugForName(product.seller)}`}><Icon name="store" /> Mağaza</Link>
          </section>
        </aside>
      </section>

      <section className="productTrustRowV5">
        <article><Icon name="shield" /><div><b>Alıcı koruması</b><span>Ödeme, teslimat onayına kadar güvenli hesapta tutulur.</span></div></article>
        <article><Icon name="truck" /><div><b>Takipli gönderim</b><span>Kargo hareketleri sipariş ekranından takip edilir.</span></div></article>
        <article><Icon name="clock" /><div><b>Son dakika uzatması</b><span>Son 2 dakikadaki teklifler süreyi 2 dakika uzatır.</span></div></article>
      </section>

      <div className="productLowerGridV5">
        <section className="productInfoPanelV5">
          <nav aria-label="Ürün bilgi sekmeleri">
            <button type="button" className={activeTab === "description" ? "active" : ""} onClick={() => setActiveTab("description")}>Açıklama</button>
            <button type="button" className={activeTab === "specs" ? "active" : ""} onClick={() => setActiveTab("specs")}>Teknik özellikler</button>
            <button type="button" className={activeTab === "shipping" ? "active" : ""} onClick={() => setActiveTab("shipping")}>Kargo ve iade</button>
          </nav>

          {activeTab === "description" && (
            <div className="productDescriptionV5">
              <h2>Satıcının ürün açıklaması</h2>
              <p>{product.description}</p>
              <div><Icon name="info" /><span>Ürün açıklaması satıcı tarafından sağlanmıştır. Teklif vermeden önce fotoğrafları ve ürün özelliklerini incele.</span></div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="productSpecsV5">
              {product.specs.map((spec) => <div key={spec.label}><span>{spec.label}</span><b>{spec.value}</b></div>)}
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="productShippingV5">
              <article><Icon name="truck" /><div><b>{product.shipping}</b><span>Satıcı, ödeme onayından sonra ürünü belirtilen süre içinde kargoya verir.</span></div></article>
              <article><Icon name="shield" /><div><b>Kontrol süresi</b><span>Alıcı ürünü teslim aldıktan sonra sipariş ekranından teslimatı onaylar veya sorun bildirir.</span></div></article>
              <article><Icon name="check" /><div><b>Uyuşmazlık desteği</b><span>Ürün ilan açıklamasından farklıysa kanıtlarla inceleme talebi oluşturulabilir.</span></div></article>
            </div>
          )}
        </section>

        <aside className="productBidHistoryV5">
          <header><div><span>TEKLİF AKIŞI</span><h2>Son teklifler</h2></div><b>{bidCount}</b></header>
          <div>
            {history.map((item, index) => (
              <article className={item.mine ? "mine" : index === 0 ? "leader" : ""} key={item.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{item.bidder}</b><small>{item.time}</small></div>
                <strong>{formatPrice(item.amount)}</strong>
                {index === 0 && <em>{item.mine ? "Lider sensin" : "Lider"}</em>}
              </article>
            ))}
          </div>
          <p><Icon name="shield" /> Kullanıcı adları gizlilik amacıyla maskelenir.</p>
        </aside>
      </div>
    </div>
  );
}
