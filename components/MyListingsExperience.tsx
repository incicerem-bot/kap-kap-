"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ListingStatus = "draft" | "active" | "paused" | "ended" | "sold" | "cancelled" | string;
type Listing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  saleType: "auction" | "fixed";
  category: string;
  subcategory: string;
  condition: string;
  status: ListingStatus;
  startPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  reservePrice: number | null;
  minIncrement: number;
  stock: number;
  bidCount: number;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  imageCount: number;
  imagePath: string | null;
};

type IconName = "plus" | "search" | "refresh" | "image" | "gavel" | "tag" | "eye" | "pause" | "play" | "cancel" | "clock" | "box" | "arrow";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const icons: Record<IconName, ReactNode> = {
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
    refresh: <><path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6.8 6.2L4 11M5.5 15A7 7 0 0 0 17.2 17.8L20 13"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 3 3 3-4 5 6"/></>,
    gavel: <><path d="m14 5 5 5"/><path d="m12 7 5 5"/><path d="m4 20 8-8"/><path d="m9 4 4-2 6 6-2 4Z"/><path d="M3 21h10"/></>,
    tag: <><path d="M20 13 13 20l-9-9V4h7Z"/><circle cx="8.5" cy="8.5" r="1"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    pause: <><path d="M9 5v14"/><path d="M15 5v14"/></>,
    play: <path d="m8 5 11 7-11 7Z"/>,
    cancel: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    box: <><path d="m4 7 8-4 8 4-8 4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4Z"/><path d="M12 11v10"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  };
  return <svg {...common}>{icons[name]}</svg>;
}

const statusLabels: Record<string, string> = {
  draft: "Taslak",
  active: "Yayında",
  paused: "Durduruldu",
  ended: "Sona erdi",
  sold: "Satıldı",
  cancelled: "İptal edildi",
};

const categoryLabels: Record<string, string> = {
  phone: "Telefon & Tablet",
  computer: "Bilgisayar",
  gaming: "Oyun & E-spor",
  watch: "Saat",
  camera: "Kamera",
  collection: "Koleksiyon",
  home: "Ev & Yaşam",
};

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(raw: unknown): Listing[] {
  const rows = Array.isArray(raw) ? raw : [];
  return rows.map((row) => {
    const value = row as Partial<Listing>;
    return {
      id: String(value.id ?? ""),
      slug: String(value.slug ?? ""),
      title: String(value.title ?? "İsimsiz ilan"),
      description: String(value.description ?? ""),
      saleType: value.saleType === "fixed" ? "fixed" : "auction",
      category: String(value.category ?? "gaming"),
      subcategory: String(value.subcategory ?? ""),
      condition: String(value.condition ?? "good"),
      status: String(value.status ?? "draft"),
      startPrice: number(value.startPrice),
      currentPrice: number(value.currentPrice),
      buyNowPrice: value.buyNowPrice == null ? null : number(value.buyNowPrice),
      reservePrice: value.reservePrice == null ? null : number(value.reservePrice),
      minIncrement: number(value.minIncrement),
      stock: number(value.stock),
      bidCount: number(value.bidCount),
      endsAt: value.endsAt ? String(value.endsAt) : null,
      createdAt: String(value.createdAt ?? ""),
      updatedAt: String(value.updatedAt ?? ""),
      imageCount: number(value.imageCount),
      imagePath: value.imagePath ? String(value.imagePath) : null,
    };
  });
}

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function date(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(parsed);
}

export default function MyListingsExperience() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data, error: rpcError } = await client.rpc("kk_get_my_listings");
      if (rpcError) throw rpcError;
      setListings(normalize(data));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "İlanlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("created")) {
      setNotice("İlanın kaydedildi. Buradan durumunu yönetebilirsin.");
    }
  }, [load]);

  const stats = useMemo(() => ({
    all: listings.length,
    draft: listings.filter((item) => item.status === "draft").length,
    active: listings.filter((item) => item.status === "active").length,
    paused: listings.filter((item) => item.status === "paused").length,
    ended: listings.filter((item) => ["ended", "sold", "cancelled"].includes(item.status)).length,
  }), [listings]);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    return listings.filter((item) => {
      const statusMatch = filter === "all" || (filter === "ended" ? ["ended", "sold", "cancelled"].includes(item.status) : item.status === filter);
      const queryMatch = !normalizedQuery || `${item.title} ${item.description} ${item.subcategory}`.toLocaleLowerCase("tr-TR").includes(normalizedQuery);
      return statusMatch && queryMatch;
    });
  }, [filter, listings, query]);

  function imageUrl(path: string | null) {
    if (!path) return "";
    const client = getSupabaseBrowserClient();
    return client?.storage.from("listing-assets").getPublicUrl(path).data.publicUrl ?? "";
  }

  async function changeStatus(listing: Listing, action: "publish" | "pause" | "cancel") {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    if (action === "cancel" && typeof window !== "undefined" && !window.confirm("Bu ilanı iptal etmek istediğine emin misin?")) return;

    setWorkingId(listing.id);
    setNotice("");
    setError("");
    try {
      if (action === "publish") {
        const { error: publishError } = await client.rpc("kk_publish_listing", { p_listing_id: listing.id });
        if (publishError) throw publishError;
        setNotice("İlan yayına alındı.");
      } else {
        const nextStatus = action === "pause" ? "paused" : "cancelled";
        const { error: statusError } = await client.rpc("kk_set_listing_status", { p_listing_id: listing.id, p_status: nextStatus });
        if (statusError) throw statusError;
        setNotice(action === "pause" ? "İlan durduruldu." : "İlan iptal edildi.");
      }
      await load();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "İlan durumu değiştirilemedi.");
    } finally {
      setWorkingId("");
    }
  }

  if (loading) {
    return <section className="myListingsLoadingV27"><span /><strong>İlanların hazırlanıyor</strong><p>Taslak ve aktif satışların yükleniyor.</p></section>;
  }

  return (
    <div className="myListingsV27">
      {notice && <button type="button" className="myListingsNoticeV27" onClick={() => setNotice("")}>{notice}</button>}
      {error && <div className="myListingsErrorV27"><strong>İşlem tamamlanamadı</strong><span>{error}</span><button type="button" onClick={() => setError("")}>Kapat</button></div>}

      <section className="myListingsTopV27">
        <div className="myListingsStatsV27">
          <article><span>Tüm ilanlar</span><strong>{stats.all}</strong></article>
          <article><span>Yayında</span><strong>{stats.active}</strong></article>
          <article><span>Taslak</span><strong>{stats.draft}</strong></article>
          <article><span>Durduruldu</span><strong>{stats.paused}</strong></article>
        </div>
        <Link href="/ilan-olustur"><Icon name="plus" /> Yeni ilan oluştur</Link>
      </section>

      <section className="myListingsToolsV27">
        <nav aria-label="İlan filtreleri">
          {(["all", "active", "draft", "paused", "ended"] as const).map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "all" ? "Tümü" : item === "active" ? "Yayında" : item === "draft" ? "Taslak" : item === "paused" ? "Durduruldu" : "Tamamlanan"}<small>{stats[item]}</small></button>)}
        </nav>
        <div><label><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İlanlarda ara" /></label><button type="button" onClick={() => void load()} aria-label="Yenile"><Icon name="refresh" /></button></div>
      </section>

      {visible.length ? (
        <section className="myListingsListV27">
          {visible.map((listing) => {
            const cover = imageUrl(listing.imagePath);
            const price = listing.saleType === "fixed" ? (listing.buyNowPrice ?? listing.startPrice) : Math.max(listing.currentPrice, listing.startPrice);
            return (
              <article className="myListingCardV27" key={listing.id}>
                <div className="myListingImageV27">{cover ? <img src={cover} alt={listing.title} /> : <Icon name="image" />}<span>{listing.imageCount} fotoğraf</span></div>
                <div className="myListingInfoV27">
                  <div className="myListingBadgesV27"><span className={listing.saleType}><Icon name={listing.saleType === "fixed" ? "tag" : "gavel"} /> {listing.saleType === "fixed" ? "Sabit fiyat" : "Açık artırma"}</span><span className={`status ${listing.status}`}>{statusLabels[listing.status] ?? listing.status}</span></div>
                  <small>{listing.subcategory || categoryLabels[listing.category] || listing.category}</small>
                  <h2>{listing.title}</h2>
                  <p>{listing.description}</p>
                  <div className="myListingMetaV27"><span><Icon name="clock" /> {listing.status === "active" ? `Bitiş: ${date(listing.endsAt)}` : `Oluşturma: ${date(listing.createdAt)}`}</span><span><Icon name="box" /> {listing.saleType === "auction" ? `${listing.bidCount} teklif` : `${listing.stock} stok`}</span></div>
                </div>
                <div className="myListingPriceV27"><span>{listing.saleType === "auction" ? "Güncel teklif" : "Satış fiyatı"}</span><strong>{money(price)}</strong>{listing.saleType === "auction" && <small>Başlangıç {money(listing.startPrice)}</small>}</div>
                <div className="myListingActionsV27">
                  {listing.status === "active" && <><Link href={`/urun/${listing.slug}`} target="_blank"><Icon name="eye" /> Görüntüle</Link><button type="button" disabled={workingId === listing.id} onClick={() => void changeStatus(listing, "pause")}><Icon name="pause" /> Durdur</button></>}
                  {["draft", "paused"].includes(listing.status) && <button type="button" className="publish" disabled={workingId === listing.id} onClick={() => void changeStatus(listing, "publish")}><Icon name="play" /> {workingId === listing.id ? "İşleniyor…" : "Yayınla"}</button>}
                  {["draft", "paused"].includes(listing.status) && <button type="button" className="danger" disabled={workingId === listing.id} onClick={() => void changeStatus(listing, "cancel")}><Icon name="cancel" /> İptal et</button>}
                  {["ended", "sold"].includes(listing.status) && <Link href={`/urun/${listing.slug}`}><Icon name="arrow" /> Sonucu aç</Link>}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="myListingsEmptyV27"><Icon name="gavel" /><h2>{listings.length ? "Bu filtrede ilan bulunmuyor" : "Henüz ilan oluşturmadın"}</h2><p>{listings.length ? "Başka bir durum filtresi seçebilir veya aramayı temizleyebilirsin." : "İlk açık artırmanı ya da sabit fiyatlı ürününü birkaç adımda oluştur."}</p><Link href="/ilan-olustur">İlk ilanı oluştur <Icon name="arrow" /></Link></section>
      )}
    </div>
  );
}
