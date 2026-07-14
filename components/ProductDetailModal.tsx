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
  sellerTrust: SellerTrustSummary | null;
  sellerTrustLoading: boolean;
  onOpenSellerReviews: () => void;
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
            <span className="liveBadge">CANLI</span>
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

          <button className="openLiveRoomButton" type="button" onClick={props.onOpenLiveRoom}>
            Canlı açık artırma odasına gir
          </button>

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
          </section>

          <button
            className="messageSellerButton"
            type="button"
            onClick={props.onOpenMessages}
          >
            Satıcıya mesaj gönder
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
