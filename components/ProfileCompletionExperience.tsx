"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isSafeInternalPath } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Notice = { type: "success" | "error"; text: string } | null;

type FormState = {
  fullName: string;
  username: string;
  birthDate: string;
  city: string;
  district: string;
};

function normalizeUsername(value: string) {
  const ascii = value
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (letter) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[letter] ?? letter);
  return ascii.replace(/[^a-z0-9._-]/g, "").slice(0, 30);
}

function ageFromBirthDate(value: string) {
  if (!value) return null;
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export default function ProfileCompletionExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [form, setForm] = useState<FormState>({
    fullName: profile?.fullName ?? "",
    username: profile?.username ?? "",
    birthDate: profile?.birthDate ?? "",
    city: profile?.city ?? "",
    district: profile?.district ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    setForm({
      fullName: profile?.fullName ?? "",
      username: profile?.username ?? "",
      birthDate: profile?.birthDate ?? "",
      city: profile?.city ?? "",
      district: profile?.district ?? "",
    });
  }, [profile?.birthDate, profile?.city, profile?.district, profile?.fullName, profile?.username]);

  const returnToRaw = searchParams.get("returnTo");
  const returnTo = isSafeInternalPath(returnToRaw)
    ? returnToRaw!
    : profile?.role === "seller"
      ? "/satici-dogrulama"
      : "/profil";
  const age = useMemo(() => ageFromBirthDate(form.birthDate), [form.birthDate]);

  useEffect(() => {
    if (user && profile?.profileCompletedAt && !loading) {
      window.location.replace(returnTo);
    }
  }, [loading, profile?.profileCompletedAt, returnTo, user]);

  const progress = [
    form.fullName.trim().length >= 3,
    /^[a-z0-9][a-z0-9._-]{2,29}$/.test(form.username),
    age !== null && age >= 18,
    form.city.trim().length >= 2,
  ].filter(Boolean).length;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      router.push(`/giris?returnTo=${encodeURIComponent(`/profil-tamamlama?returnTo=${encodeURIComponent(returnTo)}`)}`);
      return;
    }

    const fullName = form.fullName.trim();
    const username = normalizeUsername(form.username);
    const city = form.city.trim();
    if (fullName.length < 3) {
      setNotice({ type: "error", text: "Ad soyad en az 3 karakter olmalıdır." });
      return;
    }
    if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(username)) {
      setNotice({ type: "error", text: "Kullanıcı adı en az 3 karakter olmalı ve yalnızca küçük harf, rakam, nokta, alt çizgi veya tire içermelidir." });
      return;
    }
    if (age === null || age < 18) {
      setNotice({ type: "error", text: "KapışKapış hesabı için 18 yaşını doldurmuş olmalısın." });
      return;
    }
    if (city.length < 2) {
      setNotice({ type: "error", text: "Şehir bilgisini eksiksiz gir." });
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setNotice({ type: "error", text: "Supabase bağlantısı yapılandırılmamış." });
      return;
    }

    setLoading(true);
    setNotice(null);
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      const token = sessionData.session?.access_token;
      if (sessionError || !token) {
        throw new Error("Oturum süresi dolmuş. Lütfen yeniden giriş yap.");
      }

      const response = await fetch("/api/account/profile/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          username,
          birthDate: form.birthDate,
          city,
          district: form.district.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; code?: string; requestId?: string };
      if (!response.ok || !payload.ok) {
        const suffix = payload.requestId ? ` (Kayıt: ${payload.requestId.slice(0, 8)})` : "";
        throw new Error(`${payload.message || "Profil bilgileri kaydedilemedi."}${suffix}`);
      }

      setNotice({ type: "success", text: "Profilin tamamlandı. Hesap merkezi açılıyor…" });
      // Profil başarıyla kaydedildikten sonra ek bir profil sorgusunun başarısız olması
      // kullanıcıya yanlışlıkla kayıt hatası göstermemeli. Tam sayfa yenilemesi yeni profili okur.
      window.setTimeout(() => window.location.replace(returnTo), 350);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Profil bilgileri kaydedilemedi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profileSetupV21">
      <section className="profileSetupHeroV21">
        <div>
          <span>HESAP PROFİLİ</span>
          <h2>KapışKapış hesabını tamamla</h2>
          <p>Bu bilgiler teklif, satış, teslimat ve hesap güvenliği kontrollerinde kullanılır. Doğum tarihin ve konum bilgin mağaza sayfalarında herkese açık gösterilmez.</p>
        </div>
        <div className="profileSetupProgressV21">
          <strong>{progress}/4</strong>
          <span>zorunlu bilgi hazır</span>
          <i><b style={{ width: `${(progress / 4) * 100}%` }} /></i>
        </div>
      </section>

      {notice && <div className={`profileSetupNoticeV21 ${notice.type}`} aria-live="polite">{notice.text}</div>}

      <form className="profileSetupFormV21" onSubmit={submit}>
        <section>
          <header><span>1</span><div><small>KİMLİK BİLGİLERİ</small><h3>Gerçek hesap bilgileri</h3></div></header>
          <div className="profileSetupFieldsV21 two">
            <label>Ad soyad<input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} autoComplete="name" minLength={3} maxLength={120} required /></label>
            <label>Kullanıcı adı<div className="profileUsernameV21"><span>@</span><input value={form.username} onChange={(event) => update("username", normalizeUsername(event.target.value))} autoComplete="username" minLength={3} maxLength={30} placeholder="kemalakar" required /></div><small>Mağaza, yorum ve herkese açık profil adresinde kullanılabilir.</small></label>
            <label>Doğum tarihi<input type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} required /><small>{age === null ? "18 yaş kontrolü için gereklidir." : age >= 18 ? `${age} yaş · uygun` : `${age} yaş · hesap için uygun değil`}</small></label>
            <label>Hesap e-postası<input value={profile?.email || user?.email || ""} disabled readOnly /><small>E-posta değişikliği güvenlik onayı gerektirir.</small></label>
          </div>
        </section>

        <section>
          <header><span>2</span><div><small>KONUM</small><h3>Şehir ve teslimat bölgesi</h3></div></header>
          <div className="profileSetupFieldsV21 two">
            <label>Şehir<input value={form.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level1" maxLength={80} placeholder="İzmir" required /></label>
            <label>İlçe <em>isteğe bağlı</em><input value={form.district} onChange={(event) => update("district", event.target.value)} autoComplete="address-level2" maxLength={80} placeholder="Karşıyaka" /></label>
          </div>
          <div className="profilePrivacyV21"><strong>Gizlilik</strong><p>Doğum tarihin ve açık adresin satıcılara veya diğer kullanıcılara gösterilmez. Şehir bilgisi yalnızca kargo ve yakınlık deneyimlerinde kullanılabilir.</p></div>
        </section>

        <footer>
          <Link href="/hukuk?doc=gizlilik" target="_blank">KVKK ve gizlilik bilgilerini görüntüle</Link>
          <button type="submit" disabled={loading}>{loading ? "Kaydediliyor…" : "Profili tamamla"}</button>
        </footer>
      </form>
    </div>
  );
}
