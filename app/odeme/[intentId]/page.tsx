import MarketplaceShell from "@/components/MarketplaceShell";
import CheckoutIntentExperience from "@/components/CheckoutIntentExperience";

export default async function CheckoutPage({ params }: { params: Promise<{ intentId: string }> }) {
  const { intentId } = await params;
  return <MarketplaceShell eyebrow="GÜVENLİ ÖDEME" title="Siparişini tamamla" description="Teslimat adresini seç, iyzico güvenli ödeme sayfasına geç ve siparişini oluştur."><CheckoutIntentExperience intentId={intentId}/></MarketplaceShell>;
}
