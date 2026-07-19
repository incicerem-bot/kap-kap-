import MarketplaceShell from "@/components/MarketplaceShell";
import OrdersCenterExperience from "@/components/OrdersCenterExperience";

export default function OrdersPage() {
  return (
    <MarketplaceShell
      eyebrow="ALIŞVERİŞLERİM"
      title="Sipariş ve teslimat merkezi"
      description="Kazandığın ürünlerin ödeme, hazırlık, kargo ve teslimat süreçlerini güvenle takip et."
    >
      <OrdersCenterExperience />
    </MarketplaceShell>
  );
}
