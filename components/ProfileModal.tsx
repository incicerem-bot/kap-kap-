"use client";

import { useState } from "react";
import type { Auction, AuctionOrder, ProfileSummary } from "./types";

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type ProfileTab = "listings" | "bids" | "favorites" | "won" | "orders";

type ProfileModalProps = {
  open: boolean;
  profile: ProfileSummary | null;
  myAuctions: Auction[];
  bidAuctions: Auction[];
  favoriteAuctions: Auction[];
  wonAuctions: Auction[];
  orders: AuctionOrder[];
  loading: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onOpenAuction: (auction: Auction) => void;
  onOpenOrder: (order: AuctionOrder) => void;
  onOpenSell: () => void;
  onOpenFounderPanel: () => void;
  onOpenAddresses: () => void;
  onOpenProfileSettings: () => void;
  onSignOut: () => void;
};

export default function ProfileModal({
  open,
  profile,
  myAuctions,
  bidAuctions,
  favoriteAuctions,
  wonAuctions,
  orders,
  loading,
  isAdmin,
  onClose,
  onOpenAuction,
  onOpenOrder,
  onOpenSell,
  onOpenFounderPanel,
  onOpenAddresses,
  onOpenProfileSettings,
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
          : activeTab === "won"
            ? wonAuctions
            : [];

  const sectionTitle =
    activeTab === "listings"
      ? "Aktif ilanlarım"
      : activeTab === "bids"
        ? "Teklif verdiklerim"
        : activeTab === "favorites"
          ? "Favorilerim"
          : activeTab === "won"
            ? "Kazandıklarım"
            : "Siparişlerim";

  const emptyTitle =
    activeTab === "listings"
      ? "Henüz aktif ilanın yok."
      : activeTab === "bids"
        ? "Henüz teklif verdiğin ilan yok."
        : activeTab === "favorites"
          ? "Henüz favori ilanın yok."
          : activeTab === "won"
            ? "Henüz kazandığın açık artırma yok."
            : "Henüz siparişin yok.";

  const emptyDescription =
    activeTab === "listings"
      ? "İlk ilanını oluşturarak satışa başla."
      : activeTab === "bids"
        ? "Canlı açık artırmalara katıldığında ilanlar burada görünür."
        : activeTab === "favorites"
          ? "Beğendiğin ilanları favoriye eklediğinde burada saklanır."
          : activeTab === "won"
            ? "En yüksek teklifle tamamladığın ürünler burada görünür."
            : "Kazandığın veya sattığın ürünlerin teslimat akışı burada görünür.";

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
          <button className={activeTab === "orders" ? "profileActionActive" : ""} type="button" onClick={() => setActiveTab("orders")}>
            <span>05</span><strong>Siparişlerim</strong><small>Ödeme ve kargo takibi</small>
          </button>
          <button type="button" onClick={onOpenAddresses}>
            <span>06</span><strong>Adreslerim</strong><small>Teslimat adreslerini yönet</small>
          </button>
          <button type="button" onClick={onOpenProfileSettings}>
            <span>07</span><strong>Profil ayarları</strong><small>Kullanıcı ve mağaza bilgileri</small>
          </button>
          <button className={activeTab === "listings" ? "profileActionActive" : ""} type="button" onClick={() => setActiveTab("listings")}>
            <span>06</span><strong>İlanlarım</strong><small>Satıştaki ürünlerini yönet</small>
          </button>
        </section>

        <section className="myListingsSection">
          <div className="profileSectionHeader">
            <div><span>YÖNETİM</span><h3>{sectionTitle}</h3></div>
            {activeTab === "listings" && <button type="button" onClick={onOpenSell}>Yeni ilan</button>}
          </div>

          {loading ? (
            <div className="profileEmptyState">Bilgiler yükleniyor...</div>
          ) : activeTab === "orders" ? (
            orders.length === 0 ? (
              <div className="profileEmptyState">
                <strong>{emptyTitle}</strong>
                <span>{emptyDescription}</span>
              </div>
            ) : (
              <div className="profileOrdersGrid">
                {orders.map((order) => (
                  <button
                    className="profileOrderCard"
                    type="button"
                    key={order.id}
                    onClick={() => onOpenOrder(order)}
                  >
                    <div className="profileOrderImage">
                      {order.auction?.image_url ? (
                        <img
                          src={order.auction.image_url}
                          alt={order.auction.title}
                        />
                      ) : (
                        <span>KK</span>
                      )}
                    </div>
                    <div>
                      <strong>
                        {order.auction?.title || "Açık artırma siparişi"}
                      </strong>
                      <span>{money(Number(order.amount))}</span>
                      <small>
                        {order.status === "payment_pending"
                          ? "Ödeme bekleniyor"
                          : order.status === "paid"
                            ? "Ödeme alındı"
                            : order.status === "preparing"
                              ? "Hazırlanıyor"
                              : order.status === "shipped"
                                ? "Kargoya verildi"
                                : order.status === "delivered"
                                  ? "Teslim edildi"
                                  : "İptal edildi"}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            )
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

        {isAdmin && (
          <section className="founderEntry adminFounderEntry">
            <div>
              <span>YÖNETİCİ</span>
              <strong>Kurucu ve güvenlik araçları</strong>
              <small>
                Test verileri, ilan moderasyonu ve platform yönetimi.
              </small>
            </div>
            <button type="button" onClick={onOpenFounderPanel}>
              Yönetim Panelini Aç
            </button>
          </section>
        )}

        <footer className="profileFooter">
          <div><strong>KapışKapış Güven Merkezi</strong><span>Hesabın ve işlemlerin güvenle korunur.</span></div>
          <button type="button" onClick={onSignOut}>Çıkış yap</button>
        </footer>
      </section>
    </div>
  );
}
