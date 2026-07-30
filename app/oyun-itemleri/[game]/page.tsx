import MarketHubExperience from "@/components/MarketHubExperience";
import MarketplaceShell from "@/components/MarketplaceShell";
import { notFound } from "next/navigation";

const games = new Set(["cs2", "valorant", "dota-2", "rust", "lol", "steam"]);

export default async function GameItemCategoryPage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!games.has(game)) notFound();
  return <MarketplaceShell compact title="Oyun İtemleri"><MarketHubExperience mode="game-items" selectedGame={game} /></MarketplaceShell>;
}
