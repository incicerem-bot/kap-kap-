import MarketplaceShell from "@/components/MarketplaceShell";
import PaymentResultExperience from "@/components/PaymentResultExperience";

type SearchParams = {
  session?: string | string[];
  error?: string | string[];
  message?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function LegacyPaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const sessionId = firstValue(query.session);
  const callbackError = firstValue(query.error) || firstValue(query.message);

  return (
    <MarketplaceShell
      eyebrow="ÖDEME SONUCU"
      title="Sipariş durumu"
      description="Ödeme sonucu iyzico yanıtı ve KapışKapış sipariş kaydıyla doğrulanır."
    >
      <PaymentResultExperience
        sessionId={sessionId}
        callbackError={callbackError}
      />
    </MarketplaceShell>
  );
}
