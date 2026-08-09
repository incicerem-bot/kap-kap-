import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DiscoveryExperience from "@/components/DiscoveryExperience";
import MarketHubExperience from "@/components/MarketHubExperience";
import MarketplaceShell from "@/components/MarketplaceShell";
import { findGameItemFilter } from "@/components/gameItemTaxonomyData";

type PageProps = { params: Promise<{ game: string; filter: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { game, filter } = await params;
  const match = findGameItemFilter(game, filter);
  return match ? { title: `${match.value} ${match.taxonomy.name} İlanları | KapışKapış`, description: `${match.taxonomy.name} için ${match.value} item ilanlarını keşfet.` } : {};
}

export default async function GameItemFilterPage({ params }: PageProps) {
  const { game, filter } = await params;
  const match = findGameItemFilter(game, filter);
  if (!match) notFound();
  return <MarketplaceShell eyebrow={match.section.title.toLocaleUpperCase("tr-TR")} title={`${match.value} · ${match.taxonomy.name}`} description={`${match.section.description}. Bu türe uygun doğrulanmış item ilanlarını keşfet.`}>
    <MarketHubExperience mode="game-items" selectedGame={game} selectedItemFilter={match.value} />
    <DiscoveryExperience initialQuery={match.value} categoryTitle={`${match.value} ${match.taxonomy.name}`} />
  </MarketplaceShell>;
}
