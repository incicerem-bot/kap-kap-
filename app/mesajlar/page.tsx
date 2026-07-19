import MarketplaceShell from "@/components/MarketplaceShell";
import MessagingCenterExperience from "@/components/MessagingCenterExperience";

export default function Page() {
  return (
    <MarketplaceShell
      eyebrow="GÜVENLİ İLETİŞİM"
      title="Mesajlar"
      description="Alıcı, satıcı ve destek ekibiyle işlem bağlamını kaybetmeden güvenli biçimde konuş."
    >
      <MessagingCenterExperience />
    </MarketplaceShell>
  );
}
