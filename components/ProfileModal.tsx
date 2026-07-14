"use client";

import { useState } from "react";
import type { Auction, ProfileSummary } from "./types";

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type ProfileTab = "listings" | "bids" | "favorites" | "won";

type ProfileModalProps = {
  open: boolean;
  profile: ProfileSummary | null;
  myAuctions: Auction[];
  bidAuctions: Auction[];
  favoriteAuctions: Auction[];
  wonAuctions: Auction[];
  loading: boolean;
  onClose: () => void;
  onOpenAuction: (auction: Auction) => void;
  onOpenSell: () => void;
  onSignOut: () => void;
};

export default function ProfileModal({
  open,
  profile,
  myAuctions,
  bidAuctions,
  favoriteAuctions,
  wonAuctions,
  loading,
  onClose,
  onOpenAuction,
  onOpenSell,
  onSignOut,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");

  if (!open) return null;

  const activeItems =
    activeTab === "listings"
      ? myAuctions
      : activeTab === "bids"
        ? bidAuctions
        : activeTab === "favorites"
          ? favoriteAuctions
          : wonAuctions;

  const sectionTitle =
    activeTab === "listings"
      ? "Aktif ilanlarım"
      : activeTab === "bids"
        ? "Teklif verdiklerim"
        : activeTab === "favorites"
          ? "Favorilerim"
          : "Kazandıklarım";

  const emptyTitle =
    activeTab === "listings"
      ? "Henüz aktif ilanın yok."
      : activeTab === "bids"
        ? "Henüz teklif verdiğin ilan yok."
        : activeTab === "favorites"
          ? "Henüz favori ilanın yok."
          : "Henüz kazandığın açık artırma yok.";

  const emptyDescription =
    activeTab === "listings"
      ? "İlk ilanını oluşturarak satışa başla."
      : activeTab === "bids"
        ? "Canlı açık artırmalara katıldığında ilanlar burada görünür."
        : activeTab === "favorites"
          ? "Beğendiğin ilanları favoriye eklediğinde burada saklanır."
          : "En yüksek teklifle tamamladığın ürünler burada görünür.";

  return (
    <div className="modalBackdrop profileBackdrop" onMouseDown={onClose}>
      <section
        className="profileCenter"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header className="profileHero">
          <div className="profileIdentity">
            <span className="profileAvatarLarge">
              {(profile?.full_name || profile?.email || "K")
                .slice(0, 1)
                .toLocaleUpperCase("tr")}
            </span>
            <div>
              <span className="profileEyebrow">KAPIŞKAPIŞ HESABI</span>
              <h2>{profile?.full_name || "Kullanıcı"}</h2>
              <p>{profile?.email || "Profil bilgisi yükleniyor..."}</p>
            </div>
          </div>
          <div className="profileVerification">
            <span>Doğrulanmış hesap</span>
            <strong>Aktif</strong>
          </div>
        </header>

        <section className="profileStats">
          <article><span>Aktif ilan</span><strong>{profile?.active_listings ?? 0}</strong></article>
          <article><span>Favoriler</span><strong>{profile?.favorite_count ?? 0}</strong></article>
          <article><span>Verilen teklifler</span><strong>{profile?.bid_count ?? 0}</strong></article>
          <article>
            <span>Üyelik yılı</span>
            <strong>{profile?.created_at ? new Date(profile.created_at).getFullYear() : "—"}</strong>
          </article>
        </section>

        <section className="profileQuickActions profileQuickActionsFive">
          <button type="button" onClick={onOpenSell}>
            <span>01</span><strong>Yeni ilan oluştur</strong><small>Ürününü açık artırmaya çıkar</small>
          </button>
          <button className={activeTab === "bids" ? "profileActionActive" : ""} type="button" onClick={() => setActiveTab("bids")}>
            <span>02</span><strong>Tekliflerim</strong><small>Katıldığın açık artırmalar</small>
          </button>
          <button className={activeTab === "favorites" ? "profileActionActive" : ""} type="button" onClick={() => setActiveTab("favorites")}>
            <span>03</span><strong>Favorilerim</strong><small>Kaydettiğin ilanlar</small>
          </button>
          <button className={activeTab === "won" ? "profileActionActive" : ""} type="button" onClick={() => setActiveTab("won")}>
            <span>04</span><strong>Kazandıklarım</strong><small>Tamamlanan kazançların</small>
          </button>
          <button className={activeTab === "listings" ? "profileActionActive" : ""} type="button" onClick={() => setActiveTab("listings")}>
            <span>05</span><strong>İlanlarım</strong><small>Satıştaki ürünlerini yönet</small>
          </button>
        </section>

        <section className="myListingsSection">
          <div className="profileSectionHeader">
            <div><span>YÖNETİM</span><h3>{sectionTitle}</h3></div>
            {activeTab === "listings" && <button type="button" onClick={onOpenSell}>Yeni ilan</button>}
          </div>

          {loading ? (
            <div className="profileEmptyState">Bilgiler yükleniyor...</div>
          ) : activeItems.length === 0 ? (
            <div className="profileEmptyState">
              <strong>{emptyTitle}</strong>
              <span>{emptyDescription}</span>
              {activeTab === "listings" && <button type="button" onClick={onOpenSell}>İlan oluştur</button>}
            </div>
          ) : (
            <div className="myListingsGrid">
              {activeItems.map((auction) => (
                <button className="myListingCard" type="button" key={auction.id} onClick={() => onOpenAuction(auction)}>
                  <div className="myListingImage">
                    {auction.image_url ? <img src={auction.image_url} alt={auction.title} /> : <span>KK</span>}
                  </div>
                  <div className="myListingContent">
                    <strong>{auction.title}</strong>
                    <span>{money(Number(auction.current_price))}</span>
                    <small>
                      {activeTab === "listings"
                        ? "Aktif açık artırma"
                        : activeTab === "bids"
                          ? "Teklif verdiğin ilan"
                          : activeTab === "favorites"
                            ? "Favori ilan"
                            : "Kazandığın açık artırma"}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <footer className="profileFooter">
          <div><strong>KapışKapış Güven Merkezi</strong><span>Hesabın ve işlemlerin güvenle korunur.</span></div>
          <button type="button" onClick={onSignOut}>Çıkış yap</button>
        </footer>
      </section>
    </div>
  );
}
