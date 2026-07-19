import MarketplaceShell from "@/components/MarketplaceShell";
import LogisticsCenterExperience from "@/components/LogisticsCenterExperience";

type PageProps = {
  searchParams: Promise<{ order?: string; mode?: string }>;
};

export default async function LogisticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <MarketplaceShell
      eyebrow="KAPIŞKAPIŞ KARGO"
      title="Kargo ve iade merkezi"
      description="Gönderi kodunu oluştur, kargonu canlı takip et ve teslimat veya iade işlemlerini güvenli ödeme korumasıyla yönet."
    >
      <LogisticsCenterExperience initialOrder={params.order} initialMode={params.mode} />
    </MarketplaceShell>
  );
}
