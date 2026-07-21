import Link from "next/link";

export default async function AccountStatusPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const closed = status === "closed";
  return (
    <main className="authorizationStateV19">
      <img src="/kapiskapis-logo.png" alt="KapışKapış" />
      <section>
        <span>HESAP DURUMU</span>
        <h1>{closed ? "Hesabın kapalı" : "Hesabın geçici olarak kısıtlandı"}</h1>
        <p>{closed ? "Bu hesap kapatılmış durumda. Bir hata olduğunu düşünüyorsan destek ekibine ulaş." : "Güvenlik veya platform kuralları nedeniyle bazı hesap işlemleri geçici olarak durduruldu."}</p>
        <div><Link href="/yardim">Destek merkezine git</Link><Link href="/hukuk">Platform kuralları</Link></div>
      </section>
    </main>
  );
}
