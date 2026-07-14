"use client";

import { FormEvent, useState } from "react";
import type { Auction } from "./types";

type Props = {
  open: boolean;
  auction: Auction | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void> | void;
};

const reasons = [
  ["fake", "Sahte veya yanıltıcı ilan"],
  ["prohibited", "Yasaklı ürün"],
  ["wrong_category", "Yanlış kategori"],
  ["stolen", "Çalıntı ürün şüphesi"],
  ["spam", "Spam / tekrarlanan ilan"],
  ["other", "Diğer"],
];

export default function ReportListingModal({
  open,
  auction,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState("fake");
  const [details, setDetails] = useState("");

  if (!open || !auction) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(reason, details.trim());
    setReason("fake");
    setDetails("");
  }

  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <section
        className="reportListingModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>
        <header>
          <span>GÜVEN MERKEZİ</span>
          <h2>İlanı bildir</h2>
          <p>{auction.title}</p>
        </header>

        <form onSubmit={handleSubmit}>
          <label>
            Bildirim nedeni
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              {reasons.map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Açıklama
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={5}
              minLength={10}
              maxLength={500}
              placeholder="Sorunu mümkün olduğunca açık anlat..."
              required
            />
          </label>

          <button className="reportSubmitButton" type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Bildirimi gönder"}
          </button>
        </form>

        <footer>
          Bildirim sahibine açıklanmaz. Kötüye kullanım hesap kısıtlamasına neden olabilir.
        </footer>
      </section>
    </div>
  );
}
