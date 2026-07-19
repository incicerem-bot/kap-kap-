"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchBidSecuritySummary, type BidSecuritySummary } from "@/lib/bid-security";

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);

export default function BidSecurityResultExperience({ initialStatus, initialMessage }: { initialStatus: string; initialMessage: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState(initialMessage);
  const [summary, setSummary] = useState<BidSecuritySummary | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      try {
        const result = await fetchBidSecuritySummary();
        if (!active) return;
        setSummary({ access: result.access, deposits: result.deposits });
        const newest = result.deposits[0];
        if (newest?.status === "held" || newest?.status === "refunded") {
          if (newest.bidFailureMessage) { setStatus("bid_failed"); setMessage(newest.bidFailureMessage); }
          else if (newest.bidPlacedAt) setStatus("success");
          else setStatus("processing");
        } else if (newest?.status === "failed") {
          setStatus("failed");
          setMessage(newest.failureMessage || "Güvence ödemesi doğrulanamadı.");
        }
        if (["processing", "awaiting"].includes(status) || (["held", "refunded"].includes(newest?.status ?? "") && !newest?.bidPlacedAt && !newest?.bidFailureMessage)) timer = setTimeout(check, 2200);
      } catch (reason) {
        if (!active) return;
        setMessage(reason instanceof Error ? reason.message : "Teklif güvencesi okunamadı.");
      }
    };
    void check();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [status]);

  const success = status === "success";
  const failed = status === "failed" || status === "bid_failed";
  const newest = summary?.deposits[0];
  const productLink = newest?.listingSlug ? `/urun/${newest.listingSlug}` : "/arama";

  return (
    <div className={`bidSecurityResultV18 ${success ? "success" : failed ? "failed" : "processing"}`}>
      <div className="bidSecurityResultIconV18">{success ? "✓" : failed ? "!" : <span/>}</div>
      <small>{success ? "GÜVENCE DOĞRULANDI" : failed ? "İŞLEM TAMAMLANAMADI" : "İYZİCO DOĞRULAMASI"}</small>
      <h1>{success ? "Güvencen doğrulandı ve teklifin verildi" : status === "bid_failed" ? "Güvence aktif, teklif yeniden gerekli" : failed ? "Güvence doğrulanamadı" : "Güvence ve teklif sonucu kontrol ediliyor"}</h1>
      <p>{success ? "Teklifin açık artırmaya kaydedildi. Kazanamazsan veya aktif riskin kalmazsa güvence tutarını iade edebilirsin." : status === "bid_failed" ? (message || "Ödeme sırasında fiyat değiştiği için teklif otomatik verilemedi. Güvencen hesabında aktif; ürün sayfasından güncel tutarla tekrar teklif verebilirsin.") : failed ? (message || "Kartından başarılı işlem doğrulanamadı.") : "Callback ve webhook sonuçları karşılaştırılıyor. Bu ekran otomatik güncellenecek."}</p>
      {summary && <div className="bidSecurityResultMetricsV18"><article><span>Aktif güvence</span><b>{money(summary.access.heldSecurity)}</b></article><article><span>Aktif risk</span><b>{money(summary.access.securityRequired)}</b></article><article><span>İade edilebilir</span><b>{money(summary.access.refundableSecurity)}</b></article></div>}
      <div className="bidSecurityResultActionsV18"><Link href={productLink}>{success || status === "bid_failed" ? "Ürün sayfasına dön" : "Açık artırmaları keşfet"}</Link><Link href="/teklif-guvencesi" className="secondary">Güvence merkezine dön</Link></div>
    </div>
  );
}
