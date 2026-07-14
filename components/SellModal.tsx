"use client";

import type { FormEvent } from "react";
import type { AuctionCategory } from "./types";

type SellModalProps = {
  open: boolean;
  loading: boolean;
  title: string;
  description: string;
  category: AuctionCategory;
  startPrice: string;
  minIncrement: string;
  durationHours: string;
  imagePreview: string;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: AuctionCategory) => void;
  onStartPriceChange: (value: string) => void;
  onMinIncrementChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function SellModal(props: SellModalProps) {
  if (!props.open) return null;

  return (
    <div className="modalBackdrop" onMouseDown={props.onClose}>
      <section className="modalCard wideModal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="closeButton" type="button" onClick={props.onClose}>×</button>
        <span className="eyebrow">YENİ AÇIK ARTIRMA</span>
        <h2>Ürününü kapıştır</h2>

        <form onSubmit={props.onSubmit}>
          <label className="imageUploader">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => props.onImageChange(event.target.files?.[0] ?? null)}
            />
            {props.imagePreview ? (
              <img src={props.imagePreview} alt="Ürün önizlemesi" />
            ) : (
              <div>
                <span>+</span>
                <strong>Ürün fotoğrafı ekle</strong>
                <small>JPG, PNG veya WEBP · En fazla 5 MB</small>
              </div>
            )}
          </label>

          <label>
            İlan başlığı
            <input
              value={props.title}
              onChange={(event) => props.onTitleChange(event.target.value)}
              required
            />
          </label>

          <label>
            Açıklama
            <textarea
              value={props.description}
              onChange={(event) => props.onDescriptionChange(event.target.value)}
              rows={4}
            />
          </label>

          <label>
            Kategori
            <select
              value={props.category}
              onChange={(event) => props.onCategoryChange(event.target.value as AuctionCategory)}
            >
              <option value="phone">Telefon</option>
              <option value="computer">Bilgisayar</option>
              <option value="gaming">Oyun</option>
              <option value="watch">Saat</option>
              <option value="vehicle">Araç</option>
              <option value="home">Ev & Yaşam</option>
              <option value="camera">Kamera</option>
              <option value="collection">Koleksiyon</option>
            </select>
          </label>

          <div className="formGrid">
            <label>
              Başlangıç fiyatı
              <input
                type="number"
                min="1"
                value={props.startPrice}
                onChange={(event) => props.onStartPriceChange(event.target.value)}
                required
              />
            </label>
            <label>
              Minimum artış
              <input
                type="number"
                min="1"
                value={props.minIncrement}
                onChange={(event) => props.onMinIncrementChange(event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Süre
            <select value={props.durationHours} onChange={(event) => props.onDurationChange(event.target.value)}>
              <option value="1">1 saat</option>
              <option value="6">6 saat</option>
              <option value="12">12 saat</option>
              <option value="24">24 saat</option>
              <option value="72">3 gün</option>
              <option value="168">7 gün</option>
            </select>
          </label>

          <button className="modalPrimary" type="submit" disabled={props.loading}>
            {props.loading ? "Yayınlanıyor..." : "Açık artırmayı yayınla"}
          </button>
        </form>
      </section>
    </div>
  );
}
