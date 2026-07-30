"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Intent = {
  id: string;
  status: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  expiresAt: string;
  createdAt: string;
  listing: { id: string; slug: string; title: string; imagePath: string | null };
  seller: { id: string; name: string; slug: string; verified: boolean };
};

type IconName = "lock" | "clock" | "shield" | "truck" | "card" | "check" | "arrow" | "cancel" | "image";
function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const icons: Record<IconName, ReactNode> = {
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
    truck: <><path d="M3 6h11v10H3Z"/><path d="M14 9h4l3 3v4h-7Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    cancel: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 3 3 3-4 5 6"/></>,
  };
  return <svg {...common}>{icons[name]}</svg>;
}

function n(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function normalize(raw: unknown): Intent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const listing = (value.listing ?? {}) as Record<string, unknown>;
  const seller = (value.seller ?? {}) as Record<string, unknown>;
  return {
    id: String(value.id ?? ""), status: String(value.status ?? ""), quantity: n(value.quantity), unitPrice: n(value.unitPrice), totalAmount: n(value.totalAmount),
    expiresAt: String(value.expiresAt ?? ""), createdAt: String(value.createdAt ?? ""),
    listing: { id: String(listing.id ?? ""), slug: String(listing.slug ?? ""), title: String(listing.title ?? "Ürün"), imagePath: listing.imagePath ? String(listing.imagePath) : null },
    seller: { id: String(seller.id ?? ""), name: String(seller.name ?? "Satıcı"), slug: String(seller.slug ?? ""), verified: Boolean(seller.verified) },
  };
}
function money(value: number) { return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(value); }
function remaining(expiresAt: string, now: number) {
  const seconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  return { done: seconds <= 0, label: `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}` };
}

export default function CheckoutIntentExperience({ intentId }: { intentId: string }) {
  const router = useRouter();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data, error: rpcError } = await client.rpc("kk_get_purchase_intent", { p_intent_id: intentId });
      if (rpcError) throw rpcError;
      setIntent(normalize(data));
      setError("");
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Rezervasyon yüklenemedi."); }
    finally { setLoading(false); }
  }, [intentId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const countdown = useMemo(() => intent ? remaining(intent.expiresAt, now) : { done: true, label: "00:00" }, [intent, now]);
  const imageUrl = useMemo(() => intent?.listing.imagePath ? getSupabaseBrowserClient()?.storage.from("listing-assets").getPublicUrl(intent.listing.imagePath).data.publicUrl ?? "" : "", [intent?.listing.imagePath]);

  async function cancel() {
    if (!intent) return;
    setWorking(true); setError("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { error: rpcError } = await client.rpc("kk_cancel_purchase_intent", { p_intent_id: intent.id });
      if (rpcError) throw rpcError;
      router.push(`/urun/${intent.listing.slug}`);
    } catch (cancelError) { setError(cancelError instanceof Error ? cancelError.message : "Rezervasyon iptal edilemedi."); setWorking(false); }
  }

  if (loading) return <section className="checkoutLoadingV28"><span/><strong>Güvenli ödeme hazırlanıyor</strong><p>Stok rezervasyonun ve sipariş tutarın kontrol ediliyor.</p></section>;
  if (!intent) return <section className="checkoutEmptyV28"><Icon name="cancel"/><h2>Rezervasyon bulunamadı</h2><p>{error || "Rezervasyon süresi dolmuş olabilir."}</p><Link href="/">Ana sayfaya dön</Link></section>;

  const active = ["reserved", "checkout_started"].includes(intent.status) && !countdown.done;
  return <div className="checkoutV28">
    {error && <div className="checkoutErrorV28"><strong>İşlem tamamlanamadı</strong><span>{error}</span><button type="button" onClick={() => setError("")}>Kapat</button></div>}
    <div className="checkoutGridV28">
      <section className="checkoutMainV28">
        <header className="checkoutHeaderV28"><div><span>GÜVENLİ ÖDEME</span><h1>Ürün senin için ayrıldı</h1><p>Rezervasyon süresi boyunca başka bir kullanıcı bu stoğu satın alamaz.</p></div><div className={active ? "" : "expired"}><Icon name="clock"/><span>Kalan süre</span><strong>{active ? countdown.label : "Süre doldu"}</strong></div></header>
        <article className="checkoutProductV28">{imageUrl ? <img src={imageUrl} alt={intent.listing.title}/> : <div><Icon name="image"/></div>}<section><small>{intent.seller.name}{intent.seller.verified ? " · Doğrulanmış mağaza" : ""}</small><h2>{intent.listing.title}</h2><p>{intent.quantity} adet × {money(intent.unitPrice)}</p><Link href={`/urun/${intent.listing.slug}`}>İlana geri dön <Icon name="arrow"/></Link></section><strong>{money(intent.totalAmount)}</strong></article>
        <section className="checkoutStepsV28"><article className="done"><b><Icon name="check"/></b><div><strong>Stok ayrıldı</strong><span>Ürün 15 dakika boyunca senin adına rezerve edildi.</span></div></article><article className="active"><b>2</b><div><strong>Teslimat ve kart bilgileri</strong><span>Bir sonraki güncellemede adres seçimi ve iyzico ödeme oturumu bu alana bağlanacak.</span></div></article><article><b>3</b><div><strong>Satıcıya güvenli aktarım</strong><span>Ödeme, sipariş ve teslim koşullarına göre satıcı hesabına aktarılacak.</span></div></article></section>
        <div className="checkoutComingV28"><Icon name="card"/><div><strong>Ödeme altyapısı bağlantı noktası hazır</strong><p>Bu güncelleme stok rezervasyonu ve ödeme niyetini oluşturur. Karttan gerçek tahsilat henüz yapılmaz; iyzico ödeme oturumu Güncelleme 45’te bağlanacaktır.</p></div></div>
      </section>
      <aside className="checkoutSummaryV28"><span>SİPARİŞ ÖZETİ</span><dl><div><dt>Ürün toplamı</dt><dd>{money(intent.totalAmount)}</dd></div><div><dt>Kargo</dt><dd>Ödeme adımında</dd></div><div><dt>Hizmet bedeli</dt><dd>Ödeme adımında</dd></div><div className="total"><dt>Şimdilik ayrılan tutar</dt><dd>{money(intent.totalAmount)}</dd></div></dl><button type="button" className="primary" disabled>İyzico ödemesi Güncelleme 45’te</button>{active && <button type="button" className="cancel" onClick={() => void cancel()} disabled={working}>{working ? "İptal ediliyor…" : "Rezervasyonu iptal et"}</button>}<div className="checkoutTrustV28"><p><Icon name="lock"/><span><strong>Şifreli işlem</strong>Kart bilgileri KapışKapış sunucusunda tutulmaz.</span></p><p><Icon name="shield"/><span><strong>Alıcı koruması</strong>Sipariş durumu ödeme sonrası takip edilir.</span></p><p><Icon name="truck"/><span><strong>Takipli teslimat</strong>Kargo kodu siparişe bağlanır.</span></p></div></aside>
    </div>
  </div>;
}
