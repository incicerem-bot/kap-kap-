import MarketplaceShell from "@/components/MarketplaceShell";
import CheckoutIntentExperience from "@/components/CheckoutIntentExperience";

export default async function CheckoutPage({ params }: { params: Promise<{ intentId: string }> }) {
  const { intentId } = await params;
  return <MarketplaceShell eyebrow="GÜVENLİ ÖDEME" title="Satın alma rezervasyonu" description="Ürünün stoktan ayrıldı. Sipariş ve ödeme hazırlığını buradan takip et."><CheckoutIntentExperience intentId={intentId}/></MarketplaceShell>;
}
