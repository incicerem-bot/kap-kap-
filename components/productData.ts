export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
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
    id: "rolex-submariner",
    title: "Rolex Submariner Date",
    category: "Saat",
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
    seller: "Mert Saat & Koleksiyon",
    sellerInitials: "MS",
    sellerRating: 4.9,
    sellerSales: 326,
    location: "İzmir, Konak",
    watchers: 18,
    views: 846,
    description: "2022 çıkışlı, çok temiz kullanılmış Rolex Submariner Date. Kutu, garanti kartı ve satın alma faturasıyla birlikte gönderilecektir. Kozmetik durumu fotoğraflarda görüldüğü gibidir; mekanizma ve tarih fonksiyonu sorunsuz çalışmaktadır.",
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
    id: "iphone-15-pro",
    title: "iPhone 15 Pro 256 GB",
    category: "Telefon",
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
    seller: "TeknoCadde",
    sellerInitials: "TC",
    sellerRating: 4.8,
    sellerSales: 512,
    location: "İstanbul, Kadıköy",
    watchers: 43,
    views: 1294,
    description: "Doğal titanyum renk, 256 GB iPhone 15 Pro. Pil sağlığı %96'dır. Ekran ve kasada kullanımı etkileyen çizik bulunmamaktadır. Kutu, Type-C kablo ve fatura ile gönderilir.",
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
    id: "ps5-slim",
    title: "PlayStation 5 Slim",
    category: "Oyun & Konsol",
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
    description: "Diskli PlayStation 5 Slim kasa. İki adet DualSense kol, dikey stand ve HDMI kablosu dahildir. Cihaz test edilmiş, fan ve disk sürücüsü sorunsuzdur.",
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
    id: "macbook-pro",
    title: "MacBook Pro M3 Pro",
    category: "Bilgisayar",
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
    seller: "Pro Bilgisayar",
    sellerInitials: "PB",
    sellerRating: 4.7,
    sellerSales: 214,
    location: "Bursa, Nilüfer",
    watchers: 35,
    views: 918,
    description: "14 inç MacBook Pro, M3 Pro işlemci, 18 GB birleşik bellek ve 512 GB SSD. Pil döngüsü 42'dir. Kasa temiz, ekran lekesizdir. Orijinal adaptör ve kutu dahildir.",
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
    id: "sony-alpha",
    title: "Sony Alpha A7 IV",
    category: "Elektronik",
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
    seller: "Foto Market",
    sellerInitials: "FM",
    sellerRating: 4.9,
    sellerSales: 189,
    location: "İzmir, Bornova",
    watchers: 21,
    views: 509,
    description: "Sony A7 IV gövde, düşük shutter sayısı ve temiz sensör. Profesyonel çekimlerde yedek gövde olarak kullanılmıştır. İki batarya, şarj cihazı ve kutu dahildir.",
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
    id: "lego-technic",
    title: "LEGO Technic Koleksiyon",
    category: "Koleksiyon",
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
    seller: "Parça Parça",
    sellerInitials: "PP",
    sellerRating: 4.6,
    sellerSales: 84,
    location: "Antalya, Muratpaşa",
    watchers: 16,
    views: 334,
    description: "Üç farklı LEGO Technic setinden oluşan koleksiyon. Tüm parçalar kontrol edilmiş, eksik parça bulunmamaktadır. Kullanım kitapçıkları ve kutular mevcuttur.",
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
