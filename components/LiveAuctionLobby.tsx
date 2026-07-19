"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  secondsToTime,
  timeToSeconds,
  type Product,
} from "@/components/productData";
import { useAuctionProducts } from "@/components/useAuctionProducts";

type IconName = "live" | "users" | "clock" | "arrow" | "bell" | "shield" | "bolt" | "calendar";

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
    live: <><circle cx="12" cy="12" r="2.5" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" /><path d="M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.8 2.8 8.1 7 10 4.2-1.9 7-5.2 7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function LiveRoomCard({ product, remaining }: { product: Product; remaining: number }) {
  const urgent = remaining < 1200;

  return (
    <article className="liveRoomCardV5">
      <Link href={`/urun/${product.id}`} className="liveRoomImageV5">
        <img src={product.image} alt={product.title} />
        <span className="liveRoomStatusV5"><i /> CANLI</span>
        <small><Icon name="users" /> {product.watchers} izleyici</small>
      </Link>
      <div className="liveRoomBodyV5">
        <div className="liveRoomCategoryV5"><span>{product.category}</span><b>{product.condition}</b></div>
        <Link href={`/urun/${product.id}`}><h3>{product.title}</h3></Link>
        <div className="liveRoomPriceV5">
          <div><span>Güncel teklif</span><strong>{product.price}</strong></div>
          <div className={urgent ? "urgent" : ""}><span>Kalan süre</span><strong>{secondsToTime(remaining)}</strong></div>
        </div>
        <div className="liveRoomMetaV5">
          <span>{product.bids} teklif</span>
          <span>{product.seller}</span>
        </div>
        <Link href={`/urun/${product.id}`} className="liveRoomJoinV5">Canlı odaya gir <Icon name="arrow" /></Link>
      </div>
    </article>
  );
}

export default function LiveAuctionLobby() {
  const { products: marketplaceProducts } = useAuctionProducts();
  const liveProducts = useMemo(() => marketplaceProducts.filter((product) => product.live), [marketplaceProducts]);
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>(() =>
    Object.fromEntries(liveProducts.map((product) => [product.id, timeToSeconds(product.time)]))
  );
  const [sort, setSort] = useState<"ending" | "popular" | "bids">("ending");
  const [reminders, setReminders] = useState<string[]>([]);

  useEffect(() => {
    setRemainingTimes((current) => ({
      ...current,
      ...Object.fromEntries(liveProducts.map((product) => [product.id, product.endsAt ? Math.max(0, Math.floor((new Date(product.endsAt).getTime() - Date.now()) / 1000)) : timeToSeconds(product.time)])),
    }));
  }, [liveProducts]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingTimes((current) =>
        Object.fromEntries(Object.entries(current).map(([id, seconds]) => [id, Math.max(0, seconds - 1)]))
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedProducts = useMemo(() => {
    return [...liveProducts].sort((a, b) => {
      if (sort === "popular") return b.watchers - a.watchers;
      if (sort === "bids") return b.bids - a.bids;
      return (remainingTimes[a.id] ?? 0) - (remainingTimes[b.id] ?? 0);
    });
  }, [liveProducts, remainingTimes, sort]);

  const featured = sortedProducts[0] ?? marketplaceProducts[0];
  const featuredRemaining = featured ? (remainingTimes[featured.id] ?? timeToSeconds(featured.time)) : 0;

  function toggleReminder(id: string) {
    setReminders((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  if (!featured) {
    return <div className="premiumEmpty"><h3>Aktif canlı açık artırma bulunamadı</h3><p>Yeni canlı odalar yayınlandığında burada görünecek.</p></div>;
  }

  return (
    <div className="liveLobbyV5">
      <section className="liveLobbyHeroV5">
        <div className="liveLobbyHeroContentV5">
          <span className="liveLobbyKickerV5"><i /> ŞİMDİ YAYINDA</span>
          <h1>Canlı odada teklif değişir, <strong>heyecan saniye saniye artar.</strong></h1>
          <p>Aktif açık artırma odalarına katıl, teklif akışını anlık izle ve son saniyeye kadar kapış.</p>
          <div className="liveLobbyHeroStatsV5">
            <div><Icon name="live" /><span><b>{liveProducts.length}</b> açık oda</span></div>
            <div><Icon name="users" /><span><b>{liveProducts.reduce((total, product) => total + product.watchers, 0)}</b> izleyici</span></div>
            <div><Icon name="bolt" /><span><b>{liveProducts.reduce((total, product) => total + product.bids, 0)}</b> teklif</span></div>
          </div>
        </div>

        <div className="liveLobbyFeaturedV5">
          <img src={featured.image} alt={featured.title} />
          <div className="liveLobbyFeaturedShadeV5" />
          <div className="liveLobbyFeaturedTopV5">
            <span><i /> ÖNE ÇIKAN CANLI ODA</span>
            <b><Icon name="users" /> {featured.watchers}</b>
          </div>
          <div className="liveLobbyFeaturedBodyV5">
            <span>{featured.category}</span>
            <h2>{featured.title}</h2>
            <div>
              <p><small>Güncel teklif</small><strong>{featured.price}</strong></p>
              <p className={featuredRemaining < 1200 ? "urgent" : ""}><small>Kalan süre</small><strong>{secondsToTime(featuredRemaining)}</strong></p>
            </div>
            <Link href={`/urun/${featured.id}`}>Canlı odaya katıl <Icon name="arrow" /></Link>
          </div>
        </div>
      </section>

      <section className="liveSafetyStripV5">
        <article><Icon name="shield" /><div><b>Doğrulanmış teklif</b><span>Yalnızca kartı doğrulanmış ve gereken güvenceyi sağlayan hesaplar katılır.</span></div></article>
        <article><Icon name="clock" /><div><b>Anti-sniping kuralı</b><span>Son 2 dakikadaki teklif süreyi otomatik uzatır.</span></div></article>
        <article><Icon name="live" /><div><b>Anlık senkronizasyon</b><span>Fiyat ve teklif sırası odadaki herkese aynı anda yansır.</span></div></article>
      </section>

      <section className="liveLobbyRoomsV5">
        <header className="liveLobbySectionHeadV5">
          <div><span>AKTİF ODALAR</span><h2>Şimdi kapışılan ürünler</h2><p>Teklif vermeden önce ürün detayını, satıcı puanını ve minimum artış tutarını kontrol et.</p></div>
          <label>
            Sırala
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
              <option value="ending">En yakın biten</option>
              <option value="popular">En çok izlenen</option>
              <option value="bids">En çok teklif alan</option>
            </select>
          </label>
        </header>

        <div className="liveRoomGridV5">
          {sortedProducts.map((product) => (
            <LiveRoomCard key={product.id} product={product} remaining={remainingTimes[product.id] ?? timeToSeconds(product.time)} />
          ))}
        </div>
      </section>

      <section className="liveScheduleV5">
        <header><div><span>YAKLAŞAN YAYINLAR</span><h2>Sıradaki canlı açık artırmalar</h2></div><Link href="/bildirimler">Tüm hatırlatıcılar <Icon name="arrow" /></Link></header>
        <div>
          {marketplaceProducts.filter((product) => !product.live).slice(0, 3).map((product, index) => {
            const reminderActive = reminders.includes(product.id);
            return (
              <article key={product.id}>
                <div className="liveScheduleDateV5"><span>{index === 0 ? "BUGÜN" : index === 1 ? "YARIN" : "22 TEM"}</span><b>{index === 0 ? "21:30" : index === 1 ? "19:00" : "20:45"}</b></div>
                <img src={product.image} alt={product.title} />
                <div className="liveScheduleInfoV5"><span>{product.category}</span><h3>{product.title}</h3><p>Başlangıç teklifi {product.price}</p></div>
                <button className={reminderActive ? "active" : ""} type="button" onClick={() => toggleReminder(product.id)}><Icon name={reminderActive ? "shield" : "bell"} /> {reminderActive ? "Hatırlatıcı açık" : "Hatırlat"}</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="liveLobbyHowV5">
        <div><span>CANLI ODA REHBERİ</span><h2>Katılmadan önce bilmen gerekenler</h2></div>
        <div>
          <article><b>01</b><Icon name="calendar" /><h3>Odaya katıl</h3><p>Aktif veya planlanan yayını aç, ürün bilgilerini incele.</p></article>
          <article><b>02</b><Icon name="shield" /><h3>Güvenceni doğrula</h3><p>Teklifin için gereken güvence teklif tutarına göre otomatik hesaplanır.</p></article>
          <article><b>03</b><Icon name="bolt" /><h3>Teklifini ver</h3><p>Manuel ya da gizli üst sınırlı otomatik teklif kullan.</p></article>
          <article><b>04</b><Icon name="clock" /><h3>Son ana kadar izle</h3><p>Süre bittiğinde en yüksek geçerli teklif açık artırmayı kazanır.</p></article>
        </div>
      </section>
    </div>
  );
}
