"use client";

import type { Auction, AuctionCategory } from "./types";

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

type AuctionCardProps = {
  auction: Auction;
  isFavorite: boolean;
  onToggleFavorite: (auctionId: string) => void;
  onOpenDetail: (auction: Auction) => void;
  isCompared: boolean;
  onToggleCompare: (auctionId: string) => void;
  pricePulse?: boolean;
};

export default function AuctionCard({
  auction,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
  isCompared,
  onToggleCompare,
  pricePulse = false,
}: AuctionCardProps) {
  return (
    <article className={`liveCard ${pricePulse ? "pricePulseCard" : ""}`}>
      <div className="liveImage">
        <span className="liveBadge">CANLI</span>
        <button
          type="button"
          className={isFavorite ? "favoriteActive" : ""}
          onClick={() => onToggleFavorite(auction.id)}
          aria-label="Favoriye ekle"
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        {auction.image_url ? (
          <img src={auction.image_url} alt={auction.title} />
        ) : (
          <div className="imageFallback">KK</div>
        )}
      </div>

      <span className="categoryBadge">{categoryLabels[auction.category || "all"]}</span>
      <h3>{auction.title}</h3>
      {(auction.brand || auction.model) && (
        <span className="productModelLine">
          {[auction.brand, auction.model].filter(Boolean).join(" · ")}
        </span>
      )}
      <span className="sellerLine">Doğrulanmış satıcı</span>

      <div className="liveMeta">
        <div>
          <span>Güncel teklif</span>
          <strong className={pricePulse ? "pricePulseText" : ""}>
            {money(Number(auction.current_price))}
          </strong>
        </div>
        <small>{remainingTime(auction.ends_at)}</small>
      </div>

      <button className={`compareCardButton ${isCompared ? "compareCardActive" : ""}`} type="button" onClick={() => onToggleCompare(auction.id)}>{isCompared ? "Karşılaştırmada" : "Karşılaştır"}</button>

      <div className="cardActions">
        <button
          className={`favoriteTextButton ${isFavorite ? "favoriteTextActive" : ""}`}
          type="button"
          onClick={() => onToggleFavorite(auction.id)}
        >
          {isFavorite ? "Favorilerde" : "Favoriye ekle"}
        </button>

        <button className="kapisButton" type="button" onClick={() => onOpenDetail(auction)}>
          KAPIŞ!
        </button>
      </div>
    </article>
  );
}
