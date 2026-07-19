"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { parsePrice, timeToSeconds, type Product } from "@/components/productData";
import { useAuctionProducts } from "@/components/useAuctionProducts";
import { sellerSlugForName } from "@/components/sellerData";
import { COMPARE_STORAGE_KEY, FAVORITES_STORAGE_KEY, defaultCompareIds, defaultFavoriteIds, useStoredIds } from "@/components/useMarketplaceCollections";

type SortKey = "relevant" | "ending" | "price-low" | "price-high" | "bids" | "newest";
type SaleMode = "all" | "live" | "scheduled";
type ViewMode = "grid" | "list";

type Props = {
  initialQuery?: string;
  lockedCategory?: string;
  categoryTitle?: string;
};

const categories = ["Tümü", "Telefon", "Bilgisayar", "Oyun & Konsol", "Saat", "Elektronik", "Koleksiyon", "Ev & Yaşam"];
const conditions = ["Az kullanılmış", "Çok iyi", "Garantili", "Kutulu", "Sıfır ayarında"];

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
}

function money(value: number) {
  return `${value.toLocaleString("tr-TR")} TL`;
}

function Icon({ name }: { name: "search" | "filter" | "grid" | "list" | "heart" | "clock" | "shield" | "close" | "bell" | "compare" | "check" }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    compare: <><path d="M8 3 4 7l4 4"/><path d="M4 7h12a4 4 0 0 1 4 4v1"/><path d="m16 21 4-4-4-4"/><path d="M20 17H8a4 4 0 0 1-4-4v-1"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function DiscoveryCard({ product, view, favorite, compared, onFavorite, onCompare }: { product: Product; view: ViewMode; favorite: boolean; compared: boolean; onFavorite: () => void; onCompare: () => void }) {
  const urgent = timeToSeconds(product.time) < 3600;
  return (
    <article className={`discoveryCard ${view === "list" ? "discoveryCardList" : ""}`}>
      <div className="discoveryCardImage">
        <Link href={`/urun/${product.id}`} aria-label={`${product.title} detayını aç`}><img src={product.image} alt={product.title} loading="lazy" /></Link>
        <div className="discoveryImageBadges">
          {product.live ? <span className="discoveryLiveBadge"><i /> CANLI</span> : <span className="discoveryScheduledBadge">SÜRELİ</span>}
          {urgent && <span className="discoveryUrgentBadge">SON SAAT</span>}
        </div>
        <div className="discoveryCardQuickActionsV11"><button type="button" className={compared ? "active" : ""} onClick={onCompare} aria-label={compared ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"} aria-pressed={compared}><Icon name={compared ? "check" : "compare"} /></button><button type="button" className={favorite ? "discoveryFavorite active" : "discoveryFavorite"} onClick={onFavorite} aria-label={favorite ? "Favorilerden çıkar" : "Favoriye ekle"} aria-pressed={favorite}><Icon name="heart" /></button></div>
      </div>
      <div className="discoveryCardContent">
        <div className="discoveryCardEyebrow"><span>{product.category}</span><small>{product.condition}</small></div>
        <Link href={`/urun/${product.id}`} className="discoveryCardTitle"><h3>{product.title}</h3></Link>
        <div className="discoverySellerLine">
          <span className={product.verified ? "verified" : ""}><Icon name="shield" /></span>
          <div><Link href={`/magaza/${product.sellerSlug ?? sellerSlugForName(product.seller)}`}>{product.seller}</Link><small>{product.verified ? "Doğrulanmış satıcı" : "Bireysel satıcı"} · {product.location}</small></div>
        </div>
        {view === "list" && <p className="discoveryCardDescription">{product.description}</p>}
        <div className="discoveryCardMetrics">
          <div><span>Güncel teklif</span><strong>{product.price}</strong></div>
          <div><span>Teklif</span><strong>{product.bids}</strong></div>
          <div><span>İzleyen</span><strong>{product.watchers}</strong></div>
        </div>
        <div className="discoveryCardFooter"><span className={urgent ? "urgent" : ""}><Icon name="clock" /> {product.time}</span><Link href={`/urun/${product.id}`}>Açık artırmaya git</Link></div>
      </div>
    </article>
  );
}

export default function DiscoveryExperience({ initialQuery = "", lockedCategory, categoryTitle }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(lockedCategory || "Tümü");
  const [saleMode, setSaleMode] = useState<SaleMode>("all");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("relevant");
  const [view, setView] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const favorites = useStoredIds(FAVORITES_STORAGE_KEY, defaultFavoriteIds);
  const compare = useStoredIds(COMPARE_STORAGE_KEY, defaultCompareIds);
  const [saved, setSaved] = useState(false);
  const [collectionNotice, setCollectionNotice] = useState("");
  const { products: marketplaceProducts } = useAuctionProducts();

  const products = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Number.POSITIVE_INFINITY;
    let result = marketplaceProducts.filter((product) => {
      const searchable = normalize([product.title, product.category, product.condition, product.seller, product.location, product.description, ...product.specs.flatMap((spec) => [spec.label, spec.value])].join(" "));
      const price = parsePrice(product.price);
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (category === "Tümü" || product.category === category)
        && (saleMode === "all" || (saleMode === "live" ? product.live : !product.live))
        && (!selectedConditions.length || selectedConditions.includes(product.condition))
        && (!verifiedOnly || product.verified)
        && price >= min && price <= max;
    });
    result = [...result].sort((a, b) => {
      if (sort === "ending") return timeToSeconds(a.time) - timeToSeconds(b.time);
      if (sort === "price-low") return parsePrice(a.price) - parsePrice(b.price);
      if (sort === "price-high") return parsePrice(b.price) - parsePrice(a.price);
      if (sort === "bids") return b.bids - a.bids;
      if (sort === "newest") return marketplaceProducts.indexOf(b) - marketplaceProducts.indexOf(a);
      const boost = (product: Product) => normalizedQuery && normalize(product.title).startsWith(normalizedQuery) ? 1 : 0;
      return boost(b) - boost(a) || b.watchers - a.watchers;
    });
    return result;
  }, [category, marketplaceProducts, maxPrice, minPrice, query, saleMode, selectedConditions, sort, verifiedOnly]);

  const activeFilterCount = [category !== (lockedCategory || "Tümü"), saleMode !== "all", selectedConditions.length > 0, verifiedOnly, Boolean(minPrice), Boolean(maxPrice)].filter(Boolean).length;
  const clearFilters = () => { setCategory(lockedCategory || "Tümü"); setSaleMode("all"); setSelectedConditions([]); setVerifiedOnly(false); setMinPrice(""); setMaxPrice(""); };
  const toggleCondition = (condition: string) => setSelectedConditions((current) => current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition]);
  const toggleCompare = (id: string) => {
    const result = compare.toggle(id, 3);
    setCollectionNotice(result === "limit" ? "En fazla 3 ürünü karşılaştırabilirsin." : result === "added" ? "Ürün karşılaştırmaya eklendi." : "Ürün karşılaştırmadan çıkarıldı.");
  };

  return (
    <div className="discoveryV10">
      {collectionNotice && <div className="engagementToastV11" role="status"><Icon name="check" /> {collectionNotice}</div>}
      <section className="discoveryHero">
        <div><span>{categoryTitle ? "KATEGORİ KEŞFİ" : "AKILLI ARAMA"}</span><h2>{categoryTitle ? `${categoryTitle} açık artırmaları` : "Aradığın ürünü birkaç saniyede bul"}</h2><p>Başlık, marka, teknik özellik, satıcı ve konum bilgilerini birlikte tarayan gelişmiş keşif deneyimi.</p></div>
        <div className="discoveryHeroTrust"><Icon name="shield" /><div><strong>Güvenli sonuçlar</strong><small>Doğrulanmış hesap ve korumalı ödeme seçeneklerini öne çıkarır.</small></div></div>
      </section>

      <form className="discoverySearchBox" onSubmit={(event) => event.preventDefault()} role="search">
        <Icon name="search" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Örn. iPhone 15 Pro, M3 Pro, PlayStation..." aria-label="Ürünlerde ara" />
        {query && <button type="button" className="discoverySearchClear" onClick={() => setQuery("")} aria-label="Aramayı temizle"><Icon name="close" /></button>}
        <button type="submit" className="discoverySearchSubmit">Ara</button>
      </form>

      <div className="discoveryPopularSearches"><span>Popüler:</span>{["iPhone", "PlayStation", "MacBook", "Rolex", "Sony"].map((term) => <button key={term} type="button" onClick={() => setQuery(term)}>{term}</button>)}</div>

      <div className="discoveryToolbar">
        <div className="discoveryResultSummary"><strong>{products.length}</strong><span>{query ? `“${query}” için uygun ilan` : "uygun açık artırma"}</span></div>
        <div className="discoveryToolbarActions">
          <button type="button" className="discoveryMobileFilter" onClick={() => setFiltersOpen(true)}><Icon name="filter" /> Filtreler {activeFilterCount > 0 && <small>{activeFilterCount}</small>}</button>
          <label className="discoverySort"><span>Sırala</span><select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="relevant">En alakalı</option><option value="ending">Süresi azalan</option><option value="price-low">Fiyat: düşükten</option><option value="price-high">Fiyat: yüksekten</option><option value="bids">En çok teklif</option><option value="newest">Yeni eklenen</option></select></label>
          <div className="discoveryViewToggle"><button type="button" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Izgara görünümü"><Icon name="grid" /></button><button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="Liste görünümü"><Icon name="list" /></button></div>
        </div>
      </div>

      <div className="discoveryLayout">
        <aside className={filtersOpen ? "discoveryFilters open" : "discoveryFilters"}>
          <div className="discoveryFilterMobileHead"><strong>Filtreler</strong><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Filtreleri kapat"><Icon name="close" /></button></div>
          <div className="discoveryFilterHead"><div><Icon name="filter" /><strong>Sonuçları daralt</strong></div>{activeFilterCount > 0 && <button type="button" onClick={clearFilters}>Temizle</button>}</div>
          {!lockedCategory && <div className="discoveryFilterGroup"><h3>Kategori</h3><div className="discoveryRadioList">{categories.map((option) => <label key={option}><input type="radio" name="category" checked={category === option} onChange={() => setCategory(option)} /><span>{option}</span><small>{option === "Tümü" ? marketplaceProducts.length : marketplaceProducts.filter((item) => item.category === option).length}</small></label>)}</div></div>}
          <div className="discoveryFilterGroup"><h3>Açık artırma türü</h3><div className="discoverySegmented"><button type="button" className={saleMode === "all" ? "active" : ""} onClick={() => setSaleMode("all")}>Tümü</button><button type="button" className={saleMode === "live" ? "active" : ""} onClick={() => setSaleMode("live")}>Canlı</button><button type="button" className={saleMode === "scheduled" ? "active" : ""} onClick={() => setSaleMode("scheduled")}>Süreli</button></div></div>
          <div className="discoveryFilterGroup"><h3>Fiyat aralığı</h3><div className="discoveryPriceFields"><label><span>En az</span><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" /></label><i>—</i><label><span>En fazla</span><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Sınırsız" /></label></div><div className="discoveryPriceShortcuts">{[25000, 50000, 100000].map((value) => <button type="button" key={value} onClick={() => setMaxPrice(String(value))}>{money(value)} altı</button>)}</div></div>
          <div className="discoveryFilterGroup"><h3>Ürün durumu</h3><div className="discoveryCheckList">{conditions.map((condition) => <label key={condition}><input type="checkbox" checked={selectedConditions.includes(condition)} onChange={() => toggleCondition(condition)} /><span>{condition}</span></label>)}</div></div>
          <div className="discoveryFilterGroup discoveryVerifiedFilter"><label><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} /><span><Icon name="shield" /><div><strong>Yalnızca doğrulanmış satıcılar</strong><small>Kimlik ve iletişim bilgileri kontrol edilmiş hesaplar.</small></div></span></label></div>
          <button type="button" className="discoveryApplyMobile" onClick={() => setFiltersOpen(false)}>{products.length} ilanı göster</button>
        </aside>
        {filtersOpen && <button type="button" className="discoveryFilterBackdrop" onClick={() => setFiltersOpen(false)} aria-label="Filtreleri kapat" />}

        <section className="discoveryResults">
          {activeFilterCount > 0 && <div className="discoveryActiveFilters"><span>Aktif filtreler:</span>{saleMode !== "all" && <button type="button" onClick={() => setSaleMode("all")}>{saleMode === "live" ? "Canlı" : "Süreli"} <Icon name="close" /></button>}{selectedConditions.map((condition) => <button key={condition} type="button" onClick={() => toggleCondition(condition)}>{condition} <Icon name="close" /></button>)}{verifiedOnly && <button type="button" onClick={() => setVerifiedOnly(false)}>Doğrulanmış satıcı <Icon name="close" /></button>}{(minPrice || maxPrice) && <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); }}>{minPrice ? `${money(Number(minPrice))} üzeri` : ""}{minPrice && maxPrice ? " · " : ""}{maxPrice ? `${money(Number(maxPrice))} altı` : ""} <Icon name="close" /></button>}</div>}
          {products.length > 0 ? <div className={view === "grid" ? "discoveryProductGrid" : "discoveryProductList"}>{products.map((product) => <DiscoveryCard key={product.id} product={product} view={view} favorite={favorites.ids.includes(product.id)} compared={compare.ids.includes(product.id)} onFavorite={() => favorites.toggle(product.id)} onCompare={() => toggleCompare(product.id)} />)}</div> : <div className="discoveryEmpty"><span><Icon name="search" /></span><h3>Bu filtrelerle ilan bulunamadı</h3><p>Arama kelimesini sadeleştir veya seçili filtrelerden bazılarını kaldır.</p><button type="button" onClick={() => { setQuery(""); clearFilters(); }}>Tüm ilanları göster</button></div>}
          <div className="discoverySavedSearch"><div><Icon name="bell" /><div><strong>Yeni ilanları kaçırma</strong><span>Bu aramaya uygun yeni ürün geldiğinde bildirim al.</span></div></div><button type="button" className={saved ? "saved" : ""} onClick={() => setSaved((value) => !value)}>{saved ? "Arama kaydedildi" : "Aramayı kaydet"}</button></div>
        </section>
      </div>
    </div>
  );
}
