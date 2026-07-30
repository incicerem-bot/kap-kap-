"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Address = {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  addressLine: string;
  postalCode: string;
  isDefault: boolean;
};

type Checkout = {
  id: string;
  status: string;
  quantity: number;
  unitPrice: number;
  productAmount: number;
  platformCommission: number;
  sellerPayoutAmount: number;
  payableAmount: number;
  expiresAt: string;
  listing: { id: string; slug: string; title: string; imagePath: string | null; shippingMethod: string; shippingPayer: string };
  seller: { id: string; name: string; slug: string; verified: boolean };
  addresses: Address[];
};

type AddressForm = Omit<Address, "id" | "isDefault">;
const emptyAddress: AddressForm = { title: "Evim", fullName: "", phone: "", city: "", district: "", neighborhood: "", addressLine: "", postalCode: "" };

type IconName = "lock" | "clock" | "shield" | "truck" | "card" | "check" | "arrow" | "cancel" | "image" | "pin" | "user";
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
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  };
  return <svg {...common}>{icons[name]}</svg>;
}

function number(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function string(value: unknown) { return value == null ? "" : String(value); }
function normalizeAddress(raw: unknown): Address {
  const value = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return { id: string(value.id), title: string(value.title), fullName: string(value.fullName), phone: string(value.phone), city: string(value.city), district: string(value.district), neighborhood: string(value.neighborhood), addressLine: string(value.addressLine), postalCode: string(value.postalCode), isDefault: Boolean(value.isDefault) };
}
function normalize(raw: unknown): Checkout | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const listing = (value.listing ?? {}) as Record<string, unknown>;
  const seller = (value.seller ?? {}) as Record<string, unknown>;
  return {
    id: string(value.id), status: string(value.status), quantity: number(value.quantity), unitPrice: number(value.unitPrice), productAmount: number(value.productAmount), platformCommission: number(value.platformCommission), sellerPayoutAmount: number(value.sellerPayoutAmount), payableAmount: number(value.payableAmount), expiresAt: string(value.expiresAt),
    listing: { id: string(listing.id), slug: string(listing.slug), title: string(listing.title || "Ürün"), imagePath: listing.imagePath ? string(listing.imagePath) : null, shippingMethod: string(listing.shippingMethod), shippingPayer: string(listing.shippingPayer) },
    seller: { id: string(seller.id), name: string(seller.name || "Satıcı"), slug: string(seller.slug), verified: Boolean(seller.verified) },
    addresses: Array.isArray(value.addresses) ? value.addresses.map(normalizeAddress) : [],
  };
}
function money(value: number) { return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(value); }
function remaining(expiresAt: string, now: number) {
  const seconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  return { done: seconds <= 0, label: `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}` };
}

export default function CheckoutIntentExperience({ intentId }: { intentId: string }) {
  const router = useRouter();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [identityNumber, setIdentityNumber] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data, error: rpcError } = await client.rpc("kk_get_checkout_context", { p_intent_id: intentId });
      if (rpcError) throw rpcError;
      const next = normalize(data);
      if (!next) throw new Error("Ödeme rezervasyonu bulunamadı.");
      setCheckout(next);
      const preferred = next.addresses.find((item) => item.isDefault) ?? next.addresses[0];
      if (preferred) setSelectedAddressId((current) => current || preferred.id);
      else setEditingAddress(true);
      setError("");
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Ödeme bilgileri yüklenemedi."); }
    finally { setLoading(false); }
  }, [intentId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const countdown = useMemo(() => checkout ? remaining(checkout.expiresAt, now) : { done: true, label: "00:00" }, [checkout, now]);
  const imageUrl = useMemo(() => checkout?.listing.imagePath ? getSupabaseBrowserClient()?.storage.from("listing-assets").getPublicUrl(checkout.listing.imagePath).data.publicUrl ?? "" : "", [checkout?.listing.imagePath]);
  const active = Boolean(checkout && ["reserved", "checkout_started"].includes(checkout.status) && !countdown.done);

  function setField<K extends keyof AddressForm>(key: K, value: AddressForm[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function saveAddress(event: FormEvent) {
    event.preventDefault();
    setWorking(true); setError("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data, error: rpcError } = await client.rpc("kk_save_checkout_address", {
        p_address_id: null,
        p_title: form.title,
        p_full_name: form.fullName,
        p_phone: form.phone,
        p_city: form.city,
        p_district: form.district,
        p_neighborhood: form.neighborhood,
        p_address_line: form.addressLine,
        p_postal_code: form.postalCode,
        p_is_default: true,
      });
      if (rpcError) throw rpcError;
      const saved = normalizeAddress(data);
      setSelectedAddressId(saved.id);
      setEditingAddress(false);
      setForm(emptyAddress);
      await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Adres kaydedilemedi."); }
    finally { setWorking(false); }
  }

  async function startPayment() {
    if (!checkout || !active) return;
    if (!selectedAddressId) { setError("Teslimat adresi seçmelisin."); return; }
    const identity = identityNumber.replace(/\D/g, "");
    if (identity.length !== 11) { setError("iyzico doğrulaması için 11 haneli T.C. kimlik numaranı yaz."); return; }
    setWorking(true); setError("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error("Oturumun sona ermiş. Yeniden giriş yap.");
      const response = await fetch("/api/payments/iyzico/checkout-form", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ intentId: checkout.id, addressId: selectedAddressId, identityNumber: identity }),
      });
      const result = await response.json() as { paymentPageUrl?: string; error?: string };
      if (!response.ok || !result.paymentPageUrl) throw new Error(result.error || "iyzico ödeme sayfası açılamadı.");
      window.location.assign(result.paymentPageUrl);
    } catch (paymentError) { setError(paymentError instanceof Error ? paymentError.message : "Ödeme başlatılamadı."); setWorking(false); }
  }

  async function cancel() {
    if (!checkout) return;
    setWorking(true); setError("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { error: rpcError } = await client.rpc("kk_cancel_purchase_intent", { p_intent_id: checkout.id });
      if (rpcError) throw rpcError;
      router.push(`/urun/${checkout.listing.slug}`);
    } catch (cancelError) { setError(cancelError instanceof Error ? cancelError.message : "Rezervasyon iptal edilemedi."); setWorking(false); }
  }

  if (loading) return <section className="checkoutLoadingV28"><span/><strong>Güvenli ödeme hazırlanıyor</strong><p>Stok, teslimat ve sipariş tutarın kontrol ediliyor.</p></section>;
  if (!checkout) return <section className="checkoutEmptyV28"><Icon name="cancel"/><h2>Rezervasyon bulunamadı</h2><p>{error || "Rezervasyon süresi dolmuş olabilir."}</p><Link href="/">Ana sayfaya dön</Link></section>;

  return <div className="checkoutV29">
    {error && <div className="checkoutErrorV28"><strong>İşlem tamamlanamadı</strong><span>{error}</span><button type="button" onClick={() => setError("")}>Kapat</button></div>}
    <div className="checkoutGridV29">
      <section className="checkoutMainV29">
        <header className="checkoutHeaderV29"><div><span>GÜVENLİ ÖDEME</span><h1>Siparişini tamamla</h1><p>Kart bilgilerin KapışKapış’a gelmeden iyzico güvenli ödeme sayfasında işlenir.</p></div><div className={active ? "" : "expired"}><Icon name="clock"/><span>Kalan süre</span><strong>{active ? countdown.label : "Süre doldu"}</strong></div></header>
        <article className="checkoutProductV29">{imageUrl ? <img src={imageUrl} alt={checkout.listing.title}/> : <div><Icon name="image"/></div>}<section><small>{checkout.seller.name}{checkout.seller.verified ? " · Doğrulanmış mağaza" : ""}</small><h2>{checkout.listing.title}</h2><p>{checkout.quantity} adet × {money(checkout.unitPrice)}</p><Link href={`/urun/${checkout.listing.slug}`}>İlana geri dön <Icon name="arrow"/></Link></section><strong>{money(checkout.productAmount)}</strong></article>

        <section className="checkoutAddressV29">
          <header><div><span>1. TESLİMAT ADRESİ</span><h2>Ürün nereye gönderilecek?</h2></div>{checkout.addresses.length > 0 && <button type="button" onClick={() => setEditingAddress((value) => !value)}>{editingAddress ? "Adreslere dön" : "+ Yeni adres"}</button>}</header>
          {!editingAddress && checkout.addresses.length > 0 ? <div className="checkoutAddressListV29">{checkout.addresses.map((address) => <label className={selectedAddressId === address.id ? "selected" : ""} key={address.id}><input type="radio" name="address" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)}/><span><b><Icon name="pin"/>{address.title}{address.isDefault && <em>Varsayılan</em>}</b><strong>{address.fullName} · {address.phone}</strong><small>{address.neighborhood ? `${address.neighborhood}, ` : ""}{address.addressLine}, {address.district}/{address.city}</small></span></label>)}</div> : <form className="checkoutAddressFormV29" onSubmit={saveAddress}>
            <div className="wide"><label>Adres başlığı<input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Evim, İşim" required/></label></div>
            <label>Ad soyad<input value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} autoComplete="name" required/></label>
            <label>Telefon<input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="05xx xxx xx xx" inputMode="tel" autoComplete="tel" required/></label>
            <label>İl<input value={form.city} onChange={(e) => setField("city", e.target.value)} autoComplete="address-level1" required/></label>
            <label>İlçe<input value={form.district} onChange={(e) => setField("district", e.target.value)} autoComplete="address-level2" required/></label>
            <label>Mahalle<input value={form.neighborhood} onChange={(e) => setField("neighborhood", e.target.value)} /></label>
            <label>Posta kodu<input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} inputMode="numeric" autoComplete="postal-code" /></label>
            <div className="wide"><label>Açık adres<textarea value={form.addressLine} onChange={(e) => setField("addressLine", e.target.value)} rows={3} placeholder="Sokak, bina ve daire numarası" autoComplete="street-address" required/></label></div>
            <div className="wide actions"><button type="submit" disabled={working}>{working ? "Kaydediliyor…" : "Adresi kaydet ve seç"}</button></div>
          </form>}
        </section>

        <section className="checkoutIdentityV29"><div><Icon name="user"/><span><strong>Ödeme doğrulama bilgisi</strong><small>T.C. kimlik numaran yalnız iyzico ödeme isteğine gönderilir; KapışKapış veritabanına kaydedilmez.</small></span></div><label>T.C. kimlik numarası<input value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" autoComplete="off" placeholder="11 hane"/></label></section>

        <section className="checkoutStepsV29"><article className="done"><b><Icon name="check"/></b><div><strong>Stok ayrıldı</strong><span>Ürün ödeme süresi boyunca senin adına rezerve edildi.</span></div></article><article className="active"><b>2</b><div><strong>iyzico güvenli ödeme</strong><span>Butona bastığında kart bilgilerini gireceğin iyzico sayfası açılır.</span></div></article><article><b>3</b><div><strong>Sipariş ve satıcı aktarımı</strong><span>Başarılı ödeme siparişe dönüşür ve satıcı ödeme kırılımı kaydedilir.</span></div></article></section>
      </section>

      <aside className="checkoutSummaryV29"><span>SİPARİŞ ÖZETİ</span><dl><div><dt>Ürün toplamı</dt><dd>{money(checkout.productAmount)}</dd></div><div><dt>Kargo</dt><dd>{checkout.listing.shippingPayer === "seller" ? "Satıcı öder" : "Ürün tutarına dahil değil"}</dd></div><div><dt>KapışKapış güvencesi</dt><dd>Ürün tutarından karşılanır</dd></div><div className="total"><dt>Ödenecek tutar</dt><dd>{money(checkout.payableAmount)}</dd></div></dl><button type="button" className="primary" onClick={() => void startPayment()} disabled={!active || working || !selectedAddressId}>{working ? "iyzico hazırlanıyor…" : "iyzico ile güvenli öde"}</button>{active && <button type="button" className="cancel" onClick={() => void cancel()} disabled={working}>Rezervasyonu iptal et</button>}<div className="checkoutTrustV29"><p><Icon name="lock"/><span><strong>Kart verisi tutulmaz</strong>Ödeme formu iyzico tarafından sunulur.</span></p><p><Icon name="shield"/><span><strong>Tutar kontrolü</strong>Dönen ödeme tutarı siparişle eşleştirilir.</span></p><p><Icon name="truck"/><span><strong>Sipariş kaydı</strong>Başarılı ödeme sonrası teslimat süreci başlar.</span></p></div></aside>
    </div>
  </div>;
}
