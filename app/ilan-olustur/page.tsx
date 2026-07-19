import Link from "next/link";
import ListingWizard from "@/components/ListingWizard";

export default function CreateListingPage() {
  return (
    <main className="createListingPageV4">
      <header className="createListingHeaderV4">
        <Link href="/" className="createListingBrandV4" aria-label="KapışKapış ana sayfa">
          <img src="/kapiskapis-logo.png" alt="KapışKapış" />
        </Link>
        <div className="createListingHeaderTitleV4">
          <span>SATIŞ MERKEZİ</span>
          <strong>Yeni ilan oluştur</strong>
        </div>
        <Link href="/" className="createListingExitV4">Vazgeç ve çık</Link>
      </header>
      <ListingWizard />
    </main>
  );
}
