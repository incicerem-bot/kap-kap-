"use client";

import { FormEvent, useState } from "react";
import type { AuctionOrder, DisputeType } from "./types";

type Props = {
  open: boolean;
  order: AuctionOrder | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    type: DisputeType,
    reason: string,
    details: string
  ) => Promise<void> | void;
};

export default function DisputeFormModal({
  open,
  order,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [type, setType] = useState<DisputeType>("problem");
  const [reason, setReason] = useState("Ürün açıklamayla uyuşmuyor");
  const [details, setDetails] = useState("");

  if (!open || !order) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(type, reason, details.trim());
    setType("problem");
    setReason("Ürün açıklamayla uyuşmuyor");
    setDetails("");
  }

  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <section
        className="disputeFormModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header>
          <span>GÜVENLİ İŞLEM MERKEZİ</span>
          <h2>Talep oluştur</h2>
          <p>{order.auction?.title || "Sipariş"}</p>
        </header>

        <form onSubmit={submit}>
          <label>
            Talep türü
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as DisputeType)
              }
            >
              <option value="cancellation">Sipariş iptali</option>
              <option value="return">İade talebi</option>
              <option value="problem">Ürün / teslimat sorunu</option>
            </select>
          </label>

          <label>
            Neden
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              <option>Ürün açıklamayla uyuşmuyor</option>
              <option>Ürün hasarlı geldi</option>
              <option>Yanlış ürün gönderildi</option>
              <option>Kargo gecikti</option>
              <option>Satıcı ürünü göndermedi</option>
              <option>Satın almaktan vazgeçtim</option>
              <option>Diğer</option>
            </select>
          </label>

          <label>
            Açıklama
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              minLength={15}
              maxLength={1000}
              rows={6}
              placeholder="Sorunu tarih, ürün durumu ve beklentinle birlikte anlat..."
              required
            />
          </label>

          <button className="disputeSubmitButton" type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Talebi güven merkezine gönder"}
          </button>
        </form>
      </section>
    </div>
  );
}
