"use client";

import { FormEvent, useState } from "react";
import type { AuctionOrder } from "./types";

type Props = {
  open: boolean;
  order: AuctionOrder | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void> | void;
};

export default function ReviewFormModal({
  open,
  order,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!open || !order) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(rating, comment.trim());
    setRating(5);
    setComment("");
  }

  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <section
        className="reviewFormModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>
          ×
        </button>

        <header>
          <span>SATICI DEĞERLENDİRMESİ</span>
          <h2>Alışveriş deneyimini paylaş</h2>
          <p>{order.auction?.title || "Tamamlanan sipariş"}</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="reviewStarPicker">
            <span>Puanın</span>
            <div>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value <= rating ? "reviewStarActive" : ""}
                  onClick={() => setRating(value)}
                  aria-label={`${value} yıldız`}
                >
                  ★
                </button>
              ))}
            </div>
            <strong>{rating}/5</strong>
          </div>

          <label>
            Yorum
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              minLength={10}
              maxLength={500}
              rows={5}
              placeholder="Ürün açıklamayla uyumlu muydu? Satıcı hızlı ve ilgili miydi?"
              required
            />
          </label>

          <button className="modalPrimary" type="submit" disabled={loading}>
            {loading ? "Yayınlanıyor..." : "Değerlendirmeyi yayınla"}
          </button>
        </form>
      </section>
    </div>
  );
}
