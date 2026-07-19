import MarketplaceShell from "@/components/MarketplaceShell";
import SellerStoreExperience from "@/components/SellerStoreExperience";
import { findSellerBySlug, sellerProfiles, type SellerProfile } from "@/components/sellerData";

export function generateStaticParams() {
  return sellerProfiles.map((seller) => ({ slug: seller.slug }));
}

function sellerPlaceholder(slug: string): SellerProfile {
  return {
    slug,
    name: "KapışKapış Mağazası",
    initials: "KK",
    tagline: "Mağaza bilgileri yükleniyor",
    location: "Türkiye",
    joinedAt: "2026",
    verified: false,
    rating: 0,
    sales: 0,
    followers: 0,
    responseRate: 0,
    responseTime: "—",
    shipOnTime: 0,
    cancellationRate: 0,
    productIds: [],
    categories: [],
    about: "Mağaza bilgileri Supabase üzerinden yükleniyor.",
    badges: [],
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    reviews: [],
  };
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function SellerStorePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab = "listings" } = await searchParams;
  const seller = findSellerBySlug(slug) ?? sellerPlaceholder(slug);

  return (
    <MarketplaceShell title={`${seller.name} mağazası`} compact>
      <SellerStoreExperience seller={seller} initialTab={tab} />
    </MarketplaceShell>
  );
}
