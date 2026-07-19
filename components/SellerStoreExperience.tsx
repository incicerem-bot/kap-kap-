"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { parsePrice, timeToSeconds, type Product } from "@/components/productData";
import { useAuctionProducts } from "@/components/useAuctionProducts";
import { type SellerProfile } from "@/components/sellerData";
import { loadSellerReviewBundle, type SellerReviewBundle } from "@/lib/reviews";
import { FAVORITES_STORAGE_KEY, defaultFavoriteIds, useStoredIds } from "@/components/useMarketplaceCollections";

type StoreTab = "listings" | "reviews" | "about";
type ListingSort = "ending" | "popular" | "price-low" | "price-high";
type IconName = "check" | "shield" | "star" | "clock" | "truck" | "message" | "heart" | "share" | "flag" | "store" | "location" | "calendar" | "filter" | "chevron" | "package" | "chart";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    check: <path d="m5 12 4 4L19 6" />,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    truck: <><path d="M3 5h11v12H3zM14 9h4l3 3v5h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /><path d="M8 9h8M8 13h5" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 5h11l-2 4 2 4H5" /></>,
    store: <><path d="M4 10v10h16V10" /><path d="M3 10 5 4h14l2 6" /><path d="M8 20v-6h8v6" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    package: <><path d="m3 7 9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7M12 11v10" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20V8" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function money(value: number) {
  return `${value.toLocaleString("tr-TR")} TL`;
}

function ratingStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" />);
}

function StoreProductCard({ product, favorite, onFavorite }: { product: Product; favorite: boolean; onFavorite: () => void }) {
  const urgent = timeToSeconds(product.time) < 3600;
  return (
    <article className="storeProductCardV15">
      <div className="storeProductImageV15">
        <Link href={`/urun/${product.id}`}><img src={product.image} alt={product.title} /></Link>
        <span className={product.live ? "live" : "scheduled"}>{product.live ? "CANLI" : "SÜRELİ"}</span>
        <button type="button" className={favorite ? "active" : ""} onClick={onFavorite} aria-label={favorite ? "Favorilerden çıkar" : "Favoriye ekle"}><Icon name="heart" /></button>
      </div>
      <div className="storeProductBodyV15">
        <div><span>{product.category}</span><small>{product.condition}</small></div>
        <Link href={`/urun/${product.id}`}><h3>{product.title}</h3></Link>
        <section><p><small>Güncel teklif</small><strong>{product.price}</strong></p><p><small>Teklif</small><strong>{product.bids}</strong></p></section>
        <footer><span className={urgent ? "urgent" : ""}><Icon name="clock" /> {product.time}</span><Link href={`/urun/${product.id}`}>İlana git <Icon name="chevron" /></Link></footer>
      </div>
    </article>
  );
}

export default function SellerStoreExperience({ seller: initialSeller, initialTab = "listings" }: { seller: SellerProfile; initialTab?: string }) {
  const normalizedTab: StoreTab = initialTab === "reviews" ? "reviews" : initialTab === "about" ? "about" : "listings";
  const [tab, setTab] = useState<StoreTab>(normalizedTab);
  const [followed, setFollowed] = useState(false);
  const [notice, setNotice] = useState("");
  const [sort, setSort] = useState<ListingSort>("ending");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [databaseBundle, setDatabaseBundle] = useState<SellerReviewBundle | null>(null);
  const [databaseResolved, setDatabaseResolved] = useState(false);
  const favorites = useStoredIds(FAVORITES_STORAGE_KEY, defaultFavoriteIds);
  const { products: marketplaceProducts } = useAuctionProducts();

  useEffect(() => {
    let active = true;
    setDatabaseResolved(false);
    loadSellerReviewBundle(initialSeller.slug)
      .then((bundle) => { if (active) setDatabaseBundle(bundle); })
      .finally(() => { if (active) setDatabaseResolved(true); });
    return () => { active = false; };
  }, [initialSeller.slug]);

  const seller = useMemo<SellerProfile>(() => {
    if (!databaseBundle) return initialSeller;
    const responseMinutes = databaseBundle.seller.responseTimeMinutes;
    return {
      ...initialSeller,
      name: databaseBundle.seller.name,
      initials: databaseBundle.seller.initials,
      tagline: databaseBundle.seller.tagline,
      location: databaseBundle.seller.location,
      verified: databaseBundle.seller.verified,
      rating: databaseBundle.summary.averageRating,
      sales: databaseBundle.seller.successfulSalesCount,
      followers: databaseBundle.seller.followersCount,
      responseRate: databaseBundle.seller.responseRate,
      responseTime: responseMinutes < 60 ? `${responseMinutes} dakika` : `${Math.round(responseMinutes / 60)} saat`,
      shipOnTime: databaseBundle.seller.shipOnTimeRate,
      cancellationRate: databaseBundle.seller.cancellationRate,
      categories: databaseBundle.seller.categories,
      about: databaseBundle.seller.about,
      badges: databaseBundle.seller.badges,
      ratingDistribution: databaseBundle.summary.distribution,
      reviews: databaseBundle.reviews,
    };
  }, [databaseBundle, initialSeller]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const products = useMemo(() => {
    const matches = marketplaceProducts.filter((product) => product.sellerSlug === seller.slug || product.seller === seller.name || seller.productIds.includes(product.id));
    return [...matches].sort((a, b) => {
      if (sort === "popular") return b.watchers - a.watchers;
      if (sort === "price-low") return parsePrice(a.price) - parsePrice(b.price);
      if (sort === "price-high") return parsePrice(b.price) - parsePrice(a.price);
      return timeToSeconds(a.time) - timeToSeconds(b.time);
    });
  }, [marketplaceProducts, seller.name, seller.productIds, seller.slug, sort]);

  const allReviews = seller.reviews;
  const visibleReviews = ratingFilter === "all" ? allReviews : allReviews.filter((review) => review.rating === ratingFilter);
  const totalRatings = Object.values(seller.ratingDistribution).reduce((sum, count) => sum + count, 0);

  async function shareStore() {
    try {
      if (navigator.share) await navigator.share({ title: seller.name, text: `${seller.name} KapışKapış mağazası`, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setNotice("Mağaza bağlantısı panoya kopyalandı.");
      }
    } catch {
      // Paylaşım penceresi kullanıcı tarafından kapatılmış olabilir.
    }
  }

  return (
    <div className="sellerStoreV15">
      {notice && <button type="button" className="storeToastV15" onClick={() => setNotice("")}><Icon name="check" /> {notice}</button>}

      <section className="storeHeroV15">
        <div className="storeHeroGlowV15" />
        <div className="storeIdentityV15">
          <div className="storeAvatarV15">{seller.initials}<i><Icon name="check" /></i></div>
          <div className="storeIdentityCopyV15">
            <div><span>DOĞRULANMIŞ KAPIŞKAPIŞ MAĞAZASI</span>{seller.verified && <em><Icon name="shield" /> Güvenli satıcı</em>}</div>
            <h1>{seller.name}</h1>
            <p>{seller.tagline}</p>
            <ul><li><Icon name="location" /> {seller.location}</li><li><Icon name="calendar" /> {seller.joinedAt} tarihinden beri üye</li></ul>
          </div>
        </div>
        <div className="storeHeroActionsV15">
          <Link href={`/mesajlar?seller=${seller.slug}`}><Icon name="message" /> Mesaj gönder</Link>
          <button type="button" className={followed ? "followed" : ""} onClick={() => { setFollowed((value) => !value); setNotice(followed ? "Mağaza takibi bırakıldı." : "Yeni ilanlar için mağaza takibe alındı."); }}><Icon name="heart" /> {followed ? "Takip ediliyor" : "Mağazayı takip et"}</button>
          <button type="button" className="iconOnly" onClick={shareStore} aria-label="Mağazayı paylaş"><Icon name="share" /></button>
          <button type="button" className="iconOnly" onClick={() => setNotice("Mağaza bildirim formu açıldı. Bu işlem demo olarak çalışır.")} aria-label="Mağazayı bildir"><Icon name="flag" /></button>
        </div>
      </section>

      <section className="storeMetricsV15">
        <article className="rating"><span><Icon name="star" /></span><div><strong>{seller.rating.toLocaleString("tr-TR")}</strong><small>{totalRatings.toLocaleString("tr-TR")} doğrulanmış değerlendirme</small></div></article>
        <article><span><Icon name="package" /></span><div><strong>{seller.sales.toLocaleString("tr-TR")}</strong><small>Başarılı satış</small></div></article>
        <article><span><Icon name="message" /></span><div><strong>%{seller.responseRate}</strong><small>Yanıt oranı · {seller.responseTime}</small></div></article>
        <article><span><Icon name="truck" /></span><div><strong>%{seller.shipOnTime}</strong><small>Zamanında kargo</small></div></article>
        <article><span><Icon name="shield" /></span><div><strong>%{seller.cancellationRate.toLocaleString("tr-TR")}</strong><small>Sipariş iptal oranı</small></div></article>
      </section>

      <nav className="storeTabsV15" aria-label="Mağaza bölümleri">
        <button type="button" className={tab === "listings" ? "active" : ""} onClick={() => setTab("listings")}><Icon name="store" /> Aktif ilanlar <small>{products.length}</small></button>
        <button type="button" className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}><Icon name="star" /> Değerlendirmeler <small>{totalRatings}</small></button>
        <button type="button" className={tab === "about" ? "active" : ""} onClick={() => setTab("about")}><Icon name="shield" /> Mağaza hakkında</button>
      </nav>

      {tab === "listings" && (
        <section className="storeListingsV15">
          <header><div><span>MAĞAZA VİTRİNİ</span><h2>Aktif açık artırmalar</h2></div><label><Icon name="filter" /><select value={sort} onChange={(event) => setSort(event.target.value as ListingSort)}><option value="ending">Süresi azalan</option><option value="popular">En çok izlenen</option><option value="price-low">Fiyat düşükten</option><option value="price-high">Fiyat yüksekten</option></select></label></header>
          {products.length ? <div className="storeProductGridV15">{products.map((product) => <StoreProductCard key={product.id} product={product} favorite={favorites.ids.includes(product.id)} onFavorite={() => favorites.toggle(product.id)} />)}</div> : <div className="storeEmptyV15"><Icon name="store" /><h3>Şu anda aktif ilan bulunmuyor</h3><p>Mağazayı takip ederek yeni açık artırmalardan haberdar olabilirsin.</p></div>}
        </section>
      )}

      {tab === "reviews" && (
        <section className="storeReviewsLayoutV15">
          <aside className="storeRatingPanelV15">
            <div className="storeRatingBigV15"><strong>{seller.rating.toLocaleString("tr-TR")}</strong><span>{ratingStars(seller.rating)}</span><small>{totalRatings.toLocaleString("tr-TR")} doğrulanmış alışveriş</small></div>
            <div className="storeRatingBarsV15">{([5, 4, 3, 2, 1] as const).map((rating) => { const count = seller.ratingDistribution[rating]; const percent = totalRatings ? Math.round(count / totalRatings * 100) : 0; return <button type="button" key={rating} className={ratingFilter === rating ? "active" : ""} onClick={() => setRatingFilter(ratingFilter === rating ? "all" : rating)}><span>{rating} <Icon name="star" /></span><i><b style={{ width: `${percent}%` }} /></i><small>{count}</small></button>; })}</div>
            {ratingFilter !== "all" && <button type="button" className="clearRatingV15" onClick={() => setRatingFilter("all")}>Tüm değerlendirmeleri göster</button>}
          </aside>

          <div className="storeReviewFeedV15">
            <header><div><span>GERÇEK ALIŞVERİŞ DENEYİMLERİ</span><h2>{ratingFilter === "all" ? "Son değerlendirmeler" : `${ratingFilter} yıldızlı değerlendirmeler`}</h2></div><em><Icon name="shield" /> {databaseResolved && databaseBundle ? "Supabase doğrulamalı siparişler" : "Yalnızca tamamlanmış siparişler"}</em></header>
            {visibleReviews.length ? visibleReviews.map((review) => (
              <article className="storeReviewCardV15" key={review.id}>
                <header><div className="reviewBuyerV15">{review.buyer.slice(0, 1)}</div><div><strong>{review.buyer}</strong><span>{ratingStars(review.rating)}</span></div><time>{review.date}</time></header>
                <h3>{review.title}</h3>
                <p>{review.comment}</p>
                {review.photos?.length ? <div className="reviewPhotosV16">{review.photos.map((photo, index) => <img key={`${review.id}-${index}`} src={photo} alt={`${review.product} değerlendirme fotoğrafı ${index + 1}`} />)}</div> : null}
                <div className="reviewTagsV15">{review.tags.map((tag) => <span key={tag}><Icon name="check" /> {tag}</span>)}</div>
                <footer><div><Icon name="package" /><span>{review.product}</span>{review.verifiedPurchase && <em><Icon name="shield" /> Doğrulanmış alışveriş</em>}</div>{review.productId && <Link href={`/urun/${review.productId}`}>Ürünü gör <Icon name="chevron" /></Link>}</footer>
                {review.sellerReply && <section className="sellerReplyV15"><div>{seller.initials}</div><p><strong>{seller.name} yanıtladı</strong><span>{review.sellerReply}</span></p></section>}
              </article>
            )) : <div className="storeEmptyV15"><Icon name="star" /><h3>Bu puanda değerlendirme bulunmuyor</h3><p>Başka bir puan filtresi seçebilirsin.</p></div>}
          </div>
        </section>
      )}

      {tab === "about" && (
        <section className="storeAboutLayoutV15">
          <div className="storeAboutMainV15">
            <article><span>MAĞAZA HAKKINDA</span><h2>{seller.name}</h2><p>{seller.about}</p></article>
            <article><span>UZMANLIK ALANLARI</span><h2>Satış kategorileri</h2><div className="storeCategoryTagsV15">{seller.categories.map((category) => <Link key={category} href={`/arama?q=${encodeURIComponent(category)}`}>{category}</Link>)}</div></article>
            <article><span>ŞEFFAFLIK NOTU</span><h2>Bu göstergeler nasıl hesaplanır?</h2><p>Yanıt oranı, zamanında kargo ve iptal oranı; tamamlanmış KapışKapış işlemlerindeki son 90 günlük mağaza hareketlerinden oluşturulur. Mağaza kendi puanını veya değerlendirmeleri değiştiremez.</p></article>
          </div>
          <aside className="storeVerificationV15"><header><Icon name="shield" /><div><span>GÜVEN DOĞRULAMALARI</span><h2>Mağaza kontrolleri</h2></div></header>{seller.badges.map((badge) => <div key={badge}><i><Icon name="check" /></i><span>{badge}</span></div>)}<footer><Icon name="chart" /><p><strong>Güven göstergeleri güncel</strong><span>Son kontrol: 19 Temmuz 2026</span></p></footer></aside>
        </section>
      )}
    </div>
  );
}
