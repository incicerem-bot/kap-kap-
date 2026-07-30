import MarketplaceShell from "@/components/MarketplaceShell";
import ListingCreateExperience from "@/components/ListingCreateExperience";

export default function CreateListingPage() {
  return (
    <MarketplaceShell
      eyebrow="SATIŞ BAŞLAT"
      title="Yeni ilan oluştur"
      description="Açık artırma veya sabit fiyatlı satışını tek akışta hazırla. İlan önce taslak olarak güvenle kaydedilir."
    >
      <ListingCreateExperience />
    </MarketplaceShell>
  );
}
