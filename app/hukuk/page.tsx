import LegalTrustCenter from "@/components/LegalTrustCenter";
import MarketplaceShell from "@/components/MarketplaceShell";

type PageProps = { searchParams: Promise<{ doc?: string }> };

export default async function LegalPage({ searchParams }: PageProps) {
  const { doc = "genel" } = await searchParams;
  return (
    <MarketplaceShell
      eyebrow="ŞEFFAFLIK VE GÜVEN"
      title="Hukuk ve Güven Merkezi"
      description="Üyelik, açık artırma, satış, ödeme ve kişisel veri süreçlerinin güncel taslakları."
    >
      <LegalTrustCenter initialDoc={doc} />
    </MarketplaceShell>
  );
}
