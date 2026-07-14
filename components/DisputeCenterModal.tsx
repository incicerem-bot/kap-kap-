"use client";

import { useState } from "react";
import type { OrderDispute } from "./types";

type Props = {
  open: boolean;
  disputes: OrderDispute[];
  currentUserId: string;
  isAdmin: boolean;
  loading: boolean;
  onClose: () => void;
  onSellerResponse: (dispute: OrderDispute, response: string) => void;
  onResolve: (
    dispute: OrderDispute,
    status: "approved" | "rejected" | "resolved"
  ) => void;
};

const statusLabel: Record<string, string> = {
  open: "Açık",
  seller_responded: "Satıcı yanıtladı",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  resolved: "Çözüldü",
};

export default function DisputeCenterModal({
  open,
  disputes,
  currentUserId,
  isAdmin,
  loading,
  onClose,
  onSellerResponse,
  onResolve,
}: Props) {
  const [responses, setResponses] = useState<Record<string, string>>({});

  if (!open) return null;

  return (
    <div className="modalBackdrop disputeBackdrop" onMouseDown={onClose}>
      <section
        className="disputeCenter"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="closeButton" type="button" onClick={onClose}>×</button>

        <header className="disputeHeader">
          <div>
            <span>İADE & UYUŞMAZLIK</span>
            <h2>{isAdmin ? "Uyuşmazlık Yönetimi" : "Taleplerim"}</h2>
            <p>İptal, iade ve sipariş sorunlarını güvenli biçimde takip et.</p>
          </div>
          <strong>{disputes.filter((item) => item.status === "open").length} açık</strong>
        </header>

        {loading ? (
          <div className="disputeEmpty">Talepler yükleniyor...</div>
        ) : disputes.length === 0 ? (
          <div className="disputeEmpty">
            <strong>Henüz talep yok.</strong>
            <span>Sipariş merkezinden yeni talep oluşturabilirsin.</span>
          </div>
        ) : (
          <div className="disputeList">
            {disputes.map((dispute) => {
              const isSeller = dispute.seller_id === currentUserId;
              const canRespond =
                isSeller &&
                ["open", "seller_responded"].includes(dispute.status);

              return (
                <article className={`disputeCard dispute-${dispute.status}`} key={dispute.id}>
                  <div className="disputeCardTop">
                    <div>
                      <span>{dispute.type}</span>
                      <strong>{dispute.reason}</strong>
                    </div>
                    <small>{statusLabel[dispute.status] || dispute.status}</small>
                  </div>

                  <p>{dispute.details}</p>

                  {dispute.seller_response && (
                    <div className="sellerResponseBox">
                      <span>SATICI YANITI</span>
                      <p>{dispute.seller_response}</p>
                    </div>
                  )}

                  {canRespond && (
                    <div className="sellerResponseForm">
                      <textarea
                        rows={3}
                        placeholder="Satıcı yanıtını yaz..."
                        value={responses[dispute.id] || ""}
                        onChange={(event) =>
                          setResponses((current) => ({
                            ...current,
                            [dispute.id]: event.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        disabled={loading || !(responses[dispute.id] || "").trim()}
                        onClick={() =>
                          onSellerResponse(
                            dispute,
                            (responses[dispute.id] || "").trim()
                          )
                        }
                      >
                        Yanıtı gönder
                      </button>
                    </div>
                  )}

                  {isAdmin && !["approved", "rejected", "resolved"].includes(dispute.status) && (
                    <div className="disputeAdminActions">
                      <button type="button" onClick={() => onResolve(dispute, "approved")}>
                        Talebi onayla
                      </button>
                      <button type="button" onClick={() => onResolve(dispute, "rejected")}>
                        Reddet
                      </button>
                      <button type="button" onClick={() => onResolve(dispute, "resolved")}>
                        Çözüldü
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
