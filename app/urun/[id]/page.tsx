import MarketplaceShell from "@/components/MarketplaceShell";
import ProductDetailExperience from "@/components/ProductDetailExperience";
import { demoProducts } from "@/components/productData";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fallbackProduct = demoProducts.find((item) => item.id === id) ?? null;

  return (
    <MarketplaceShell title={fallbackProduct?.title ?? "Açık artırma detayı"} compact>
      <ProductDetailExperience productSlug={id} fallbackProduct={fallbackProduct} />
    </MarketplaceShell>
  );
}
