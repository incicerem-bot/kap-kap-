import Link from "next/link";
import MarketplaceShell from "@/components/MarketplaceShell";
import ProfileDashboard from "@/components/ProfileDashboard";

export default function ProfilePage() {
  return (
    <MarketplaceShell
      eyebrow="HESAP MERKEZİ"
      title="Profilim"
      description="Satış performansını, bakiyeni ve hesap güvenliğini tek ekrandan yönet."
      action={<Link href="/ayarlar" className="profileHeaderAction">Profili düzenle</Link>}
    >
      <ProfileDashboard />
    </MarketplaceShell>
  );
}
