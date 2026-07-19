import DiscoveryExperience from "@/components/DiscoveryExperience";
import MarketplaceShell from "@/components/MarketplaceShell";
import { notFound } from "next/navigation";

const categories: Record<string, string> = { telefon: "Telefon", bilgisayar: "Bilgisayar", oyun: "Oyun & Konsol", saat: "Saat", koleksiyon: "Koleksiyon", elektronik: "Elektronik", "ev-yasam": "Ev & Yaşam" };

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories[slug];
  if (!category) notFound();
  return <MarketplaceShell compact eyebrow="KATEGORİ" title={category} description={`${category} kategorisindeki doğrulanmış açık artırmaları keşfet.`}><DiscoveryExperience lockedCategory={category} categoryTitle={category} /></MarketplaceShell>;
}
