"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FAVORITES_STORAGE_KEY, defaultFavoriteIds, useStoredIds } from "@/components/useMarketplaceCollections";
import { useNotifications } from "@/components/useNotifications";
import { useAuth } from "@/components/AuthProvider";
import {
  accountSecurityItems,
  adminMenuItems,
  auctionMenuItems,
  buyerAccountItems,
  categoryMenuItems,
  gameItemMenuItems,
  marketModeItems,
  sellerMenuItems,
  type NavigationIcon,
  type NavigationItem,
} from "@/components/marketplaceNavigation";

function Icon({ name }: { name: NavigationIcon }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<NavigationIcon, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    markets: <><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></>,
    auction: <><path d="m4 15 7-7 5 5-7 7z"/><path d="m13 6 2-2 5 5-2 2M14 18h7"/></>,
    live: <><circle cx="12" cy="12" r="2.5"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4"/><path d="M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4"/></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6z"/>,
    tag: <><path d="M20 13 11 22l-9-9V4h9z"/><circle cx="7.5" cy="8.5" r="1.5"/></>,
    gameItem: <><path d="M5 4h14v16H5z"/><path d="M9 8h6M8 12h8M10 16h4"/><path d="m3 7 2-1M19 6l2 1"/></>,
    phone: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></>,
    computer: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    game: <><path d="M8 8h8a5 5 0 0 1 4.7 6.7l-1 3a2 2 0 0 1-3.3.8L14 16h-4l-2.4 2.5a2 2 0 0 1-3.3-.8l-1-3A5 5 0 0 1 8 8Z"/><path d="M8 11v4M6 13h4M16.5 12.5h.01M18.5 14.5h.01"/></>,
    camera: <><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></>,
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
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></>,
    store: <><path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6"/><path d="M8 20v-6h8v6"/></>,
    orders: <><path d="M6 3h12l2 4-2 14H6L4 7z"/><path d="M4 7h16M9 11h6"/></>,
    shipping: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/><path d="M15 11h7v4h-7z"/></>,
    support: <><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13H2v5h4v-5zM20 13h2v5h-4v-5zM18 19c-1 2-3 2-5 2"/></>,
    users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 5"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function isPathActive(pathname: string, href: string) {
  const cleanHref = href.split("?")[0].split("#")[0];
  if (cleanHref === "/") return pathname === "/";
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function SidebarLinks({ items, pathname }: { items: NavigationItem[]; pathname: string }) {
  return <>{items.map((item) => <Link key={item.href} href={item.href} className={isPathActive(pathname, item.href) ? "active" : ""}><span>{item.icon && <Icon name={item.icon} />}</span><em>{item.label}</em>{item.badge && <small className="sidebarBadgeV30">{item.badge}</small>}</Link>)}</>;
}

export default function MarketplaceShell({ title, eyebrow, description, children, action, compact = false }: {
  title: string; eyebrow?: string; description?: string; children: ReactNode; action?: ReactNode; compact?: boolean;
}) {
  const pathname = usePathname();
  const favorites = useStoredIds(FAVORITES_STORAGE_KEY, defaultFavoriteIds);
  const { unreadCount: unreadNotificationCount } = useNotifications();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const role = profile?.role ?? "buyer";
  const isSeller = role === "seller";
  const isAdmin = role === "admin";
  const sellerStatus = profile?.sellerStatus ?? "not_started";
  const isSellerCandidate = !isSeller && !isAdmin && ["pending", "rejected", "suspended"].includes(sellerStatus);
  const sellerTarget = (path: string) => isSeller ? path : `/satici-dogrulama?required=seller&returnTo=${encodeURIComponent(path)}`;
  const sellHref = sellerTarget("/ilan-olustur");
  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Hesabım";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("tr-TR") || "KK";

  return (
    <main className="marketApp">
      <header className="marketHeader">
        <Link href="/" className="marketBrand" aria-label="KapışKapış ana sayfa"><img src="/kapiskapis-logo.png" alt="KapışKapış" /></Link>
        <form className="marketHeaderSearch" action="/arama" method="get" role="search"><Icon name="search" /><input name="q" type="search" placeholder="Ürün, marka, oyun veya item ara" aria-label="KapışKapış pazarlarında ara" /><button type="submit">Ara</button></form>

        <nav className="marketTopActions" aria-label="Kullanıcı işlemleri">
          {user ? <>
            <Link href="/favoriler" aria-label="Favoriler"><Icon name="heart" />{favorites.ids.length > 0 && <small>{favorites.ids.length}</small>}</Link>
            <Link href="/bildirimler" aria-label="Bildirimler"><Icon name="bell" />{unreadNotificationCount > 0 && <small>{unreadNotificationCount}</small>}</Link>
            <Link href="/mesajlar" aria-label="Mesajlar"><Icon name="message" /></Link>
            <Link href="/profil" className="marketIdentityV19" aria-label="Profil"><span>{initials}</span><div><b>{displayName}</b><small>{isAdmin ? "Yönetici" : isSeller ? "Satıcı" : isSellerCandidate ? "Satıcı adayı" : "Alıcı"}</small></div></Link>
          </> : !authLoading && <div className="marketGuestActionsV19"><Link href="/giris">Giriş yap</Link><Link href="/kayit">Kayıt ol</Link></div>}
          <details className="marketSellMenuV30">
            <summary><Icon name="plus" /><span>Satış Yap</span></summary>
            <div>
              <Link href={sellerTarget("/ilan-olustur?mode=auction")}><Icon name="auction" /><span><b>Açık artırma oluştur</b><small>Teklifli ve süreli satış</small></span></Link>
              <Link href={sellerTarget("/ilan-olustur?mode=fixed")}><Icon name="tag" /><span><b>Sabit fiyatlı ilan</b><small>Doğrudan satın alma</small></span></Link>
              <Link href={sellerTarget("/ilan-olustur?mode=game-item")}><Icon name="gameItem" /><span><b>Oyun itemi sat</b><small>Dijital ürün ilanı</small></span></Link>
            </div>
          </details>
        </nav>
      </header>

      <nav className="marketModeBarV30" aria-label="KapışKapış pazarları">
        <Link href="/pazarlar" className={isPathActive(pathname, "/pazarlar") ? "active all" : "all"}><Icon name="markets" /><span>Tüm Pazarlar</span></Link>
        {marketModeItems.map((item) => <Link key={item.href} href={item.href} className={isPathActive(pathname, item.href) ? "active" : ""}><Icon name={item.icon || "markets"} /><span>{item.label}</span>{item.badge && <small>{item.badge}</small>}</Link>)}
        <Link href="/nasil-calisir" className={isPathActive(pathname, "/nasil-calisir") ? "active help" : "help"}><span>Nasıl Çalışır?</span></Link>
      </nav>

      <div className="marketLayout">
        <aside className="marketSidebar">
          <div className="sidebarSectionLabel">PAZARLAR</div>
          <nav aria-label="Pazarlar"><SidebarLinks items={marketModeItems} pathname={pathname} /></nav>

          <div className="sidebarDivider" />
          <div className="sidebarSectionLabel">AÇIK ARTIRMA</div>
          <nav aria-label="Açık artırma"><SidebarLinks items={auctionMenuItems} pathname={pathname} /></nav>

          <div className="sidebarDivider" />
          <div className="sidebarSectionLabel">KATEGORİLER</div>
          <nav aria-label="Kategoriler"><SidebarLinks items={categoryMenuItems} pathname={pathname} /></nav>

          <details className="sidebarGameItemsV30" open={pathname.startsWith("/oyun-itemleri")}>
            <summary><Icon name="gameItem" /> Oyun İtemi Kategorileri <span>⌄</span></summary>
            <nav aria-label="Oyun itemi kategorileri"><SidebarLinks items={gameItemMenuItems} pathname={pathname} /></nav>
          </details>

          <div className="sidebarDivider" />
          <div className="sidebarSectionLabel">{user ? "HESABIM" : "ÜYELİK"}</div>
          <nav className="accountMenu accountMenuV30" aria-label="Hesabım">
            {user ? <>
              <SidebarLinks items={buyerAccountItems} pathname={pathname} />
              {isSeller && <><span className="sidebarSubLabelV30">SATICI İŞLEMLERİ</span><SidebarLinks items={sellerMenuItems} pathname={pathname} /></>}
              {!isSeller && !isAdmin && <Link href="/satici-dogrulama" className={isPathActive(pathname, "/satici-dogrulama") ? "active" : ""}><span><Icon name="store" /></span><em>{isSellerCandidate ? "Satıcı Başvurum" : "Satıcı Ol"}</em></Link>}
              {isAdmin && <><span className="sidebarSubLabelV30">YÖNETİM</span><SidebarLinks items={adminMenuItems} pathname={pathname} /></>}
              <span className="sidebarSubLabelV30">GÜVENLİK & DESTEK</span>
              <SidebarLinks items={accountSecurityItems} pathname={pathname} />
              <button type="button" className="accountLogoutV19" onClick={() => void signOut()}><Icon name="logout" /> Güvenli çıkış</button>
            </> : <>
              <Link href="/giris"><span><Icon name="user" /></span><em>Giriş yap</em></Link>
              <Link href="/kayit"><span><Icon name="plus" /></span><em>Ücretsiz kayıt ol</em></Link>
              <SidebarLinks items={accountSecurityItems.slice(2)} pathname={pathname} />
            </>}
          </nav>

          <div className="sidebarPromo"><span>{isSeller ? "ÜÇ PAZARDA SATIŞ" : isSellerCandidate ? "SATICI BAŞVURUSU" : "SATICI OL"}</span><strong>{isSeller ? "Satış türünü seç" : isSellerCandidate ? "Başvurunu tamamla" : "Mağazanı aç"}</strong><p>{isSeller ? "Açık artırma, sabit fiyat veya oyun itemi ilanı oluştur." : isSellerCandidate ? "Ödeme ve mağaza onay adımlarını takip et." : "Doğrulamayı tamamla ve üç pazarda satışa başla."}</p><Link href={sellHref}>{isSeller ? "Satış oluştur" : isSellerCandidate ? "Başvuruyu görüntüle" : "Satıcı başvurusu"}</Link></div>
        </aside>

        <section className={`marketContent ${compact ? "marketContentCompact" : ""}`}>
          {!compact && <div className="marketPageHead"><div>{eyebrow && <span className="marketEyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div>{action}</div>}</div>}
          {children}
          <footer className="marketFooter marketFooterV30">
            <div><img src="/kapiskapis-logo.png" alt="KapışKapış" /><p>Açık artırma, sabit fiyatlı alışveriş ve oyun itemleri için tek güvenli pazar altyapısı.</p></div>
            <div><strong>PAZARLAR</strong><nav><Link href="/acik-artirma">Açık Artırma</Link><Link href="/sabit-fiyat">Sabit Fiyat</Link><Link href="/oyun-itemleri">Oyun İtemleri</Link><Link href="/pazarlar">Tüm Pazarlar</Link></nav></div>
            <div><strong>HESAP & SATIŞ</strong><nav><Link href={sellHref}>Satış Yap</Link><Link href="/siparisler">Siparişler</Link><Link href="/tekliflerim">Tekliflerim</Link><Link href="/satici-dogrulama">Satıcı Ol</Link></nav></div>
            <div><strong>DESTEK</strong><nav><Link href="/nasil-calisir">Nasıl çalışır?</Link><Link href="/yardim">Yardım merkezi</Link><Link href="/hukuk">Hukuk ve güven</Link><Link href="/hukuk?doc=gizlilik">KVKK & Gizlilik</Link></nav></div>
            <small>© 2026 KapışKapış. Tüm hakları saklıdır.</small>
          </footer>
        </section>
      </div>

      <nav className="marketMobileNav marketMobileNavV30" aria-label="Mobil menü">
        <Link href="/" className={pathname === "/" ? "active" : ""}><Icon name="home" /><span>Ana Sayfa</span></Link>
        <Link href="/pazarlar" className={isPathActive(pathname, "/pazarlar") || isPathActive(pathname, "/acik-artirma") || isPathActive(pathname, "/sabit-fiyat") || isPathActive(pathname, "/oyun-itemleri") ? "active" : ""}><Icon name="markets" /><span>Pazarlar</span></Link>
        <Link href={sellHref} className="mobileSell" aria-label="Satış oluştur"><Icon name="plus" /></Link>
        <Link href={user ? "/siparisler" : "/giris?returnTo=/siparisler"} className={isPathActive(pathname, "/siparisler") ? "active" : ""}><Icon name="orders" /><span>Siparişler</span></Link>
        <Link href={user ? "/profil" : "/giris"} className={isPathActive(pathname, "/profil") ? "active" : ""}><Icon name="user" /><span>{user ? "Hesabım" : "Giriş"}</span></Link>
      </nav>
    </main>
  );
}
