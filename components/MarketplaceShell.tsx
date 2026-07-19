"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { marketplaceNotifications } from "@/components/notificationData";
import { FAVORITES_STORAGE_KEY, READ_NOTIFICATIONS_STORAGE_KEY, defaultFavoriteIds, defaultReadNotificationIds, useStoredIds } from "@/components/useMarketplaceCollections";

type IconName =
  | "home"
  | "live"
  | "bolt"
  | "phone"
  | "computer"
  | "game"
  | "watch"
  | "collection"
  | "electronics"
  | "house"
  | "heart"
  | "bell"
  | "message"
  | "user"
  | "bid"
  | "search"
  | "plus";

function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    live: <><circle cx="12" cy="12" r="2.5"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4"/><path d="M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4"/></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6z"/>,
    phone: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></>,
    computer: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    game: <><path d="M8 8h8a5 5 0 0 1 4.7 6.7l-1 3a2 2 0 0 1-3.3.8L14 16h-4l-2.4 2.5a2 2 0 0 1-3.3-.8l-1-3A5 5 0 0 1 8 8Z"/><path d="M8 11v4M6 13h4M16.5 12.5h.01M18.5 14.5h.01"/></>,
    watch: <><circle cx="12" cy="12" r="5"/><path d="M9 2h6l1 5M9 22h6l1-5M12 9v3l2 1"/></>,
    collection: <><path d="M4 7h16v13H4z"/><path d="M7 4h10v3M8 11h8M8 15h5"/></>,
    electronics: <><path d="M5 5h14v14H5z"/><path d="M9 9h6v6H9zM2 9h3M19 9h3M2 15h3M19 15h3M9 2v3M15 2v3M9 19v3M15 19v3"/></>,
    house: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
    bid: <><path d="m4 15 7-7 5 5-7 7z"/><path d="m13 6 2-2 5 5-2 2M14 18h7"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

const menu: Array<[string, IconName, string]> = [
  ["/", "home", "Ana Sayfa"],
  ["/canli", "live", "Canlı Açık Artırmalar"],
  ["/son-dakika", "bolt", "Son Dakika"],
  ["/kategori/telefon", "phone", "Telefon"],
  ["/kategori/bilgisayar", "computer", "Bilgisayar"],
  ["/kategori/oyun", "game", "Oyun & Konsol"],
  ["/kategori/saat", "watch", "Saat"],
  ["/kategori/koleksiyon", "collection", "Koleksiyon"],
  ["/kategori/elektronik", "electronics", "Elektronik"],
  ["/kategori/ev-yasam", "house", "Ev & Yaşam"],
];

const account = [
  ["/profil", "Profilim"],
  ["/ilanlarim", "Satış Merkezi"],
  ["/satici-dogrulama", "Satıcı Doğrulama"],
  ["/teklif-guvencesi", "Teklif Güvencesi"],
  ["/tekliflerim", "Tekliflerim"],
  ["/favoriler", "Favorilerim"],
  ["/karsilastir", "Ürün Karşılaştırma"],
  ["/siparisler", "Siparişlerim"],
  ["/kargo", "Kargo ve İadeler"],
  ["/uyusmazlik", "Uyuşmazlıklar"],
  ["/mesajlar", "Mesajlar"],
  ["/bildirimler", "Bildirimler"],
  ["/cuzdan", "Cüzdanım"],
  ["/ayarlar", "Ayarlar ve Güvenlik"],
  ["/yonetim", "Yönetim Merkezi"],
  ["/hukuk", "Hukuk ve Güven"],
];

export default function MarketplaceShell({
  title,
  eyebrow,
  description,
  children,
  action,
  compact = false,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const favorites = useStoredIds(FAVORITES_STORAGE_KEY, defaultFavoriteIds);
  const readNotifications = useStoredIds(READ_NOTIFICATIONS_STORAGE_KEY, defaultReadNotificationIds);
  const unreadNotificationCount = marketplaceNotifications.filter((item) => !readNotifications.ids.includes(item.id)).length;

  return (
    <main className="marketApp">
      <header className="marketHeader">
        <Link href="/" className="marketBrand" aria-label="KapışKapış ana sayfa">
          <img src="/kapiskapis-logo.png" alt="KapışKapış" />
        </Link>

        <form className="marketHeaderSearch" action="/arama" method="get" role="search">
          <Icon name="search" />
          <input name="q" type="search" placeholder="Ürün, marka veya kategori ara" aria-label="Açık artırmalarda ara" />
          <button type="submit">Ara</button>
        </form>

        <nav className="marketTopActions" aria-label="Kullanıcı işlemleri">
          <Link href="/favoriler" aria-label="Favoriler"><Icon name="heart" />{favorites.ids.length > 0 && <small>{favorites.ids.length}</small>}</Link>
          <Link href="/bildirimler" aria-label="Bildirimler"><Icon name="bell" />{unreadNotificationCount > 0 && <small>{unreadNotificationCount}</small>}</Link>
          <Link href="/mesajlar" aria-label="Mesajlar"><Icon name="message" /></Link>
          <Link href="/profil" className="marketAvatar" aria-label="Profil"><Icon name="user" /></Link>
          <Link href="/ilan-olustur" className="marketSell"><Icon name="plus" /> İlan Ver</Link>
        </nav>
      </header>

      <div className="marketLayout">
        <aside className="marketSidebar">
          <div className="sidebarSectionLabel">KEŞFET</div>
          <nav aria-label="Kategoriler">
            {menu.map(([href, icon, label]) => (
              <Link key={href} href={href} className={pathname === href ? "active" : ""}>
                <span><Icon name={icon} /></span>{label}
              </Link>
            ))}
          </nav>
          <div className="sidebarDivider" />
          <div className="sidebarSectionLabel">HESABIM</div>
          <nav className="accountMenu" aria-label="Hesabım">
            {account.map(([href, label]) => (
              <Link key={href} href={href} className={pathname === href ? "active" : ""}>{label}</Link>
            ))}
          </nav>
          <div className="sidebarPromo">
            <span>ÜCRETSİZ İLAN</span>
            <strong>Satmaya başla</strong>
            <p>Ürününü birkaç adımda açık artırmaya çıkar.</p>
            <Link href="/ilan-olustur">İlan oluştur</Link>
          </div>
        </aside>

        <section className={`marketContent ${compact ? "marketContentCompact" : ""}`}>
          {!compact && <div className="marketPageHead">
            <div>
              {eyebrow && <span className="marketEyebrow">{eyebrow}</span>}
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>}
          {children}

          <footer className="marketFooter">
            <div>
              <img src="/kapiskapis-logo.png" alt="KapışKapış" />
              <p>Teknoloji ve oyun ürünlerinde güvenli açık artırma deneyimi.</p>
            </div>
            <nav aria-label="Alt menü">
              <Link href="/nasil-calisir">Nasıl çalışır?</Link>
              <Link href="/yardim">Yardım merkezi</Link>
              <Link href="/hukuk">Hukuk ve güven</Link>
              <Link href="/hukuk?doc=gizlilik">KVKK & Gizlilik</Link>
              <Link href="/ilan-olustur">İlan ver</Link>
              <Link href="/canli">Canlı açık artırmalar</Link>
              <Link href="/giris">Giriş yap</Link>
            </nav>
            <small>© 2026 KapışKapış. Tüm hakları saklıdır.</small>
          </footer>
        </section>
      </div>

      <nav className="marketMobileNav" aria-label="Mobil menü">
        <Link href="/" className={pathname === "/" ? "active" : ""}><Icon name="home" /><span>Ana Sayfa</span></Link>
        <Link href="/canli" className={pathname === "/canli" ? "active" : ""}><Icon name="live" /><span>Canlı</span></Link>
        <Link href="/ilan-olustur" className="mobileSell" aria-label="İlan ver"><Icon name="plus" /></Link>
        <Link href="/tekliflerim" className={pathname === "/tekliflerim" ? "active" : ""}><Icon name="bid" /><span>Teklifler</span></Link>
        <Link href="/profil" className={pathname === "/profil" ? "active" : ""}><Icon name="user" /><span>Profil</span></Link>
      </nav>
    </main>
  );
}
