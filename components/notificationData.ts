export type NotificationKind = "auction" | "order" | "message" | "account" | "campaign";

export type MarketplaceNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  time: string;
  href: string;
  action: string;
  important?: boolean;
  readAt?: string | null;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};

export const marketplaceNotifications: MarketplaceNotification[] = [
  {
    id: "bid-passed-iphone",
    kind: "auction",
    title: "Teklifin geçildi",
    description: "iPhone 15 Pro 256 GB için yeni lider teklif 48.100 TL oldu.",
    time: "2 dk önce",
    href: "/urun/iphone-15-pro",
    action: "Teklifi yükselt",
    important: true,
  },
  {
    id: "ending-rolex",
    kind: "auction",
    title: "Takip ettiğin açık artırma bitiyor",
    description: "Rolex Submariner Date açık artırmasının bitmesine 20 dakikadan az kaldı.",
    time: "14 dk önce",
    href: "/urun/rolex-submariner",
    action: "Açık artırmaya git",
    important: true,
  },
  {
    id: "order-shipped",
    kind: "order",
    title: "Siparişin kargoya verildi",
    description: "PlayStation 5 Slim siparişin KapışKapış Güvenli Kargo ile yola çıktı.",
    time: "1 sa önce",
    href: "/siparisler",
    action: "Kargoyu takip et",
  },
  {
    id: "new-message",
    kind: "message",
    title: "Yeni mesajın var",
    description: "Mert Saat & Koleksiyon ürünün kutu içeriğiyle ilgili soruna yanıt verdi.",
    time: "3 sa önce",
    href: "/mesajlar",
    action: "Mesajı aç",
  },
  {
    id: "payment-protected",
    kind: "order",
    title: "Ödemen güvenli hesapta",
    description: "KK-10428 numaralı siparişin ödemesi teslimat onayına kadar korunuyor.",
    time: "Dün",
    href: "/siparisler",
    action: "Siparişi görüntüle",
  },
  {
    id: "account-verified",
    kind: "account",
    title: "Telefon doğrulaması tamamlandı",
    description: "Hesap güvenlik seviyen yükseldi. Yüksek tutarlı tekliflerde daha hızlı güvence için kimlik doğrulamasını tamamlayabilirsin.",
    time: "2 gün önce",
    href: "/ayarlar",
    action: "Güvenliği tamamla",
  },
  {
    id: "saved-search",
    kind: "campaign",
    title: "Kaydettiğin aramaya yeni ilan geldi",
    description: "“MacBook Pro M3” aramana uyan 2 yeni açık artırma yayınlandı.",
    time: "3 gün önce",
    href: "/arama?q=MacBook%20Pro%20M3",
    action: "Yeni ilanları gör",
  },
];
