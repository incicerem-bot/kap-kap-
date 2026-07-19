import MarketplaceShell from "@/components/MarketplaceShell";
import FavoritesCenterExperience from "@/components/FavoritesCenterExperience";

export default function Page() {
  return (
    <MarketplaceShell eyebrow="KOLEKSİYONUM" title="Favorilerim" description="Takip ettiğin ürünleri, fiyat hareketlerini ve bitiş sürelerini tek merkezden yönet.">
      <FavoritesCenterExperience />
    </MarketplaceShell>
  );
}
