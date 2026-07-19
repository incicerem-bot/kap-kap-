"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  fetchBidSecuritySummary,
  initializeSmartBidGuarantee,
  quoteBidSecurity,
  refundBidSecurityDeposit,
  type BidSecurityQuote,
  type BidSecuritySummary,
} from "@/lib/bid-security";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.startsWith("90")) return `+${digits}`;
  return digits;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    initializing: "Hazırlanıyor",
    pending: "Ödeme bekleniyor",
    awaiting_webhook: "Doğrulanıyor",
    held: "Aktif güvence",
    failed: "Başarısız",
    refund_requested: "İade işleniyor",
    refunded: "İade edildi",
  };
  return labels[status] ?? status;
}

export default function BidSecurityCenterExperience({
  listingSlug,
  bidAmount,
  maxAmount,
  returnPath,
}: {
  listingSlug?: string;
  bidAmount?: number;
  maxAmount?: number | null;
  returnPath?: string;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState<BidSecuritySummary | null>(null);
  const [quote, setQuote] = useState<BidSecurityQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refunding, setRefunding] = useState("");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ name: "", surname: "", identityNumber: "", gsmNumber: "", email: "", address: "", city: "İzmir", zipCode: "" });

  const hasBidContext = Boolean(listingSlug && bidAmount && bidAmount > 0);
  const effectiveMax = maxAmount && maxAmount >= (bidAmount ?? 0) ? maxAmount : bidAmount ?? 0;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const client = getSupabaseBrowserClient();
      const userResult = await client?.auth.getUser();
      const user = userResult?.data.user;
      if (!user) {
        const current = hasBidContext
          ? `/teklif-guvencesi?listing=${encodeURIComponent(listingSlug!)}&bid=${bidAmount}&max=${effectiveMax}&return=${encodeURIComponent(returnPath || `/urun/${listingSlug}`)}`
          : "/teklif-guvencesi";
        router.replace(`/giris?redirect=${encodeURIComponent(current)}`);
        return;
      }
      const fullName = String(user.user_metadata?.full_name ?? "").trim().split(/\s+/);
      setForm((old) => ({ ...old, name: old.name || fullName[0] || "", surname: old.surname || fullName.slice(1).join(" "), email: old.email || user.email || "" }));

      const [summaryResult, quoteResult] = await Promise.all([
        fetchBidSecuritySummary(),
        hasBidContext ? quoteBidSecurity(listingSlug!, bidAmount!, effectiveMax) : Promise.resolve(null),
      ]);
      setSummary({ access: summaryResult.access, deposits: summaryResult.deposits });
      setQuote(quoteResult?.quote ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Teklif güvencesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [listingSlug, bidAmount, effectiveMax]);

  const coverage = useMemo(() => {
    if (!summary?.access.heldSecurity) return 0;
    return Math.min(100, Math.round((summary.access.securityRequired / summary.access.heldSecurity) * 100));
  }, [summary]);

  function change(name: keyof typeof form, value: string) {
    setForm((old) => ({ ...old, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !quote || !listingSlug || !bidAmount) return;
    setError("");
    if (!accepted) {
      setError("Akıllı Teklif Güvencesi ve iade koşullarını kabul etmelisin.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await initializeSmartBidGuarantee({ listingSlug, bidAmount, maxAmount: effectiveMax, buyer: form });
      if (!result.paymentPageUrl) throw new Error("iyzico ödeme sayfası adresi alınamadı.");
      window.location.assign(result.paymentPageUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Teklif güvencesi başlatılamadı.");
      setSubmitting(false);
    }
  }

  async function refund(id: string) {
    if (refunding) return;
    setError("");
    setRefunding(id);
    try {
      await refundBidSecurityDeposit(id);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Güvence iadesi tamamlanamadı.");
    } finally {
      setRefunding("");
    }
  }

  if (loading) return <div className="bidSecurityLoadingV18"><span/><h2>Akıllı teklif güvencesi hazırlanıyor</h2><p>Teklifin ve aktif açık artırma risklerin kontrol ediliyor.</p></div>;

  return (
    <div className="bidSecurityCenterV18">
      {error && <div className="bidSecurityAlertV18" role="alert">{error}</div>}

      <section className="bidSecurityMetricsV18">
        <article className={summary?.access.cardVerified ? "verified" : ""}><span>KART DOĞRULAMASI</span><strong>{summary?.access.cardVerified ? "Doğrulandı" : "Gerekli"}</strong><small>Kart bilgisi KapışKapış'ta tutulmaz</small></article>
        <article><span>AKTİF GÜVENCE</span><strong>{money(summary?.access.heldSecurity ?? 0)}</strong><small>iyzico ile doğrulanmış tutar</small></article>
        <article><span>AKTİF RİSK İÇİN GEREKEN</span><strong>{money(summary?.access.securityRequired ?? 0)}</strong><small>Lider teklifler ve ödenmemiş kazanımlar</small></article>
        <article><span>İADE EDİLEBİLİR</span><strong>{money(summary?.access.refundableSecurity ?? 0)}</strong><small>Aktif risk dışında kalan güvence</small></article>
      </section>

      <section className="bidSecurityUsageV18">
        <div><span>Aktif güvencenin kullanım oranı</span><strong>%{coverage}</strong></div>
        <div className="bidSecurityProgressV18"><i style={{ width: `${coverage}%` }}/></div>
        <p>{money(summary?.access.securityRequired ?? 0)} aktif risk için ayrıldı · {money(summary?.access.refundableSecurity ?? 0)} iade edilebilir.</p>
      </section>

      {quote ? (
        <div className="bidSecurityLayoutV18">
          <form className="bidSecurityFormV18" onSubmit={submit}>
            <header><small>BU TEKLİFE ÖZEL</small><h2>{quote.listingTitle}</h2><p>{money(quote.riskAmount)} seviyesindeki teklifin için güvence otomatik hesaplandı. Önceden bir limit seçmiyorsun; yalnızca eksik tutar doğrulanıyor.</p></header>

            <div className="smartGuaranteeBreakdownV18">
              <div><span>Teklif / otomatik üst sınır</span><b>{money(quote.riskAmount)}</b></div>
              <div><span>Bu teklifin güvence ihtiyacı</span><b>{money(quote.securityForBid)}</b></div>
              <div><span>Mevcut aktif güvencen</span><b>{money(quote.heldSecurity)}</b></div>
              <div className="total"><span>iyzico ile doğrulanacak fark</span><b>{money(quote.chargeAmount)}</b></div>
            </div>

            {quote.cardVerificationRequired && quote.securityForBid === 0 && (
              <div className="bidSecurityInfoV18"><b>Yalnızca kart doğrulaması</b><p>Bu teklif 5.000 TL altında olduğu için yüzdesel güvence alınmaz. Kartının gerçek olduğunu doğrulamak için küçük bir işlem yapılır; teklif kaydedildikten sonra otomatik iade başlatılır.</p></div>
            )}

            <div className="bidSecurityFieldsV18">
              <label><span>Ad</span><input value={form.name} onChange={(event) => change("name", event.target.value)} required/></label>
              <label><span>Soyad</span><input value={form.surname} onChange={(event) => change("surname", event.target.value)} required/></label>
              <label><span>T.C. kimlik numarası</span><input value={form.identityNumber} onChange={(event) => change("identityNumber", event.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" minLength={11} maxLength={11} required/></label>
              <label><span>Telefon</span><input value={form.gsmNumber} onChange={(event) => change("gsmNumber", normalizePhone(event.target.value))} inputMode="tel" placeholder="05xx xxx xx xx" required/></label>
              <label className="wide"><span>E-posta</span><input type="email" value={form.email} onChange={(event) => change("email", event.target.value)} required/></label>
              <label className="wide"><span>Fatura adresi</span><textarea rows={3} value={form.address} onChange={(event) => change("address", event.target.value)} required/></label>
              <label><span>Şehir</span><input value={form.city} onChange={(event) => change("city", event.target.value)} required/></label>
              <label><span>Posta kodu</span><input value={form.zipCode} onChange={(event) => change("zipCode", event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric"/></label>
            </div>

            <label className="bidSecurityConsentV18"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)}/><span><Link href="/hukuk?doc=guvenli-odeme" target="_blank">Güvenli Ödeme Koşulları</Link> ile güvencenin aktif lider teklif veya ödenmemiş kazanım varken iade edilemeyeceğini okudum.</span></label>
            <button className="bidSecuritySubmitV18" type="submit" disabled={submitting || !quote.requiresPayment}>{submitting ? "iyzico’ya bağlanıyor…" : `${money(quote.chargeAmount)} güvenceyi doğrula ve teklif ver`}</button>
            <p className="bidSecuritySafeV18">3D Secure · Yalnızca gereken fark · Doğrulama sonrası teklif otomatik gönderilir</p>
          </form>

          <aside className="bidSecurityAsideV18">
            <section><small>AKILLI MODEL</small><ol><li><b>Teklifini gir</b><span>Sistem üst sınırına göre riski hesaplar.</span></li><li><b>Yalnızca farkı doğrula</b><span>Mevcut güvencen tekrar kullanılabilir.</span></li><li><b>Teklif otomatik verilir</b><span>iyzico sonucu doğrulanınca teklif gönderilir.</span></li><li><b>Risk bitince iade et</b><span>Liderlik ve ödenmemiş kazanım kalmadığında güvence serbestleşir.</span></li></ol></section>
            <section className="notice"><b>Güvence oranları</b><p>5.000 TL'ye kadar kart doğrulaması; 5.001–20.000 TL için 500 TL; 20.001–50.000 TL için %5; üzerindeki tekliflerde %10 güvence uygulanır.</p></section>
            <Link className="bidSecurityReturnV18" href={returnPath || `/urun/${listingSlug}`}>Ürün sayfasına dön</Link>
          </aside>
        </div>
      ) : (
        <section className="bidSecurityOverviewV18">
          <div><small>ÖNCEDEN LİMİT YÜKLEME YOK</small><h2>Güvence teklif verirken otomatik hesaplanır</h2><p>Açık artırmada teklifini girmen yeterli. Düşük tutarlarda yalnız kart doğrulaması yapılır; yüksek tutarlarda risk oranına göre küçük bir güvence istenir.</p><Link href="/arama">Açık artırmaları keşfet</Link></div>
          <div className="smartGuaranteeRulesV18"><article><b>0–5.000 TL</b><span>Kart doğrulaması</span></article><article><b>5.001–20.000 TL</b><span>500 TL güvence</span></article><article><b>20.001–50.000 TL</b><span>%5 güvence</span></article><article><b>50.001 TL üzeri</b><span>%10 güvence</span></article></div>
        </section>
      )}

      <section className="bidSecurityHistoryV18">
        <header><div><small>GÜVENCE HAREKETLERİ</small><h2>Doğrulama, teklif ve iade geçmişi</h2></div><button type="button" onClick={() => void load()}>Yenile</button></header>
        {summary?.deposits.length ? <div className="bidSecurityTableV18">
          {summary.deposits.map((deposit) => (
            <article key={deposit.id}>
              <div><b>{money(deposit.amount)}</b><small>{new Date(deposit.createdAt).toLocaleString("tr-TR")}</small></div>
              <span className={`status ${deposit.status}`}>{statusLabel(deposit.status)}</span>
              <p>{deposit.bidFailureMessage || deposit.failureMessage || (deposit.bidPlacedAt ? `${deposit.listingTitle || "Açık artırma"} teklifin kaydedildi.` : deposit.status === "held" ? "Aktif teklif güvencesi" : deposit.status === "refunded" ? "Kartına iade süreci başlatıldı" : "iyzico işlemi")}</p>
              {deposit.status === "held" && deposit.amount <= (summary?.access.refundableSecurity ?? 0) + 0.001 && <button type="button" disabled={refunding === deposit.id} onClick={() => void refund(deposit.id)}>{refunding === deposit.id ? "İade ediliyor…" : "Güvenceyi iade et"}</button>}
            </article>
          ))}
        </div> : <div className="bidSecurityEmptyV18"><b>Henüz teklif güvencesi hareketin yok</b><p>Güvence gereken ilk teklifinde işlemler burada görünecek.</p></div>}
      </section>
    </div>
  );
}
