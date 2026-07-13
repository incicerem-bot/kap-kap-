"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  supabaseConfigured,
} from "../lib/supabase";

type AuthMode = "login" | "register";

type Auction = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  start_price: number;
  current_price: number;
  min_increment: number;
  ends_at: string;
  status: "active" | "ended" | "cancelled";
  created_at: string;
};

export default function HomePage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Oturum kontrol ediliyor...");
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionDescription, setAuctionDescription] = useState("");
  const [startPrice, setStartPrice] = useState("1000");
  const [minIncrement, setMinIncrement] = useState("100");
  const [durationHours, setDurationHours] = useState("24");

  async function loadAuctions() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) return;

    const { data, error } = await supabase
      .from("auctions")
      .select(
        "id, seller_id, title, description, start_price, current_price, min_increment, ends_at, status, created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      setMessage(`İlanlar yüklenemedi: ${error.message}`);
      return;
    }

    setAuctions((data ?? []) as Auction[]);
  }

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabaseConfigured || !supabase) {
      setMessage("Supabase bağlantısı bulunamadı.");
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setMessage(`Oturum hatası: ${error.message}`);
        return;
      }

      setUser(data.session?.user ?? null);
      setProfileName(data.session?.user?.user_metadata?.full_name ?? "");

      if (data.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setProfileName(profile.full_name);
        }
      }

      setMessage(
        data.session?.user
          ? "KapışKapış hesabına giriş yapıldı."
          : "Hesabına giriş yap veya yeni hesap oluştur."
      );
    });

    void loadAuctions();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setProfileName(session?.user?.user_metadata?.full_name ?? "");
      setMessage(
        session?.user
          ? "KapışKapış hesabına giriş yapıldı."
          : "Hesabına giriş yap veya yeni hesap oluştur."
      );
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();

    if (!supabaseConfigured || !supabase) {
      setMessage("Supabase bağlantısı bulunamadı.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || password.length < 6) {
      setMessage("Geçerli bir e-posta ve en az 6 karakterli şifre gir.");
      return;
    }

    if (mode === "register" && fullName.trim().length < 2) {
      setMessage("Ad soyad alanını doldur.");
      return;
    }

    setLoading(true);
    setMessage(mode === "register" ? "Hesap oluşturuluyor..." : "Giriş yapılıyor...");

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          setMessage(`Kayıt hatası: ${error.message}`);
          return;
        }

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            email: cleanEmail,
          });
        }

        if (data.session) {
          setUser(data.user);
          setProfileName(fullName.trim());
          setMessage("Hesabın oluşturuldu ve giriş yapıldı.");
        } else {
          setMessage(
            "Hesabın oluşturuldu. E-posta adresine gelen doğrulama bağlantısına tıkla."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setMessage(`Giriş hatası: ${error.message}`);
          return;
        }

        setUser(data.user);
        setMessage("KapışKapış hesabına giriş yapıldı.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const supabase = getSupabaseBrowserClient();
    const cleanEmail = email.trim().toLowerCase();

    if (!supabase) {
      setMessage("Supabase bağlantısı bulunamadı.");
      return;
    }

    if (!cleanEmail) {
      setMessage("Önce e-posta adresini yaz.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    setLoading(false);

    if (error) {
      setMessage(`Şifre sıfırlama hatası: ${error.message}`);
      return;
    }

    setMessage("Şifre sıfırlama bağlantısı e-posta adresine gönderildi.");
  }

  async function handleProfileSave() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase bağlantısı bulunamadı.");
      return;
    }

    if (profileName.trim().length < 2) {
      setMessage("Ad soyad en az 2 karakter olmalı.");
      return;
    }

    setLoading(true);
    const cleanName = profileName.trim();

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: cleanName,
      },
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: cleanName,
        email: data.user.email ?? "",
      });

      if (profileError) {
        setLoading(false);
        setMessage(`Profil tablosu hatası: ${profileError.message}`);
        return;
      }
    }

    setLoading(false);

    if (error) {
      setMessage(`Profil güncelleme hatası: ${error.message}`);
      return;
    }

    setUser(data.user);
    setMessage("Profil bilgilerin veritabanına kaydedildi.");
  }

  async function handleCreateAuction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setMessage("İlan vermek için giriş yapmalısın.");
      return;
    }

    const cleanTitle = auctionTitle.trim();
    const cleanDescription = auctionDescription.trim();
    const parsedStartPrice = Number(startPrice);
    const parsedMinIncrement = Number(minIncrement);
    const parsedDurationHours = Number(durationHours);

    if (cleanTitle.length < 5) {
      setMessage("İlan başlığı en az 5 karakter olmalı.");
      return;
    }

    if (
      !Number.isFinite(parsedStartPrice) ||
      parsedStartPrice <= 0 ||
      !Number.isFinite(parsedMinIncrement) ||
      parsedMinIncrement <= 0 ||
      !Number.isFinite(parsedDurationHours) ||
      parsedDurationHours <= 0
    ) {
      setMessage("Fiyat, teklif artışı ve süre geçerli olmalı.");
      return;
    }

    setLoading(true);
    setMessage("İlan Supabase'e kaydediliyor...");

    const endsAt = new Date(
      Date.now() + parsedDurationHours * 60 * 60 * 1000
    ).toISOString();

    const { error } = await supabase.from("auctions").insert({
      seller_id: user.id,
      title: cleanTitle,
      description: cleanDescription,
      start_price: parsedStartPrice,
      current_price: parsedStartPrice,
      min_increment: parsedMinIncrement,
      ends_at: endsAt,
      status: "active",
    });

    setLoading(false);

    if (error) {
      setMessage(`İlan oluşturma hatası: ${error.message}`);
      return;
    }

    setAuctionTitle("");
    setAuctionDescription("");
    setStartPrice("1000");
    setMinIncrement("100");
    setDurationHours("24");
    setMessage("İlanın yayınlandı.");
    await loadAuctions();
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      setMessage(`Çıkış hatası: ${error.message}`);
      return;
    }

    setUser(null);
    setEmail("");
    setPassword("");
    setMessage("Güvenli şekilde çıkış yapıldı.");
  }

  return (
    <main className="page">
      <section className="brand">
        <div className="logo">KK</div>
        <div>
          <h1>KapışKapış</h1>
          <p>Beğendiysen bekleme, KapışKapış kap!</p>
        </div>
      </section>

      <section className="card">
        {user ? (
          <>
            <span className="status success">● CANLI BAĞLANTI</span>
            <h2>Hoş geldin</h2>
            <p className="muted">{user.user_metadata?.full_name || user.email}</p>

            <div className="accountBox">
              <span>Hesap e-postası</span>
              <strong>{user.email}</strong>
            </div>

            <label>
              Ad soyad
              <input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Ad soyad"
                autoComplete="name"
              />
            </label>

            <button
              className="primaryButton"
              type="button"
              onClick={handleProfileSave}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Profili kaydet"}
            </button>

            <div className="divider" />

            <h2>İlk açık artırmanı oluştur</h2>
            <form onSubmit={handleCreateAuction}>
              <label>
                İlan başlığı
                <input
                  value={auctionTitle}
                  onChange={(event) => setAuctionTitle(event.target.value)}
                  placeholder="Örnek: iPhone 15 Pro 256 GB"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Açıklama
                <textarea
                  value={auctionDescription}
                  onChange={(event) => setAuctionDescription(event.target.value)}
                  placeholder="Ürünün durumunu ve özelliklerini yaz"
                  rows={4}
                  maxLength={1000}
                />
              </label>

              <div className="formGrid">
                <label>
                  Başlangıç fiyatı
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={startPrice}
                    onChange={(event) => setStartPrice(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Minimum artış
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={minIncrement}
                    onChange={(event) => setMinIncrement(event.target.value)}
                    required
                  />
                </label>
              </div>

              <label>
                Açık artırma süresi
                <select
                  value={durationHours}
                  onChange={(event) => setDurationHours(event.target.value)}
                >
                  <option value="1">1 saat</option>
                  <option value="6">6 saat</option>
                  <option value="12">12 saat</option>
                  <option value="24">24 saat</option>
                  <option value="72">3 gün</option>
                  <option value="168">7 gün</option>
                </select>
              </label>

              <button className="primaryButton" type="submit" disabled={loading}>
                {loading ? "Yayınlanıyor..." : "Açık artırmayı yayınla"}
              </button>
            </form>

            <p className="message">{message}</p>

            <button
              className="secondaryButton"
              type="button"
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? "İşleniyor..." : "Çıkış yap"}
            </button>
          </>
        ) : (
          <>
            <div className="tabs">
              <button
                type="button"
                className={mode === "login" ? "tab active" : "tab"}
                onClick={() => {
                  setMode("login");
                  setMessage("Hesabına giriş yap.");
                }}
              >
                Giriş yap
              </button>
              <button
                type="button"
                className={mode === "register" ? "tab active" : "tab"}
                onClick={() => {
                  setMode("register");
                  setMessage("Yeni KapışKapış hesabını oluştur.");
                }}
              >
                Kayıt ol
              </button>
            </div>

            <h2>{mode === "login" ? "Tekrar hoş geldin" : "Kapışmaya katıl"}</h2>

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Ad soyad
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Kemal Akar"
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                E-posta
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Şifre
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="En az 6 karakter"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
              </label>

              <button className="primaryButton" type="submit" disabled={loading}>
                {loading
                  ? "İşleniyor..."
                  : mode === "login"
                    ? "Giriş yap"
                    : "Hesap oluştur"}
              </button>

              {mode === "login" && (
                <button
                  className="linkButton"
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Şifremi unuttum
                </button>
              )}
            </form>

            <p className="message">{message}</p>
          </>
        )}
      </section>

      <section className="card auctionListCard">
        <div className="sectionHeading">
          <div>
            <span className="status success">● GERÇEK VERİ</span>
            <h2>Canlı açık artırmalar</h2>
          </div>
          <button className="refreshButton" type="button" onClick={loadAuctions}>
            Yenile
          </button>
        </div>

        {auctions.length === 0 ? (
          <p className="muted">
            Henüz aktif ilan yok. Giriş yapıp ilk açık artırmayı sen başlat.
          </p>
        ) : (
          <div className="auctionList">
            {auctions.map((auction) => (
              <article className="auctionItem" key={auction.id}>
                <div>
                  <h3>{auction.title}</h3>
                  <p>{auction.description || "Açıklama eklenmemiş."}</p>
                </div>
                <div className="auctionMeta">
                  <span>Güncel fiyat</span>
                  <strong>
                    {Number(auction.current_price).toLocaleString("tr-TR")} TL
                  </strong>
                  <small>
                    Bitiş:{" "}
                    {new Date(auction.ends_at).toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
          background:
            radial-gradient(circle at top, rgba(255, 183, 3, 0.16), transparent 32%),
            #08090c;
          color: #f8fafc;
          font-family: Arial, sans-serif;
        }

        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 28px;
          padding: 24px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
          width: min(100%, 720px);
        }

        .logo {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #ffb703;
          color: #08090c;
          font-size: 24px;
          font-weight: 900;
          box-shadow: 0 12px 40px rgba(255, 183, 3, 0.22);
        }

        h1,
        h2,
        p {
          margin-top: 0;
        }

        h1 {
          margin-bottom: 4px;
          font-size: clamp(32px, 8vw, 48px);
        }

        .brand p {
          margin-bottom: 0;
          color: #a7afbf;
        }

        .card {
          width: min(100%, 720px);
          padding: 28px;
          border: 1px solid #252a34;
          border-radius: 24px;
          background: rgba(17, 20, 27, 0.94);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
        }

        .tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 26px;
          padding: 5px;
          border-radius: 14px;
          background: #090b10;
        }

        .tab {
          border: 0;
          border-radius: 10px;
          padding: 12px;
          background: transparent;
          color: #98a2b3;
          cursor: pointer;
          font-weight: 700;
        }

        .tab.active {
          background: #ffb703;
          color: #111318;
        }

        form {
          display: grid;
          gap: 16px;
        }

        label {
          display: grid;
          gap: 8px;
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 700;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #303642;
          border-radius: 12px;
          padding: 14px;
          background: #0b0d12;
          color: white;
          font: inherit;
          outline: none;
        }

        textarea {
          resize: vertical;
          min-height: 110px;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: #ffb703;
          box-shadow: 0 0 0 3px rgba(255, 183, 3, 0.12);
        }

        .primaryButton,
        .secondaryButton {
          width: 100%;
          border-radius: 12px;
          padding: 14px 18px;
          cursor: pointer;
          font-weight: 900;
          font-size: 15px;
        }

        .primaryButton {
          border: 0;
          background: #ffb703;
          color: #101216;
        }

        .secondaryButton {
          border: 1px solid #374151;
          background: transparent;
          color: white;
        }

        .linkButton {
          border: 0;
          background: transparent;
          color: #ffcb47;
          cursor: pointer;
          font-weight: 700;
          padding: 4px;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .message {
          margin: 18px 0 0;
          color: #aeb7c5;
          line-height: 1.5;
          font-size: 14px;
        }

        .muted {
          color: #aeb7c5;
        }

        .status {
          display: inline-flex;
          margin-bottom: 18px;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
        }

        .success {
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
        }

        .accountBox {
          display: grid;
          gap: 6px;
          margin: 24px 0;
          padding: 16px;
          border-radius: 14px;
          background: #0b0d12;
        }

        .accountBox span {
          color: #8d97a8;
          font-size: 12px;
        }

        .accountBox strong {
          overflow-wrap: anywhere;
        }

        .divider {
          height: 1px;
          margin: 28px 0;
          background: #252a34;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .auctionListCard {
          margin-bottom: 40px;
        }

        .sectionHeading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .refreshButton {
          border: 1px solid #374151;
          border-radius: 10px;
          padding: 10px 12px;
          background: transparent;
          color: white;
          cursor: pointer;
          font-weight: 700;
        }

        .auctionList {
          display: grid;
          gap: 12px;
        }

        .auctionItem {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          padding: 18px;
          border: 1px solid #2c323d;
          border-radius: 16px;
          background: #0b0d12;
        }

        .auctionItem h3 {
          margin: 0 0 8px;
        }

        .auctionItem p {
          margin-bottom: 0;
          color: #9ca6b5;
          line-height: 1.45;
        }

        .auctionMeta {
          display: grid;
          align-content: center;
          justify-items: end;
          min-width: 150px;
        }

        .auctionMeta span,
        .auctionMeta small {
          color: #8d97a8;
        }

        .auctionMeta strong {
          margin: 4px 0 8px;
          color: #ffcb47;
          font-size: 20px;
        }

        @media (max-width: 620px) {
          .formGrid,
          .auctionItem {
            grid-template-columns: 1fr;
          }

          .auctionMeta {
            justify-items: start;
          }
        }
      `}</style>
    </main>
  );
}
