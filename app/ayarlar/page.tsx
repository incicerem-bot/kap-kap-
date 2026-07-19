import MarketplaceShell from "@/components/MarketplaceShell";
import AccountCenterExperience from "@/components/AccountCenterExperience";

export default function Page() {
  return (
    <MarketplaceShell eyebrow="HESAP" title="Ayarlar ve güvenlik" description="Profilini, doğrulamalarını, ödeme yöntemlerini ve gizlilik tercihlerini tek yerden yönet." compact>
      <AccountCenterExperience />
    </MarketplaceShell>
  );
}
