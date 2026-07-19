"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import Link from "next/link";

type ConversationKind = "order" | "auction" | "support";
type Message = { id: number; mine?: boolean; text: string; time: string; system?: boolean };
type Conversation = {
  id: string;
  name: string;
  initials: string;
  verified?: boolean;
  online?: boolean;
  unread: number;
  kind: ConversationKind;
  product: string;
  orderId?: string;
  price: string;
  image: string;
  lastMessage: string;
  time: string;
  messages: Message[];
};

type IconName = "search" | "shield" | "send" | "paperclip" | "more" | "box" | "gavel" | "headset" | "check" | "back" | "flag" | "lock";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    shield: <><path d="M12 3 4.5 6v5.2c0 4.6 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.2 7.5-9.8V6z"/><path d="m9 12 2 2 4-4"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>,
    paperclip: <path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.7 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    box: <><path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>,
    gavel: <><path d="m14 4 6 6M12 6l6 6M3 21l8-8M8 3l8 8-4 4-8-8zM14 18h7"/></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M18 19c0 1.1-.9 2-2 2h-4M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    back: <path d="m15 18-6-6 6-6"/>,
    flag: <><path d="M5 22V4M5 5h11l-2 4 2 4H5"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const initialConversations: Conversation[] = [
  {
    id: "mert-teknoloji", name: "Mert Teknoloji", initials: "MT", verified: true, online: true, unread: 2, kind: "order",
    product: "iPhone 15 Pro Max 256 GB", orderId: "KK-24931", price: "58.750 TL",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80",
    lastMessage: "Ürün bugün kargoya verilecek.", time: "11:42",
    messages: [
      { id: 1, text: "Bu görüşme KapışKapış güvenli mesajlaşma kurallarıyla korunur.", time: "10:18", system: true },
      { id: 2, text: "Merhaba, ürünün kutusu, faturası ve orijinal şarj kablosu mevcut.", time: "10:20" },
      { id: 3, mine: true, text: "Teşekkürler. Pil sağlığı yüzde kaç ve bugün kargoya verebilir misiniz?", time: "10:24" },
      { id: 4, text: "Pil sağlığı %94. Öğleden sonra KapışKapış Kargo koduyla teslim edeceğim.", time: "10:31" },
      { id: 5, mine: true, text: "Tamamdır, kargo bilgisini buradan bekliyorum.", time: "10:34" },
      { id: 6, text: "Ürün bugün kargoya verilecek. Takip kodu oluşunca sistem otomatik paylaşacak.", time: "11:42" },
    ],
  },
  {
    id: "prestige-saat", name: "Prestige Saat", initials: "PS", verified: true, unread: 0, kind: "order",
    product: "Rolex Submariner Date 126610LN", orderId: "KK-24891", price: "125.000 TL",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=500&q=80",
    lastMessage: "Kargo takip numarası siparişe eklendi.", time: "Dün",
    messages: [
      { id: 1, text: "Saat ekspertiz raporuyla birlikte gönderilecektir.", time: "16:04" },
      { id: 2, mine: true, text: "Paketleme sırasında kutunun fotoğrafını paylaşabilir misiniz?", time: "16:08" },
      { id: 3, text: "Elbette. Kargo takip numarası siparişe eklendi.", time: "18:22" },
    ],
  },
  {
    id: "retro-koleksiyon", name: "Retro Koleksiyon", initials: "RK", verified: true, unread: 1, kind: "auction",
    product: "Nintendo Game Boy Color CIB", price: "12.400 TL",
    image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=500&q=80",
    lastMessage: "Kutu köşesinin yakın fotoğrafını gönderdim.", time: "Sal",
    messages: [
      { id: 1, mine: true, text: "İlan görsellerinde kutunun sağ alt köşesi tam görünmüyor. Hasar var mı?", time: "14:11" },
      { id: 2, text: "Yırtık yok, yalnızca hafif ezilme mevcut. Kutu köşesinin yakın fotoğrafını gönderdim.", time: "14:18" },
    ],
  },
  {
    id: "kapiskapis-destek", name: "KapışKapış Destek", initials: "KK", verified: true, online: true, unread: 0, kind: "support",
    product: "Destek talebi #DST-1842", price: "Yanıt süresi: ~8 dk",
    image: "/kapiskapis-icon.png",
    lastMessage: "Talebiniz güven ekibine aktarıldı.", time: "Cum",
    messages: [
      { id: 1, text: "Merhaba Kemal, ödeme doğrulama talebiniz güven ekibine aktarıldı.", time: "09:12" },
      { id: 2, mine: true, text: "Teşekkürler. Ek belge göndermem gerekiyor mu?", time: "09:14" },
      { id: 3, text: "Şimdilik gerek yok. Gelişme olduğunda bildirim göndereceğiz.", time: "09:16" },
    ],
  },
];

const quickReplies = ["Teşekkürler, takipteyim.", "Kargo kodunu paylaşır mısınız?", "Ürünün güncel fotoğrafını rica ederim."];

export default function MessagingCenterExperience() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | ConversationKind>("all");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileThread, setMobileThread] = useState(false);

  const filtered = useMemo(() => conversations.filter((conversation) => {
    const matchesFilter = filter === "all" || (filter === "unread" ? conversation.unread > 0 : conversation.kind === filter);
    const haystack = `${conversation.name} ${conversation.product} ${conversation.orderId ?? ""} ${conversation.lastMessage}`.toLocaleLowerCase("tr-TR");
    return matchesFilter && haystack.includes(query.toLocaleLowerCase("tr-TR"));
  }), [conversations, filter, query]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];

  function chooseConversation(id: string) {
    setSelectedId(id);
    setMobileThread(true);
    setConversations((items) => items.map((item) => item.id === id ? { ...item, unread: 0 } : item));
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setConversations((items) => items.map((item) => item.id === selected.id ? {
      ...item,
      lastMessage: text,
      time: "Şimdi",
      messages: [...item.messages, { id: Date.now(), mine: true, text, time: "Şimdi" }],
    } : item));
    setDraft("");
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <div className="messagingV7">
      {notice && <button type="button" className="supportToastV7" onClick={() => setNotice("")}><Icon name="check"/><span>{notice}</span></button>}

      <section className={`conversationPanelV7 ${mobileThread ? "mobileHidden" : ""}`}>
        <header>
          <div><span>GELEN KUTUSU</span><strong>{conversations.reduce((sum, item) => sum + item.unread, 0)} okunmamış mesaj</strong></div>
          <button type="button" aria-label="Mesaj seçenekleri"><Icon name="more"/></button>
        </header>

        <label className="messageSearchV7"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kişi, ürün veya sipariş ara" /></label>

        <nav className="messageFiltersV7" aria-label="Mesaj filtreleri">
          {([ ["all", "Tümü"], ["unread", "Okunmamış"], ["order", "Sipariş"], ["auction", "İlan"] ] as Array<["all" | "unread" | ConversationKind, string]>).map(([key, label]) => <button key={key} type="button" className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}</button>)}
        </nav>

        <div className="conversationListV7">
          {filtered.length ? filtered.map((conversation) => (
            <button type="button" key={conversation.id} className={`conversationCardV7 ${selected.id === conversation.id ? "active" : ""}`} onClick={() => chooseConversation(conversation.id)}>
              <span className={`conversationAvatarV7 kind-${conversation.kind}`}>{conversation.initials}{conversation.online && <i />}</span>
              <div><strong>{conversation.name}{conversation.verified && <small><Icon name="check"/></small>}</strong><b>{conversation.product}</b><p>{conversation.lastMessage}</p></div>
              <aside><time>{conversation.time}</time>{conversation.unread > 0 && <em>{conversation.unread}</em>}</aside>
            </button>
          )) : <div className="messageEmptyV7"><Icon name="search"/><strong>Konuşma bulunamadı</strong><span>Arama kelimesini veya filtreyi değiştir.</span></div>}
        </div>
      </section>

      <section className={`chatPanelV7 ${mobileThread ? "mobileVisible" : ""}`}>
        <header className="chatHeaderV7">
          <button type="button" className="chatBackV7" onClick={() => setMobileThread(false)} aria-label="Konuşmalara dön"><Icon name="back"/></button>
          <span className={`conversationAvatarV7 kind-${selected.kind}`}>{selected.initials}{selected.online && <i />}</span>
          <div><strong>{selected.name}{selected.verified && <small><Icon name="check"/></small>}</strong><p>{selected.online ? "Çevrimiçi" : "Son görülme yakın zamanda"} · Doğrulanmış hesap</p></div>
          <button type="button" className="chatMoreV7" onClick={() => showNotice("Konuşma seçenekleri açılacak.")} aria-label="Konuşma seçenekleri"><Icon name="more"/></button>
        </header>

        <div className="chatContextV7">
          <img src={selected.image} alt="" />
          <div><span>{selected.kind === "support" ? "DESTEK KAYDI" : selected.orderId ? `SİPARİŞ #${selected.orderId}` : "AÇIK ARTIRMA"}</span><strong>{selected.product}</strong><small>{selected.price}</small></div>
          {selected.orderId ? <Link href={`/siparisler?order=${selected.orderId}`}>Siparişi gör</Link> : selected.kind === "support" ? <Link href="/yardim">Talebi gör</Link> : <Link href="/canli">İlanı gör</Link>}
        </div>

        <div className="chatSafetyV7"><Icon name="lock"/><span>Ödeme ve iletişimi KapışKapış dışında sürdürme. Şüpheli mesajları bildir.</span></div>

        <div className="chatMessagesV7">
          <div className="chatDateV7">BUGÜN</div>
          {selected.messages.map((message) => message.system ? (
            <div className="systemMessageV7" key={message.id}><Icon name="shield"/><span>{message.text}</span></div>
          ) : (
            <div className={`chatBubbleRowV7 ${message.mine ? "mine" : ""}`} key={message.id}>
              <div className="chatBubbleV7"><p>{message.text}</p><small>{message.time}{message.mine && <Icon name="check"/>}</small></div>
            </div>
          ))}
        </div>

        <div className="quickRepliesV7">{quickReplies.map((reply) => <button type="button" key={reply} onClick={() => setDraft(reply)}>{reply}</button>)}</div>

        <form className="chatComposerV7" onSubmit={sendMessage}>
          <button type="button" onClick={() => showNotice("Fotoğraf ve belge yükleme sonraki backend bağlantısında etkinleşecek.")} aria-label="Dosya ekle"><Icon name="paperclip"/></button>
          <textarea rows={1} maxLength={1000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Güvenli mesajını yaz..." />
          <button type="submit" disabled={!draft.trim()} aria-label="Mesaj gönder"><Icon name="send"/></button>
        </form>
      </section>

      <aside className="chatInfoV7">
        <section className="trustScoreV7"><span><Icon name="shield"/></span><div><small>GÜVEN DURUMU</small><strong>Doğrulanmış işlem</strong><p>Ödeme, mesajlaşma ve teslimat KapışKapış korumasında.</p></div></section>
        <section className="chatInfoCardV7"><h3>İşlem özeti</h3><div><span><Icon name={selected.kind === "auction" ? "gavel" : selected.kind === "support" ? "headset" : "box"}/></span><p><strong>{selected.product}</strong><small>{selected.orderId ? `Sipariş #${selected.orderId}` : selected.price}</small></p></div>{selected.orderId && <Link href="/siparisler">Sipariş merkezine git</Link>}</section>
        <section className="safeRulesV7"><h3>Güvenli konuşma</h3><p><Icon name="check"/> Kart, IBAN veya şifre paylaşma.</p><p><Icon name="check"/> Platform dışı ödeme teklifini kabul etme.</p><p><Icon name="check"/> Ürünle ilgili kararları burada kayda al.</p></section>
        <button className="reportChatV7" type="button" onClick={() => showNotice("Konuşma güven ekibine bildirilmek üzere işaretlendi.")}><Icon name="flag"/> Konuşmayı bildir</button>
      </aside>
    </div>
  );
}
