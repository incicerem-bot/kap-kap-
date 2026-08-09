import MarketHubExperience from "@/components/MarketHubExperience";
import MarketplaceShell from "@/components/MarketplaceShell";
import { notFound } from "next/navigation";
import { gameItemMenuItems } from "@/components/marketplaceNavigation";

const games = new Set(gameItemMenuItems.map((item) => item.href.split("/").pop()));

export default async function GameItemCategoryPage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!games.has(game)) notFound();
  return <MarketplaceShell compact title="Oyun İtemleri"><MarketHubExperience mode="game-items" selectedGame={game} /></MarketplaceShell>;
}
