import Link from "next/link";

export default function UnauthorizedPage({ searchParams }: { searchParams: Promise<{ required?: string }> }) {
  return <UnauthorizedContent searchParams={searchParams} />;
}

async function UnauthorizedContent({ searchParams }: { searchParams: Promise<{ required?: string }> }) {
  const params = await searchParams;
  const admin = params.required === "admin";
  return (
    <main className="authorizationStateV19">
      <img src="/kapiskapis-logo.png" alt="KapışKapış" />
      <section>
        <span>ERİŞİM KISITLANDI</span>
        <h1>Bu bölüme erişim yetkin yok</h1>
        <p>{admin ? "Yönetim Merkezi yalnızca KapışKapış tarafından yönetici rolü verilen hesaplara açıktır." : "Bu işlem için gerekli hesap rolü hesabında bulunmuyor."}</p>
        <div><Link href="/profil">Profilime dön</Link><Link href="/">Ana sayfa</Link></div>
      </section>
    </main>
  );
}
