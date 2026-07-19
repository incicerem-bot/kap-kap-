import MarketplaceShell from "@/components/MarketplaceShell";
import PaymentResultExperience from "@/components/PaymentResultExperience";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ order?: string; status?: string; message?: string }> }) {
  const params = await searchParams;
  return (
    <MarketplaceShell compact title="Ödeme sonucu">
      <PaymentResultExperience orderNo={String(params.order ?? "unknown")} initialStatus={String(params.status ?? "processing")} initialMessage={params.message ? String(params.message) : undefined} />
    </MarketplaceShell>
  );
}
