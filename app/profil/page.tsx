import Link from "next/link";
import MarketplaceShell from "@/components/MarketplaceShell";
import ProfileDashboard from "@/components/ProfileDashboard";

export default function ProfilePage() {
  return (
    <MarketplaceShell
      eyebrow="HESAP MERKEZİ"
      title="Hesap Özeti"
      description="Rolüne özel işlemlerini, doğrulamalarını ve son hareketlerini tek ekrandan yönet."
      action={<Link href="/ayarlar" className="profileHeaderAction">Ayarlar ve güvenlik</Link>}
    >
      <ProfileDashboard />
    </MarketplaceShell>
  );
}
