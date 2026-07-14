"use client";

import type { SavedSearch } from "./types";

type Props = {
  open: boolean;
  searches: SavedSearch[];
  loading: boolean;
  onClose: () => void;
  onApply: (search: SavedSearch) => void;
  onDelete: (searchId: string) => void;
  onToggleAlert: (search: SavedSearch) => void;
};

function label(value: string | null | undefined) {
  return value?.trim() || "Tümü";
}

export default function SavedSearchesPanel({
  open,
  searches,
  loading,
  onClose,
  onApply,
  onDelete,
  onToggleAlert,
}: Props) {
  if (!open) return null;

  return (
    <div className="modalBackdrop savedSearchBackdrop" onMouseDown={onClose}>
      <section
        className="savedSearchPanel"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>
          ×
        </button>

        <header className="savedSearchHeader">
          <span>AKILLI ALARM MERKEZİ</span>
          <h2>Kayıtlı aramalarım</h2>
          <p>
            Aramalarını tekrar uygula veya eşleşen yeni ilanlar için alarmı aç.
          </p>
        </header>

        {loading ? (
          <div className="savedSearchEmpty">Aramalar yükleniyor...</div>
        ) : searches.length === 0 ? (
          <div className="savedSearchEmpty">
            <strong>Henüz kayıtlı araman yok.</strong>
            <span>
              Ana sayfadaki filtreleri seçip “Aramayı kaydet” düğmesine bas.
            </span>
          </div>
        ) : (
          <div className="savedSearchList">
            {searches.map((search) => (
              <article className="savedSearchCard" key={search.id}>
                <div className="savedSearchCardTop">
                  <div>
                    <strong>{search.name}</strong>
                    <span>
                      {label(search.brand)} · {label(search.model)}
                    </span>
                  </div>

                  <button
                    className={
                      search.alerts_enabled
                        ? "savedAlertOn"
                        : "savedAlertOff"
                    }
                    type="button"
                    onClick={() => onToggleAlert(search)}
                  >
                    {search.alerts_enabled ? "Alarm açık" : "Alarm kapalı"}
                  </button>
                </div>

                <div className="savedSearchTags">
                  <span>{search.category}</span>
                  {search.product_type && <span>{search.product_type}</span>}
                  {search.min_price !== null && (
                    <span>Min. {search.min_price.toLocaleString("tr-TR")} ₺</span>
                  )}
                  {search.max_price !== null && (
                    <span>Maks. {search.max_price.toLocaleString("tr-TR")} ₺</span>
                  )}
                  {Object.entries(search.specifications ?? {})
                    .filter(([, value]) => value !== "" && value !== null)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <span key={key}>
                        {key.replaceAll("_", " ")}: {String(value)}
                      </span>
                    ))}
                </div>

                <div className="savedSearchActions">
                  <button type="button" onClick={() => onApply(search)}>
                    Aramayı uygula
                  </button>
                  <button type="button" onClick={() => onDelete(search.id)}>
                    Sil
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
