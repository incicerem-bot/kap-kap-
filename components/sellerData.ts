export type SellerReview = {
  id: string;
  buyer: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  product: string;
  productId?: string;
  verifiedPurchase: boolean;
  tags: string[];
  sellerReply?: string;
  photos?: string[];
};

export type SellerProfile = {
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  location: string;
  joinedAt: string;
  verified: boolean;
  rating: number;
  sales: number;
  followers: number;
  responseRate: number;
  responseTime: string;
  shipOnTime: number;
  cancellationRate: number;
  productIds: string[];
  categories: string[];
  about: string;
  badges: string[];
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: SellerReview[];
};

const sharedReviews: Record<string, SellerReview[]> = {
  technology: [
    {
      id: "rv-tech-1",
      buyer: "S••• K•••",
      rating: 5,
      date: "17 Temmuz 2026",
      title: "İlanla tamamen aynı geldi",
      comment: "Ürün açıklamadaki durumla birebir aynıydı. Paketleme çok sağlamdı ve satıcı tüm sorularıma hızlı cevap verdi.",
      product: "iPhone 15 Pro 256 GB",
      productId: "iphone-15-pro",
      verifiedPurchase: true,
      tags: ["Açıklamaya uygun", "Hızlı kargo", "Güvenli paketleme"],
      sellerReply: "Güzel değerlendirmeniz için teşekkür ederiz. İyi günlerde kullanın.",
    },
    {
      id: "rv-tech-2",
      buyer: "A••• Y•••",
      rating: 5,
      date: "9 Temmuz 2026",
      title: "Güven veren satıcı",
      comment: "Seri numarası ve pil bilgisi teklif öncesinde paylaşıldı. Kargo aynı gün çıktı.",
      product: "Apple Watch Ultra 2",
      verifiedPurchase: true,
      tags: ["İyi iletişim", "Hızlı kargo"],
    },
    {
      id: "rv-tech-3",
      buyer: "M••• D•••",
      rating: 4,
      date: "28 Haziran 2026",
      title: "Ürün iyi, paket biraz gecikti",
      comment: "Ürün sorunsuz ve temizdi. Yoğunluk nedeniyle kargoya verilmesi bir gün sürdü.",
      product: "AirPods Pro 2",
      verifiedPurchase: true,
      tags: ["Açıklamaya uygun"],
      sellerReply: "Gecikme için tekrar özür dileriz. Geri bildiriminizi operasyon ekibimize aktardık.",
    },
  ],
  watch: [
    {
      id: "rv-watch-1",
      buyer: "E••• T•••",
      rating: 5,
      date: "15 Temmuz 2026",
      title: "Eksiksiz belge ve çok iyi paketleme",
      comment: "Saat ekspertiz kartı, kutusu ve faturasıyla gönderildi. Değerli ürün paketlemesi gerçekten profesyoneldi.",
      product: "Omega Seamaster Diver 300M",
      verifiedPurchase: true,
      tags: ["Belgeler eksiksiz", "Güvenli paketleme", "İyi iletişim"],
    },
    {
      id: "rv-watch-2",
      buyer: "B••• Ö•••",
      rating: 5,
      date: "2 Temmuz 2026",
      title: "Koleksiyoncular için güvenilir mağaza",
      comment: "Referans numarası ve bakım geçmişi doğru çıktı. Satıcı satış sonrasında da yardımcı oldu.",
      product: "Tudor Black Bay 58",
      verifiedPurchase: true,
      tags: ["Açıklamaya uygun", "Uzman satıcı"],
      sellerReply: "Değerli yorumunuz için teşekkür ederiz. Yeni parçalarımızda tekrar görüşmek dileğiyle.",
    },
  ],
  game: [
    {
      id: "rv-game-1",
      buyer: "O••• Ç•••",
      rating: 5,
      date: "18 Temmuz 2026",
      title: "Konsol tertemiz çıktı",
      comment: "Kutu içeriği eksiksizdi. Cihazı teslim alınca test ettim, kol ve disk sürücüsü sorunsuz çalışıyor.",
      product: "PlayStation 5 Slim",
      productId: "ps5-slim",
      verifiedPurchase: true,
      tags: ["Açıklamaya uygun", "Eksiksiz içerik", "Hızlı kargo"],
    },
    {
      id: "rv-game-2",
      buyer: "D••• A•••",
      rating: 4,
      date: "7 Temmuz 2026",
      title: "İletişim ve paketleme iyi",
      comment: "Kargo firmasından kaynaklı bir günlük gecikme oldu ancak mağaza süreci yakından takip etti.",
      product: "Xbox Series X",
      verifiedPurchase: true,
      tags: ["İyi iletişim", "Güvenli paketleme"],
    },
  ],
};

export const sellerProfiles: SellerProfile[] = [
  {
    slug: "mert-saat-koleksiyon",
    name: "Mert Saat & Koleksiyon",
    initials: "MS",
    tagline: "Belgeli lüks saatler ve seçkin koleksiyon parçaları",
    location: "İzmir, Konak",
    joinedAt: "Mart 2022",
    verified: true,
    rating: 4.9,
    sales: 326,
    followers: 1840,
    responseRate: 99,
    responseTime: "12 dakika",
    shipOnTime: 98,
    cancellationRate: 0.4,
    productIds: ["rolex-submariner"],
    categories: ["Saat", "Koleksiyon"],
    about: "Mert Saat & Koleksiyon, ikinci el ve koleksiyonluk saatlerde ürün geçmişi, referans numarası ve mevcut belgeleri açıkça paylaşmayı esas alan doğrulanmış bir KapışKapış mağazasıdır.",
    badges: ["Kimlik doğrulandı", "Banka hesabı doğrulandı", "Uzman satıcı", "Hızlı gönderim"],
    ratingDistribution: { 5: 287, 4: 25, 3: 8, 2: 3, 1: 3 },
    reviews: sharedReviews.watch,
  },
  {
    slug: "teknocadde",
    name: "TeknoCadde",
    initials: "TC",
    tagline: "Kontrol edilmiş telefon, tablet ve giyilebilir teknoloji",
    location: "İstanbul, Kadıköy",
    joinedAt: "Eylül 2021",
    verified: true,
    rating: 4.8,
    sales: 512,
    followers: 2930,
    responseRate: 98,
    responseTime: "8 dakika",
    shipOnTime: 97,
    cancellationRate: 0.7,
    productIds: ["iphone-15-pro"],
    categories: ["Telefon", "Elektronik"],
    about: "TeknoCadde, cihazların pil, kozmetik durum, garanti ve fatura bilgilerini ilan öncesinde kontrol ederek yayınlar. Tüm gönderiler darbe korumalı ambalajla hazırlanır.",
    badges: ["Kurumsal satıcı", "Kimlik doğrulandı", "Aynı gün kargo", "Düşük iptal oranı"],
    ratingDistribution: { 5: 421, 4: 67, 3: 15, 2: 5, 1: 4 },
    reviews: sharedReviews.technology,
  },
  {
    slug: "gameport",
    name: "GamePort",
    initials: "GP",
    tagline: "Konsol, ekipman ve oyuncu donanımlarında test edilmiş ürünler",
    location: "Ankara, Çankaya",
    joinedAt: "Ocak 2022",
    verified: true,
    rating: 4.9,
    sales: 731,
    followers: 3640,
    responseRate: 99,
    responseTime: "6 dakika",
    shipOnTime: 99,
    cancellationRate: 0.3,
    productIds: ["ps5-slim"],
    categories: ["Oyun & Konsol", "Elektronik"],
    about: "GamePort, oyun konsollarını bağlantı, fan, sürücü ve kontrolcü testlerinden geçirerek listeler. İlanlarda kutu içeriği ve garanti durumu eksiksiz belirtilir.",
    badges: ["Kurumsal satıcı", "Kimlik doğrulandı", "Test edilmiş ürün", "Hızlı gönderim"],
    ratingDistribution: { 5: 651, 4: 58, 3: 14, 2: 5, 1: 3 },
    reviews: sharedReviews.game,
  },
  {
    slug: "pro-bilgisayar",
    name: "Pro Bilgisayar",
    initials: "PB",
    tagline: "Profesyonel bilgisayarlar ve performans donanımları",
    location: "Bursa, Nilüfer",
    joinedAt: "Kasım 2022",
    verified: true,
    rating: 4.7,
    sales: 214,
    followers: 1180,
    responseRate: 96,
    responseTime: "22 dakika",
    shipOnTime: 95,
    cancellationRate: 1.1,
    productIds: ["macbook-pro"],
    categories: ["Bilgisayar", "Elektronik"],
    about: "Pro Bilgisayar, dizüstü ve masaüstü sistemlerde pil döngüsü, sıcaklık, depolama sağlığı ve donanım testlerini ilan bilgilerine ekler.",
    badges: ["Kimlik doğrulandı", "Teknik test", "Güvenli paketleme"],
    ratingDistribution: { 5: 164, 4: 34, 3: 10, 2: 4, 1: 2 },
    reviews: sharedReviews.technology.slice(0, 2),
  },
  {
    slug: "foto-market",
    name: "Foto Market",
    initials: "FM",
    tagline: "Fotoğraf ve video ekipmanlarında uzman mağaza",
    location: "İzmir, Bornova",
    joinedAt: "Haziran 2023",
    verified: true,
    rating: 4.9,
    sales: 189,
    followers: 970,
    responseRate: 98,
    responseTime: "15 dakika",
    shipOnTime: 98,
    cancellationRate: 0.5,
    productIds: ["sony-alpha"],
    categories: ["Elektronik"],
    about: "Foto Market, sensör, shutter, lens yuvası ve video fonksiyonlarını kontrol ederek fotoğraf ekipmanlarını ayrıntılı test raporuyla listeler.",
    badges: ["Uzman satıcı", "Kimlik doğrulandı", "Test edilmiş ürün"],
    ratingDistribution: { 5: 169, 4: 14, 3: 4, 2: 1, 1: 1 },
    reviews: sharedReviews.technology.slice(0, 2),
  },
  {
    slug: "parca-parca",
    name: "Parça Parça",
    initials: "PP",
    tagline: "Eksiksiz setler ve özenle seçilmiş koleksiyon ürünleri",
    location: "Antalya, Muratpaşa",
    joinedAt: "Ağustos 2024",
    verified: false,
    rating: 4.6,
    sales: 84,
    followers: 430,
    responseRate: 94,
    responseTime: "35 dakika",
    shipOnTime: 93,
    cancellationRate: 1.8,
    productIds: ["lego-technic"],
    categories: ["Koleksiyon"],
    about: "Parça Parça, koleksiyon setlerini parça kontrolü yaptıktan sonra listeler. Eksik parça, kutu ve kitapçık bilgileri ilanda ayrıca belirtilir.",
    badges: ["Telefon doğrulandı", "Koleksiyon satıcısı"],
    ratingDistribution: { 5: 62, 4: 13, 3: 5, 2: 2, 1: 2 },
    reviews: sharedReviews.game.slice(0, 2),
  },
  {
    slug: "ev-teknoloji",
    name: "Ev Teknoloji",
    initials: "ET",
    tagline: "Ev teknolojilerinde kontrollü ve temiz ürünler",
    location: "İstanbul, Ataşehir",
    joinedAt: "Şubat 2024",
    verified: true,
    rating: 4.8,
    sales: 146,
    followers: 720,
    responseRate: 97,
    responseTime: "18 dakika",
    shipOnTime: 96,
    cancellationRate: 0.8,
    productIds: ["dyson-v15"],
    categories: ["Ev & Yaşam", "Elektronik"],
    about: "Ev Teknoloji, ev elektroniği ürünlerini motor, batarya ve aksesuar kontrollerinden geçirerek satışa sunar.",
    badges: ["Kimlik doğrulandı", "Banka hesabı doğrulandı", "Güvenli gönderim"],
    ratingDistribution: { 5: 119, 4: 20, 3: 5, 2: 1, 1: 1 },
    reviews: sharedReviews.technology.slice(0, 2),
  },
];

export function findSellerBySlug(slug: string) {
  return sellerProfiles.find((seller) => seller.slug === slug);
}

export function sellerSlugForName(name: string) {
  return sellerProfiles.find((seller) => seller.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR"))?.slug
    ?? name.toLocaleLowerCase("tr-TR").replaceAll("ı", "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

