"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function PasswordRecoveryExperience() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isInvitation, setIsInvitation] = useState(false);
  const [returnTo, setReturnTo] = useState("/ayarlar?password=updated");

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-ZÇĞİÖŞÜ]/.test(password) && /[a-zçğıöşü]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^\w\s]/.test(password)) score++;
    return score;
  }, [password]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const invitation = query.get("invite") === "1";
    const requested = query.get("returnTo");
    setIsInvitation(invitation);
    setReturnTo(requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : invitation ? "/profil" : "/ayarlar?password=updated");
    const client = getSupabaseBrowserClient();
    if (!client) return;
    void client.auth.getUser().then(({ data }) => setReady(Boolean(data.user))).finally(() => setChecking(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setMessage({ type: "error", text: "Yeni şifreler birbiriyle eşleşmiyor." });
      return;
    }
    if (strength < 3) {
      setMessage({ type: "error", text: "En az 8 karakter, büyük-küçük harf ve rakam içeren güçlü bir şifre kullan." });
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setMessage(null);
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      setMessage({ type: "error", text: error.message });
      return;
    }
    await client.auth.signOut({ scope: "others" });
    setLoading(false);
    setMessage({ type: "success", text: isInvitation ? "Şifren oluşturuldu. Hesap kurulumuna yönlendiriliyorsun." : "Şifren güncellendi. Diğer cihazlardaki oturumlar kapatıldı." });
    window.setTimeout(() => window.location.assign(returnTo), 900);
  }

  return (
    <main className="activationPageV20">
      <Link href="/" className="activationBrandV20"><img src="/kapiskapis-logo.png" alt="KapışKapış" /></Link>
      <section className="activationCardV20">
        <span className="activationIconV20">●</span>
        <small>{isInvitation ? "DAVETLİ HESAP KURULUMU" : "ŞİFRE GÜVENLİĞİ"}</small>
        <h1>{isInvitation ? "KapışKapış şifreni oluştur" : "Yeni şifreni oluştur"}</h1>
        <p>{isInvitation ? "Yönetici davetini kabul etmek için güçlü bir şifre belirle. Ardından rolüne uygun hesap merkezine yönlendirileceksin." : "Yeni şifren önceki şifrenden farklı ve yalnızca KapışKapış hesabında kullandığın güçlü bir şifre olmalı."}</p>
        {checking ? (
          <div className="activationMessageV20">Şifre yenileme bağlantısı doğrulanıyor…</div>
        ) : !ready ? (
          <div className="activationMessageV20 error">Şifre yenileme oturumu bulunamadı veya bağlantının süresi doldu. Yeni bir bağlantı iste.</div>
        ) : (
          <form className="activationFormV20" onSubmit={submit}>
            <label>Yeni şifre<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete="new-password" required /></label>
            <div className="passwordMeterV20"><span style={{ width: `${strength * 25}%` }} /></div>
            <label>Yeni şifre tekrar<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={8} autoComplete="new-password" required /></label>
            {message && <div className={`activationMessageV20 ${message.type}`}>{message.text}</div>}
            <button type="submit" className="activationPrimaryV20" disabled={loading}>{loading ? "Güncelleniyor…" : "Yeni şifreyi kaydet"}</button>
          </form>
        )}
        {!checking && !ready && <Link href="/giris" className="activationPrimaryV20">Yeni şifre bağlantısı iste</Link>}
      </section>
    </main>
  );
}
