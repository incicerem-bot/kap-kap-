"use client";

import type { FormEvent } from "react";
import type { Auction, Bid, AuctionCategory, SellerTrustSummary } from "./types";

const categoryLabels: Record<AuctionCategory, string> = {
  all: "Diğer",
  phone: "Telefon",
  computer: "Bilgisayar",
  gaming: "Oyun",
  watch: "Saat",
  vehicle: "Araç",
  home: "Ev & Yaşam",
  camera: "Kamera",
  collection: "Koleksiyon",
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
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

type ProductDetailModalProps = {
  auction: Auction | null;
  bids: Bid[];
  bidAmount: string;
  loading: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onBidAmountChange: (value: string) => void;
  onSubmitBid: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFavorite: (auctionId: string) => void;
  onOpenMessages: () => void;
  onOpenLiveRoom: () => void;
  currentUserId: string;
  liveControlLoading: boolean;
  onToggleLiveStatus: () => void;
  hasLiveReminder: boolean;
  reminderLoading: boolean;
  onToggleLiveReminder: () => void;
  sellerTrust: SellerTrustSummary | null;
  sellerTrustLoading: boolean;
  onOpenSellerReviews: () => void;
  onOpenSellerStore: () => void;
  onOpenPublicUserProfile: () => void;
  isFollowingSeller: boolean;
  followLoading: boolean;
  onToggleSellerFollow: () => void;
  onReportListing: () => void;
  pricePulse?: boolean;
};

export default function ProductDetailModal(props: ProductDetailModalProps) {
  if (!props.auction) return null;
  const auction = props.auction;

  return (
    <div className="modalBackdrop detailBackdrop" onMouseDown={props.onClose}>
      <section className="premiumDetail" onMouseDown={(event) => event.stopPropagation()}>
        <button className="closeButton detailClose" type="button" onClick={props.onClose}>×</button>

        <div className="premiumGallery">
          <div className="galleryTop">
            {auction.live_enabled && (
              <span
                className={`liveBadge ${
                  auction.live_is_open ? "liveBadgeOpen" : "liveBadgeClosed"
                }`}
              >
                {auction.live_is_open ? "CANLI" : "CANLI PLANLI"}
              </span>
            )}
            <button
              className={`detailFavorite ${props.isFavorite ? "detailFavoriteActive" : ""}`}
              type="button"
              onClick={() => props.onToggleFavorite(auction.id)}
            >
              {props.isFavorite ? "♥ Favorilerde" : "♡ Favoriye ekle"}
            </button>
          </div>

          <div className="mainProductImage">
            {auction.image_url ? (
              <img src={auction.image_url} alt={auction.title} />
            ) : (
              <div className="imageFallback largeFallback">KK</div>
            )}
          </div>
        </div>

        <aside className="premiumBidPanel">
          <span className="detailCategory">{categoryLabels[auction.category || "all"]}</span>
          <h2>{auction.title}</h2>
          <p>{auction.description || "Ürün açıklaması eklenmemiş."}</p>

          <div className="auctionPulse">
            <div>
              <span>Güncel teklif</span>
              <strong className={props.pricePulse ? "pricePulseText" : ""}>
                {money(Number(auction.current_price))}
              </strong>
            </div>
            <div className="countdownBox">
              <span>Kalan süre</span>
              <strong>{remainingTime(auction.ends_at)}</strong>
            </div>
          </div>

          {(auction.brand || auction.model) && (
            <div className="productIdentityBar">
              <div>
                <span>Marka</span>
                <strong>{auction.brand || "Belirtilmedi"}</strong>
              </div>
              <div>
                <span>Model</span>
                <strong>{auction.model || "Belirtilmedi"}</strong>
              </div>
            </div>
          )}

          {auction.specifications &&
            Object.keys(auction.specifications).length > 0 && (
              <section className="technicalSpecs">
                <div className="technicalSpecsHeader">
                  <span>TEKNİK DETAYLAR</span>
                  <strong>Ürün özellikleri</strong>
                </div>
                <div className="technicalSpecsGrid">
                  {Object.entries(auction.specifications).map(([key, value]) => (
                    <div key={key}>
                      <span>
                        {key
                          .replaceAll("_", " ")
                          .replace(/\w/g, (letter) =>
                            letter.toLocaleUpperCase("tr")
                          )}
                      </span>
                      <strong>
                        {value === "yes"
                          ? "Var"
                          : value === "no"
                            ? "Yok"
                            : String(value)}
                      </strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

          <div className="bidRules">
            <div>
              <span>Başlangıç fiyatı</span>
              <strong>{money(Number(auction.start_price))}</strong>
            </div>
            <div>
              <span>Minimum artış</span>
              <strong>{money(Number(auction.min_increment))}</strong>
            </div>
          </div>

          <form className="premiumBidForm" onSubmit={props.onSubmitBid}>
            <label>
              Teklif tutarın
              <div className="bidInputWrap">
                <input
                  type="number"
                  value={props.bidAmount}
                  onChange={(event) => props.onBidAmountChange(event.target.value)}
                  min={Number(auction.current_price) + Number(auction.min_increment)}
                  required
                />
                <span>₺</span>
              </div>
            </label>

            <button className="kapisButton premiumKapis" type="submit" disabled={props.loading}>
              {props.loading ? "Teklif veriliyor..." : "KAPIŞ! — Teklif Ver"}
            </button>
          </form>

          {auction.live_enabled && (
            <section className="liveAuctionControlCard">
              <div>
                <span>CANLI AÇIK ARTIRMA</span>
                <strong>
                  {auction.live_is_open
                    ? "Canlı oda şu anda açık"
                    : "Canlı oda henüz açılmadı"}
                </strong>
                <small>
                  {auction.seller_id === props.currentUserId
                    ? auction.live_scheduled_at
                      ? `Planlanan başlangıç: ${new Date(
                          auction.live_scheduled_at
                        ).toLocaleString("tr-TR")}`
                      : "İlan sahibi olarak canlı odayı istediğin zaman açıp kapatabilirsin."
                    : auction.live_is_open
                      ? "Canlı teklif akışına ve oda sohbetine katılabilirsin."
                      : auction.live_scheduled_at
                        ? `Planlanan başlangıç: ${new Date(
                            auction.live_scheduled_at
                          ).toLocaleString("tr-TR")}`
                        : "Satıcı canlı odayı açtığında katılım başlayacak."}
                </small>
              </div>

              <div className="liveAuctionControlActions">
                {auction.seller_id === props.currentUserId && (
                  <button
                    className={
                      auction.live_is_open
                        ? "closeLiveAuctionButton"
                        : "startLiveAuctionButton"
                    }
                    type="button"
                    disabled={props.liveControlLoading}
                    onClick={props.onToggleLiveStatus}
                  >
                    {props.liveControlLoading
                      ? "İşleniyor..."
                      : auction.live_is_open
                        ? "Canlı odayı kapat"
                        : "Canlı odayı aç"}
                  </button>
                )}

                <button
                  className="openLiveRoomButton"
                  type="button"
                  disabled={!auction.live_is_open}
                  onClick={props.onOpenLiveRoom}
                >
                  {auction.live_is_open
                    ? "Canlı açık artırma odasına gir"
                    : "Canlı oda kapalı"}
                </button>

                {auction.seller_id !== props.currentUserId &&
                  !auction.live_is_open && (
                    <button
                      className={
                        props.hasLiveReminder
                          ? "liveReminderActive"
                          : "liveReminderButton"
                      }
                      type="button"
                      disabled={props.reminderLoading}
                      onClick={props.onToggleLiveReminder}
                    >
                      {props.reminderLoading
                        ? "İşleniyor..."
                        : props.hasLiveReminder
                          ? "Hatırlatıcıyı kaldır"
                          : "Canlı yayın için hatırlat"}
                    </button>
                  )}
              </div>
            </section>
          )}

          <section className="sellerTrustCard">
            <div className="sellerTrustCardHeader">
              <span className="sellerTrustAvatar">
                {(props.sellerTrust?.seller_name || "K")
                  .slice(0, 1)
                  .toLocaleUpperCase("tr")}
              </span>
              <div>
                <span>SATICI</span>
                <strong>
                  {props.sellerTrustLoading
                    ? "Satıcı yükleniyor..."
                    : props.sellerTrust?.seller_name || "KapışKapış Satıcısı"}
                </strong>
                <small>Doğrulanmış hesap</small>
              </div>
            </div>

            <div className="sellerTrustMetrics">
              <div>
                <strong>
                  {props.sellerTrust?.review_count
                    ? props.sellerTrust.average_rating.toFixed(1)
                    : "Yeni"}
                </strong>
                <span>Satıcı puanı</span>
              </div>
              <div>
                <strong>{props.sellerTrust?.review_count ?? 0}</strong>
                <span>Yorum</span>
              </div>
              <div>
                <strong>{props.sellerTrust?.completed_sales ?? 0}</strong>
                <span>Teslimat</span>
              </div>
            </div>

            <button
              className="sellerReviewsButton"
              type="button"
              onClick={props.onOpenSellerReviews}
            >
              Satıcı yorumlarını görüntüle
            </button>

            <div className="sellerStoreActions">
              <button
                type="button"
                onClick={props.onOpenSellerStore}
              >
                Satıcının mağazasını aç
              </button>
              <button
                type="button"
                onClick={props.onOpenPublicUserProfile}
              >
                Kullanıcı profilini görüntüle
              </button>
              <button
                type="button"
                className={props.isFollowingSeller ? "sellerFollowActive" : ""}
                disabled={props.followLoading}
                onClick={props.onToggleSellerFollow}
              >
                {props.followLoading
                  ? "İşleniyor..."
                  : props.isFollowingSeller
                    ? "Takibi bırak"
                    : "Satıcıyı takip et"}
              </button>
            </div>
          </section>

          <button
            className="messageSellerButton"
            type="button"
            onClick={props.onOpenMessages}
          >
            Satıcıya mesaj gönder
          </button>

          <button
            className="reportListingButton"
            type="button"
            onClick={props.onReportListing}
          >
            Bu ilanı bildir
          </button>

          <div className="premiumBidHistory">
            <h3>Son teklifler</h3>
            {props.bids.length === 0 ? (
              <div className="historyEmpty">Henüz teklif verilmedi.</div>
            ) : (
              props.bids.map((bid, index) => (
                <div className="premiumBidRow" key={bid.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{money(Number(bid.amount))}</strong>
                  <small>{new Date(bid.created_at).toLocaleString("tr-TR")}</small>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
