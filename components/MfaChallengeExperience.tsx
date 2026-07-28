"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { isSafeInternalPath } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Factor = { id: string; friendly_name?: string; status?: string; factor_type?: string };

export default function MfaChallengeExperience() {
  const [factor, setFactor] = useState<Factor | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) { setLoading(false); return; }
    void client.auth.mfa.listFactors().then(({ data, error }) => {
      if (error) setMessage(error.message);
      const factorData = data as { all?: Factor[]; totp?: Factor[] } | null;
      const next = (factorData?.all ?? factorData?.totp ?? []).find((item) => item.factor_type === "totp" && item.status === "verified") ?? null;
      setFactor(next);
      setLoading(false);
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client || !factor) return;
    if (!/^\d{6}$/.test(code)) return setMessage("Authenticator uygulamasındaki 6 haneli kodu yaz.");
    setLoading(true);
    setMessage("");
    const { error } = await client.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    setLoading(false);
    if (error) return setMessage("Kod doğrulanamadı. Yeni kodla tekrar dene.");
    const query = new URLSearchParams(window.location.search);
    const requested = query.get("returnTo");
    window.location.assign(isSafeInternalPath(requested) ? requested! : "/profil");
  }

  return (
    <main className="mfaChallengeV23">
      <section>
        <Link href="/" className="mfaBrandV23"><img src="/kapiskapis-logo.png" alt="KapışKapış" /></Link>
        <span>İKİ ADIMLI DOĞRULAMA</span>
        <h1>Girişini güvenli kodla tamamla</h1>
        <p>Authenticator uygulamandaki güncel 6 haneli kodu gir.</p>
        {loading ? <div className="mfaStateV23">Güvenlik faktörleri kontrol ediliyor…</div> : factor ? <form onSubmit={submit}><label>Doğrulama kodu<input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" autoFocus /></label>{message && <div className="mfaErrorV23">{message}</div>}<button type="submit" disabled={loading}>Girişi doğrula</button></form> : <div className="mfaStateV23"><strong>Authenticator kurulumu bulunamadı.</strong><p>Hesap güvenliği bölümünden iki adımlı doğrulamayı etkinleştir.</p><Link href="/ayarlar?tab=security&mfa=required">Güvenlik ayarlarına git</Link></div>}
        <footer><Link href="/giris">Farklı hesapla giriş yap</Link><Link href="/yardim">Yardım al</Link></footer>
      </section>
    </main>
  );
}
