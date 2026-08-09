import type { MetadataRoute } from "next";

const routes = [
  "", "/pazarlar", "/acik-artirma", "/sabit-fiyat", "/oyun-itemleri", "/canli", "/son-dakika",
  "/nasil-calisir", "/yardim", "/hukuk", "/giris", "/kayit",
  "/kategori/bilgisayar-oyunlari", "/kategori/playstation-oyunlari", "/kategori/xbox-oyunlari",
  "/kategori/nintendo-oyunlari", "/kategori/steam-kodlari", "/kategori/epin-hediye-karti",
  "/kategori/gaming-mouse", "/kategori/gaming-klavye", "/kategori/gaming-kulaklik",
  "/kategori/gaming-mousepad", "/kategori/gaming-monitor", "/kategori/oyuncu-koltugu",
  "/kategori/gamepad-joystick", "/kategori/direksiyon-seti", "/kategori/yayin-ekipmanlari",
  "/oyun-itemleri/cs2", "/oyun-itemleri/valorant", "/oyun-itemleri/knight-online",
  "/oyun-itemleri/metin2", "/oyun-itemleri/league-of-legends", "/oyun-itemleri/pubg-mobile",
  "/oyun-itemleri/roblox", "/oyun-itemleri/mobile-legends",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `https://kap-kap.vercel.app${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/kategori") || route.startsWith("/oyun-itemleri/") ? 0.8 : 0.7,
  }));
}
