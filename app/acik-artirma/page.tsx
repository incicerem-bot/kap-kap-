import MarketHubExperience from "@/components/MarketHubExperience";
import MarketplaceShell from "@/components/MarketplaceShell";

export default function AuctionMarketPage() {
  return <MarketplaceShell compact title="Açık Artırma"><MarketHubExperience mode="auction" /></MarketplaceShell>;
}
