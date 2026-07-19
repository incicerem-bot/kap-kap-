import MarketplaceShell from "@/components/MarketplaceShell";
import ProductDetailExperience from "@/components/ProductDetailExperience";
import { demoProducts } from "@/components/productData";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = demoProducts.find((item) => item.id === id) ?? demoProducts[0];

  return (
    <MarketplaceShell title={product.title} compact>
      <ProductDetailExperience product={product} />
    </MarketplaceShell>
  );
}
