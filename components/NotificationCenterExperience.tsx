"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { marketplaceNotifications, type NotificationKind } from "@/components/notificationData";
import { READ_NOTIFICATIONS_STORAGE_KEY, defaultReadNotificationIds, useStoredIds } from "@/components/useMarketplaceCollections";

type FilterKey = "all" | "unread" | NotificationKind;
type IconName = "gavel" | "box" | "message" | "user" | "campaign" | "check" | "settings" | "trash" | "arrow" | "bell";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    gavel: <><path d="m14 5 5 5M12 7l5 5M4 20l8-8M8 4l4-2 8 8-2 4z" /><path d="M3 21h10" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></>,
    campaign: <><path d="m3 11 14-6v14L3 13z" /><path d="M8 14v5a2 2 0 0 1-2 2H5l-1-8" /><path d="M20 9v6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" /><path d="M10 11v6M14 11v6" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const iconByKind: Record<NotificationKind, IconName> = { auction: "gavel", order: "box", message: "message", account: "user", campaign: "campaign" };
const labelByKind: Record<NotificationKind, string> = { auction: "Açık artırma", order: "Sipariş", message: "Mesaj", account: "Hesap", campaign: "Fırsatlar" };

export default function NotificationCenterExperience() {
  const read = useStoredIds(READ_NOTIFICATIONS_STORAGE_KEY, defaultReadNotificationIds);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({ bid: true, ending: true, order: true, message: true, campaign: false, email: true, push: true });

  const visible = useMemo(() => marketplaceNotifications.filter((item) => !dismissed.includes(item.id)).filter((item) => filter === "all" || (filter === "unread" ? !read.ids.includes(item.id) : item.kind === filter)), [dismissed, filter, read.ids]);
  const unreadCount = marketplaceNotifications.filter((item) => !dismissed.includes(item.id) && !read.ids.includes(item.id)).length;

  return (
    <div className="notificationsV11">
      <section className="notificationStatsV11">
        <article><span><Icon name="bell" /></span><div><strong>{unreadCount}</strong><small>Okunmamış bildirim</small></div></article>
        <article><span><Icon name="gavel" /></span><div><strong>{marketplaceNotifications.filter((item) => item.kind === "auction").length}</strong><small>Açık artırma hareketi</small></div></article>
        <article><span><Icon name="box" /></span><div><strong>{marketplaceNotifications.filter((item) => item.kind === "order").length}</strong><small>Sipariş güncellemesi</small></div></article>
        <button type="button" onClick={() => setSettingsOpen((value) => !value)}><Icon name="settings" /><span>Bildirim tercihleri</span></button>
      </section>

      {settingsOpen && <section className="notificationSettingsV11">
        <header><div><span>BİLDİRİM TERCİHLERİ</span><h2>Neyi, hangi kanaldan almak istiyorsun?</h2></div><button type="button" onClick={() => setSettingsOpen(false)}>Kapat</button></header>
        <div className="notificationPreferenceGridV11">
          {([
            ["bid", "Teklif hareketleri", "Teklifin geçildiğinde veya lider olduğunda"],
            ["ending", "Süre uyarıları", "Takip ettiğin ürün bitmeye yaklaştığında"],
            ["order", "Sipariş ve kargo", "Ödeme, kargo ve teslimat hareketlerinde"],
            ["message", "Mesajlar", "Satıcı veya alıcı yeni mesaj gönderdiğinde"],
            ["campaign", "Fırsatlar", "Kaydedilmiş aramalar ve kampanyalarda"],
          ] as Array<[keyof typeof preferences, string, string]>).map(([key, title, text]) => <label key={key}><div><strong>{title}</strong><small>{text}</small></div><input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} /><span /></label>)}
        </div>
        <footer><div><strong>Teslimat kanalları</strong><span>Kritik güvenlik bildirimleri her zaman uygulama içinde gösterilir.</span></div><label><input type="checkbox" checked={preferences.push} onChange={(event) => setPreferences((current) => ({ ...current, push: event.target.checked }))} /><span /> Anlık bildirim</label><label><input type="checkbox" checked={preferences.email} onChange={(event) => setPreferences((current) => ({ ...current, email: event.target.checked }))} /><span /> E-posta</label></footer>
      </section>}

      <section className="notificationToolbarV11">
        <div>{([['all', 'Tümü'], ['unread', `Okunmamış (${unreadCount})`], ['auction', 'Açık artırma'], ['order', 'Sipariş'], ['message', 'Mesaj'], ['account', 'Hesap']] as Array<[FilterKey, string]>).map(([key, label]) => <button type="button" key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}</button>)}</div>
        {unreadCount > 0 && <button type="button" onClick={() => read.setIds(marketplaceNotifications.map((item) => item.id))}><Icon name="check" /> Tümünü okundu işaretle</button>}
      </section>

      <div className="notificationListV11">
        {visible.map((item) => {
          const unread = !read.ids.includes(item.id);
          return <article key={item.id} className={`${unread ? "unread" : ""} ${item.important ? "important" : ""}`}>
            <button type="button" className="notificationMainV11" onClick={() => read.setIds((current) => current.includes(item.id) ? current : [...current, item.id])}>
              <span className={`notificationIconV11 ${item.kind}`}><Icon name={iconByKind[item.kind]} /></span>
              <div><span>{labelByKind[item.kind]} · {item.time}</span><h3>{item.title}</h3><p>{item.description}</p></div>
              {unread && <i aria-label="Okunmamış" />}
            </button>
            <div className="notificationActionsV11"><Link href={item.href} onClick={() => read.setIds((current) => current.includes(item.id) ? current : [...current, item.id])}>{item.action} <Icon name="arrow" /></Link><button type="button" onClick={() => setDismissed((current) => [...current, item.id])} aria-label="Bildirimi sil"><Icon name="trash" /></button></div>
          </article>;
        })}
        {visible.length === 0 && <section className="notificationEmptyV11"><span><Icon name="check" /></span><h2>Burada yeni bildirim yok</h2><p>Seçtiğin filtredeki tüm hareketleri kontrol ettin.</p><button type="button" onClick={() => setFilter("all")}>Tüm bildirimleri göster</button></section>}
      </div>
    </div>
  );
}
