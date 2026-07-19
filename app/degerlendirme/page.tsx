import MarketplaceShell from "@/components/MarketplaceShell";
import ReviewFlowExperience from "@/components/ReviewFlowExperience";

type PageProps = { searchParams: Promise<{ order?: string }> };

export default async function ReviewPage({ searchParams }: PageProps) {
  const { order = "KK-24672" } = await searchParams;
  return (
    <MarketplaceShell
      eyebrow="DOĞRULANMIŞ ALIŞVERİŞ"
      title="Satıcıyı değerlendir"
      description="Teslim aldığın ürünü ve satıcı deneyimini puanlayarak diğer alıcılara yardımcı ol."
    >
      <ReviewFlowExperience orderId={order} />
    </MarketplaceShell>
  );
}
