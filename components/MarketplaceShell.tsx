"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const menu = [
  ["/", "⌂", "Ana Sayfa"],
  ["/canli", "◉", "Canlı Açık Artırmalar"],
  ["/son-dakika", "⚡", "Son Dakika"],
  ["/kategori/telefon", "▣", "Telefon"],
  ["/kategori/bilgisayar", "▤", "Bilgisayar"],
  ["/kategori/oyun", "◆", "Oyun & Konsol"],
  ["/kategori/saat", "◷", "Saat"],
  ["/kategori/koleksiyon", "◇", "Koleksiyon"],
  ["/kategori/elektronik", "⌁", "Elektronik"],
  ["/kategori/ev-yasam", "⌂", "Ev & Yaşam"],
];

const account = [
  ["/profil", "Profilim"],
  ["/ilanlarim", "İlanlarım"],
  ["/tekliflerim", "Tekliflerim"],
  ["/favoriler", "Favorilerim"],
  ["/siparisler", "Siparişlerim"],
  ["/mesajlar", "Mesajlar"],
  ["/bildirimler", "Bildirimler"],
  ["/cuzdan", "Cüzdanım"],
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

  return (
    <main className="marketApp">
      <header className="marketHeader">
        <Link href="/" className="marketBrand" aria-label="KapışKapış ana sayfa">
          <img src="/kapiskapis-logo.png" alt="KapışKapış" />
        </Link>
        <nav className="desktopMainLinks"><Link href="/">Ana Sayfa</Link><Link href="/kategori/elektronik">Kategoriler</Link><Link href="/canli">Canlı Açık Artırmalar</Link><Link href="/nasil-calisir">Nasıl Çalışır?</Link></nav>
        <nav className="marketTopActions">
          <Link href="/favoriler" aria-label="Favoriler">♡<small>11</small></Link>
          <Link href="/bildirimler" aria-label="Bildirimler">♧<small>3</small></Link>
          <Link href="/mesajlar" aria-label="Mesajlar">▢</Link>
          <Link href="/ilan-olustur" className="marketSell">+ İlan Ver</Link>
        </nav>
      </header>

      <div className="marketLayout">
        <aside className="marketSidebar">
          <div className="sidebarSectionLabel">KEŞFET</div>
          <nav>
            {menu.map(([href, icon, label]) => (
              <Link key={href} href={href} className={pathname === href ? "active" : ""}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </nav>
          <div className="sidebarDivider" />
          <div className="sidebarSectionLabel">HESABIM</div>
          <nav className="accountMenu">
            {account.map(([href, label]) => (
              <Link key={href} href={href} className={pathname === href ? "active" : ""}>{label}</Link>
            ))}
          </nav>
          <div className="sidebarPromo">
            <strong>Satmaya başla</strong>
            <p>Ürününü dakikalar içinde açık artırmaya çıkar.</p>
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
        </section>
      </div>

      <nav className="marketMobileNav">
        <Link href="/">⌂<span>Ana Sayfa</span></Link>
        <Link href="/canli">◉<span>Canlı</span></Link>
        <Link href="/ilan-olustur" className="mobileSell">＋</Link>
        <Link href="/tekliflerim">◆<span>Teklifler</span></Link>
        <Link href="/profil">●<span>Profil</span></Link>
      </nav>
    </main>
  );
}
