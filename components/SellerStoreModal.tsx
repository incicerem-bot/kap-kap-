"use client";

import type { Auction, SellerStoreSummary } from "./types";

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type Props = {
  open: boolean;
  summary: SellerStoreSummary | null;
  loading: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  currentUserId: string;
  onClose: () => void;
  onToggleFollow: () => void;
  onOpenAuction: (auction: Auction) => void;
};

export default function SellerStoreModal({
  open,
  summary,
  loading,
  isFollowing,
  followLoading,
  currentUserId,
  onClose,
  onToggleFollow,
  onOpenAuction,
}: Props) {
  if (!open) return null;

  const ownStore = summary?.seller_id === currentUserId;

  return (
    <div className="modalBackdrop sellerStoreBackdrop" onMouseDown={onClose}>
      <section
        className="sellerStoreModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        {summary?.seller_profile?.cover_url && (
          <div className="sellerStoreCover">
            <img
              src={summary.seller_profile.cover_url}
              alt={summary.seller_profile.store_name}
            />
          </div>
        )}

        <header className="sellerStoreHeader">
          <div className="sellerStoreIdentity">
            <span className="sellerStoreAvatar">
              {summary?.seller_profile?.logo_url || summary?.avatar_url ? (
                <img
                  src={
                    summary?.seller_profile?.logo_url ||
                    summary?.avatar_url ||
                    ""
                  }
                  alt={summary?.seller_name || "Satıcı"}
                />
              ) : (
                (summary?.seller_name || "K")
                  .slice(0, 1)
                  .toLocaleUpperCase("tr")
              )}
            </span>
            <div>
              <span>
                {summary?.seller_profile?.verified
                  ? "DOĞRULANMIŞ SATICI"
                  : "SATICI MAĞAZASI"}
              </span>
              <h2>
                {summary?.seller_profile?.store_name ||
                  summary?.seller_name ||
                  "KapışKapış Satıcısı"}
              </h2>
              <p>
                {summary?.seller_profile?.description ||
                  summary?.bio ||
                  "Doğrulanmış satıcı profili ve aktif açık artırmalar."}
              </p>
              {(summary?.username || summary?.city) && (
                <small>
                  {summary?.username ? `@${summary.username}` : ""}
                  {summary?.username && summary?.city ? " · " : ""}
                  {summary?.city || ""}
                </small>
              )}
            </div>
          </div>

          {!ownStore && (
            <button
              className={isFollowing ? "sellerFollowActive" : ""}
              type="button"
              disabled={followLoading}
              onClick={onToggleFollow}
            >
              {followLoading
                ? "İşleniyor..."
                : isFollowing
                  ? "Takibi bırak"
                  : "Satıcıyı takip et"}
            </button>
          )}
        </header>

        {loading ? (
          <div className="sellerStoreEmpty">Satıcı mağazası yükleniyor...</div>
        ) : (
          <>
            <section className="sellerStoreStats">
              <article>
                <span>Satıcı puanı</span>
                <strong>
                  {summary?.review_count
                    ? summary.average_rating.toFixed(1)
                    : "Yeni"}
                </strong>
              </article>
              <article>
                <span>Yorum</span>
                <strong>{summary?.review_count ?? 0}</strong>
              </article>
              <article>
                <span>Tamamlanan satış</span>
                <strong>{summary?.completed_sales ?? 0}</strong>
              </article>
              <article>
                <span>Takipçi</span>
                <strong>{summary?.follower_count ?? 0}</strong>
              </article>
            </section>

            <section className="sellerStoreListings">
              <div className="sellerStoreListingsHeader">
                <span>AKTİF İLANLAR</span>
                <h3>{summary?.active_listings.length ?? 0} açık artırma</h3>
              </div>

              {!summary?.active_listings.length ? (
                <div className="sellerStoreEmpty">
                  Bu satıcının aktif ilanı bulunmuyor.
                </div>
              ) : (
                <div className="sellerStoreGrid">
                  {summary.active_listings.map((auction) => (
                    <button
                      type="button"
                      key={auction.id}
                      onClick={() => onOpenAuction(auction)}
                    >
                      <div>
                        {auction.image_url ? (
                          <img src={auction.image_url} alt={auction.title} />
                        ) : (
                          <span>KK</span>
                        )}
                      </div>
                      <strong>{auction.title}</strong>
                      <b>{money(Number(auction.current_price))}</b>
                      <small>
                        {[auction.brand, auction.model]
                          .filter(Boolean)
                          .join(" · ") || "İlanı görüntüle"}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </div>
  );
}
