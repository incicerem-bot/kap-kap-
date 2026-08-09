import DiscoveryExperience from "@/components/DiscoveryExperience";
import MarketplaceShell from "@/components/MarketplaceShell";
import { notFound } from "next/navigation";

const categories: Record<string, string> = {
  "bilgisayar-oyunlari": "Bilgisayar Oyunları",
  "xbox-oyunlari": "Xbox Oyunları",
  "playstation-oyunlari": "PlayStation Oyunları",
  "steam-oyunlari": "Steam Oyunları",
  "ozel-seri": "Özel Seri Oyuncu Ürünleri",
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories[slug];
  if (!category) notFound();
  return <MarketplaceShell compact eyebrow="KATEGORİ" title={category} description={`${category} kategorisindeki doğrulanmış açık artırmaları keşfet.`}><DiscoveryExperience lockedCategory={category} categoryTitle={category} /></MarketplaceShell>;
}
