import DiscoveryExperience from "@/components/DiscoveryExperience";
import MarketplaceShell from "@/components/MarketplaceShell";
import { notFound } from "next/navigation";
import { equipmentBrandItems } from "@/components/marketplaceNavigation";
import EquipmentTaxonomy from "@/components/EquipmentTaxonomy";
import CompatibilityAdvisor from "@/components/CompatibilityAdvisor";
import type { Metadata } from "next";

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
  "bilgisayar-kasasi": "Bilgisayar Kasası",
  "ekran-karti": "Ekran Kartı",
  "ssd": "SSD",
  "anakart": "Anakart",
  "islemci": "İşlemci",
  "ram-bellek": "RAM Bellek",
  "guc-kaynagi": "Güç Kaynağı",
  "sivi-sogutma": "Sıvı Soğutma",
  "hava-sogutma": "Hava Soğutma",
  "kasa-fani": "Kasa Fanı",
  "oyuncu-masasi": "Oyuncu Masası",
  "ozel-seri": "Özel Seri Oyuncu Ürünleri",
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = equipmentBrandItems.find((item) => item.href.endsWith(`/kategori/${slug}`));
  const title = categories[slug] ?? brand?.label;
  return title ? { title: `${title} İlanları | KapışKapış`, description: `${title} oyuncu ürünlerini ayrıntılı filtreler, açık artırma ve sabit fiyat seçenekleriyle keşfet.` } : {};
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = equipmentBrandItems.find((item) => item.href.endsWith(`/kategori/${slug}`));
  const category = categories[slug] ?? brand?.label;
  if (!category) notFound();
  return (
    <MarketplaceShell eyebrow={brand ? "OYUNCU MARKASI" : "KATEGORİ"} title={category} description={`${category} için doğrulanmış oyuncu ürünlerini ve ilanları keşfet.`}>
      {!brand && <EquipmentTaxonomy category={slug} />}
      {!brand && <CompatibilityAdvisor category={slug} />}
      <DiscoveryExperience initialQuery={brand?.label ?? ""} lockedCategory={brand ? undefined : category} categoryTitle={category} taxonomyCategory={brand ? undefined : slug} />
    </MarketplaceShell>
  );
}
