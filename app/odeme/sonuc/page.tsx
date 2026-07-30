import MarketplaceShell from "@/components/MarketplaceShell";
import PaymentResultExperience from "@/components/PaymentResultExperience";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ session?: string; error?: string }> }) {
  const query = await searchParams;
  return <MarketplaceShell eyebrow="ÖDEME SONUCU" title="Sipariş durumu" description="Ödeme sonucu iyzico yanıtı ve KapışKapış sipariş kaydıyla doğrulanır."><PaymentResultExperience sessionId={query.session || ""} callbackError={query.error || ""}/></MarketplaceShell>;
}
