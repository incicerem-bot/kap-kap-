"use client";

import { FormEvent, useState } from "react";
import type { AuctionOrder, OrderStatus } from "./types";

const statusLabels: Record<OrderStatus, string> = {
  payment_pending: "Ödeme bekleniyor",
  paid: "Ödeme alındı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
};

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type OrderCenterModalProps = {
  open: boolean;
  order: AuctionOrder | null;
  currentUserId: string;
  loading: boolean;
  onClose: () => void;
  onUpdateStatus: (
    status: OrderStatus,
    trackingCode?: string
  ) => Promise<void> | void;
  reviewSubmitted: boolean;
  onOpenReview: () => void;
};

export default function OrderCenterModal({
  open,
  order,
  currentUserId,
  loading,
  onClose,
  onUpdateStatus,
  reviewSubmitted,
  onOpenReview,
}: OrderCenterModalProps) {
  const [trackingCode, setTrackingCode] = useState("");

  if (!open || !order) return null;

  const isBuyer = order.buyer_id === currentUserId;
  const isSeller = order.seller_id === currentUserId;

  const steps: OrderStatus[] = [
    "payment_pending",
    "paid",
    "preparing",
    "shipped",
    "delivered",
  ];

  const currentIndex = steps.indexOf(order.status);

  async function handleShip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onUpdateStatus("shipped", trackingCode.trim());
    setTrackingCode("");
  }

  return (
    <div className="modalBackdrop orderBackdrop" onMouseDown={onClose}>
      <section
        className="orderCenter"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>
          ×
        </button>

        <header className="orderHeader">
          <div>
            <span>SİPARİŞ MERKEZİ</span>
            <h2>{order.auction?.title || "Açık artırma siparişi"}</h2>
            <p>Sipariş no: {order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className={`orderStatusBadge status-${order.status}`}>
            {statusLabels[order.status]}
          </div>
        </header>

        <section className="orderProduct">
          <div className="orderImage">
            {order.auction?.image_url ? (
              <img src={order.auction.image_url} alt={order.auction.title} />
            ) : (
              <span>KK</span>
            )}
          </div>

          <div>
            <span>Kazanan teklif</span>
            <strong>{money(Number(order.amount))}</strong>
            <small>
              {isBuyer ? "Alıcı görünümü" : isSeller ? "Satıcı görünümü" : ""}
            </small>
          </div>
        </section>

        <section className="orderTimeline">
          {steps.map((step, index) => {
            const completed =
              order.status !== "cancelled" && index <= currentIndex;

            return (
              <div
                className={`orderStep ${completed ? "orderStepComplete" : ""}`}
                key={step}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{statusLabels[step]}</strong>
                  <small>
                    {step === "payment_pending"
                      ? "Alıcının ödeme işlemi bekleniyor."
                      : step === "paid"
                        ? "Ödeme güvenli şekilde kaydedildi."
                        : step === "preparing"
                          ? "Satıcı ürünü kargoya hazırlıyor."
                          : step === "shipped"
                            ? "Ürün takipli olarak gönderildi."
                            : "Alıcı teslimatı onayladı."}
                  </small>
                </div>
              </div>
            );
          })}
        </section>

        {order.tracking_code && (
          <section className="trackingCard">
            <span>Kargo takip kodu</span>
            <strong>{order.tracking_code}</strong>
          </section>
        )}

        <section className="orderActions">
          {isBuyer && order.status === "payment_pending" && (
            <button
              className="orderPrimary"
              type="button"
              disabled={loading}
              onClick={() => void onUpdateStatus("paid")}
            >
              {loading ? "İşleniyor..." : "Test ödemesini tamamla"}
            </button>
          )}

          {isSeller && order.status === "paid" && (
            <button
              className="orderPrimary"
              type="button"
              disabled={loading}
              onClick={() => void onUpdateStatus("preparing")}
            >
              {loading ? "İşleniyor..." : "Ürünü hazırlamaya başla"}
            </button>
          )}

          {isSeller && order.status === "preparing" && (
            <form className="shippingForm" onSubmit={handleShip}>
              <label>
                Kargo takip kodu
                <input
                  value={trackingCode}
                  onChange={(event) => setTrackingCode(event.target.value)}
                  placeholder="Örn. 123456789"
                  minLength={5}
                  required
                />
              </label>
              <button className="orderPrimary" type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kargoya verildi olarak işaretle"}
              </button>
            </form>
          )}

          {isBuyer && order.status === "shipped" && (
            <button
              className="orderPrimary"
              type="button"
              disabled={loading}
              onClick={() => void onUpdateStatus("delivered")}
            >
              {loading ? "İşleniyor..." : "Teslim aldım"}
            </button>
          )}

          {order.status === "delivered" && (
            <div className="orderDeliveredGroup">
              <div className="orderSuccess">
                <strong>Sipariş tamamlandı.</strong>
                <span>Alıcı teslimatı onayladı.</span>
              </div>

              {isBuyer && (
                <button
                  className="orderReviewButton"
                  type="button"
                  disabled={reviewSubmitted}
                  onClick={onOpenReview}
                >
                  {reviewSubmitted
                    ? "Satıcı değerlendirildi"
                    : "Satıcıyı değerlendir"}
                </button>
              )}
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="orderCancelled">
              <strong>Sipariş iptal edildi.</strong>
            </div>
          )}
        </section>

        <footer className="orderSafety">
          Bu sürümde ödeme adımı test akışıdır. Gerçek para transferi ödeme
          sağlayıcısı bağlandığında etkinleşecektir.
        </footer>
      </section>
    </div>
  );
}
