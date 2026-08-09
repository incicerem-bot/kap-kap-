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

export const gameProductMenuItems: NavigationItem[] = [
  { href: "/kategori/bilgisayar-oyunlari", label: "Bilgisayar Oyunları", icon: "computer", description: "Kutulu PC oyunları ve özel sürümler" },
  { href: "/kategori/playstation-oyunlari", label: "PlayStation Oyunları", icon: "game", description: "PS5 ve PS4 oyunları" },
  { href: "/kategori/xbox-oyunlari", label: "Xbox Oyunları", icon: "game", description: "Series X|S ve Xbox One oyunları" },
  { href: "/kategori/nintendo-oyunlari", label: "Nintendo Oyunları", icon: "game", description: "Switch oyunları ve koleksiyon sürümleri" },
  { href: "/kategori/steam-kodlari", label: "Steam Cüzdan ve Kod", icon: "tag", description: "Steam oyun ve cüzdan kodları" },
  { href: "/kategori/epin-hediye-karti", label: "E-pin ve Hediye Kartı", icon: "tag", description: "Platform bakiyesi ve oyun kodları" },
];

export const equipmentMenuItems: NavigationItem[] = [
  { href: "/kategori/gaming-mouse", label: "Gaming Mouse", icon: "computer", description: "FPS, MMO ve e-spor mouse modelleri" },
  { href: "/kategori/gaming-klavye", label: "Gaming Klavye", icon: "computer", description: "Mekanik, manyetik ve TKL klavyeler" },
  { href: "/kategori/gaming-kulaklik", label: "Gaming Kulaklık", icon: "electronics", description: "Kablolu ve kablosuz oyuncu kulaklıkları" },
  { href: "/kategori/gaming-mousepad", label: "Gaming Mousepad", icon: "collection", description: "Speed, control ve geniş yüzeyler" },
  { href: "/kategori/gaming-monitor", label: "Gaming Monitör", icon: "computer", description: "Yüksek Hz ve düşük gecikmeli monitörler" },
  { href: "/kategori/oyuncu-koltugu", label: "Oyuncu Koltuğu", icon: "collection", description: "Ergonomik oyuncu ve çalışma koltukları" },
  { href: "/kategori/gamepad-joystick", label: "Gamepad ve Joystick", icon: "game", description: "PC ve konsol kontrolcüleri" },
  { href: "/kategori/direksiyon-seti", label: "Direksiyon Seti", icon: "game", description: "Sim racing direksiyon ve pedal setleri" },
  { href: "/kategori/yayin-ekipmanlari", label: "Mikrofon ve Yayın", icon: "electronics", description: "Mikrofon, stand ve yayın aksesuarları" },
];

export const collectionMenuItems: NavigationItem[] = [
  { href: "/kategori/ozel-seri", label: "Özel Seri Oyuncu Ürünleri", icon: "collection", description: "Sınırlı üretim ve koleksiyon ürünleri" },
];

export const categoryMenuItems: NavigationItem[] = [
  ...gameProductMenuItems,
  ...equipmentMenuItems,
  ...collectionMenuItems,
];

export const gameItemMenuItems: NavigationItem[] = [
  { href: "/oyun-itemleri/cs2", label: "Counter-Strike 2", icon: "gameItem", description: "Skin ve takas edilebilir itemler" },
  { href: "/oyun-itemleri/valorant", label: "Valorant", icon: "gameItem", description: "VP ve bölgesel dijital ürünler" },
  { href: "/oyun-itemleri/knight-online", label: "Knight Online", icon: "gameItem", description: "Item, GB ve oyun içi teslimat" },
  { href: "/oyun-itemleri/metin2", label: "Metin2", icon: "gameItem", description: "Yang ve aktarılabilir itemler" },
  { href: "/oyun-itemleri/league-of-legends", label: "League of Legends", icon: "gameItem", description: "RP ve oyun içi ürünler" },
  { href: "/oyun-itemleri/pubg-mobile", label: "PUBG Mobile", icon: "gameItem", description: "UC ve mobil oyun ürünleri" },
  { href: "/oyun-itemleri/roblox", label: "Roblox", icon: "gameItem", description: "Robux ve dijital kodlar" },
  { href: "/oyun-itemleri/mobile-legends", label: "Mobile Legends", icon: "gameItem", description: "Elmas ve mobil oyun ürünleri" },
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
