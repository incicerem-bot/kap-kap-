"use client";

import type { Auction, ProfileSummary } from "./types";

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type ProfileModalProps = {
  open: boolean;
  profile: ProfileSummary | null;
  myAuctions: Auction[];
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
  loading,
  onClose,
  onOpenAuction,
  onOpenSell,
  onSignOut,
}: ProfileModalProps) {
  if (!open) return null;

  return (
    <div className="modalBackdrop profileBackdrop" onMouseDown={onClose}>
      <section className="profileCenter" onMouseDown={(event) => event.stopPropagation()}>
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header className="profileHero">
          <div className="profileIdentity">
            <span className="profileAvatarLarge">
              {(profile?.full_name || profile?.email || "K").slice(0, 1).toLocaleUpperCase("tr")}
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
          <article><span>Üyelik yılı</span><strong>{profile?.created_at ? new Date(profile.created_at).getFullYear() : "—"}</strong></article>
        </section>

        <section className="profileQuickActions">
          <button type="button" onClick={onOpenSell}><span>01</span><strong>Yeni ilan oluştur</strong><small>Ürününü açık artırmaya çıkar</small></button>
          <button type="button"><span>02</span><strong>Tekliflerim</strong><small>Katıldığın açık artırmalar</small></button>
          <button type="button"><span>03</span><strong>Favorilerim</strong><small>Kaydettiğin ilanlar</small></button>
          <button type="button"><span>04</span><strong>Hesap ayarları</strong><small>Profil ve güvenlik seçenekleri</small></button>
        </section>

        <section className="myListingsSection">
          <div className="profileSectionHeader">
            <div><span>YÖNETİM</span><h3>Aktif ilanlarım</h3></div>
            <button type="button" onClick={onOpenSell}>Yeni ilan</button>
          </div>

          {loading ? (
            <div className="profileEmptyState">İlanlar yükleniyor...</div>
          ) : myAuctions.length === 0 ? (
            <div className="profileEmptyState">
              <strong>Henüz aktif ilanın yok.</strong>
              <span>İlk ilanını oluşturarak satışa başla.</span>
              <button type="button" onClick={onOpenSell}>İlan oluştur</button>
            </div>
          ) : (
            <div className="myListingsGrid">
              {myAuctions.map((auction) => (
                <button className="myListingCard" type="button" key={auction.id} onClick={() => onOpenAuction(auction)}>
                  <div className="myListingImage">
                    {auction.image_url ? <img src={auction.image_url} alt={auction.title} /> : <span>KK</span>}
                  </div>
                  <div className="myListingContent">
                    <strong>{auction.title}</strong>
                    <span>{money(Number(auction.current_price))}</span>
                    <small>Aktif açık artırma</small>
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
