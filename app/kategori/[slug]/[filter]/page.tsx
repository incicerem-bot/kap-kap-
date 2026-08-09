import { notFound } from "next/navigation";
import Link from "next/link";
import DiscoveryExperience from "@/components/DiscoveryExperience";
import EquipmentTaxonomy from "@/components/EquipmentTaxonomy";
import MarketplaceShell from "@/components/MarketplaceShell";
import { findEquipmentFilter } from "@/components/equipmentTaxonomyData";
import CompatibilityAdvisor from "@/components/CompatibilityAdvisor";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ slug: string; filter: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, filter } = await params;
  const match = findEquipmentFilter(slug, filter);
  return match ? { title: `${match.value} ${match.taxonomy.name} | KapışKapış`, description: `${match.taxonomy.name} kategorisinde ${match.value} ürün ilanlarını karşılaştır.` } : {};
}

export default async function EquipmentFilterPage({ params }: PageProps) {
  const { slug, filter } = await params;
  const match = findEquipmentFilter(slug, filter);
  if (!match) notFound();
  const groupLabel = match.group === "brand" ? "MARKA" : match.group === "type" ? "ÜRÜN TÜRÜ" : "TEKNİK ÖZELLİK";
  return <MarketplaceShell eyebrow={groupLabel} title={`${match.value} ${match.taxonomy.name}`} description={`${match.taxonomy.name} kategorisinde ${match.value} seçeneğine uygun doğrulanmış ilanları keşfet.`}>
    <nav className="equipmentBreadcrumbV38" aria-label="Kategori yolu"><Link href="/pazarlar">Pazarlar</Link><span>›</span><Link href={`/kategori/${slug}`}>{match.taxonomy.name}</Link><span>›</span><strong>{match.value}</strong></nav>
    <EquipmentTaxonomy category={slug} selected={match.value} />
    <CompatibilityAdvisor category={slug} />
    <DiscoveryExperience lockedCategory={match.taxonomy.name} categoryTitle={`${match.value} ${match.taxonomy.name}`} taxonomyCategory={slug} initialFilters={[match.value]} />
  </MarketplaceShell>;
}
