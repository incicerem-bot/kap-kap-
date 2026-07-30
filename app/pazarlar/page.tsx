import MarketHubExperience from "@/components/MarketHubExperience";
import MarketplaceShell from "@/components/MarketplaceShell";

export default function MarketsPage() {
  return <MarketplaceShell compact title="Pazarlar"><MarketHubExperience mode="overview" /></MarketplaceShell>;
}
