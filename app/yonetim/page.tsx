import MarketplaceShell from "@/components/MarketplaceShell";
import AdminOperationsCenter from "@/components/AdminOperationsCenter";

export default function ManagementPage() {
  return (
    <MarketplaceShell
      eyebrow="KAPIŞKAPIŞ OPERASYON"
      title="Yönetim Merkezi"
      description="İlan güvenliği, kullanıcı doğrulama, ödeme akışı ve platform risklerini tek merkezden yönetin."
    >
      <AdminOperationsCenter />
    </MarketplaceShell>
  );
}
