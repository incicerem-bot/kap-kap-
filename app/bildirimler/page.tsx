import MarketplaceShell from "@/components/MarketplaceShell";
import NotificationCenterExperience from "@/components/NotificationCenterExperience";

export default function Page() {
  return (
    <MarketplaceShell eyebrow="HABERLER" title="Bildirim merkezi" description="Teklif, sipariş, mesaj ve hesap hareketlerini önem sırasına göre takip et.">
      <NotificationCenterExperience />
    </MarketplaceShell>
  );
}
