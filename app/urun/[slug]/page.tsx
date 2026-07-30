import MarketplaceShell from "@/components/MarketplaceShell";
import ProductDetailExperience from "@/components/ProductDetailExperience";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MarketplaceShell eyebrow="CANLI İLAN" title="Ürün ve teklif odası" description="Fiyatı, kalan süreyi ve teklif hareketlerini canlı takip et."><ProductDetailExperience slug={slug}/></MarketplaceShell>;
}
