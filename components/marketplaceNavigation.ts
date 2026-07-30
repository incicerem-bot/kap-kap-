export type NavigationIcon =
  | "home"
  | "markets"
  | "auction"
  | "live"
  | "bolt"
  | "tag"
  | "gameItem"
  | "phone"
  | "computer"
  | "game"
  | "camera"
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
  | "plus"
  | "logout"
  | "store"
  | "orders"
  | "shipping"
  | "shield"
  | "settings"
  | "wallet"
  | "support"
  | "users";

export type NavigationItem = {
  href: string;
  label: string;
  icon?: NavigationIcon;
  description?: string;
  badge?: string;
};

export const marketModeItems: NavigationItem[] = [
  {
    href: "/acik-artirma",
    label: "Açık Artırma",
    icon: "auction",
    description: "Canlı teklif ve süreli satış",
    badge: "CANLI",
  },
  {
    href: "/sabit-fiyat",
    label: "Sabit Fiyat Pazarı",
    icon: "tag",
    description: "Sepete ekle ve doğrudan satın al",
  },
  {
    href: "/oyun-itemleri",
    label: "Oyun İtemleri",
    icon: "gameItem",
    description: "Güvenli dijital ürün pazarı",
    badge: "YENİ",
  },
];

export const auctionMenuItems: NavigationItem[] = [
  { href: "/acik-artirma", label: "Tüm Açık Artırmalar", icon: "auction" },
  { href: "/canli", label: "Canlı Açık Artırmalar", icon: "live", badge: "CANLI" },
  { href: "/son-dakika", label: "Son Dakika", icon: "bolt" },
  { href: "/teklif-guvencesi", label: "Teklif Güvencesi", icon: "shield" },
];

export const categoryMenuItems: NavigationItem[] = [
  { href: "/kategori/telefon", label: "Telefon", icon: "phone" },
  { href: "/kategori/bilgisayar", label: "Bilgisayar", icon: "computer" },
  { href: "/kategori/oyun", label: "Oyun & Konsol", icon: "game" },
  { href: "/kategori/kamera", label: "Kamera", icon: "camera" },
  { href: "/kategori/saat", label: "Saat & Giyilebilir", icon: "watch" },
  { href: "/kategori/koleksiyon", label: "Koleksiyon", icon: "collection" },
  { href: "/kategori/elektronik", label: "Elektronik", icon: "electronics" },
  { href: "/kategori/ev-yasam", label: "Ev & Yaşam", icon: "house" },
];

export const gameItemMenuItems: NavigationItem[] = [
  { href: "/oyun-itemleri/cs2", label: "Counter-Strike 2", icon: "gameItem" },
  { href: "/oyun-itemleri/valorant", label: "VALORANT", icon: "gameItem" },
  { href: "/oyun-itemleri/dota-2", label: "Dota 2", icon: "gameItem" },
  { href: "/oyun-itemleri/rust", label: "Rust", icon: "gameItem" },
  { href: "/oyun-itemleri/lol", label: "League of Legends", icon: "gameItem" },
  { href: "/oyun-itemleri/steam", label: "Steam Envanteri", icon: "gameItem" },
];

export const buyerAccountItems: NavigationItem[] = [
  { href: "/profil", label: "Hesap Özeti", icon: "user" },
  { href: "/tekliflerim", label: "Tekliflerim", icon: "bid" },
  { href: "/siparisler", label: "Siparişlerim", icon: "orders" },
  { href: "/favoriler", label: "Favorilerim", icon: "heart" },
  { href: "/karsilastir", label: "Ürün Karşılaştırma", icon: "markets" },
  { href: "/mesajlar", label: "Mesajlar", icon: "message" },
  { href: "/bildirimler", label: "Bildirimler", icon: "bell" },
  { href: "/cuzdan", label: "Cüzdanım", icon: "wallet" },
  { href: "/kargo", label: "Kargo ve İadeler", icon: "shipping" },
  { href: "/uyusmazlik", label: "Uyuşmazlıklar", icon: "shield" },
];

export const accountSecurityItems: NavigationItem[] = [
  { href: "/hesap-dogrulama", label: "Hesap Doğrulama", icon: "shield" },
  { href: "/ayarlar", label: "Ayarlar ve Güvenlik", icon: "settings" },
  { href: "/yardim", label: "Yardım Merkezi", icon: "support" },
  { href: "/hukuk", label: "Hukuk ve Güven", icon: "shield" },
];

export const sellerMenuItems: NavigationItem[] = [
  { href: "/magazam", label: "Satıcı Merkezi", icon: "store" },
  { href: "/ilan-olustur", label: "Yeni Satış Oluştur", icon: "plus" },
  { href: "/ilanlarim", label: "İlanlarım", icon: "auction" },
  { href: "/siparisler?view=seller", label: "Gelen Siparişler", icon: "orders" },
  { href: "/kargo?view=seller", label: "Kargo İşlemleri", icon: "shipping" },
  { href: "/magazam/ayarlar", label: "Mağaza Ayarları", icon: "settings" },
  { href: "/satici-dogrulama", label: "Satıcı Doğrulama", icon: "shield" },
];

export const adminMenuItems: NavigationItem[] = [
  { href: "/yonetim", label: "Yönetim Merkezi", icon: "settings" },
  { href: "/yonetim/kullanicilar", label: "Kullanıcı Yönetimi", icon: "users" },
];
