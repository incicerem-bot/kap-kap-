"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type SellerCenterData = {
  sellerId: string;
  storeName: string;
  storeSlug: string;
  verified: boolean;
  storeActive: boolean;
  platformReviewStatus: string;
  storeSetupCompleted: boolean;
  payoutStatus: string;
  payoutReady: boolean;
  allListingCount: number;
  activeListingCount: number;
  draftListingCount: number;
  pausedListingCount: number;
  totalBidCount: number;
};

type IconName =
  | "store"
  | "plus"
  | "list"
  | "settings"
  | "eye"
  | "check"
  | "clock"
  | "wallet"
  | "gavel"
  | "refresh"
  | "arrow";

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

  const icons: Record<IconName, ReactNode> = {
    store: <><path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6"/><path d="M8 20v-6h8v6"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    wallet: <><path d="M3 6h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6Z"/><path d="M3 8V5a2 2 0 0 1 2-2h12"/><path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    gavel: <><path d="m14 5 5 5"/><path d="m12 7 5 5"/><path d="m4 20 8-8"/><path d="m9 4 4-2 6 6-2 4Z"/><path d="M3 21h10"/></>,
    refresh: <><path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6.8 6.2L4 11M5.5 15A7 7 0 0 0 17.2 17.8L20 13"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  };

  return <svg {...common}>{icons[name]}</svg>;
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(raw: unknown): SellerCenterData {
  const value = (Array.isArray(raw) ? raw[0] : raw) as Partial<SellerCenterData> | null;
  return {
    sellerId: value?.sellerId ?? "",
    storeName: value?.storeName || "KapışKapış Mağazam",
    storeSlug: value?.storeSlug ?? "",
    verified: Boolean(value?.verified),
    storeActive: Boolean(value?.storeActive),
    platformReviewStatus: value?.platformReviewStatus ?? "pending",
    storeSetupCompleted: Boolean(value?.storeSetupCompleted),
    payoutStatus: value?.payoutStatus ?? "not_started",
    payoutReady: Boolean(value?.payoutReady),
    allListingCount: number(value?.allListingCount),
    activeListingCount: number(value?.activeListingCount),
    draftListingCount: number(value?.draftListingCount),
    pausedListingCount: number(value?.pausedListingCount),
    totalBidCount: number(value?.totalBidCount),
  };
}

export default function SellerCenterDashboard() {
  const [data, setData] = useState<SellerCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");

      const { data: result, error: rpcError } = await client.rpc("kk_get_my_seller_center");
      if (rpcError) throw rpcError;

      setData(normalize(result));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Satıcı merkezi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const steps = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Satıcı hesabı onayı",
        description: "KapışKapış satıcı incelemesi tamamlanmalı.",
        done: data.platformReviewStatus === "approved" && data.verified,
        href: "/satici-dogrulama",
      },
      {
        title: "Ödeme hesabı",
        description: "Satış gelirleri için iyzico alt üye hesabı aktif olmalı.",
        done: data.payoutReady,
        href: "/satici-dogrulama",
      },
      {
        title: "Mağaza vitrini",
        description: "Mağaza adı, açıklaması, kategori ve teslimat bilgileri tamamlanmalı.",
        done: data.storeSetupCompleted && data.storeActive,
        href: "/magazam/ayarlar",
      },
      {
        title: "İlk ilan",
        description: "Açık artırma veya sabit fiyatlı ilk ürününü oluştur.",
        done: data.allListingCount > 0,
        href: "/ilan-olustur",
      },
    ];
  }, [data]);

  const completedSteps = steps.filter((step) => step.done).length;
  const readiness = steps.length ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextStep = steps.find((step) => !step.done);

  if (loading) {
    return (
      <section className="sellerCenterLoadingV26">
        <span />
        <strong>Satıcı merkezi hazırlanıyor</strong>
        <p>Mağaza ve ilan bilgilerin kontrol ediliyor.</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="sellerCenterErrorV26">
        <div><Icon name="store" /></div>
        <span>SATICI MERKEZİ</span>
        <h2>Panel henüz bağlanamadı</h2>
        <p>{error || "Satıcı merkezi bilgileri alınamadı."}</p>
        <small>Önce paketteki <b>20260730_025_seller_center_dashboard.sql</b> dosyasını Supabase SQL Editor’da çalıştır.</small>
        <button type="button" onClick={() => void load()}><Icon name="refresh" /> Tekrar dene</button>
      </section>
    );
  }

  return (
    <div className="sellerCenterV26">
      <section className="sellerCenterHeroV26">
        <div className="sellerCenterHeroCopyV26">
          <span>SATIŞ KONTROL MERKEZİ</span>
          <h2>{data.storeName}</h2>
          <p>
            {data.storeActive
              ? "Mağazan yayında. İlanlarını ve satış hareketlerini buradan yönetebilirsin."
              : "Satışa hazır olmak için kalan adımları tamamla."}
          </p>
          <div className="sellerCenterHeroActionsV26">
            <Link href="/ilan-olustur"><Icon name="plus" /> Yeni ilan oluştur</Link>
            <Link href="/ilanlarim" className="secondary"><Icon name="list" /> İlanlarımı yönet</Link>
          </div>
        </div>

        <div className="sellerCenterReadinessV26">
          <div className="sellerCenterRingV26" style={{ "--seller-progress": `${readiness * 3.6}deg` } as CSSProperties}>
            <strong>%{readiness}</strong>
            <small>hazır</small>
          </div>
          <p>{completedSteps}/{steps.length} temel adım tamamlandı</p>
          <span className={data.storeActive ? "active" : "pending"}>
            {data.storeActive ? "Mağaza yayında" : "Kurulum devam ediyor"}
          </span>
        </div>
      </section>

      {nextStep && (
        <section className="sellerCenterNextV26">
          <div><Icon name="clock" /></div>
          <p><span>ŞİMDİ YAPILACAK</span><strong>{nextStep.title}</strong><small>{nextStep.description}</small></p>
          <Link href={nextStep.href}>Devam et <Icon name="arrow" /></Link>
        </section>
      )}

      <section className="sellerCenterStatsV26" aria-label="Mağaza istatistikleri">
        <article><span>Aktif ilan</span><strong>{data.activeListingCount}</strong><small>Şu anda yayında</small></article>
        <article><span>Taslak ilan</span><strong>{data.draftListingCount}</strong><small>Yayınlanmayı bekliyor</small></article>
        <article><span>Bekleyen ilan</span><strong>{data.pausedListingCount}</strong><small>Duraklatılmış</small></article>
        <article><span>Toplam teklif</span><strong>{data.totalBidCount}</strong><small>Tüm ilanlarda</small></article>
      </section>

      <section className="sellerCenterBodyV26">
        <div className="sellerCenterActionsV26">
          <header><span>HIZLI İŞLEMLER</span><h2>Ne yapmak istiyorsun?</h2></header>
          <div>
            <Link href="/ilan-olustur"><i><Icon name="gavel" /></i><p><strong>İlan oluştur</strong><span>Açık artırma veya sabit fiyatlı satış başlat.</span></p><Icon name="arrow" /></Link>
            <Link href="/ilanlarim"><i><Icon name="list" /></i><p><strong>İlanları yönet</strong><span>Taslak, aktif ve durdurulmuş ilanlarını görüntüle.</span></p><Icon name="arrow" /></Link>
            <Link href="/magazam/ayarlar"><i><Icon name="settings" /></i><p><strong>Mağazayı düzenle</strong><span>Logo, kapak, açıklama ve mağaza kurallarını değiştir.</span></p><Icon name="arrow" /></Link>
            {data.storeSlug ? (
              <Link href={`/magaza/${data.storeSlug}`} target="_blank"><i><Icon name="eye" /></i><p><strong>Mağazayı görüntüle</strong><span>Müşterilerin gördüğü vitrini yeni sekmede aç.</span></p><Icon name="arrow" /></Link>
            ) : (
              <Link href="/magazam/ayarlar"><i><Icon name="eye" /></i><p><strong>Vitrini hazırla</strong><span>Mağaza bağlantını oluştur ve vitrini yayına hazırla.</span></p><Icon name="arrow" /></Link>
            )}
          </div>
        </div>

        <aside className="sellerCenterChecklistV26">
          <header><span>SATIŞA HAZIRLIK</span><h2>Kurulum kontrolü</h2></header>
          <div className="sellerCenterChecklistProgressV26"><span><i style={{ width: `${readiness}%` }} /></span><strong>%{readiness}</strong></div>
          <ul>
            {steps.map((step) => (
              <li key={step.title} className={step.done ? "done" : ""}>
                <i>{step.done ? <Icon name="check" /> : <Icon name="clock" />}</i>
                <p><strong>{step.title}</strong><span>{step.description}</span></p>
                {!step.done && <Link href={step.href}>Aç</Link>}
              </li>
            ))}
          </ul>
          <footer><Icon name="wallet" /><p><strong>Ödeme durumu</strong><span>{data.payoutReady ? "Satış geliri hesabı aktif" : `Durum: ${data.payoutStatus}`}</span></p></footer>
        </aside>
      </section>
    </div>
  );
}
