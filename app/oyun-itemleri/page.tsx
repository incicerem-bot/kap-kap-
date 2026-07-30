import MarketHubExperience from "@/components/MarketHubExperience";
import MarketplaceShell from "@/components/MarketplaceShell";

export default function GameItemsPage() {
  return <MarketplaceShell compact title="Oyun İtemleri"><MarketHubExperience mode="game-items" /></MarketplaceShell>;
}
