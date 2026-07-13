"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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
  image_url: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function remainingTime(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();

  if (diff <= 0) return "Sona erdi";

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (hours >= 24) {
    return `${Math.floor(hours / 24)} gün ${hours % 24} saat`;
  }

  return `${hours} sa ${minutes} dk`;
}

export default function HomePage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Oturum kontrol ediliyor...");
  const [loading, setLoading] = useState(false);

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionDescription, setAuctionDescription] = useState("");
  const [startPrice, setStartPrice] = useState("1000");
  const [minIncrement, setMinIncrement] = useState("100");
  const [durationHours, setDurationHours] = useState("24");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [query, setQuery] = useState("");

  async function loadAuctions() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("auctions")
      .select(
        "id, seller_id, title, description, start_price, current_price, min_increment, ends_at, status, created_at, image_url"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(24);

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

        if (profile?.full_name) setProfileName(profile.full_name);
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
          setShowAuth(false);
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
        setProfileName(data.user.user_metadata?.full_name ?? "");
        setMessage("KapışKapış hesabına giriş yapıldı.");
        setShowAuth(false);
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

    if (!supabase || !user) {
      setMessage("Önce giriş yapmalısın.");
      return;
    }

    const cleanName = profileName.trim();

    if (cleanName.length < 2) {
      setMessage("Ad soyad en az 2 karakter olmalı.");
      return;
    }

    setLoading(true);

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
    setMessage("Profil bilgilerin kaydedildi.");
  }


  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Yalnızca görsel dosyası yükleyebilirsin.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Ürün fotoğrafı en fazla 5 MB olabilir.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("Fotoğraf seçildi. İlanı yayınladığında yüklenecek.");
  }

  async function handleCreateAuction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setMessage("İlan vermek için giriş yapmalısın.");
      setShowAuth(true);
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

    if (!imageFile) {
      setMessage("En az bir ürün fotoğrafı seç.");
      return;
    }

    setLoading(true);
    setMessage("Fotoğraf yükleniyor...");

    const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
    const objectPath = `${user.id}/${crypto.randomUUID()}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("auction-images")
      .upload(objectPath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

    if (uploadError) {
      setLoading(false);
      setMessage(`Fotoğraf yükleme hatası: ${uploadError.message}`);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("auction-images")
      .getPublicUrl(objectPath);

    const imageUrl = publicUrlData.publicUrl;
    const endsAt = new Date(
      Date.now() + parsedDurationHours * 60 * 60 * 1000
    ).toISOString();

    setMessage("İlan Supabase'e kaydediliyor...");

    const { error } = await supabase.from("auctions").insert({
      seller_id: user.id,
      title: cleanTitle,
      description: cleanDescription,
      start_price: parsedStartPrice,
      current_price: parsedStartPrice,
      min_increment: parsedMinIncrement,
      ends_at: endsAt,
      status: "active",
      image_url: imageUrl,
    });

    if (error) {
      await supabase.storage.from("auction-images").remove([objectPath]);
    }

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
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setMessage("Fotoğraflı ilanın yayınlandı.");
    setShowSell(false);
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

  const filteredAuctions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr");
    if (!normalized) return auctions;

    return auctions.filter((auction) =>
      `${auction.title} ${auction.description}`
        .toLocaleLowerCase("tr")
        .includes(normalized)
    );
  }, [auctions, query]);

  return (
    <main className="appShell">
      <header className="topbar">
        <button className="brandButton" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="brandMark">KK</span>
          <span className="brandText">
            <strong>KapışKapış</strong>
            <small>Teklif ver, değerini bul</small>
          </span>
        </button>

        <div className="topActions">
          <span className="livePill">● SUPABASE CANLI</span>

          {user ? (
            <div className="userMenu">
              <span className="userAvatar">
                {(profileName || user.email || "K").slice(0, 1).toLocaleUpperCase("tr")}
              </span>
              <div>
                <strong>{profileName || "Kullanıcı"}</strong>
                <button type="button" onClick={handleSignOut}>Çıkış yap</button>
              </div>
            </div>
          ) : (
            <button
              className="loginButton"
              type="button"
              onClick={() => setShowAuth(true)}
            >
              Giriş yap
            </button>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="heroContent">
          <span className="eyebrow">CANLI AÇIK ARTIRMALAR</span>
          <h1>
            İkinci el ürünün
            <br />
            gerçek değerini bul.
          </h1>
          <p>
            Doğrulanmış kullanıcılar, güvenli teklifler ve gerçek zamanlı
            açık artırmalar.
          </p>

          <div className="heroActions">
            <button
              className="primaryCta"
              type="button"
              onClick={() => {
                if (!user) {
                  setShowAuth(true);
                  return;
                }
                setShowSell(true);
              }}
            >
              Ürününü açık artırmaya çıkar <span>→</span>
            </button>

            <button className="secondaryCta" type="button" onClick={() => document.getElementById("auctions")?.scrollIntoView({ behavior: "smooth" })}>
              Canlı ilanları keşfet
            </button>
          </div>
        </div>

        <div className="heroMetric">
          <span className="metricLabel">CANLI PAZAR</span>
          <strong>{auctions.length}</strong>
          <span>Aktif açık artırma</span>
          <small>Supabase üzerinden anlık yükleniyor</small>
        </div>
      </section>

      <section className="trustStrip">
        <article>
          <span className="trustIcon">✓</span>
          <div>
            <strong>Doğrulanmış hesaplar</strong>
            <small>Güvenli kullanıcı topluluğu</small>
          </div>
        </article>
        <article>
          <span className="trustIcon">⚡</span>
          <div>
            <strong>Anlık açık artırma</strong>
            <small>Teklifler saniyeler içinde güncellenir</small>
          </div>
        </article>
        <article>
          <span className="trustIcon">🔒</span>
          <div>
            <strong>Korumalı işlem</strong>
            <small>Alıcı ve satıcı odaklı güvenlik</small>
          </div>
        </article>
      </section>

      <section className="searchSection">
        <div className="searchBar">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Telefon, bilgisayar, oyun konsolu ara..."
          />
          <button type="button" onClick={loadAuctions}>Yenile</button>
        </div>
      </section>

      <section className="categoryStrip">
        {[
          { name: "Tümü", icon: "✦", note: "Tüm ilanlar" },
          { name: "Telefon", icon: "◫", note: "Akıllı telefonlar" },
          { name: "Bilgisayar", icon: "▰", note: "Laptop & masaüstü" },
          { name: "Oyun", icon: "◇", note: "Konsol & ekipman" },
          { name: "Ev & Yaşam", icon: "⌂", note: "Ev ürünleri" },
        ].map((item, index) => (
          <button
            type="button"
            key={item.name}
            className={index === 0 ? "activeCategory" : ""}
          >
            <span>{item.icon}</span>
            <div>
              <strong>{item.name}</strong>
              <small>{item.note}</small>
            </div>
          </button>
        ))}
      </section>

      <section className="auctionSection" id="auctions">
        <div className="sectionHeader">
          <div>
            <span className="eyebrow">ŞU ANDA CANLI</span>
            <h2>Kaçırılmayacak açık artırmalar</h2>
          </div>
          <span className="resultCount">{filteredAuctions.length} ilan</span>
        </div>

        {filteredAuctions.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">⌛</div>
            <h3>Henüz aktif ilan yok</h3>
            <p>İlk açık artırmayı sen başlat.</p>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setShowAuth(true);
                  return;
                }
                setShowSell(true);
              }}
            >
              İlan oluştur
            </button>
          </div>
        ) : (
          <div className="auctionGrid">
            {filteredAuctions.map((auction, index) => (
              <article className="auctionCard" key={auction.id}>
                <div className={`imagePlaceholder imageTone${(index % 4) + 1}`}>
                  <span className="liveBadge">CANLI</span>
                  {index < 3 && <span className="trendBadge">ÖNE ÇIKAN</span>}
                  <button
                    className="favoriteButton"
                    type="button"
                    aria-label="Favorilere ekle"
                    onClick={() => setMessage("Favoriler sıradaki adımda gerçek veriye bağlanacak.")}
                  >
                    ♡
                  </button>
                  {auction.image_url ? (
                    <img
                      className="auctionImage"
                      src={auction.image_url}
                      alt={auction.title}
                    />
                  ) : (
                    <span className="categoryIcon">🔨</span>
                  )}
                </div>

                <div className="cardBody">
                  <div className="cardTopline">
                    <span>Doğrulanmış satıcı</span>
                    <strong>{remainingTime(auction.ends_at)}</strong>
                  </div>

                  <h3>{auction.title}</h3>
                  <p>{auction.description || "Ürün açıklaması eklenmemiş."}</p>

                  <div className="bidRow">
                    <div>
                      <span>Güncel teklif</span>
                      <strong>{money(Number(auction.current_price))}</strong>
                    </div>

                    <button type="button" onClick={() => setMessage("Teklif sistemi sıradaki adımda aktif edilecek.")}>
                      Teklif ver
                    </button>
                  </div>

                  <div className="cardFooter">
                    <span>Minimum artış: {money(Number(auction.min_increment))}</span>
                    <span>{new Date(auction.ends_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {user && (
        <section className="profileStrip">
          <div>
            <span className="eyebrow">HESABIM</span>
            <h2>Profil bilgilerin</h2>
          </div>

          <div className="profileFields">
            <input
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Ad soyad"
            />
            <button type="button" onClick={handleProfileSave} disabled={loading}>
              Profili kaydet
            </button>
          </div>
        </section>
      )}

      <footer>
        <div>
          <strong>KapışKapış</strong>
          <span>Beğendiysen bekleme, KapışKapış kap!</span>
        </div>
        <small>© 2026 KapışKapış · Güvenli açık artırma platformu</small>
      </footer>

      <nav className="mobileNav" aria-label="Mobil menü">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span>⌂</span>
          Ana sayfa
        </button>
        <button type="button" onClick={() => document.getElementById("auctions")?.scrollIntoView({ behavior: "smooth" })}>
          <span>⌕</span>
          Keşfet
        </button>
        <button
          className="sellNavButton"
          type="button"
          onClick={() => {
            if (!user) {
              setShowAuth(true);
              return;
            }
            setShowSell(true);
          }}
        >
          <span>＋</span>
          İlan ver
        </button>
        <button type="button" onClick={() => setMessage("Tekliflerim ekranı yakında eklenecek.")}>
          <span>⌁</span>
          Teklifler
        </button>
        <button type="button" onClick={() => user ? window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) : setShowAuth(true)}>
          <span>◉</span>
          Profil
        </button>
      </nav>

      {message && <div className="toast">{message}</div>}

      {showAuth && (
        <div className="modalBackdrop" onMouseDown={() => setShowAuth(false)}>
          <section className="modalCard" onMouseDown={(event) => event.stopPropagation()}>
            <button className="closeButton" type="button" onClick={() => setShowAuth(false)}>×</button>

            <div className="modalBrand">
              <span className="brandMark">KK</span>
              <div>
                <strong>KapışKapış</strong>
                <small>Hesabına eriş</small>
              </div>
            </div>

            <div className="tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                Giriş yap
              </button>
              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
              >
                Kayıt ol
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Ad soyad
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Ad soyad"
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

              <button className="modalPrimary" type="submit" disabled={loading}>
                {loading
                  ? "İşleniyor..."
                  : mode === "login"
                    ? "Giriş yap"
                    : "Hesap oluştur"}
              </button>

              {mode === "login" && (
                <button className="forgotButton" type="button" onClick={handleForgotPassword}>
                  Şifremi unuttum
                </button>
              )}
            </form>

            <p className="modalMessage">{message}</p>
          </section>
        </div>
      )}

      {showSell && (
        <div className="modalBackdrop" onMouseDown={() => setShowSell(false)}>
          <section className="modalCard sellModal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="closeButton" type="button" onClick={() => setShowSell(false)}>×</button>

            <span className="eyebrow">YENİ AÇIK ARTIRMA</span>
            <h2>Ürününü yayınla</h2>

            <form onSubmit={handleCreateAuction}>
              <label>
                Ürün fotoğrafı
                <div className="photoUploader">
                  <input
                    className="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    required
                  />
                  {imagePreview ? (
                    <img className="photoPreview" src={imagePreview} alt="Ürün önizlemesi" />
                  ) : (
                    <div className="photoPlaceholder">
                      <strong>Fotoğraf seç</strong>
                      <span>JPG, PNG veya WEBP · en fazla 5 MB</span>
                    </div>
                  )}
                </div>
              </label>

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
                    value={minIncrement}
                    onChange={(event) => setMinIncrement(event.target.value)}
                    required
                  />
                </label>
              </div>

              <label>
                Süre
                <select value={durationHours} onChange={(event) => setDurationHours(event.target.value)}>
                  <option value="1">1 saat</option>
                  <option value="6">6 saat</option>
                  <option value="12">12 saat</option>
                  <option value="24">24 saat</option>
                  <option value="72">3 gün</option>
                  <option value="168">7 gün</option>
                </select>
              </label>

              <button className="modalPrimary" type="submit" disabled={loading}>
                {loading ? "Yayınlanıyor..." : "Açık artırmayı yayınla"}
              </button>
            </form>
          </section>
        </div>
      )}

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          background: #f5f6f8;
          color: #15171d;
          font-family: Inter, Arial, sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .appShell {
          min-height: 100vh;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px clamp(18px, 4vw, 64px);
          border-bottom: 1px solid #eceef2;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(18px);
        }

        .brandButton {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0;
          background: transparent;
          text-align: left;
        }

        .brandMark {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #111216;
          color: #ffc63d;
          font-weight: 950;
          letter-spacing: -0.08em;
          box-shadow: 0 8px 24px rgba(17, 18, 22, 0.18);
        }

        .brandText {
          display: grid;
        }

        .brandText strong {
          font-size: 18px;
        }

        .brandText small {
          color: #8a909d;
          font-size: 11px;
        }

        .topActions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .livePill {
          padding: 8px 11px;
          border-radius: 999px;
          background: #eaf8f0;
          color: #18864d;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .loginButton {
          border: 0;
          border-radius: 12px;
          padding: 11px 16px;
          background: #111216;
          color: white;
          font-weight: 800;
        }

        .userMenu {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .userAvatar {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ffc63d;
          font-weight: 900;
        }

        .userMenu div {
          display: grid;
        }

        .userMenu strong {
          font-size: 13px;
        }

        .userMenu button {
          border: 0;
          padding: 0;
          background: transparent;
          color: #969ca8;
          font-size: 11px;
          text-align: left;
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(240px, 0.7fr);
          gap: 24px;
          padding: clamp(48px, 8vw, 96px) clamp(18px, 5vw, 80px);
          background:
            radial-gradient(circle at 80% 20%, rgba(255, 198, 61, 0.18), transparent 30%),
            linear-gradient(135deg, #0c0d11, #191b22);
          color: white;
        }

        .heroContent {
          max-width: 760px;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 14px;
          color: #d89f0d;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.13em;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(46px, 7vw, 86px);
          line-height: 0.96;
          letter-spacing: -0.055em;
        }

        .hero p {
          max-width: 590px;
          margin: 24px 0 0;
          color: #b9bec9;
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1.55;
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 32px;
        }

        .primaryCta,
        .secondaryCta {
          border-radius: 14px;
          padding: 15px 18px;
          font-weight: 900;
        }

        .primaryCta {
          border: 0;
          background: #ffc63d;
          color: #111216;
        }

        .primaryCta span {
          margin-left: 10px;
        }

        .secondaryCta {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.04);
          color: white;
        }

        .heroMetric {
          align-self: end;
          display: grid;
          padding: 26px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
        }

        .metricLabel {
          color: #ffc63d;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.1em;
        }

        .heroMetric strong {
          margin: 8px 0 2px;
          font-size: 54px;
          letter-spacing: -0.06em;
        }

        .heroMetric span:not(.metricLabel) {
          color: white;
          font-weight: 700;
        }

        .heroMetric small {
          margin-top: 12px;
          color: #9ca3af;
        }


        .trustStrip {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: -26px clamp(18px, 5vw, 80px) 0;
          padding: 16px;
          border: 1px solid #e3e6eb;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 50px rgba(20, 22, 28, 0.09);
          backdrop-filter: blur(18px);
        }

        .trustStrip article {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 10px 14px;
          border-radius: 16px;
        }

        .trustStrip article + article {
          border-left: 1px solid #eceef2;
        }

        .trustIcon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #fff4d1;
          color: #a87300;
          font-weight: 950;
        }

        .trustStrip div {
          display: grid;
          min-width: 0;
        }

        .trustStrip strong {
          font-size: 13px;
        }

        .trustStrip small {
          margin-top: 3px;
          overflow: hidden;
          color: #8d939e;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .searchSection {
          padding: 28px clamp(18px, 5vw, 80px) 0;
        }

        .searchBar {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 10px 12px 10px 18px;
          border: 1px solid #e0e3e8;
          border-radius: 18px;
          background: white;
          box-shadow: 0 14px 40px rgba(23, 25, 31, 0.06);
        }

        .searchBar span {
          color: #8b929f;
          font-size: 24px;
        }

        .searchBar input {
          border: 0;
          outline: none;
          padding: 11px 0;
          background: transparent;
        }

        .searchBar button {
          border: 0;
          border-radius: 11px;
          padding: 11px 14px;
          background: #111216;
          color: white;
          font-weight: 800;
        }

        .categoryStrip {
          display: grid;
          grid-template-columns: repeat(5, minmax(150px, 1fr));
          gap: 12px;
          overflow-x: auto;
          padding: 18px clamp(18px, 5vw, 80px);
        }

        .categoryStrip button {
          min-width: 150px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e5ea;
          border-radius: 18px;
          padding: 14px;
          background: white;
          color: #505662;
          text-align: left;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .categoryStrip button:hover {
          transform: translateY(-2px);
          border-color: #d7aa33;
          box-shadow: 0 10px 26px rgba(27, 29, 35, 0.07);
        }

        .categoryStrip button > span {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f1f3f5;
          color: #111216;
          font-size: 20px;
          font-weight: 950;
        }

        .categoryStrip button div {
          display: grid;
        }

        .categoryStrip strong {
          font-size: 13px;
        }

        .categoryStrip small {
          margin-top: 3px;
          color: #969ca7;
          font-size: 10px;
        }

        .categoryStrip .activeCategory {
          border-color: #111216;
          background: #111216;
          color: white;
        }

        .categoryStrip .activeCategory > span {
          background: #ffc63d;
        }

        .auctionSection {
          padding: 22px clamp(18px, 5vw, 80px) 72px;
        }

        .sectionHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .sectionHeader h2,
        .profileStrip h2 {
          margin: 0;
          font-size: clamp(28px, 4vw, 42px);
          letter-spacing: -0.04em;
        }

        .resultCount {
          color: #8c929d;
          font-size: 14px;
        }

        .auctionGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .auctionCard {
          overflow: hidden;
          border: 1px solid #e3e6ea;
          border-radius: 22px;
          background: white;
          box-shadow: 0 12px 34px rgba(24, 26, 31, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .auctionCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 44px rgba(24, 26, 31, 0.1);
        }

        .imagePlaceholder {
          position: relative;
          min-height: 190px;
          display: grid;
          place-items: center;
        }

        .imageTone1 { background: linear-gradient(145deg, #e7e9ed, #cfd3d9); }
        .imageTone2 { background: linear-gradient(145deg, #eee7df, #d9cfc3); }
        .imageTone3 { background: linear-gradient(145deg, #e3e8e4, #c8d1cb); }
        .imageTone4 { background: linear-gradient(145deg, #e8e3ed, #d1c8dc); }

        .liveBadge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          padding: 7px 9px;
          border-radius: 999px;
          background: #e54954;
          color: white;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.08em;
        }

        .trendBadge {
          position: absolute;
          left: 14px;
          bottom: 14px;
          z-index: 2;
          padding: 7px 9px;
          border-radius: 999px;
          background: rgba(17, 18, 22, 0.88);
          color: #ffc63d;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.08em;
          backdrop-filter: blur(8px);
        }

        .favoriteButton {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          color: #111216;
          font-size: 20px;
          backdrop-filter: blur(8px);
        }

        .favoriteButton:hover {
          background: #ffc63d;
        }

        .categoryIcon {
          font-size: 58px;
          filter: grayscale(1);
          opacity: 0.75;
        }

        .auctionImage {
          width: 100%;
          height: 190px;
          object-fit: cover;
          display: block;
        }

        .cardBody {
          padding: 18px;
        }

        .cardTopline,
        .cardFooter,
        .bidRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .cardTopline {
          color: #8c929d;
          font-size: 11px;
        }

        .cardTopline strong {
          color: #e54954;
        }

        .cardBody h3 {
          margin: 14px 0 8px;
          font-size: 20px;
          letter-spacing: -0.025em;
        }

        .cardBody p {
          min-height: 42px;
          margin: 0;
          color: #7b818d;
          font-size: 13px;
          line-height: 1.55;
        }

        .bidRow {
          margin: 20px 0 14px;
        }

        .bidRow div {
          display: grid;
        }

        .bidRow span {
          color: #8d939f;
          font-size: 11px;
        }

        .bidRow strong {
          margin-top: 3px;
          font-size: 22px;
        }

        .bidRow button {
          border: 0;
          border-radius: 11px;
          padding: 11px 13px;
          background: #111216;
          color: white;
          font-weight: 850;
        }

        .cardFooter {
          padding-top: 14px;
          border-top: 1px solid #eceef2;
          color: #9096a1;
          font-size: 10px;
        }

        .emptyState {
          display: grid;
          place-items: center;
          padding: 56px 24px;
          border: 1px dashed #d6d9df;
          border-radius: 24px;
          background: white;
          text-align: center;
        }

        .emptyIcon {
          font-size: 48px;
        }

        .emptyState h3 {
          margin: 14px 0 6px;
        }

        .emptyState p {
          color: #8d939e;
        }

        .emptyState button {
          border: 0;
          border-radius: 12px;
          padding: 12px 16px;
          background: #ffc63d;
          font-weight: 900;
        }

        .profileStrip {
          display: grid;
          grid-template-columns: 1fr minmax(300px, 0.8fr);
          align-items: end;
          gap: 24px;
          margin: 0 clamp(18px, 5vw, 80px) 72px;
          padding: 28px;
          border-radius: 24px;
          background: #111216;
          color: white;
        }

        .profileFields {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
        }

        .profileFields input {
          border: 1px solid #353841;
          border-radius: 12px;
          padding: 13px;
          background: #1c1e24;
          color: white;
          outline: none;
        }

        .profileFields button {
          border: 0;
          border-radius: 12px;
          padding: 13px 15px;
          background: #ffc63d;
          font-weight: 900;
        }

        footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 28px clamp(18px, 5vw, 80px) 92px;
          border-top: 1px solid #e3e5e9;
          color: #858b96;
          font-size: 13px;
        }

        footer div {
          display: grid;
          gap: 4px;
        }

        footer strong {
          color: #15171d;
        }

        .mobileNav {
          position: fixed;
          left: 50%;
          bottom: 16px;
          z-index: 40;
          display: none;
          width: min(calc(100% - 24px), 520px);
          grid-template-columns: repeat(5, 1fr);
          padding: 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 22px;
          background: rgba(17, 18, 22, 0.94);
          box-shadow: 0 18px 54px rgba(0, 0, 0, 0.25);
          transform: translateX(-50%);
          backdrop-filter: blur(18px);
        }

        .mobileNav button {
          display: grid;
          place-items: center;
          gap: 3px;
          border: 0;
          border-radius: 14px;
          padding: 8px 4px;
          background: transparent;
          color: #c4c8d0;
          font-size: 9px;
          font-weight: 800;
        }

        .mobileNav button span {
          font-size: 18px;
        }

        .mobileNav .sellNavButton {
          margin-top: -22px;
          background: #ffc63d;
          color: #111216;
          box-shadow: 0 10px 28px rgba(255, 198, 61, 0.28);
        }

        .mobileNav .sellNavButton span {
          font-size: 24px;
        }

        .toast {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 60;
          max-width: min(420px, calc(100vw - 40px));
          padding: 14px 16px;
          border-radius: 14px;
          background: #111216;
          color: white;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
          font-size: 13px;
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(7, 8, 11, 0.72);
          backdrop-filter: blur(10px);
        }

        .modalCard {
          position: relative;
          width: min(100%, 460px);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 28px;
          border-radius: 24px;
          background: white;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.35);
        }

        .sellModal {
          width: min(100%, 620px);
        }

        .closeButton {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: #f0f2f5;
          color: #444a55;
          font-size: 22px;
        }

        .modalBrand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .modalBrand div {
          display: grid;
        }

        .modalBrand small {
          color: #9096a1;
        }

        .tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
          padding: 5px;
          border-radius: 14px;
          background: #f1f3f5;
        }

        .tabs button {
          border: 0;
          border-radius: 10px;
          padding: 11px;
          background: transparent;
          color: #7f8591;
          font-weight: 850;
        }

        .tabs button.active {
          background: white;
          color: #111216;
          box-shadow: 0 4px 14px rgba(17, 18, 22, 0.08);
        }

        form {
          display: grid;
          gap: 15px;
        }

        label {
          display: grid;
          gap: 7px;
          color: #555b66;
          font-size: 12px;
          font-weight: 800;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #dfe2e7;
          border-radius: 12px;
          padding: 13px 14px;
          background: white;
          color: #17191f;
          outline: none;
        }

        textarea {
          resize: vertical;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: #d89f0d;
          box-shadow: 0 0 0 3px rgba(216, 159, 13, 0.12);
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .photoUploader {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          border: 1px dashed #cfd4dc;
          border-radius: 16px;
          background: #f7f8fa;
        }

        .fileInput {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 100%;
          height: 100%;
          cursor: pointer;
          opacity: 0;
        }

        .photoPreview {
          width: 100%;
          height: 240px;
          display: block;
          object-fit: cover;
        }

        .photoPlaceholder {
          min-height: 190px;
          display: grid;
          place-content: center;
          justify-items: center;
          gap: 7px;
          padding: 24px;
          color: #737b87;
          text-align: center;
        }

        .photoPlaceholder strong {
          color: #191b20;
          font-size: 16px;
        }

        .photoPlaceholder span {
          font-size: 11px;
          font-weight: 600;
        }

        .modalPrimary {
          border: 0;
          border-radius: 12px;
          padding: 14px;
          background: #111216;
          color: white;
          font-weight: 900;
        }

        .forgotButton {
          border: 0;
          background: transparent;
          color: #c88f00;
          font-weight: 800;
        }

        .modalMessage {
          margin: 16px 0 0;
          color: #8a909b;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 980px) {
          .auctionGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .heroMetric {
            max-width: 420px;
          }
        }

        @media (max-width: 820px) {
          .trustStrip {
            grid-template-columns: 1fr;
            margin-top: -16px;
          }

          .trustStrip article + article {
            border-top: 1px solid #eceef2;
            border-left: 0;
          }

          .categoryStrip {
            display: flex;
          }
        }

        @media (max-width: 680px) {
          .topbar {
            align-items: flex-start;
          }

          .livePill {
            display: none;
          }

          .brandText small,
          .userMenu strong {
            display: none;
          }

          .hero {
            padding-top: 52px;
          }

          .hero h1 {
            font-size: 50px;
          }

          .auctionGrid {
            grid-template-columns: 1fr;
          }

          .sectionHeader,
          .profileStrip,
          footer {
            align-items: stretch;
            grid-template-columns: 1fr;
            flex-direction: column;
          }

          .mobileNav {
            display: grid;
          }

          .profileFields,
          .formGrid {
            grid-template-columns: 1fr;
          }

          .searchBar {
            grid-template-columns: auto 1fr;
          }

          .searchBar button {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </main>
  );
}
