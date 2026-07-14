"use client";

import { FormEvent } from "react";
import type { Auction, ConversationMessage } from "./types";

type MessagePanelProps = {
  open: boolean;
  auction: Auction | null;
  currentUserId: string;
  otherUserName: string;
  messages: ConversationMessage[];
  messageText: string;
  loading: boolean;
  onClose: () => void;
  onMessageChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagePanel({
  open,
  auction,
  currentUserId,
  otherUserName,
  messages,
  messageText,
  loading,
  onClose,
  onMessageChange,
  onSubmit,
}: MessagePanelProps) {
  if (!open || !auction) return null;

  return (
    <div className="messageOverlay" onMouseDown={onClose}>
      <section
        className="messagePanel"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="messageHeader">
          <div>
            <span>GÜVENLİ MESAJLAŞMA</span>
            <h2>{otherUserName}</h2>
            <p>{auction.title}</p>
          </div>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="messageProduct">
          <div className="messageProductImage">
            {auction.image_url ? (
              <img src={auction.image_url} alt={auction.title} />
            ) : (
              <span>KK</span>
            )}
          </div>
          <div>
            <strong>{auction.title}</strong>
            <span>
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
                maximumFractionDigits: 0,
              }).format(Number(auction.current_price))}
            </span>
          </div>
        </div>

        <div className="messageList">
          {messages.length === 0 ? (
            <div className="messageEmpty">
              <strong>Henüz mesaj yok.</strong>
              <span>İlk mesajı göndererek konuşmayı başlat.</span>
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.sender_id === currentUserId;

              return (
                <div
                  className={`messageBubbleRow ${mine ? "messageMine" : ""}`}
                  key={message.id}
                >
                  <div className="messageBubble">
                    <p>{message.body}</p>
                    <small>{timeLabel(message.created_at)}</small>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form className="messageComposer" onSubmit={onSubmit}>
          <textarea
            value={messageText}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder="Mesajını yaz..."
            rows={2}
            maxLength={1000}
            required
          />
          <button type="submit" disabled={loading || !messageText.trim()}>
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>

        <footer className="messageSafety">
          Telefon, ödeme veya kimlik bilgilerini mesaj içinde paylaşma.
        </footer>
      </section>
    </div>
  );
}
