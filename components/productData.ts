export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  listingUuid?: string;
  source?: "demo" | "supabase";
  endsAt?: string | null;
  status?: string;
  sellerSlug?: string;
  title: string;
  category: string;
  price: string;
  next: string;
  bids: number;
  time: string;
  image: string;
  gallery: string[];
  live: boolean;
  verified: boolean;
  condition: string;
  increment: number;
  seller: string;
  sellerInitials: string;
  sellerRating: number;
  sellerSales: number;
  location: string;
  watchers: number;
  views: number;
  description: string;
  shipping: string;
  specs: ProductSpec[];
};

export const demoProducts: Product[] = [
  {
    id: "pc-cyberpunk-collector",
    title: "Cyberpunk 2077 PC Koleksiyoncu Sürümü",
    category: "Bilgisayar Oyunları",
    price: "125.000 TL",
    next: "126.000 TL",
    bids: 28,
    time: "03:35:10",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=88",
    ],
    live: true,
    verified: true,
    condition: "Çok iyi",
    increment: 1000,
    seller: "Game Vault",
    sellerInitials: "MS",
    sellerRating: 4.9,
    sellerSales: 326,
    location: "İzmir, Konak",
    watchers: 18,
    views: 846,
    description: "Cyberpunk 2077 PC koleksiyoncu sürümü. Oyun kutusu, sanat kitabı ve koleksiyon parçaları eksiksizdir.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [
      { label: "Referans", value: "126610LN" },
      { label: "Kasa", value: "41 mm çelik" },
      { label: "Mekanizma", value: "Otomatik" },
      { label: "Garanti", value: "Belge mevcut" },
      { label: "Kutu", value: "Orijinal" },
      { label: "Üretim yılı", value: "2022" },
    ],
  },
  {
    id: "xbox-forza-horizon-5",
    title: "Forza Horizon 5 Xbox Series X",
    category: "Xbox Oyunları",
    price: "47.850 TL",
    next: "48.100 TL",
    bids: 41,
    time: "00:18:42",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=88",
    ],
    live: true,
    verified: true,
    condition: "Az kullanılmış",
    increment: 250,
    seller: "Xbox Arena",
    sellerInitials: "TC",
    sellerRating: 4.8,
    sellerSales: 512,
    location: "İstanbul, Kadıköy",
    watchers: 43,
    views: 1294,
    description: "Xbox Series X uyumlu Forza Horizon 5 kutulu oyun. Disk test edilmiş, kutu ve kapak temiz durumdadır.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [
      { label: "Depolama", value: "256 GB" },
      { label: "Renk", value: "Doğal titanyum" },
      { label: "Pil sağlığı", value: "%96" },
      { label: "Garanti", value: "8 ay" },
      { label: "Kutu", value: "Var" },
      { label: "Fatura", value: "Var" },
    ],
  },
  {
    id: "playstation-god-of-war-ragnarok",
    title: "God of War Ragnarök PlayStation 5",
    category: "PlayStation Oyunları",
    price: "18.250 TL",
    next: "18.500 TL",
    bids: 19,
    time: "01:42:16",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=88",
    ],
    live: false,
    verified: true,
    condition: "Garantili",
    increment: 250,
    seller: "GamePort",
    sellerInitials: "GP",
    sellerRating: 4.9,
    sellerSales: 731,
    location: "Ankara, Çankaya",
    watchers: 27,
    views: 672,
    description: "PlayStation 5 için God of War Ragnarök kutulu oyun. Disk sorunsuz ve kutu içeriği eksiksizdir.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [
      { label: "Model", value: "Slim diskli" },
      { label: "Depolama", value: "1 TB" },
      { label: "Kol", value: "2 DualSense" },
      { label: "Garanti", value: "14 ay" },
      { label: "Kutu", value: "Var" },
      { label: "Bölge", value: "Türkiye" },
    ],
  },
  {
    id: "steam-elden-ring",
    title: "Elden Ring Steam Oyun Kodu",
    category: "Steam Oyunları",
    price: "79.900 TL",
    next: "80.500 TL",
    bids: 33,
    time: "05:21:08",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=88",
    ],
    live: true,
    verified: true,
    condition: "Kutulu",
    increment: 500,
    seller: "Steam Key Market",
    sellerInitials: "PB",
    sellerRating: 4.7,
    sellerSales: 214,
    location: "Bursa, Nilüfer",
    watchers: 35,
    views: 918,
    description: "Türkiye bölgesinde etkinleştirilebilir Elden Ring Steam oyun kodu. Ödeme onayından sonra dijital teslim edilir.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [
      { label: "İşlemci", value: "Apple M3 Pro" },
      { label: "Bellek", value: "18 GB" },
      { label: "Depolama", value: "512 GB SSD" },
      { label: "Ekran", value: "14 inç" },
      { label: "Pil döngüsü", value: "42" },
      { label: "Renk", value: "Uzay siyahı" },
    ],
  },
  {
    id: "knight-online-raptor-9",
    title: "Knight Online Raptor +9",
    category: "Knight Online İtemleri",
    price: "62.300 TL",
    next: "62.750 TL",
    bids: 22,
    time: "08:11:54",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=88",
    ],
    live: false,
    verified: true,
    condition: "Çok iyi",
    increment: 500,
    seller: "Knight Pazarı",
    sellerInitials: "FM",
    sellerRating: 4.9,
    sellerSales: 189,
    location: "İzmir, Bornova",
    watchers: 21,
    views: 509,
    description: "Knight Online içinde aktarılabilir Raptor +9 itemi. Sunucu ve teslimat bilgileri işlem öncesinde doğrulanır.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [
      { label: "Sensör", value: "33 MP Full Frame" },
      { label: "Shutter", value: "18.420" },
      { label: "Video", value: "4K 60p" },
      { label: "Batarya", value: "2 adet" },
      { label: "Garanti", value: "Yok" },
      { label: "Kutu", value: "Var" },
    ],
  },
  {
    id: "metin2-dolunay-9",
    title: "Metin2 Dolunay Kılıcı +9",
    category: "Metin2 İtemleri",
    price: "9.750 TL",
    next: "9.900 TL",
    bids: 14,
    time: "12:08:30",
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?auto=format&fit=crop&w=1200&q=88",
    ],
    live: false,
    verified: false,
    condition: "Sıfır ayarında",
    increment: 150,
    seller: "Metin2 Han",
    sellerInitials: "PP",
    sellerRating: 4.6,
    sellerSales: 84,
    location: "Antalya, Muratpaşa",
    watchers: 16,
    views: 334,
    description: "Metin2 Dolunay Kılıcı +9. Efsunlar ve sunucu bilgisi ilan detayında yer alır; teslimat oyun içinde yapılır.",
    shipping: "Satıcı kargosu",
    specs: [
      { label: "Set sayısı", value: "3" },
      { label: "Parça durumu", value: "Eksiksiz" },
      { label: "Kutu", value: "Var" },
      { label: "Kitapçık", value: "Var" },
      { label: "Yaş", value: "18+" },
      { label: "Seri", value: "Technic" },
    ],
  },
  {
    id: "cs2-karambit-doppler",
    title: "CS2 Karambit Doppler",
    category: "CS2 İtemleri",
    price: "19.600 TL",
    next: "19.850 TL",
    bids: 17,
    time: "06:44:20",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=88",
    ],
    live: false,
    verified: true,
    condition: "Garantili",
    increment: 250,
    seller: "Skin Station",
    sellerInitials: "ET",
    sellerRating: 4.8,
    sellerSales: 403,
    location: "İstanbul, Ataşehir",
    watchers: 24,
    views: 487,
    description: "Counter-Strike 2 Karambit Doppler skin. Float ve desen bilgileri doğrulanmış Steam takas bağlantısıyla teslim edilir.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [
      { label: "Model", value: "V15 Detect Absolute" },
      { label: "Pil", value: "60 dakika" },
      { label: "Garanti", value: "10 ay" },
      { label: "Başlık", value: "5 adet" },
      { label: "Kutu", value: "Var" },
      { label: "Renk", value: "Sarı / Nikel" },
    ],
  },
  {
    id: "zelda-limited-controller",
    title: "Zelda Özel Seri Oyuncu Kontrolcüsü",
    category: "Özel Seri Oyuncu Ürünleri",
    price: "6.750 TL",
    next: "6.900 TL",
    bids: 24,
    time: "04:26:18",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=88",
      "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1200&q=88",
    ],
    live: true,
    verified: true,
    condition: "Sıfır ayarında",
    increment: 150,
    seller: "Limited Player",
    sellerInitials: "LP",
    sellerRating: 4.9,
    sellerSales: 148,
    location: "İstanbul",
    watchers: 31,
    views: 602,
    description: "Oyuncu koleksiyonlarına özel sınırlı seri kontrolcü. Orijinal kutusu, belgeleri ve seri numarasıyla gönderilir.",
    shipping: "KapışKapış Güvenli Kargo",
    specs: [
      { label: "Seri", value: "Özel üretim" },
      { label: "Kutu", value: "Var" },
      { label: "Belge", value: "Var" },
      { label: "Durum", value: "Koleksiyonluk" },
    ],
  },

];

export function timeToSeconds(time: string) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function parsePrice(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}

export function formatPrice(value: number) {
  return `${value.toLocaleString("tr-TR")} TL`;
}
