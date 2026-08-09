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

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
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

export const equipmentBrandItems: NavigationItem[] = [
  { href: "/kategori/marka-logitech-g", label: "Logitech G", description: "Mouse, klavye, kulaklık ve direksiyon" },
  { href: "/kategori/marka-razer", label: "Razer", description: "Çevre birimleri ve yayın ekipmanları" },
  { href: "/kategori/marka-steelseries", label: "SteelSeries", description: "Mouse, klavye, kulaklık ve mousepad" },
  { href: "/kategori/marka-hyperx", label: "HyperX", description: "Kulaklık, mikrofon, klavye ve mouse" },
  { href: "/kategori/marka-corsair", label: "Corsair", description: "Oyuncu ekipmanları ve aksesuarlar" },
  { href: "/kategori/marka-asus-rog", label: "ASUS ROG / TUF", description: "Monitör ve oyuncu çevre birimleri" },
  { href: "/kategori/marka-msi", label: "MSI", description: "Monitör ve oyuncu ekipmanları" },
  { href: "/kategori/marka-aoc", label: "AOC / AGON", description: "Yüksek yenileme hızlı monitörler" },
  { href: "/kategori/marka-samsung-odyssey", label: "Samsung Odyssey", description: "Gaming monitörler" },
  { href: "/kategori/marka-lg-ultragear", label: "LG UltraGear", description: "Gaming monitörler" },
  { href: "/kategori/marka-lenovo-legion", label: "Lenovo Legion", description: "Monitör ve aksesuarlar" },
  { href: "/kategori/marka-viewsonic", label: "ViewSonic", description: "Gaming monitörler" },
  { href: "/kategori/marka-pulsar", label: "Pulsar", description: "E-spor mouse ve mousepad" },
  { href: "/kategori/marka-glorious", label: "Glorious", description: "Mouse, klavye ve aksesuarlar" },
  { href: "/kategori/marka-akko", label: "Akko", description: "Mekanik klavyeler ve switchler" },
  { href: "/kategori/marka-mchose", label: "MCHOSE", description: "Mouse ve mekanik klavyeler" },
  { href: "/kategori/marka-gravastar", label: "GravaStar", description: "Tasarım odaklı oyuncu ekipmanları" },
  { href: "/kategori/marka-gamesir", label: "GameSir", description: "Gamepad ve mobil kontrolcüler" },
  { href: "/kategori/marka-thrustmaster", label: "Thrustmaster", description: "Direksiyon, pedal ve joystick" },
  { href: "/kategori/marka-fanatec", label: "Fanatec", description: "Sim racing ekipmanları" },
  { href: "/kategori/marka-rampage", label: "Rampage", description: "Erişilebilir oyuncu ekipmanları" },
  { href: "/kategori/marka-gamepower", label: "GamePower", description: "Klavye, mouse ve kulaklık" },
  { href: "/kategori/marka-havit", label: "Havit", description: "Oyuncu çevre birimleri" },
  { href: "/kategori/marka-wraith", label: "Wraith Esports", description: "E-spor odaklı seçili ekipmanlar" },
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
  { href: "/oyun-itemleri/silkroad-online", label: "Silkroad Online", icon: "gameItem", description: "Silk, gold ve aktarılabilir itemler" },
  { href: "/oyun-itemleri/rise-online", label: "Rise Online", icon: "gameItem", description: "Gold ve oyun içi itemler" },
  { href: "/oyun-itemleri/black-desert", label: "Black Desert", icon: "gameItem", description: "Acoin ve resmi dijital ürünler" },
  { href: "/oyun-itemleri/fortnite", label: "Fortnite", icon: "gameItem", description: "V-Bucks ve hediye kartları" },
  { href: "/oyun-itemleri/minecraft", label: "Minecraft", icon: "gameItem", description: "Oyun kodu ve Minecoin" },
];

export const gameItemTypeGroups: NavigationGroup[] = [
  { label: "Counter-Strike 2", items: [
    { href: "/oyun-itemleri/cs2?tur=silah-skinleri", label: "Silah Skinleri" },
    { href: "/oyun-itemleri/cs2?tur=bicaklar", label: "Bıçaklar" },
    { href: "/oyun-itemleri/cs2?tur=eldivenler", label: "Eldivenler" },
    { href: "/oyun-itemleri/cs2?tur=sticker-kasa", label: "Sticker ve Kasalar" },
  ]},
  { label: "Knight Online", items: [
    { href: "/oyun-itemleri/knight-online?tur=gb", label: "Gold Bar (GB)" },
    { href: "/oyun-itemleri/knight-online?tur=silah", label: "Silahlar" },
    { href: "/oyun-itemleri/knight-online?tur=zirh", label: "Zırhlar" },
    { href: "/oyun-itemleri/knight-online?tur=aksesuar", label: "Takı ve Aksesuar" },
    { href: "/oyun-itemleri/knight-online?tur=kc", label: "Knight Cash Kodları" },
  ]},
  { label: "Metin2", items: [
    { href: "/oyun-itemleri/metin2?tur=yang-won", label: "Yang ve Won" },
    { href: "/oyun-itemleri/metin2?tur=silah", label: "Silahlar" },
    { href: "/oyun-itemleri/metin2?tur=zirh", label: "Zırhlar" },
    { href: "/oyun-itemleri/metin2?tur=simya", label: "Simya ve Taşlar" },
    { href: "/oyun-itemleri/metin2?tur=kostum", label: "Kostüm ve Pet" },
  ]},
  { label: "Kod ve Oyun Parası", items: [
    { href: "/oyun-itemleri/valorant?tur=vp", label: "Valorant VP" },
    { href: "/oyun-itemleri/league-of-legends?tur=rp", label: "League of Legends RP" },
    { href: "/oyun-itemleri/pubg-mobile?tur=uc", label: "PUBG Mobile UC" },
    { href: "/oyun-itemleri/mobile-legends?tur=elmas", label: "Mobile Legends Elmas" },
    { href: "/oyun-itemleri/roblox?tur=hediye-karti", label: "Roblox Hediye Kartı" },
    { href: "/oyun-itemleri/fortnite?tur=v-bucks", label: "Fortnite V-Bucks" },
  ]},
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
