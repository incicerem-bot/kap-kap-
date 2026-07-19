import MarketplaceShell from "@/components/MarketplaceShell";
import ComparisonCenterExperience from "@/components/ComparisonCenterExperience";

export default function Page() {
  return (
    <MarketplaceShell eyebrow="KARAR MERKEZİ" title="Ürün karşılaştırma" description="Seçtiğin açık artırmaları fiyat, süre, satıcı ve teknik özellikleriyle yan yana incele.">
      <ComparisonCenterExperience />
    </MarketplaceShell>
  );
}
