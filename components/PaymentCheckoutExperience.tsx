"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { initializeIyzicoPayment } from "@/lib/payments";
import { loadBuyerOrders, type BuyerOrder } from "@/lib/reviews";

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value);
const buyerFeeRate = Number(process.env.NEXT_PUBLIC_KAPISKAPIS_BUYER_FEE_RATE ?? 0.025);

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return digits;
  return digits;
}

export default function PaymentCheckoutExperience({ orderNo }: { orderNo: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<BuyerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    identityNumber: "",
    gsmNumber: "",
    email: "",
    address: "",
    city: "İzmir",
    zipCode: "",
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      loadBuyerOrders(),
      getSupabaseBrowserClient()?.auth.getUser() ?? Promise.resolve({ data: { user: null }, error: null }),
    ]).then(([result, userResult]) => {
      if (!active) return;
      if (result.status === "signed-out") {
        router.replace(`/giris?redirect=${encodeURIComponent(`/odeme?order=${orderNo}`)}`);
        return;
      }
      if (result.status !== "ready") {
        setError(result.status === "error" ? result.message : "Sipariş bilgisi yüklenemedi.");
        setLoading(false);
        return;
      }
      const selected = result.data.find((item) => item.orderNo === orderNo) ?? null;
      if (!selected) {
        setError("Ödeme yapılacak sipariş bulunamadı.");
        setLoading(false);
        return;
      }
      if (selected.state !== "payment") {
        router.replace(`/odeme-sonucu?order=${encodeURIComponent(orderNo)}&status=success`);
        return;
      }
      setOrder(selected);
      const user = userResult.data.user;
      const fullName = String(user?.user_metadata?.full_name ?? "").trim().split(/\s+/);
      setForm((old) => ({
        ...old,
        name: fullName[0] ?? "",
        surname: fullName.slice(1).join(" "),
        email: user?.email ?? "",
      }));
      setLoading(false);
    }).catch((reason) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : "Sipariş bilgisi yüklenemedi.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [orderNo, router]);

  const fee = useMemo(() => order ? Math.round(order.amount * buyerFeeRate * 100) / 100 : 0, [order]);
  const total = order ? order.amount + fee : 0;

  function change(name: keyof typeof form, value: string) {
    setForm((old) => ({ ...old, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!order || submitting) return;
    setError("");
    if (!accepted) {
      setError("Ön bilgilendirme ve mesafeli satış koşullarını kabul etmelisin.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await initializeIyzicoPayment(order.orderNo, form);
      const target = result.paymentPageUrl || result.redirectUrl;
      if (!target) throw new Error("iyzico ödeme sayfası adresi alınamadı.");
      window.location.assign(target);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ödeme başlatılamadı.");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="paymentStateV16"><span className="paymentSpinnerV16"/><h2>Güvenli ödeme hazırlanıyor</h2><p>Sipariş sahipliği ve oturum bilgisi kontrol ediliyor.</p></div>;
  if (!order) return <div className="paymentStateV16 paymentStateErrorV16"><strong>!</strong><h2>Ödeme açılamadı</h2><p>{error}</p><Link href="/siparisler">Siparişlerime dön</Link></div>;

  return (
    <div className="paymentCheckoutV16">
      <form className="paymentFormV16" onSubmit={submit}>
        <header>
          <span>1</span>
          <div><small>FATURA VE TESLİMAT</small><h2>Alıcı bilgilerini doğrula</h2><p>Kart bilgilerin KapışKapış’a değil, iyzico’nun güvenli ödeme ekranına girilecek.</p></div>
        </header>

        {error && <div className="paymentAlertV16" role="alert">{error}</div>}

        <div className="paymentFieldGridV16">
          <label><span>Ad</span><input value={form.name} onChange={(event) => change("name", event.target.value)} autoComplete="given-name" required /></label>
          <label><span>Soyad</span><input value={form.surname} onChange={(event) => change("surname", event.target.value)} autoComplete="family-name" required /></label>
          <label><span>T.C. kimlik numarası</span><input value={form.identityNumber} onChange={(event) => change("identityNumber", event.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" autoComplete="off" minLength={11} maxLength={11} required /></label>
          <label><span>Telefon</span><input value={form.gsmNumber} onChange={(event) => change("gsmNumber", normalizePhone(event.target.value))} inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" required /></label>
          <label className="wide"><span>E-posta</span><input type="email" value={form.email} onChange={(event) => change("email", event.target.value)} autoComplete="email" required /></label>
          <label className="wide"><span>Açık adres</span><textarea value={form.address} onChange={(event) => change("address", event.target.value)} autoComplete="street-address" rows={3} required /></label>
          <label><span>Şehir</span><input value={form.city} onChange={(event) => change("city", event.target.value)} autoComplete="address-level1" required /></label>
          <label><span>Posta kodu</span><input value={form.zipCode} onChange={(event) => change("zipCode", event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" autoComplete="postal-code" /></label>
        </div>

        <label className="paymentConsentV16">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          <span><Link href="/hukuk?doc=mesafeli-satis" target="_blank">Ön Bilgilendirme ve Mesafeli Satış Koşulları</Link> ile <Link href="/hukuk?doc=guvenli-odeme" target="_blank">Güvenli Ödeme Koşulları</Link>nı okudum ve kabul ediyorum.</span>
        </label>

        <button className="paymentContinueV16" type="submit" disabled={submitting}>
          {submitting ? <><span className="paymentButtonSpinnerV16"/> iyzico’ya bağlanıyor</> : `iyzico ile ${money(total)} öde`}
        </button>
        <p className="paymentSecurityNoteV16">3D Secure · Kart bilgisi KapışKapış sunucularına gelmez · Tutar teslimata kadar koruma altında</p>
      </form>

      <aside className="paymentSummaryV16">
        <div className="paymentOrderProductV16"><img src={order.image} alt={order.title}/><div><small>SİPARİŞ #{order.orderNo}</small><h3>{order.title}</h3><p>{order.seller}</p></div></div>
        <div className="paymentPriceRowsV16"><p><span>Ürün bedeli</span><strong>{money(order.amount)}</strong></p><p><span>Alıcı koruma hizmeti</span><strong>{money(fee)}</strong></p><p className="total"><span>Toplam</span><strong>{money(total)}</strong></p></div>
        <section className="paymentProtectionV16"><b>KapışKapış Güvenli Ödeme</b><p>Ödeme başarılı olduğunda tutar satıcıya hemen aktarılmaz. Teslimat onayı veya uyuşmazlık sonucu beklenir.</p><ul><li>3D Secure ödeme</li><li>Webhook ve tutar doğrulaması</li><li>Teslimat sonrası satıcı aktarımı</li></ul></section>
        <Link className="paymentBackV16" href="/siparisler">← Siparişe geri dön</Link>
      </aside>
    </div>
  );
}
