"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Auction, Bid, LiveRoomMessage } from "./types";

function money(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function timeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type Props = {
  open: boolean;
  auction: Auction | null;
  bids: Bid[];
  currentUserId: string;
  currentUserName: string;
  bidAmount: string;
  loading: boolean;
  onClose: () => void;
  onBidAmountChange: (value: string) => void;
  onSubmitBid: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LiveAuctionRoom({
  open,
  auction,
  bids,
  currentUserId,
  currentUserName,
  bidAmount,
  loading,
  onClose,
  onBidAmountChange,
  onSubmitBid,
}: Props) {
  const [viewerCount, setViewerCount] = useState(1);
  const [messages, setMessages] = useState<LiveRoomMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [clock, setClock] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const isLeader = useMemo(
    () => Boolean(currentUserId && bids[0]?.bidder_id === currentUserId),
    [bids, currentUserId]
  );

  useEffect(() => {
    if (!open || !auction) return;
    const timer = window.setInterval(() => setClock(timeLeft(auction.ends_at)), 1000);
    setClock(timeLeft(auction.ends_at));
    return () => window.clearInterval(timer);
  }, [open, auction?.id, auction?.ends_at]);

  useEffect(() => {
    if (!open || !auction) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase
      .from("live_room_messages")
      .select("id, auction_id, user_id, user_name, body, created_at")
      .eq("auction_id", auction.id)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => setMessages((data ?? []) as LiveRoomMessage[]));

    const channel = supabase.channel(`live-room:${auction.id}`, {
      config: { presence: { key: currentUserId || crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setViewerCount(Math.max(1, Object.keys(state).length));
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_room_messages",
          filter: `auction_id=eq.${auction.id}`,
        },
        (payload) => {
          const incoming = payload.new as LiveRoomMessage;
          setMessages((current) =>
            current.some((item) => item.id === incoming.id)
              ? current
              : [...current, incoming].slice(-100)
          );
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId || null,
            user_name: currentUserName || "İzleyici",
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [open, auction?.id, currentUserId, currentUserName]);

  async function sendChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auction || !currentUserId || !chatText.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setChatLoading(true);
    const { error } = await supabase.from("live_room_messages").insert({
      auction_id: auction.id,
      user_id: currentUserId,
      user_name: currentUserName || "KapışKapış Kullanıcısı",
      body: chatText.trim(),
    });
    setChatLoading(false);
    if (!error) setChatText("");
  }

  if (!open || !auction) return null;

  return (
    <div className="liveRoomOverlay" onMouseDown={onClose}>
      <section className="liveRoom" onMouseDown={(event) => event.stopPropagation()}>
        <header className="liveRoomHeader">
          <div>
            <span>CANLI AÇIK ARTIRMA ODASI</span>
            <h2>{auction.title}</h2>
          </div>
          <div className="liveRoomHeaderMeta">
            <strong>{viewerCount} izleyici</strong>
            <button type="button" onClick={onClose}>×</button>
          </div>
        </header>

        <div className="liveRoomMain">
          <section className="liveRoomStage">
            <div className="liveRoomImage">
              {auction.image_url ? (
                <img src={auction.image_url} alt={auction.title} />
              ) : (
                <span>KK</span>
              )}
              <div className="roomLiveBadge">CANLI</div>
            </div>

            <div className="roomPriceBoard">
              <div>
                <span>Güncel teklif</span>
                <strong>{money(Number(auction.current_price))}</strong>
              </div>
              <div>
                <span>Kalan süre</span>
                <strong className={clock.startsWith("00:00") ? "roomUrgent" : ""}>{clock}</strong>
              </div>
            </div>

            <div className={`leaderBanner ${isLeader ? "leaderMine" : ""}`}>
              <span>{isLeader ? "LİDER SENSİN" : "EN YÜKSEK TEKLİF"}</span>
              <strong>{bids[0] ? money(Number(bids[0].amount)) : "Henüz teklif yok"}</strong>
            </div>

            <form className="roomBidForm" onSubmit={onSubmitBid}>
              <label>
                Teklif tutarın
                <div>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(event) => onBidAmountChange(event.target.value)}
                    min={Number(auction.current_price) + Number(auction.min_increment)}
                    required
                  />
                  <span>₺</span>
                </div>
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Teklif veriliyor..." : "KAPIŞ! — Canlı Teklif Ver"}
              </button>
            </form>

            <p className="roomExtensionNote">
              Son 2 dakikada gelen teklif, açık artırmayı otomatik 2 dakika uzatır.
            </p>
          </section>

          <aside className="liveRoomSidebar">
            <section className="roomFeed">
              <header><span>TEKLİF AKIŞI</span><strong>{bids.length}</strong></header>
              <div>
                {bids.length === 0 ? (
                  <p>İlk teklifi sen ver.</p>
                ) : (
                  bids.slice(0, 20).map((bid, index) => (
                    <article key={bid.id} className={index === 0 ? "topBid" : ""}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><strong>{money(Number(bid.amount))}</strong><small>{new Date(bid.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</small></div>
                      <b>{index === 0 ? "Lider" : "Geçildi"}</b>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="roomChat">
              <header><span>CANLI SOHBET</span><strong>{messages.length}</strong></header>
              <div className="roomChatMessages">
                {messages.length === 0 ? <p>Henüz mesaj yok.</p> : messages.map((message) => (
                  <article key={message.id}>
                    <strong>{message.user_name}</strong>
                    <span>{message.body}</span>
                  </article>
                ))}
              </div>
              <form onSubmit={sendChat}>
                <input
                  value={chatText}
                  onChange={(event) => setChatText(event.target.value)}
                  placeholder={currentUserId ? "Sohbete yaz..." : "Sohbet için giriş yap"}
                  disabled={!currentUserId}
                  maxLength={300}
                />
                <button type="submit" disabled={!currentUserId || chatLoading || !chatText.trim()}>
                  Gönder
                </button>
              </form>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
