"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function RegistrationPendingExperience() {
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);
  const account = searchParams.get("account") === "seller" ? "seller" : "buyer";
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function resend() {
    if (!email || cooldown > 0) return;
    const client = getSupabaseBrowserClient();
    if (!client) {
      setMessage("Supabase bağlantısı yapılandırılmamış.");
      return;
    }
    setLoading(true);
    setMessage("");
    const next = account === "seller" ? "/satici-dogrulama" : "/hesap-dogrulama";
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCooldown(60);
    setMessage("Doğrulama e-postası yeniden gönderildi.");
  }

  return (
    <main className="activationPageV20">
      <Link href="/" className="activationBrandV20"><img src="/kapiskapis-logo.png" alt="KapışKapış" /></Link>
      <section className="activationCardV20">
        <span className="activationIconV20">@</span>
        <small>E-POSTA DOĞRULAMA</small>
        <h1>Hesabını etkinleştirmek için e-postanı doğrula</h1>
        <p><strong>{email || "Kayıt sırasında kullandığın e-posta"}</strong> adresine gönderilen bağlantıyı aç. Bağlantı seni güvenli şekilde KapışKapış’a geri getirecek.</p>
        <div className="activationStepsV20">
          <article className="done"><i>1</i><div><b>Kayıt tamamlandı</b><span>{account === "seller" ? "Satıcı hesabı oluşturuldu" : "Alıcı hesabı oluşturuldu"}</span></div></article>
          <article><i>2</i><div><b>E-postayı doğrula</b><span>Gelen kutusu ve spam klasörünü kontrol et</span></div></article>
          <article><i>3</i><div><b>Hesabını kullan</b><span>{account === "seller" ? "Satıcı doğrulama ve ödeme hesabına geç" : "Teklif ve sipariş işlemlerine başla"}</span></div></article>
        </div>
        {message && <div className="activationMessageV20" aria-live="polite">{message}</div>}
        <button type="button" className="activationPrimaryV20" onClick={() => void resend()} disabled={loading || cooldown > 0 || !email}>
          {loading ? "Gönderiliyor…" : cooldown > 0 ? `Tekrar gönder (${cooldown})` : "Doğrulama e-postasını yeniden gönder"}
        </button>
        <div className="activationLinksV20"><Link href="/giris">E-postayı doğruladım, giriş yap</Link><Link href="/kayit">Farklı e-postayla kayıt ol</Link></div>
        <footer>Bağlantı çalışmıyorsa Supabase Authentication → URL Configuration bölümünde production domaininin izinli olduğunu kontrol et.</footer>
      </section>
    </main>
  );
}
