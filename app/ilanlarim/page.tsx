import MarketplaceShell from "@/components/MarketplaceShell";
import MyListingsExperience from "@/components/MyListingsExperience";

export default function MyListingsPage() {
  return (
    <MarketplaceShell
      eyebrow="SATICI MERKEZİ"
      title="İlanlarım"
      description="Taslak, aktif, durdurulmuş ve tamamlanan satışlarını tek ekrandan yönet."
    >
      <MyListingsExperience />
    </MarketplaceShell>
  );
}
