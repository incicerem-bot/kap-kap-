"use client";

import type { Auction, AuctionCategory } from "./types";

type FounderStats = {
  active: number;
  test: number;
  categories: number;
};

type FounderPanelProps = {
  open: boolean;
  loading: boolean;
  progress: number;
  stats: FounderStats;
  onClose: () => void;
  onCreateTestAuctions: () => void;
  onDeleteTestAuctions: () => void;
  onRefresh: () => void;
};

const categoryNames: Record<AuctionCategory, string> = {
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

export default function FounderPanel({
  open,
  loading,
  progress,
  stats,
  onClose,
  onCreateTestAuctions,
  onDeleteTestAuctions,
  onRefresh,
}: FounderPanelProps) {
  if (!open) return null;

  return (
    <div className="modalBackdrop founderBackdrop" onMouseDown={onClose}>
      <section className="founderPanel" onMouseDown={(event) => event.stopPropagation()}>
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header className="founderHeader">
          <div>
            <span>KAPIŞKAPIŞ BETA v1.0</span>
            <h2>Kurucu Paneli</h2>
            <p>Platformu gerçek kullanım yoğunluğunda test etmek için güvenli beta araçları.</p>
          </div>
          <div className="founderBadge">BETA YÖNETİCİSİ</div>
        </header>

        <section className="founderStats">
          <article><span>Aktif ilan</span><strong>{stats.active}</strong></article>
          <article><span>Test ilanı</span><strong>{stats.test}</strong></article>
          <article><span>Dolu kategori</span><strong>{stats.categories}/8</strong></article>
        </section>

        <section className="founderTools">
          <article className="founderTool primaryTool">
            <span>01 · VERİ ÜRETİCİ</span>
            <h3>100 test ilanı oluştur</h3>
            <p>8 kategoride, gerçekçi fiyat ve sürelerle 100 ilanı giriş yaptığın hesaba ekler.</p>
            <button type="button" disabled={loading} onClick={onCreateTestAuctions}>
              {loading ? `Oluşturuluyor · %${progress}` : "100 ilanı oluştur"}
            </button>
          </article>

          <article className="founderTool dangerTool">
            <span>02 · TEMİZLİK</span>
            <h3>Test ilanlarını temizle</h3>
            <p>Yalnızca bu panelin oluşturduğu ve sana ait olan beta ilanlarını siler.</p>
            <button type="button" disabled={loading || stats.test === 0} onClick={onDeleteTestAuctions}>
              Test ilanlarını sil
            </button>
          </article>

          <article className="founderTool">
            <span>03 · KONTROL</span>
            <h3>Verileri yenile</h3>
            <p>Ana sayfa ve kurucu istatistiklerini Supabase üzerinden yeniden yükler.</p>
            <button type="button" disabled={loading} onClick={onRefresh}>Şimdi yenile</button>
          </article>
        </section>

        {loading && (
          <div className="founderProgress">
            <div style={{ width: `${progress}%` }} />
          </div>
        )}

        <section className="founderNotes">
          <strong>Güvenli beta modu</strong>
          <p>Test ilanları <code>[KAPISKAPIS_BETA_V1]</code> etiketiyle işaretlenir. Normal kullanıcı ilanları temizleme işleminden etkilenmez.</p>
          <div className="founderCategories">
            {Object.entries(categoryNames).filter(([key]) => key !== "all").map(([key, label]) => (
              <span key={key}>{label}</span>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
