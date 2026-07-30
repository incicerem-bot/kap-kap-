"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Result = { status: string; amount: number; errorMessage: string; orderNo: string; orderStatus: string; listingSlug: string; listingTitle: string };

export default function PaymentResultExperience({ sessionId, callbackError }: { sessionId: string; callbackError: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState(callbackError);
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    const client = getSupabaseBrowserClient();
    if (!client) { setError("Supabase bağlantısı bulunamadı."); setLoading(false); return; }
    void client.rpc("kk_get_payment_result", { p_session_id: sessionId }).then(({ data, error: rpcError }) => {
      if (rpcError) setError(rpcError.message);
      else if (data && typeof data === "object") {
        const raw = data as Record<string, unknown>;
        setResult({ status: String(raw.status || ""), amount: Number(raw.amount || 0), errorMessage: String(raw.errorMessage || ""), orderNo: String(raw.orderNo || ""), orderStatus: String(raw.orderStatus || ""), listingSlug: String(raw.listingSlug || ""), listingTitle: String(raw.listingTitle || "Ürün") });
      }
      setLoading(false);
    });
  }, [sessionId]);

  if (loading) return <section className="paymentResultV29 loading"><i/><h1>Ödeme sonucu doğrulanıyor</h1><p>iyzico yanıtı sipariş tutarıyla eşleştiriliyor.</p></section>;
  const successful = result?.status === "paid";
  const review = result?.status === "under_review";
  const message = error || result?.errorMessage || "Ödeme tamamlanamadı.";

  return <section className={`paymentResultV29 ${successful ? "success" : review ? "review" : "failed"}`}>
    <div className="paymentResultMarkV29">{successful ? "✓" : review ? "…" : "×"}</div>
    <span>{successful ? "ÖDEME BAŞARILI" : review ? "GÜVENLİK İNCELEMESİNDE" : "ÖDEME TAMAMLANAMADI"}</span>
    <h1>{successful ? "Siparişin oluşturuldu" : review ? "Ödemen kontrol ediliyor" : "Tekrar deneyebilirsin"}</h1>
    <p>{successful ? `${result?.listingTitle} için ödeme alındı. Satıcı hazırlık süreci başlatıldı.` : review ? "Ödeme alındı ancak ürün kargoya verilmeden önce iyzico güvenlik sonucu beklenecek." : message}</p>
    {(successful || review) && <dl><div><dt>Sipariş no</dt><dd>{result?.orderNo || "Hazırlanıyor"}</dd></div><div><dt>Tutar</dt><dd>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(result?.amount || 0)}</dd></div><div><dt>Durum</dt><dd>{successful ? "Hazırlanıyor" : "Ödeme incelemesi"}</dd></div></dl>}
    <div className="paymentResultActionsV29">{result?.listingSlug && <Link href={`/urun/${result.listingSlug}`}>Ürün sayfası</Link>}<Link href="/">Ana sayfaya dön</Link></div>
  </section>;
}
