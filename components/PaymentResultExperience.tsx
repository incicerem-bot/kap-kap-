"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchIyzicoPaymentStatus } from "@/lib/payments";

type ResultState = "checking" | "success" | "processing" | "failed";

export default function PaymentResultExperience({ orderNo, initialStatus, initialMessage }: { orderNo: string; initialStatus: string; initialMessage?: string }) {
  const [state, setState] = useState<ResultState>(initialStatus === "success" ? "success" : initialStatus === "failed" ? "failed" : "checking");
  const [message, setMessage] = useState(initialMessage ?? "Ödeme kaydı kontrol ediliyor.");

  useEffect(() => {
    if (!orderNo || orderNo === "unknown" || state === "success") return;
    let active = true;
    let tries = 0;
    const check = async () => {
      tries += 1;
      try {
        const result = await fetchIyzicoPaymentStatus(orderNo);
        if (!active) return;
        if (result.order.paymentStatus === "paid") {
          setState("success");
          setMessage("Ödemen doğrulandı ve sipariş satıcının hazırlık ekranına geçti.");
          return;
        }
        if (result.attempt?.status === "failed" || result.order.paymentStatus === "failed") {
          setState("failed");
          setMessage(result.attempt?.failure_message || "Ödeme doğrulanamadı.");
          return;
        }
        setState("processing");
        setMessage("iyzico bildirimi bekleniyor. Bu ekran otomatik olarak güncellenecek.");
        if (tries < 15) window.setTimeout(check, 2000);
      } catch (reason) {
        if (!active) return;
        setState("failed");
        setMessage(reason instanceof Error ? reason.message : "Ödeme durumu okunamadı.");
      }
    };
    void check();
    return () => { active = false; };
  }, [orderNo, state]);

  return (
    <section className={`paymentResultV16 ${state}`}>
      <div className="paymentResultIconV16">{state === "success" ? "✓" : state === "failed" ? "!" : <span className="paymentSpinnerV16"/>}</div>
      <small>SİPARİŞ #{orderNo}</small>
      <h1>{state === "success" ? "Ödeme başarıyla tamamlandı" : state === "failed" ? "Ödeme tamamlanamadı" : "Ödeme doğrulanıyor"}</h1>
      <p>{message}</p>
      {state === "success" && <div className="paymentResultProtectionV16"><strong>Tutar güvenli ödeme havuzunda</strong><span>Ürün teslim edilip onaylanana kadar satıcıya aktarılmaz.</span></div>}
      <div className="paymentResultActionsV16"><Link href="/siparisler">Siparişlerime git</Link>{state === "failed" && <Link href={`/odeme?order=${encodeURIComponent(orderNo)}`} className="secondary">Ödemeyi tekrar dene</Link>}<Link href="/" className="ghost">Ana sayfa</Link></div>
    </section>
  );
}
