"use client";

type NavbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  favoriteCount: number;
  notificationCount: number;
  showFavoritesOnly: boolean;
  userLabel: string;
  loggedIn: boolean;
  onOpenAuth: () => void;
  onOpenSell: () => void;
  onToggleFavorites: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
};

export default function Navbar(props: NavbarProps) {
  return (
    <header className="navbar premiumNavbar">
      <button className="brand premiumBrand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <img className="brandImage" src="/kapiskapis-logo.png" alt="KapışKapış" />
      </button>

      <label className="navSearch premiumSearch">
        <input value={props.query} onChange={(e) => props.onQueryChange(e.target.value)} placeholder="Ürün, kategori veya marka ara..." />
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      </label>

      <nav className="desktopNavLinks" aria-label="Ana menü">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Ana Sayfa</button>
        <button onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}>Kategoriler</button>
        <button onClick={() => document.getElementById("live-auctions")?.scrollIntoView({ behavior: "smooth" })}>Canlı Açık Artırmalar</button>
        <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>Nasıl Çalışır?</button>
      </nav>

      <div className="navActions premiumNavActions">
        <button className={`iconButton ${props.showFavoritesOnly ? "selectedIconButton" : ""}`} type="button" aria-label="Favoriler" onClick={props.onToggleFavorites}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
          {props.favoriteCount > 0 && <small>{props.favoriteCount}</small>}
        </button>
        <button className="iconButton" type="button" aria-label="Bildirimler" onClick={props.onOpenNotifications}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
          {props.notificationCount > 0 && <small>{props.notificationCount}</small>}
        </button>
        {props.loggedIn ? (
          <button className="profileButton" type="button" onClick={props.onOpenProfile}><span>{props.userLabel.slice(0, 1).toLocaleUpperCase("tr")}</span></button>
        ) : (
          <button className="loginButton" type="button" onClick={props.onOpenAuth}>Giriş Yap</button>
        )}
        <button className="sellButton" type="button" onClick={props.onOpenSell}>{props.loggedIn ? "İlan Ver" : "Kayıt Ol"}</button>
      </div>
    </header>
  );
}
