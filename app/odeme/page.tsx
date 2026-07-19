import MarketplaceShell from "@/components/MarketplaceShell";
import PaymentCheckoutExperience from "@/components/PaymentCheckoutExperience";

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  const orderNo = String(params.order ?? "").trim();
  return (
    <MarketplaceShell eyebrow="GÜVENLİ ÖDEME" title="Sipariş ödemesini tamamla" description="Ödeme iyzico Checkout Form üzerinden 3D Secure korumasıyla alınır.">
      <PaymentCheckoutExperience orderNo={orderNo} />
    </MarketplaceShell>
  );
}
