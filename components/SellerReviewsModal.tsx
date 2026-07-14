"use client";

import type { SellerTrustSummary } from "./types";

type Props = {
  open: boolean;
  summary: SellerTrustSummary | null;
  loading: boolean;
  onClose: () => void;
};

function stars(rating: number) {
  return Array.from({ length: 5 }, (_, index) =>
    index < Math.round(rating) ? "★" : "☆"
  ).join("");
}

export default function SellerReviewsModal({
  open,
  summary,
  loading,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="modalBackdrop sellerReviewsBackdrop" onMouseDown={onClose}>
      <section
        className="sellerReviewsModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>
          ×
        </button>

        <header className="sellerReviewsHeader">
          <span>SATICI GÜVEN PROFİLİ</span>
          <h2>{summary?.seller_name || "Satıcı"}</h2>
          <p>Doğrulanmış işlemlerden gelen gerçek değerlendirmeler.</p>
        </header>

        {loading ? (
          <div className="sellerReviewsEmpty">Satıcı bilgileri yükleniyor...</div>
        ) : (
          <>
            <section className="sellerTrustSummaryGrid">
              <article>
                <span>Ortalama puan</span>
                <strong>
                  {summary?.review_count
                    ? summary.average_rating.toFixed(1)
                    : "Yeni"}
                </strong>
                <small className="sellerStars">
                  {stars(summary?.average_rating || 0)}
                </small>
              </article>

              <article>
                <span>Değerlendirme</span>
                <strong>{summary?.review_count ?? 0}</strong>
                <small>Doğrulanmış yorum</small>
              </article>

              <article>
                <span>Tamamlanan satış</span>
                <strong>{summary?.completed_sales ?? 0}</strong>
                <small>Başarılı teslimat</small>
              </article>

              <article>
                <span>Üyelik</span>
                <strong>
                  {summary?.member_since
                    ? new Date(summary.member_since).getFullYear()
                    : "—"}
                </strong>
                <small>KapışKapış üyesi</small>
              </article>
            </section>

            <section className="sellerReviewList">
              <div className="sellerReviewListHeader">
                <span>SON YORUMLAR</span>
                <h3>Alıcı değerlendirmeleri</h3>
              </div>

              {!summary?.reviews.length ? (
                <div className="sellerReviewsEmpty">
                  <strong>Henüz değerlendirme yok.</strong>
                  <span>
                    Satıcının ilk tamamlanan işlemleri sonrasında yorumlar burada
                    görünecek.
                  </span>
                </div>
              ) : (
                summary.reviews.map((review) => (
                  <article className="sellerReviewCard" key={review.id}>
                    <div className="sellerReviewTop">
                      <div>
                        <strong>
                          {review.reviewer_name || "Doğrulanmış alıcı"}
                        </strong>
                        <span>{stars(review.rating)}</span>
                      </div>
                      <small>
                        {new Date(review.created_at).toLocaleDateString("tr-TR")}
                      </small>
                    </div>
                    <p>{review.comment}</p>
                    <footer>Doğrulanmış satın alma</footer>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </section>
    </div>
  );
}
