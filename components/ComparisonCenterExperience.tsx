"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { parsePrice, timeToSeconds, type Product } from "@/components/productData";
import { useAuctionProducts } from "@/components/useAuctionProducts";
import {
  COMPARE_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
  defaultCompareIds,
  defaultFavoriteIds,
  useStoredIds,
} from "@/components/useMarketplaceCollections";

type IconName = "compare" | "trash" | "plus" | "heart" | "shield" | "clock" | "arrow" | "check";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    compare: <><path d="M8 3 4 7l4 4" /><path d="M4 7h12a4 4 0 0 1 4 4v1" /><path d="m16 21 4-4-4-4" /><path d="M20 17H8a4 4 0 0 1-4-4v-1" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" /><path d="M10 11v6M14 11v6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function specValue(product: Product, label: string) {
  return product.specs.find((spec) => spec.label === label)?.value ?? "—";
}

export default function ComparisonCenterExperience() {
  const compare = useStoredIds(COMPARE_STORAGE_KEY, defaultCompareIds);
  const favorites = useStoredIds(FAVORITES_STORAGE_KEY, defaultFavoriteIds);
  const { products: marketplaceProducts, loading } = useAuctionProducts();
  const [notice, setNotice] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);

  const products = useMemo(() => compare.ids.map((id) => marketplaceProducts.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)), [compare.ids, marketplaceProducts]);
  const available = marketplaceProducts.filter((product) => !compare.ids.includes(product.id));
  const specLabels = [...new Set(products.flatMap((product) => product.specs.map((spec) => spec.label)))].slice(0, 8);
  const lowestPrice = products.length ? Math.min(...products.map((product) => parsePrice(product.price))) : 0;
  const highestRating = products.length ? Math.max(...products.map((product) => product.sellerRating)) : 0;
  const shortestTime = products.length ? Math.min(...products.map((product) => timeToSeconds(product.time))) : 0;

  function addProduct(id: string) {
    const result = compare.toggle(id, 3);
    setNotice(result === "limit" ? "En fazla 3 ürünü karşılaştırabilirsin." : "Ürün karşılaştırmaya eklendi.");
    setSelectorOpen(false);
  }

  if (loading) {
    return <section className="comparisonEmptyV11"><span><Icon name="compare" /></span><h2>Karşılaştırma yükleniyor</h2><p>Güncel ilanlar Supabase üzerinden getiriliyor.</p></section>;
  }

  if (products.length === 0) {
    return <section className="comparisonEmptyV11"><span><Icon name="compare" /></span><h2>Karşılaştırma listen boş</h2><p>Arama veya favoriler sayfasından en fazla üç ürünü seçerek fiyat, süre, satıcı ve teknik özellikleri yan yana inceleyebilirsin.</p><div><Link href="/arama">Ürünleri keşfet</Link><button type="button" onClick={() => compare.setIds(defaultCompareIds)}>Örnek karşılaştırmayı aç</button></div></section>;
  }

  return (
    <div className="comparisonV11">
      {notice && <div className="engagementToastV11" role="status"><Icon name="check" /> {notice}</div>}
      <section className="comparisonIntroV11">
        <div><span>AKILLI KARŞILAŞTIRMA</span><h2>Karar vermeden önce farkları net gör</h2><p>Güncel teklif, kalan süre, satıcı güveni ve ürün özelliklerini tek tabloda karşılaştır.</p></div>
        <div className="comparisonIntroActionsV11">
          <button type="button" onClick={() => setSelectorOpen((value) => !value)} disabled={products.length >= 3}><Icon name="plus" /> Ürün ekle</button>
          <button type="button" onClick={compare.clear}><Icon name="trash" /> Listeyi temizle</button>
        </div>
      </section>

      {selectorOpen && <section className="comparisonSelectorV11"><header><strong>Karşılaştırmaya ürün ekle</strong><small>{3 - products.length} seçim hakkın kaldı</small></header><div>{available.map((product) => <button type="button" key={product.id} onClick={() => addProduct(product.id)}><img src={product.image} alt="" /><span><b>{product.title}</b><small>{product.price} · {product.time}</small></span><Icon name="plus" /></button>)}</div></section>}

      <section className={`comparisonCardsV11 count-${products.length}`}>
        {products.map((product) => {
          const bestPrice = parsePrice(product.price) === lowestPrice;
          const bestSeller = product.sellerRating === highestRating;
          const endingSoon = timeToSeconds(product.time) === shortestTime;
          return <article key={product.id}>
            <button type="button" className="comparisonRemoveV11" onClick={() => compare.remove(product.id)} aria-label="Karşılaştırmadan çıkar"><Icon name="trash" /></button>
            <Link href={`/urun/${product.id}`} className="comparisonImageV11"><img src={product.image} alt={product.title} />{product.live && <span><i /> CANLI</span>}</Link>
            <div className="comparisonTitleV11"><span>{product.category} · {product.condition}</span><Link href={`/urun/${product.id}`}><h3>{product.title}</h3></Link><small>{product.seller}</small></div>
            <div className="comparisonHighlightsV11">
              <div className={bestPrice ? "best" : ""}><span>Güncel teklif</span><strong>{product.price}</strong>{bestPrice && <small><Icon name="check" /> En düşük fiyat</small>}</div>
              <div className={endingSoon ? "urgent" : ""}><span>Kalan süre</span><strong><Icon name="clock" /> {product.time}</strong>{endingSoon && <small>En yakın biten</small>}</div>
            </div>
            <div className="comparisonSellerV11"><span className={product.verified ? "verified" : ""}><Icon name="shield" /></span><div><b>{product.sellerRating.toLocaleString("tr-TR")} / 5</b><small>{product.sellerSales} başarılı satış</small></div>{bestSeller && <em>En güçlü satıcı</em>}</div>
            <div className="comparisonCardActionsV11"><button type="button" className={favorites.ids.includes(product.id) ? "active" : ""} onClick={() => favorites.toggle(product.id)}><Icon name="heart" /> {favorites.ids.includes(product.id) ? "Favorilerde" : "Favoriye ekle"}</button><Link href={`/urun/${product.id}`}>İlanı aç <Icon name="arrow" /></Link></div>
          </article>;
        })}
        {products.length < 3 && <button type="button" className="comparisonAddCardV11" onClick={() => setSelectorOpen(true)}><span><Icon name="plus" /></span><strong>Başka ürün ekle</strong><small>En fazla 3 ürün karşılaştırılabilir.</small></button>}
      </section>

      <section className={`comparisonTableV11 count-${products.length}`}>
        <header><div><Icon name="compare" /><div><span>DETAYLI KARŞILAŞTIRMA</span><h2>Teklif ve ürün özellikleri</h2></div></div><small>En avantajlı değerler vurgulanır.</small></header>
        <div className="comparisonTableScrollV11">
          <div className="comparisonRowV11 head"><strong>Özellik</strong>{products.map((product) => <span key={product.id}>{product.title}</span>)}</div>
          <div className="comparisonRowV11"><strong>Güncel teklif</strong>{products.map((product) => <span className={parsePrice(product.price) === lowestPrice ? "winner" : ""} key={product.id}>{product.price}</span>)}</div>
          <div className="comparisonRowV11"><strong>Teklif sayısı</strong>{products.map((product) => <span key={product.id}>{product.bids}</span>)}</div>
          <div className="comparisonRowV11"><strong>İzleyen</strong>{products.map((product) => <span key={product.id}>{product.watchers}</span>)}</div>
          <div className="comparisonRowV11"><strong>Satıcı puanı</strong>{products.map((product) => <span className={product.sellerRating === highestRating ? "winner" : ""} key={product.id}>{product.sellerRating.toLocaleString("tr-TR")} / 5</span>)}</div>
          <div className="comparisonRowV11"><strong>Kargo</strong>{products.map((product) => <span key={product.id}>{product.shipping}</span>)}</div>
          {specLabels.map((label) => <div className="comparisonRowV11" key={label}><strong>{label}</strong>{products.map((product) => <span key={product.id}>{specValue(product, label)}</span>)}</div>)}
        </div>
      </section>

      <section className="comparisonNoteV11"><Icon name="shield" /><div><strong>Karşılaştırma karar desteğidir</strong><span>Teklif vermeden önce ilanın tüm fotoğraflarını, açıklamasını ve satıcı koşullarını ayrıca kontrol et.</span></div><Link href="/yardim">Güvenli alışveriş rehberi <Icon name="arrow" /></Link></section>
    </div>
  );
}
