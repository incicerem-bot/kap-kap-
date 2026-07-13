"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  image_url?: string | null;
  created_at: string;
};

type SelectedAuction = Auction | null;

const demoProducts = [
  {
    id: "demo-macbook",
    title: 'MacBook Pro M4 14"',
    price: 47250,
    time: "01:42:11",
    bids: 18,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "demo-iphone",
    title: "iPhone 15 Pro 256GB",
    price: 32750,
    time: "00:58:32",
    bids: 23,
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "demo-watch",
    title: "Rolex Datejust 41",
    price: 91500,
    time: "02:21:45",
    bids: 31,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "demo-ps5",
    title: "PlayStation 5 Digital",
    price: 18750,
    time: "00:35:18",
    bids: 15,
    image:
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=900&q=80",
  },
];

const activity = [
  { name: "Ayşe", text: "MacBook Pro’ya", value: "47.500 ₺", time: "2 saniye önce" },
  { name: "Mehmet", text: "Rolex Datejust saatini kazandı", value: "", time: "45 saniye önce" },
  { name: "Emre", text: "iPhone 15 Pro’ya", value: "32.750 ₺", time: "1 dakika önce" },
  { name: "Zeynep", text: "PS5 Digital Edition kazandı", value: "", time: "2 dakika önce" },
  { name: "Burak", text: "Dyson Airwrap’a", value: "8.250 ₺", time: "2 dakika önce" },
];

const mostViewed = [
  { name: "MacBook Pro M4", views: "1.249 izlenme", icon: "💻" },
  { name: "iPhone 15 Pro", views: "987 izlenme", icon: "📱" },
  { name: "Rolex Datejust 41", views: "776 izlenme", icon: "⌚" },
  { name: "PS5 Digital Edition", views: "654 izlenme", icon: "🎮" },
  { name: "Dyson Airwrap", views: "512 izlenme", icon: "💨" },
];

const startingSoon = [
  { name: "Tesla Model 3", price: "56.000 ₺", time: "02:15:33", icon: "🚗" },
  { name: 'iPad Pro 12.9" M2', price: "18.000 ₺", time: "03:45:21", icon: "📱" },
  { name: "Louis Vuitton Çanta", price: "12.000 ₺", time: "05:20:11", icon: "👜" },
];

const premiumSellers = [
  { name: "TeknoMarket", score: "4.98", sales: "2.345 satış", icon: "TM" },
  { name: "Saat Dünyası", score: "4.97", sales: "1.051 satış", icon: "SD" },
  { name: "GamerZone", score: "4.96", sales: "892 satış", icon: "GZ" },
];

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
  const seconds = Math.floor((diff % 60_000) / 1000);

  if (hours >= 24) {
    return `${Math.floor(hours / 24)}g ${hours % 24}s`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
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
  const [auctionImage, setAuctionImage] = useState<File | null>(null);
  const [auctionImagePreview, setAuctionImagePreview] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<SelectedAuction>(null);
  const [query, setQuery] = useState("");

  async function loadAuctions() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("auctions")
      .select(
        "id, seller_id, title, description, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
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

  useEffect(() => {
    if (!auctionImage) {
      setAuctionImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(auctionImage);
    setAuctionImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [auctionImage]);

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

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim() },
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
          setShowAuth(false);
          setMessage("Hesabın oluşturuldu ve giriş yapıldı.");
        } else {
          setMessage("E-posta adresine gelen doğrulama bağlantısına tıkla.");
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
        setShowAuth(false);
        setMessage("KapışKapış hesabına giriş yapıldı.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const supabase = getSupabaseBrowserClient();
    const cleanEmail = email.trim().toLowerCase();

    if (!supabase || !cleanEmail) {
      setMessage("Önce e-posta adresini yaz.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    setLoading(false);

    setMessage(
      error
        ? `Şifre sıfırlama hatası: ${error.message}`
        : "Şifre sıfırlama bağlantısı gönderildi."
    );
  }

  async function handleProfileSave() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) return;

    const cleanName = profileName.trim();

    if (cleanName.length < 2) {
      setMessage("Ad soyad en az 2 karakter olmalı.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: cleanName },
    });

    if (!error && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: cleanName,
        email: data.user.email ?? "",
      });
    }

    setLoading(false);

    if (error) {
      setMessage(`Profil güncelleme hatası: ${error.message}`);
      return;
    }

    setUser(data.user);
    setMessage("Profil bilgilerin kaydedildi.");
  }

  async function handleCreateAuction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    const cleanTitle = auctionTitle.trim();
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
      parsedMinIncrement <= 0
    ) {
      setMessage("Fiyat ve minimum artış geçerli olmalı.");
      return;
    }

    setLoading(true);
    let imageUrl: string | null = null;
    let uploadedPath = "";

    try {
      if (auctionImage) {
        if (auctionImage.size > 5 * 1024 * 1024) {
          setMessage("Fotoğraf en fazla 5 MB olabilir.");
          return;
        }

        const extension = auctionImage.name.split(".").pop()?.toLowerCase() || "jpg";
        uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("auction-images")
          .upload(uploadedPath, auctionImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setMessage(`Fotoğraf yükleme hatası: ${uploadError.message}`);
          return;
        }

        const { data } = supabase.storage
          .from("auction-images")
          .getPublicUrl(uploadedPath);

        imageUrl = data.publicUrl;
      }

      const { error } = await supabase.from("auctions").insert({
        seller_id: user.id,
        title: cleanTitle,
        description: auctionDescription.trim(),
        start_price: parsedStartPrice,
        current_price: parsedStartPrice,
        min_increment: parsedMinIncrement,
        ends_at: new Date(
          Date.now() + parsedDurationHours * 60 * 60 * 1000
        ).toISOString(),
        status: "active",
        image_url: imageUrl,
      });

      if (error) {
        if (uploadedPath) {
          await supabase.storage.from("auction-images").remove([uploadedPath]);
        }
        setMessage(`İlan oluşturma hatası: ${error.message}`);
        return;
      }

      setAuctionTitle("");
      setAuctionDescription("");
      setStartPrice("1000");
      setMinIncrement("100");
      setDurationHours("24");
      setAuctionImage(null);
      setShowSell(false);
      setMessage("İlanın yayınlandı.");
      await loadAuctions();
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (!error) {
      setUser(null);
      setMessage("Güvenli şekilde çıkış yapıldı.");
    }
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

  const activeCards = filteredAuctions.length
    ? filteredAuctions
    : demoProducts.map((product, index) => ({
        id: product.id,
        seller_id: "demo",
        title: product.title,
        description: "KapışKapış seçkisi",
        start_price: product.price - 2000,
        current_price: product.price,
        min_increment: 250,
        ends_at: new Date(Date.now() + (index + 1) * 3600000).toISOString(),
        status: "active" as const,
        image_url: product.image,
        created_at: new Date().toISOString(),
      }));

  return (
    <main className="app">
      <header className="navbar">
        <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="brandLogo">KK</span>
          <strong>KAPIŞKAPIŞ</strong>
        </button>

        <div className="navSearch">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ne arıyorsun?"
          />
        </div>

        <div className="navActions">
          <button
            className="sellButton"
            type="button"
            onClick={() => (user ? setShowSell(true) : setShowAuth(true))}
          >
            <span>＋</span> İlan Ver
          </button>
          <button className="iconButton" type="button">♧<small>3</small></button>
          <button className="iconButton" type="button">♡</button>
          <button
            className="profileButton"
            type="button"
            onClick={() => (user ? setMessage("Profilin aktif.") : setShowAuth(true))}
          >
            <span>{(profileName || user?.email || "K").slice(0, 1).toUpperCase()}</span>
          </button>
        </div>
      </header>

      <div className="dashboard">
        <section className="mainColumn">
          <section className="hero">
            <div className="heroCopy">
              <span className="heroKicker">TÜRKİYE'NİN CANLI PAZARYERİ</span>
              <h1>
                Beğendiysen bekleme,
                <br />
                <em>KapışKapış kap.</em>
              </h1>
              <p>Türkiye’nin en güvenli açık artırma platformu</p>

              <div className="heroActions">
                <button
                  className="goldButton"
                  type="button"
                  onClick={() => (user ? setShowSell(true) : setShowAuth(true))}
                >
                  ⚡ Açık Artırmaya Başla
                </button>
                <button
                  className="outlineButton"
                  type="button"
                  onClick={() =>
                    document.getElementById("live-auctions")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  ◉ Canlı Teklifleri İzle
                </button>
              </div>

              <div className="heroTrust">
                <span>🛡 Güvenli Ödeme</span>
                <span>🚚 Kargo Koruması</span>
                <span>✓ Doğrulanmış Satıcı</span>
                <span>🎧 7/24 Destek</span>
              </div>
            </div>

            <div className="heroVisual">
              <div className="glow" />
              <img
                src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"
                alt="Premium ürün"
              />
              <div className="floatingProduct watch">⌚</div>
              <div className="floatingProduct game">🎮</div>
              <div className="floatingProduct laptop">💻</div>
            </div>
          </section>

          <section className="stats">
            {[
              ["🔥", "24.381", "Canlı teklif", "Son 24 saatte"],
              ["👥", "18.219", "Doğrulanmış kullanıcı", "Topluluğumuz"],
              ["🏆", "5.921", "Tamamlanan satış", "Bu ay"],
              ["💰", "54.2M ₺", "İşlem hacmi", "Bu ay"],
            ].map(([icon, value, label, note]) => (
              <article key={label}>
                <span>{icon}</span>
                <div>
                  <strong>{value}</strong>
                  <b>{label}</b>
                  <small>{note}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="panel categories">
            <div className="panelHeader">
              <h2>KATEGORİLER</h2>
              <button type="button">Tüm Kategoriler ›</button>
            </div>
            <div className="categoryGrid">
              {[
                ["📱", "Telefon"],
                ["💻", "Bilgisayar"],
                ["🎮", "Oyun"],
                ["⌚", "Saat"],
                ["🚗", "Araç"],
                ["🛋", "Ev & Yaşam"],
                ["📷", "Kamera"],
                ["💎", "Koleksiyon"],
              ].map(([icon, name]) => (
                <button type="button" key={name}>
                  <span>{icon}</span>
                  <strong>{name}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <div className="titleWithBadge">
                <h2>BUGÜN BİTENLER</h2>
                <span>Son şans!</span>
              </div>
              <button type="button">Tümünü Gör ›</button>
            </div>

            <div className="endingGrid">
              {demoProducts.map((product) => (
                <article className="endingCard" key={product.id}>
                  <div className="productImage">
                    <span className="countdownBadge">{product.time}</span>
                    <button type="button">♡</button>
                    <img src={product.image} alt={product.title} />
                  </div>
                  <h3>{product.title}</h3>
                  <div className="priceLine">
                    <div>
                      <span>Son teklif</span>
                      <strong>{money(product.price)}</strong>
                    </div>
                    <small>{product.bids} teklif</small>
                  </div>
                  <button
                    className="kapisButton"
                    type="button"
                    onClick={() => setMessage("Gerçek teklif sistemi bir sonraki adımda bağlanacak.")}
                  >
                    KAPIŞ!
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel" id="live-auctions">
            <div className="panelHeader">
              <div className="titleWithDot">
                <span />
                <h2>CANLI AÇIK ARTIRMALAR</h2>
              </div>
              <button type="button" onClick={loadAuctions}>Yenile ›</button>
            </div>

            <div className="liveGrid">
              {activeCards.slice(0, 5).map((auction) => (
                <article className="liveCard" key={auction.id}>
                  <div className="liveImage">
                    <span className="liveBadge">● CANLI</span>
                    <button type="button">♡</button>
                    {auction.image_url ? (
                      <img src={auction.image_url} alt={auction.title} />
                    ) : (
                      <div className="imageFallback">🔨</div>
                    )}
                  </div>
                  <h3>{auction.title}</h3>
                  <span className="sellerLine">✓ Doğrulanmış satıcı</span>
                  <div className="liveMeta">
                    <div>
                      <span>Son teklif</span>
                      <strong>{money(Number(auction.current_price))}</strong>
                    </div>
                    <small>{remainingTime(auction.ends_at)}</small>
                  </div>
                  <button
                    className="kapisButton"
                    type="button"
                    onClick={() => setSelectedAuction(auction)}
                  >
                    KAPIŞ!
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="bottomGrid">
            <section className="panel compactPanel">
              <div className="panelHeader">
                <h2>AZ ÖNCE SATILANLAR</h2>
                <button type="button">Tümü ›</button>
              </div>
              {[
                ["Dyson Airwrap Complete", "8.100 ₺"],
                ["Apple Watch Series 9", "13.250 ₺"],
                ["iPhone 13 128GB", "17.750 ₺"],
                ["PlayStation 5", "16.250 ₺"],
              ].map(([name, price]) => (
                <div className="soldRow" key={name}>
                  <span>▣</span>
                  <strong>{name}</strong>
                  <b>{price}</b>
                  <em>Satıldı</em>
                </div>
              ))}
            </section>

            <section className="panel compactPanel">
              <div className="panelHeader">
                <h2>PREMİUM SATICILAR</h2>
                <button type="button">Tümü ›</button>
              </div>
              {premiumSellers.map((seller) => (
                <div className="sellerRow" key={seller.name}>
                  <span>{seller.icon}</span>
                  <div>
                    <strong>{seller.name}</strong>
                    <small>★ {seller.score}</small>
                  </div>
                  <b>{seller.sales}</b>
                </div>
              ))}
            </section>

            <section className="sponsorCard">
              <div>
                <span>SPONSORLU</span>
                <h2>AirPods Max</h2>
                <p>KapışKapış Fırsatı!</p>
                <button type="button">HEMEN KAP!</button>
              </div>
              <img
                src="https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=800&q=80"
                alt="AirPods Max"
              />
            </section>
          </section>
        </section>

        <aside className="sidebar">
          <section className="sidePanel activityPanel">
            <div className="panelHeader">
              <h2>CANLI AKTİVİTE</h2>
              <button type="button">Tümü ›</button>
            </div>

            {activity.map((item, index) => (
              <article className="activityItem" key={`${item.name}-${index}`}>
                <span className="activityAvatar">{item.name.slice(0, 1)}</span>
                <div>
                  <p>
                    <strong>{item.name}</strong>, {item.text}{" "}
                    {item.value && <b>{item.value}</b>}
                  </p>
                  <small>{item.time}</small>
                </div>
              </article>
            ))}

            <div className="pulseCard">
              <div>
                <span>Şu anda</span>
                <strong>{Math.max(421, auctions.length)}</strong>
                <p>açık artırma canlı devam ediyor!</p>
              </div>
              <div className="pulseChart">╱╲╱╲╱╲</div>
            </div>
          </section>

          <section className="sidePanel">
            <div className="panelHeader">
              <h2>EN ÇOK İZLENENLER</h2>
              <button type="button">Tümü ›</button>
            </div>
            {mostViewed.map((item) => (
              <div className="viewedRow" key={item.name}>
                <span>{item.icon}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>◉ {item.views}</small>
                </div>
              </div>
            ))}
          </section>

          <section className="sidePanel">
            <div className="panelHeader">
              <h2>YAKINDA BAŞLAYACAKLAR</h2>
              <button type="button">Tümü ›</button>
            </div>
            {startingSoon.map((item) => (
              <div className="startingRow" key={item.name}>
                <span>{item.icon}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>Başlangıç: {item.price}</small>
                  <b>⏱ {item.time}</b>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>

      {user && (
        <section className="profileDock">
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
              Kaydet
            </button>
          </div>
        </section>
      )}

      <nav className="bottomNav">
        <button className="active" type="button">
          <span>⌂</span>Ana Sayfa
        </button>
        <button type="button">
          <span>⌕</span>Ara
        </button>
        <button
          className="centerAction"
          type="button"
          onClick={() => (user ? setShowSell(true) : setShowAuth(true))}
        >
          <span>＋</span>Kapıştır
        </button>
        <button type="button">
          <span>♧</span>Bildirimler
        </button>
        <button type="button" onClick={() => (user ? setMessage("Profilin aktif.") : setShowAuth(true))}>
          <span>◉</span>Profil
        </button>
      </nav>

      {message && <div className="toast">{message}</div>}

      {showAuth && (
        <div className="modalBackdrop" onMouseDown={() => setShowAuth(false)}>
          <section className="modalCard" onMouseDown={(event) => event.stopPropagation()}>
            <button className="closeButton" type="button" onClick={() => setShowAuth(false)}>×</button>
            <div className="modalBrand">
              <span className="brandLogo">KK</span>
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
                <button className="linkButton" type="button" onClick={handleForgotPassword}>
                  Şifremi unuttum
                </button>
              )}
            </form>
          </section>
        </div>
      )}

      {showSell && (
        <div className="modalBackdrop" onMouseDown={() => setShowSell(false)}>
          <section className="modalCard wideModal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="closeButton" type="button" onClick={() => setShowSell(false)}>×</button>
            <span className="eyebrow">YENİ AÇIK ARTIRMA</span>
            <h2>Ürününü kapıştır</h2>

            <form onSubmit={handleCreateAuction}>
              <label className="imageUploader">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setAuctionImage(event.target.files?.[0] ?? null)}
                />
                {auctionImagePreview ? (
                  <img src={auctionImagePreview} alt="Ürün önizlemesi" />
                ) : (
                  <div>
                    <span>＋</span>
                    <strong>Ürün fotoğrafı ekle</strong>
                    <small>JPG, PNG veya WEBP · En fazla 5 MB</small>
                  </div>
                )}
              </label>

              <label>
                İlan başlığı
                <input
                  value={auctionTitle}
                  onChange={(event) => setAuctionTitle(event.target.value)}
                  placeholder="Örnek: iPhone 15 Pro 256 GB"
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

              <button className="modalPrimary" type="submit" disabled={loading}>
                {loading ? "Yayınlanıyor..." : "Açık artırmayı yayınla"}
              </button>
            </form>
          </section>
        </div>
      )}

      {selectedAuction && (
        <div className="modalBackdrop" onMouseDown={() => setSelectedAuction(null)}>
          <section className="detailModal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="closeButton" type="button" onClick={() => setSelectedAuction(null)}>×</button>
            <div className="detailImage">
              {selectedAuction.image_url ? (
                <img src={selectedAuction.image_url} alt={selectedAuction.title} />
              ) : (
                <div className="imageFallback">🔨</div>
              )}
            </div>
            <div className="detailContent">
              <span className="liveBadge">● CANLI</span>
              <h2>{selectedAuction.title}</h2>
              <p>{selectedAuction.description}</p>
              <div className="detailPrice">
                <span>Güncel teklif</span>
                <strong>{money(Number(selectedAuction.current_price))}</strong>
              </div>
              <div className="detailInfo">
                <span>Minimum artış</span>
                <b>{money(Number(selectedAuction.min_increment))}</b>
              </div>
              <div className="detailInfo">
                <span>Kalan süre</span>
                <b>{remainingTime(selectedAuction.ends_at)}</b>
              </div>
              <button
                className="kapisButton large"
                type="button"
                onClick={() => setMessage("Gerçek teklif sistemi sıradaki adımda bağlanacak.")}
              >
                KAPIŞ!
              </button>
            </div>
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
          background: #05080c;
          color: #f4f6f8;
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

        .app {
          min-height: 100vh;
          padding-bottom: 92px;
          background:
            radial-gradient(circle at 15% 10%, rgba(255, 183, 0, 0.06), transparent 24%),
            linear-gradient(180deg, #05080c 0%, #071018 55%, #05080c 100%);
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: grid;
          grid-template-columns: auto minmax(260px, 1fr) auto;
          align-items: center;
          gap: 28px;
          padding: 18px 28px;
          border-bottom: 1px solid #1a222b;
          background: rgba(5, 8, 12, 0.9);
          backdrop-filter: blur(18px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0;
          background: transparent;
          color: white;
        }

        .brandLogo {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #ffd35b, #f2a900);
          color: #080a0d;
          font-weight: 1000;
          letter-spacing: -0.12em;
          box-shadow: 0 10px 30px rgba(255, 187, 0, 0.24);
        }

        .brand strong {
          font-size: 19px;
          letter-spacing: 0.04em;
        }

        .navSearch {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 12px;
          max-width: 620px;
          padding: 0 16px;
          border: 1px solid #1f2832;
          border-radius: 14px;
          background: #10161d;
        }

        .navSearch span {
          color: #8d98a5;
          font-size: 22px;
        }

        .navSearch input {
          border: 0;
          outline: none;
          padding: 13px 0;
          background: transparent;
          color: white;
        }

        .navActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sellButton {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #5a4410;
          border-radius: 13px;
          padding: 10px 15px;
          background: #13100a;
          color: #ffc43d;
          font-weight: 850;
        }

        .sellButton span {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ffc43d;
          color: #080a0d;
        }

        .iconButton,
        .profileButton {
          position: relative;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: white;
          font-size: 22px;
        }

        .iconButton small {
          position: absolute;
          top: 1px;
          right: 0;
          width: 16px;
          height: 16px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          font-size: 9px;
          font-weight: 900;
        }

        .profileButton span {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 2px solid #d9b24a;
          border-radius: 50%;
          background: #222b34;
          font-weight: 900;
        }

        .dashboard {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 18px;
          padding: 0 22px 36px;
        }

        .mainColumn {
          min-width: 0;
        }

        .hero {
          position: relative;
          min-height: 330px;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
          overflow: hidden;
          margin-top: 4px;
          border: 1px solid #202a34;
          border-radius: 18px;
          background:
            radial-gradient(circle at 65% 45%, rgba(255, 176, 0, 0.22), transparent 30%),
            linear-gradient(135deg, #080b0f 0%, #15100a 100%);
        }

        .heroCopy {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 42px 30px;
        }

        .heroKicker,
        .eyebrow {
          color: #d9a319;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .hero h1 {
          margin: 12px 0 0;
          font-size: clamp(38px, 5vw, 68px);
          line-height: 1.02;
          letter-spacing: -0.05em;
        }

        .hero h1 em {
          color: #ffc43d;
          font-style: normal;
        }

        .hero p {
          margin: 18px 0 0;
          color: #c5cbd2;
          font-size: 16px;
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .goldButton,
        .outlineButton {
          border-radius: 11px;
          padding: 13px 16px;
          font-weight: 900;
        }

        .goldButton {
          border: 0;
          background: linear-gradient(135deg, #ffd45f, #f6ad08);
          color: #0b0d0f;
          box-shadow: 0 12px 28px rgba(255, 184, 0, 0.18);
        }

        .outlineButton {
          border: 1px solid #5d4a1b;
          background: rgba(10, 12, 14, 0.72);
          color: white;
        }

        .heroTrust {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 34px;
          padding-top: 20px;
          border-top: 1px solid #2a2d2f;
          color: #bbc1c8;
          font-size: 10px;
        }

        .heroVisual {
          position: relative;
          min-height: 330px;
        }

        .heroVisual img {
          position: absolute;
          right: 10%;
          bottom: 0;
          width: 45%;
          max-height: 82%;
          object-fit: cover;
          border-radius: 24px 24px 0 0;
          filter: saturate(0.8) contrast(1.05);
          opacity: 0.92;
          box-shadow: 0 0 70px rgba(255, 187, 0, 0.2);
        }

        .glow {
          position: absolute;
          inset: 20% 10%;
          border-radius: 50%;
          background: rgba(255, 174, 0, 0.18);
          filter: blur(50px);
        }

        .floatingProduct {
          position: absolute;
          z-index: 2;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 194, 61, 0.25);
          border-radius: 18px;
          background: rgba(11, 14, 18, 0.78);
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(14px);
        }

        .floatingProduct.watch {
          top: 22%;
          left: 7%;
          width: 82px;
          height: 82px;
          font-size: 50px;
          transform: rotate(-8deg);
        }

        .floatingProduct.game {
          right: 4%;
          bottom: 6%;
          width: 100px;
          height: 100px;
          font-size: 60px;
          transform: rotate(8deg);
        }

        .floatingProduct.laptop {
          left: 18%;
          bottom: 2%;
          width: 110px;
          height: 82px;
          font-size: 54px;
          transform: rotate(-4deg);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 16px 0;
          padding: 14px;
          border: 1px solid #1d2731;
          border-radius: 16px;
          background: #0a1016;
        }

        .stats article {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
        }

        .stats article > span {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 187, 0, 0.14);
          font-size: 22px;
        }

        .stats div {
          display: grid;
        }

        .stats strong {
          color: #ffc43d;
          font-size: 22px;
        }

        .stats b {
          margin-top: 2px;
          font-size: 11px;
        }

        .stats small {
          margin-top: 3px;
          color: #7f8a96;
          font-size: 9px;
        }

        .panel,
        .sidePanel {
          border: 1px solid #1b2530;
          border-radius: 16px;
          background: #091017;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
        }

        .panel {
          margin-bottom: 16px;
          padding: 14px;
        }

        .sidePanel {
          padding: 14px;
        }

        .panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .panelHeader h2 {
          margin: 0;
          font-size: 13px;
          letter-spacing: 0.02em;
        }

        .panelHeader button {
          border: 0;
          background: transparent;
          color: #9ba4ae;
          font-size: 10px;
        }

        .categoryGrid {
          display: grid;
          grid-template-columns: repeat(8, minmax(88px, 1fr));
          gap: 10px;
        }

        .categoryGrid button {
          min-height: 98px;
          display: grid;
          place-items: center;
          gap: 8px;
          border: 1px solid #26313c;
          border-radius: 12px;
          background: linear-gradient(145deg, #0c131a, #111922);
          color: white;
        }

        .categoryGrid span {
          font-size: 34px;
        }

        .categoryGrid strong {
          font-size: 10px;
        }

        .titleWithBadge,
        .titleWithDot {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .titleWithBadge span {
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.16);
          color: #ff706f;
          font-size: 9px;
          font-weight: 900;
        }

        .titleWithDot > span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #24c96b;
          box-shadow: 0 0 12px rgba(36, 201, 107, 0.5);
        }

        .endingGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .endingCard,
        .liveCard {
          overflow: hidden;
          border: 1px solid #25303b;
          border-radius: 13px;
          background: linear-gradient(180deg, #0b1117, #080d12);
        }

        .endingCard {
          padding: 10px;
        }

        .productImage,
        .liveImage {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          background: #0c1116;
        }

        .productImage {
          height: 160px;
        }

        .productImage img,
        .liveImage img,
        .detailImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .countdownBadge,
        .liveBadge {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 2;
          padding: 5px 7px;
          border-radius: 7px;
          color: white;
          font-size: 9px;
          font-weight: 950;
        }

        .countdownBadge {
          background: #d94a4f;
        }

        .liveBadge {
          background: #1aa75d;
        }

        .productImage button,
        .liveImage button {
          position: absolute;
          top: 7px;
          right: 7px;
          z-index: 2;
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 50%;
          background: rgba(8, 11, 14, 0.66);
          color: white;
          font-size: 17px;
        }

        .endingCard h3,
        .liveCard h3 {
          margin: 11px 0 8px;
          font-size: 13px;
        }

        .priceLine,
        .liveMeta {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 8px;
        }

        .priceLine div,
        .liveMeta div {
          display: grid;
        }

        .priceLine span,
        .liveMeta span {
          color: #84909c;
          font-size: 9px;
        }

        .priceLine strong,
        .liveMeta strong {
          margin-top: 3px;
          color: #ffc43d;
          font-size: 17px;
        }

        .priceLine small,
        .liveMeta small {
          color: #a7afb8;
          font-size: 9px;
        }

        .kapisButton {
          width: 100%;
          margin-top: 10px;
          border: 0;
          border-radius: 8px;
          padding: 10px;
          background: linear-gradient(135deg, #ffd45f, #f3aa00);
          color: #0a0c0f;
          font-weight: 950;
          font-size: 11px;
        }

        .kapisButton.large {
          padding: 14px;
          font-size: 14px;
        }

        .liveGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .liveCard {
          padding: 9px;
        }

        .liveImage {
          height: 120px;
        }

        .sellerLine {
          color: #7796bb;
          font-size: 9px;
        }

        .imageFallback {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 54px;
        }

        .bottomGrid {
          display: grid;
          grid-template-columns: 1fr 1fr 1.15fr;
          gap: 16px;
        }

        .compactPanel {
          margin: 0;
        }

        .soldRow,
        .sellerRow,
        .viewedRow,
        .startingRow {
          display: grid;
          align-items: center;
          gap: 10px;
          padding: 9px 0;
          border-top: 1px solid #18222c;
        }

        .soldRow {
          grid-template-columns: auto 1fr auto auto;
        }

        .soldRow span {
          color: #a6b0ba;
        }

        .soldRow strong,
        .soldRow b {
          font-size: 10px;
        }

        .soldRow em {
          color: #2bcf73;
          font-size: 9px;
          font-style: normal;
        }

        .sellerRow {
          grid-template-columns: auto 1fr auto;
        }

        .sellerRow > span {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ffc43d;
          color: #0a0c0f;
          font-size: 10px;
          font-weight: 950;
        }

        .sellerRow div {
          display: grid;
        }

        .sellerRow strong,
        .sellerRow b {
          font-size: 10px;
        }

        .sellerRow small {
          color: #ffc43d;
          font-size: 9px;
        }

        .sponsorCard {
          position: relative;
          min-height: 210px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          border: 1px solid #49350f;
          border-radius: 16px;
          background: linear-gradient(135deg, #2b1b08, #0b0d0f);
        }

        .sponsorCard > div {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px;
        }

        .sponsorCard span {
          color: #8a7650;
          font-size: 8px;
        }

        .sponsorCard h2 {
          margin: 10px 0 4px;
          font-size: 28px;
        }

        .sponsorCard p {
          margin: 0;
          color: #d4d7dc;
        }

        .sponsorCard button {
          align-self: flex-start;
          margin-top: 18px;
          border: 0;
          border-radius: 8px;
          padding: 10px 13px;
          background: #ffc43d;
          color: #0b0d0f;
          font-weight: 900;
        }

        .sponsorCard img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.72;
          mask-image: linear-gradient(to right, transparent, black 40%);
        }

        .sidebar {
          display: grid;
          align-content: start;
          gap: 16px;
          padding-top: 4px;
        }

        .activityItem {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 9px;
          padding: 10px 0;
          border-top: 1px solid #18222c;
        }

        .activityAvatar {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #303a45, #141a20);
          font-size: 11px;
          font-weight: 900;
        }

        .activityItem p {
          margin: 0;
          color: #c4cad1;
          font-size: 10px;
          line-height: 1.45;
        }

        .activityItem p strong {
          color: white;
        }

        .activityItem p b {
          color: #ffc43d;
        }

        .activityItem small {
          color: #717c88;
          font-size: 8px;
        }

        .pulseCard {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          padding: 14px;
          border: 1px solid #5a4210;
          border-radius: 12px;
          background: linear-gradient(135deg, #2a1d08, #11100c);
        }

        .pulseCard div:first-child {
          display: grid;
        }

        .pulseCard span,
        .pulseCard p {
          color: #d8dde3;
          font-size: 9px;
        }

        .pulseCard strong {
          color: #ffc43d;
          font-size: 18px;
        }

        .pulseCard p {
          margin: 3px 0 0;
        }

        .pulseChart {
          color: #ffc43d;
          letter-spacing: -2px;
        }

        .viewedRow,
        .startingRow {
          grid-template-columns: auto 1fr;
        }

        .viewedRow > span,
        .startingRow > span {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #111923;
          font-size: 26px;
        }

        .viewedRow div,
        .startingRow div {
          display: grid;
        }

        .viewedRow strong,
        .startingRow strong {
          font-size: 10px;
        }

        .viewedRow small,
        .startingRow small {
          margin-top: 3px;
          color: #8a95a1;
          font-size: 8px;
        }

        .startingRow b {
          margin-top: 4px;
          color: #ffc43d;
          font-size: 9px;
        }

        .profileDock {
          display: grid;
          grid-template-columns: 1fr minmax(280px, 0.7fr);
          align-items: center;
          gap: 18px;
          margin: 0 22px 24px;
          padding: 22px;
          border: 1px solid #1c2630;
          border-radius: 16px;
          background: #0a1016;
        }

        .profileDock h2 {
          margin: 4px 0 0;
        }

        .profileFields {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .profileFields input,
        form input,
        form textarea,
        form select {
          width: 100%;
          border: 1px solid #2a3540;
          border-radius: 10px;
          padding: 12px;
          background: #0b1219;
          color: white;
          outline: none;
        }

        .profileFields button {
          border: 0;
          border-radius: 10px;
          padding: 12px 15px;
          background: #ffc43d;
          font-weight: 900;
        }

        .bottomNav {
          position: fixed;
          left: 22px;
          right: 22px;
          bottom: 14px;
          z-index: 45;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          padding: 8px;
          border: 1px solid #1c2630;
          border-radius: 18px;
          background: rgba(8, 13, 18, 0.94);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.42);
          backdrop-filter: blur(18px);
        }

        .bottomNav button {
          display: grid;
          place-items: center;
          gap: 2px;
          border: 0;
          background: transparent;
          color: #a4adb7;
          font-size: 9px;
          font-weight: 800;
        }

        .bottomNav button span {
          font-size: 21px;
        }

        .bottomNav .active {
          color: #ffc43d;
        }

        .bottomNav .centerAction {
          margin-top: -24px;
        }

        .bottomNav .centerAction span {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border: 4px solid #3d2c07;
          border-radius: 50%;
          background: #ffc43d;
          color: #0b0d0f;
          box-shadow: 0 0 30px rgba(255, 196, 61, 0.35);
        }

        .toast {
          position: fixed;
          right: 22px;
          bottom: 92px;
          z-index: 70;
          max-width: 420px;
          padding: 13px 15px;
          border: 1px solid #33404d;
          border-radius: 12px;
          background: #0d151d;
          color: white;
          font-size: 11px;
          box-shadow: 0 16px 44px rgba(0, 0, 0, 0.34);
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(2, 5, 8, 0.82);
          backdrop-filter: blur(12px);
        }

        .modalCard,
        .detailModal {
          position: relative;
          width: min(100%, 460px);
          max-height: calc(100vh - 36px);
          overflow-y: auto;
          border: 1px solid #2a3540;
          border-radius: 18px;
          background: #091017;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5);
        }

        .modalCard {
          padding: 24px;
        }

        .wideModal {
          width: min(100%, 640px);
        }

        .closeButton {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 3;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #17212b;
          color: white;
          font-size: 20px;
        }

        .modalBrand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .modalBrand div {
          display: grid;
        }

        .modalBrand small {
          color: #8b96a2;
        }

        .tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 18px;
          padding: 5px;
          border-radius: 12px;
          background: #111923;
        }

        .tabs button {
          border: 0;
          border-radius: 9px;
          padding: 10px;
          background: transparent;
          color: #88939f;
          font-weight: 800;
        }

        .tabs button.active {
          background: #ffc43d;
          color: #0a0c0f;
        }

        form {
          display: grid;
          gap: 14px;
        }

        form label {
          display: grid;
          gap: 7px;
          color: #b8c0c8;
          font-size: 11px;
          font-weight: 800;
        }

        form textarea {
          resize: vertical;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .modalPrimary {
          border: 0;
          border-radius: 10px;
          padding: 13px;
          background: #ffc43d;
          color: #0a0c0f;
          font-weight: 950;
        }

        .linkButton {
          border: 0;
          background: transparent;
          color: #ffc43d;
          font-weight: 800;
        }

        .imageUploader {
          overflow: hidden;
          min-height: 190px;
          border: 1px dashed #536170;
          border-radius: 14px;
          background: #0c141c;
          cursor: pointer;
        }

        .imageUploader input {
          display: none;
        }

        .imageUploader img {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .imageUploader > div {
          min-height: 190px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 8px;
          color: #aeb6bf;
        }

        .imageUploader > div span {
          font-size: 34px;
        }

        .imageUploader > div small {
          color: #76818c;
        }

        .detailModal {
          width: min(100%, 900px);
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          overflow: hidden;
        }

        .detailImage {
          min-height: 500px;
          background: #0b1117;
        }

        .detailContent {
          position: relative;
          padding: 34px;
        }

        .detailContent .liveBadge {
          position: static;
          display: inline-flex;
        }

        .detailContent h2 {
          margin: 18px 0 10px;
          font-size: 30px;
        }

        .detailContent p {
          color: #929da8;
          line-height: 1.6;
        }

        .detailPrice {
          display: grid;
          margin: 28px 0;
          padding: 18px;
          border: 1px solid #3c300f;
          border-radius: 13px;
          background: #151207;
        }

        .detailPrice span {
          color: #9b9587;
          font-size: 10px;
        }

        .detailPrice strong {
          margin-top: 4px;
          color: #ffc43d;
          font-size: 34px;
        }

        .detailInfo {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #202a34;
          color: #9aa4ae;
          font-size: 12px;
        }

        .detailInfo b {
          color: white;
        }

        @media (max-width: 1180px) {
          .dashboard {
            grid-template-columns: 1fr;
          }

          .sidebar {
            grid-template-columns: repeat(3, 1fr);
          }

          .categoryGrid {
            grid-template-columns: repeat(4, minmax(88px, 1fr));
          }

          .liveGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .navbar {
            grid-template-columns: 1fr auto;
            gap: 12px;
          }

          .navSearch {
            grid-column: 1 / -1;
            grid-row: 2;
            max-width: none;
          }

          .brand strong,
          .sellButton,
          .iconButton {
            display: none;
          }

          .dashboard {
            padding: 0 12px 28px;
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .heroVisual {
            display: none;
          }

          .heroTrust {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .endingGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .liveGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .bottomGrid,
          .sidebar {
            grid-template-columns: 1fr;
          }

          .profileDock {
            grid-template-columns: 1fr;
            margin: 0 12px 24px;
          }
        }

        @media (max-width: 560px) {
          .heroCopy {
            padding: 30px 20px;
          }

          .hero h1 {
            font-size: 42px;
          }

          .categoryGrid {
            display: flex;
            overflow-x: auto;
          }

          .categoryGrid button {
            min-width: 90px;
          }

          .endingGrid,
          .liveGrid {
            grid-template-columns: 1fr;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .detailModal {
            grid-template-columns: 1fr;
          }

          .detailImage {
            min-height: 280px;
          }

          .formGrid,
          .profileFields {
            grid-template-columns: 1fr;
          }

          .bottomNav {
            left: 10px;
            right: 10px;
          }
        }
      `}</style>
    </main>
  );
}
