"use client";

import type { AuctionReport } from "./types";

type Props = {
  open: boolean;
  reports: AuctionReport[];
  loading: boolean;
  onClose: () => void;
  onOpenAuction: (report: AuctionReport) => void;
  onResolve: (
    report: AuctionReport,
    action: "dismissed" | "reviewed" | "action_taken"
  ) => void;
};

const reasonLabels: Record<string, string> = {
  fake: "Sahte / yanıltıcı",
  prohibited: "Yasaklı ürün",
  wrong_category: "Yanlış kategori",
  stolen: "Çalıntı şüphesi",
  spam: "Spam",
  other: "Diğer",
};

export default function ModerationPanel({
  open,
  reports,
  loading,
  onClose,
  onOpenAuction,
  onResolve,
}: Props) {
  if (!open) return null;

  const pending = reports.filter((report) => report.status === "pending");

  return (
    <div className="modalBackdrop moderationBackdrop" onMouseDown={onClose}>
      <section
        className="moderationPanel"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header className="moderationHeader">
          <div>
            <span>KAPIŞKAPIŞ GÜVENLİK</span>
            <h2>İlan Moderasyonu</h2>
            <p>Kullanıcı bildirimlerini incele ve gerekli işlemi uygula.</p>
          </div>
          <strong>{pending.length} bekleyen</strong>
        </header>

        {loading ? (
          <div className="moderationEmpty">Bildirimler yükleniyor...</div>
        ) : reports.length === 0 ? (
          <div className="moderationEmpty">
            <strong>İncelenecek bildirim yok.</strong>
            <span>Yeni bildirimler burada görünecek.</span>
          </div>
        ) : (
          <div className="moderationList">
            {reports.map((report) => (
              <article className={`moderationCard status-${report.status}`} key={report.id}>
                <div className="moderationCardTop">
                  <div>
                    <span>{reasonLabels[report.reason] || report.reason}</span>
                    <strong>{report.auction?.title || "İlan kaldırılmış"}</strong>
                  </div>
                  <small>{new Date(report.created_at).toLocaleString("tr-TR")}</small>
                </div>

                <p>{report.details}</p>

                <div className="moderationMeta">
                  <span>Durum: {report.status}</span>
                  <span>İlan: {report.auction_id.slice(0, 8)}</span>
                </div>

                <div className="moderationActions">
                  {report.auction && (
                    <button type="button" onClick={() => onOpenAuction(report)}>
                      İlanı aç
                    </button>
                  )}

                  {report.status === "pending" && (
                    <>
                      <button type="button" onClick={() => onResolve(report, "reviewed")}>
                        İncelendi
                      </button>
                      <button type="button" onClick={() => onResolve(report, "dismissed")}>
                        Reddet
                      </button>
                      <button
                        className="dangerModerationButton"
                        type="button"
                        onClick={() => onResolve(report, "action_taken")}
                      >
                        İlanı kaldır
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
