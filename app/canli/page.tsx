import MarketplaceShell from "@/components/MarketplaceShell";
import LiveAuctionLobby from "@/components/LiveAuctionLobby";

export default function Page() {
  return (
    <MarketplaceShell title="Canlı açık artırmalar" compact>
      <LiveAuctionLobby />
    </MarketplaceShell>
  );
}
