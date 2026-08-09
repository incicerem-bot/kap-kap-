import DiscoveryExperience from "@/components/DiscoveryExperience";
import MarketplaceShell from "@/components/MarketplaceShell";
import { notFound } from "next/navigation";
import { equipmentBrandItems } from "@/components/marketplaceNavigation";

const categories: Record<string, string> = {
  "bilgisayar-oyunlari": "Bilgisayar Oyunları",
  "playstation-oyunlari": "PlayStation Oyunları",
  "xbox-oyunlari": "Xbox Oyunları",
  "nintendo-oyunlari": "Nintendo Oyunları",
  "steam-oyunlari": "Steam Oyunları",
  "steam-kodlari": "Steam Cüzdan ve Kod",
  "epin-hediye-karti": "E-pin ve Hediye Kartı",
  "gaming-mouse": "Gaming Mouse",
  "gaming-klavye": "Gaming Klavye",
  "gaming-kulaklik": "Gaming Kulaklık",
  "gaming-mousepad": "Gaming Mousepad",
  "gaming-monitor": "Gaming Monitör",
  "oyuncu-koltugu": "Oyuncu Koltuğu",
  "gamepad-joystick": "Gamepad ve Joystick",
  "direksiyon-seti": "Direksiyon Seti",
  "yayin-ekipmanlari": "Mikrofon ve Yayın",
  "ozel-seri": "Özel Seri Oyuncu Ürünleri",
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = equipmentBrandItems.find((item) => item.href.endsWith(`/kategori/${slug}`));
  const category = categories[slug] ?? brand?.label;
  if (!category) notFound();
  return (
    <MarketplaceShell eyebrow={brand ? "OYUNCU MARKASI" : "KATEGORİ"} title={category} description={`${category} için doğrulanmış oyuncu ürünlerini ve ilanları keşfet.`}>
      <DiscoveryExperience initialQuery={brand?.label ?? ""} lockedCategory={brand ? undefined : category} categoryTitle={category} />
    </MarketplaceShell>
  );
}
