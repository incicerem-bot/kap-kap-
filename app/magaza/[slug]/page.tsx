import { notFound } from "next/navigation";
import MarketplaceShell from "@/components/MarketplaceShell";
import SellerStoreExperience from "@/components/SellerStoreExperience";
import { findSellerBySlug, sellerProfiles } from "@/components/sellerData";

export function generateStaticParams() {
  return sellerProfiles.map((seller) => ({ slug: seller.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function SellerStorePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab = "listings" } = await searchParams;
  const seller = findSellerBySlug(slug);
  if (!seller) notFound();

  return (
    <MarketplaceShell title={`${seller.name} mağazası`} compact>
      <SellerStoreExperience seller={seller} initialTab={tab} />
    </MarketplaceShell>
  );
}
