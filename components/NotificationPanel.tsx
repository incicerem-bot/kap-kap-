"use client";

import type { AppNotification } from "./types";

type NotificationPanelProps = {
  open: boolean;
  notifications: AppNotification[];
  loading: boolean;
  onClose: () => void;
  onOpenNotification: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
};

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60_000));

  if (minutes < 1) return "Şimdi";
  if (minutes < 60) return `${minutes} dk önce`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;

  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function NotificationPanel({
  open,
  notifications,
  loading,
  onClose,
  onOpenNotification,
  onMarkAllRead,
}: NotificationPanelProps) {
  if (!open) return null;

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="notificationOverlay" onMouseDown={onClose}>
      <aside
        className="notificationPanel"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="notificationHeader">
          <div>
            <span>KAPIŞKAPIŞ</span>
            <h2>Bildirimler</h2>
          </div>

          <div className="notificationHeaderActions">
            {unreadCount > 0 && (
              <button type="button" onClick={onMarkAllRead}>
                Tümünü okundu yap
              </button>
            )}
            <button className="notificationClose" type="button" onClick={onClose}>
              ×
            </button>
          </div>
        </header>

        <div className="notificationSummary">
          <strong>{unreadCount}</strong>
          <span>okunmamış bildirim</span>
        </div>

        <div className="notificationList">
          {loading ? (
            <div className="notificationEmpty">Bildirimler yükleniyor...</div>
          ) : notifications.length === 0 ? (
            <div className="notificationEmpty">
              <strong>Henüz bildirimin yok.</strong>
              <span>Teklif ve açık artırma gelişmeleri burada görünecek.</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                className={`notificationItem ${
                  notification.is_read ? "" : "notificationUnread"
                }`}
                type="button"
                key={notification.id}
                onClick={() => onOpenNotification(notification)}
              >
                <span className="notificationType">
                  {notification.type === "new_bid"
                    ? "YT"
                    : notification.type === "outbid"
                      ? "TG"
                      : notification.type === "auction_won"
                        ? "KZ"
                        : notification.type === "auction_ended"
                          ? "BT"
                          : "BL"}
                </span>

                <div className="notificationContent">
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                  <small>{relativeTime(notification.created_at)}</small>
                </div>

                {!notification.is_read && <span className="unreadDot" />}
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
