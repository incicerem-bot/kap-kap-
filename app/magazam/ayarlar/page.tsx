import MarketplaceShell from "@/components/MarketplaceShell";
import SellerStoreSettingsExperience from "@/components/SellerStoreSettingsExperience";

export default function SellerStoreSettingsPage() {
  return (
    <MarketplaceShell
      eyebrow="MAĞAZA YÖNETİMİ"
      title="Mağaza Ayarları"
      description="Mağaza vitrininin adını, bağlantısını, açıklamasını ve görsellerini düzenle."
    >
      <SellerStoreSettingsExperience />
    </MarketplaceShell>
  );
}
