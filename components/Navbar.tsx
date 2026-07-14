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

export default function Navbar({
  query,
  onQueryChange,
  favoriteCount,
  notificationCount,
  showFavoritesOnly,
  userLabel,
  loggedIn,
  onOpenAuth,
  onOpenSell,
  onToggleFavorites,
  onOpenNotifications,
  onOpenProfile,
}: NavbarProps) {
  return (
    <header className="navbar">
      <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <img className="brandImage" src="/kapiskapis-icon.png" alt="KapışKapış" />
        <strong>KAPIŞKAPIŞ</strong>
      </button>

      <label className="navSearch">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ne arıyorsun?"
        />
      </label>

      <div className="navActions">
        <button className="sellButton" type="button" onClick={onOpenSell}>
          İlan Ver
        </button>

        <button
          className="iconButton"
          type="button"
          aria-label="Bildirimler"
          onClick={onOpenNotifications}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          {notificationCount > 0 && <small>{notificationCount}</small>}
        </button>

        <button
          className={`iconButton ${showFavoritesOnly ? "selectedIconButton" : ""}`}
          type="button"
          aria-label="Favoriler"
          onClick={onToggleFavorites}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          {favoriteCount > 0 && <small>{favoriteCount}</small>}
        </button>

        {loggedIn ? (
          <button className="profileButton" type="button" onClick={onOpenProfile} title="Profil merkezi">
            <span>{userLabel.slice(0, 1).toLocaleUpperCase("tr")}</span>
          </button>
        ) : (
          <button className="loginButton" type="button" onClick={onOpenAuth}>
            Giriş yap
          </button>
        )}
      </div>
    </header>
  );
}
