"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { demoProducts, parsePrice, timeToSeconds, type Product } from "@/components/productData";
import {
  COMPARE_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
  defaultCompareIds,
  defaultFavoriteIds,
  useStoredIds,
} from "@/components/useMarketplaceCollections";

type FilterKey = "all" | "ending" | "live" | "price";

type IconName = "heart" | "compare" | "clock" | "bell" | "trash" | "shield" | "arrow" | "check";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
    compare: <><path d="M8 3 4 7l4 4" /><path d="M4 7h12a4 4 0 0 1 4 4v1" /><path d="m16 21 4-4-4-4" /><path d="M20 17H8a4 4 0 0 1-4-4v-1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" /><path d="M10 11v6M14 11v6" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function FavoriteCard({
  product,
  compared,
  alertEnabled,
  onRemove,
  onCompare,
  onAlert,
}: {
  product: Product;
  compared: boolean;
  alertEnabled: boolean;
  onRemove: () => void;
  onCompare: () => void;
  onAlert: () => void;
}) {
  const urgent = timeToSeconds(product.time) < 3600;
  const priceDelta = Math.max(product.increment * 2, Math.round(parsePrice(product.price) * 0.015));

  return (
    <article className="favoriteCardV11">
      <Link href={`/urun/${product.id}`} className="favoriteImageV11">
        <img src={product.image} alt={product.title} />
        <div>{product.live ? <span className="live"><i /> CANLI</span> : <span>SÜRELİ</span>}{urgent && <b>SON SAAT</b>}</div>
      </Link>
      <div className="favoriteBodyV11">
        <div className="favoriteTopV11">
          <div><span>{product.category}</span><small>{product.condition}</small></div>
          <button type="button" onClick={onRemove} aria-label={`${product.title} ürününü favorilerden çıkar`}><Icon name="trash" /></button>
        </div>
        <Link href={`/urun/${product.id}`}><h3>{product.title}</h3></Link>
        <div className="favoriteSellerV11"><span><Icon name="shield" /></span><div><b>{product.seller}</b><small>{product.sellerRating.toLocaleString("tr-TR")} puan · {product.location}</small></div></div>
        <div className="favoritePriceV11">
          <div><span>Güncel teklif</span><strong>{product.price}</strong><small>Son hareket: +{priceDelta.toLocaleString("tr-TR")} TL</small></div>
          <div className={urgent ? "urgent" : ""}><span>Kalan süre</span><strong><Icon name="clock" /> {product.time}</strong><small>{product.bids} teklif · {product.watchers} izleyen</small></div>
        </div>
        <div className="favoriteActionsV11">
          <button type="button" className={alertEnabled ? "active" : ""} onClick={onAlert}><Icon name={alertEnabled ? "check" : "bell"} /> {alertEnabled ? "Uyarı açık" : "Fiyat uyarısı"}</button>
          <button type="button" className={compared ? "active" : ""} onClick={onCompare}><Icon name={compared ? "check" : "compare"} /> {compared ? "Karşılaştırmada" : "Karşılaştır"}</button>
          <Link href={`/urun/${product.id}`}>Teklif ver <Icon name="arrow" /></Link>
        </div>
      </div>
    </article>
  );
}

export default function FavoritesCenterExperience() {
  const favorites = useStoredIds(FAVORITES_STORAGE_KEY, defaultFavoriteIds);
  const compare = useStoredIds(COMPARE_STORAGE_KEY, defaultCompareIds);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [alerts, setAlerts] = useState<string[]>(["iphone-15-pro"]);
  const [notice, setNotice] = useState("");

  const products = useMemo(() => favorites.ids.map((id) => demoProducts.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)), [favorites.ids]);
  const filtered = products.filter((product) => {
    if (filter === "ending") return timeToSeconds(product.time) < 7200;
    if (filter === "live") return product.live;
    if (filter === "price") return alerts.includes(product.id);
    return true;
  });

  function toggleCompare(id: string) {
    const result = compare.toggle(id, 3);
    setNotice(result === "limit" ? "En fazla 3 ürünü karşılaştırabilirsin." : result === "added" ? "Ürün karşılaştırmaya eklendi." : "Ürün karşılaştırmadan çıkarıldı.");
  }

  return (
    <div className="favoritesV11">
      {notice && <div className="engagementToastV11" role="status"><Icon name="check" /> {notice}</div>}
      <section className="favoritesSummaryV11">
        <article><span><Icon name="heart" /></span><div><strong>{products.length}</strong><small>Takip edilen ürün</small></div></article>
        <article><span><Icon name="clock" /></span><div><strong>{products.filter((product) => timeToSeconds(product.time) < 7200).length}</strong><small>2 saat içinde bitiyor</small></div></article>
        <article><span><Icon name="bell" /></span><div><strong>{alerts.length}</strong><small>Aktif fiyat uyarısı</small></div></article>
        <article><span><Icon name="compare" /></span><div><strong>{compare.ids.length}/3</strong><small>Karşılaştırmada</small></div></article>
      </section>

      <section className="favoritesToolbarV11">
        <div>
          {([['all', 'Tümü'], ['ending', 'Yakında biten'], ['live', 'Canlı'], ['price', 'Uyarı açık']] as Array<[FilterKey, string]>).map(([key, label]) => <button type="button" className={filter === key ? "active" : ""} onClick={() => setFilter(key)} key={key}>{label}</button>)}
        </div>
        <Link href="/karsilastir" className={compare.ids.length > 0 ? "ready" : ""}><Icon name="compare" /> Karşılaştırmayı aç {compare.ids.length > 0 && <small>{compare.ids.length}</small>}</Link>
      </section>

      {filtered.length > 0 ? (
        <div className="favoritesGridV11">
          {filtered.map((product) => <FavoriteCard key={product.id} product={product} compared={compare.ids.includes(product.id)} alertEnabled={alerts.includes(product.id)} onRemove={() => favorites.remove(product.id)} onCompare={() => toggleCompare(product.id)} onAlert={() => setAlerts((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} />)}
        </div>
      ) : (
        <section className="favoritesEmptyV11"><span><Icon name="heart" /></span><h2>Bu bölümde favori ürün yok</h2><p>Filtreyi değiştir veya yeni açık artırmaları keşfederek ürünleri takip etmeye başla.</p><Link href="/arama">Ürünleri keşfet</Link></section>
      )}

      <section className="favoritesProtectionV11"><Icon name="shield" /><div><strong>Takip ettiğin ürünleri güvenle yönet</strong><span>Fiyat değişimi, son saat ve teklif geçilmesi bildirimlerini tek merkezden açıp kapatabilirsin.</span></div><Link href="/bildirimler">Bildirim ayarları <Icon name="arrow" /></Link></section>
    </div>
  );
}
