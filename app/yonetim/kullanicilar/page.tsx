import type { Metadata } from "next";
import MarketplaceShell from "@/components/MarketplaceShell";
import AdminAccountCenter from "@/components/AdminAccountCenter";

export const metadata: Metadata = { title: "Kullanıcı ve Satıcı Yönetimi — KapışKapış" };

export default function Page() {
  return (
    <MarketplaceShell eyebrow="YÖNETİM" title="Kullanıcı ve satıcı hesapları" description="Gerçek kullanıcı doğrulamalarını, satıcı başvurularını ve hesap durumlarını yönet.">
      <AdminAccountCenter />
    </MarketplaceShell>
  );
}
