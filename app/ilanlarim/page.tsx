import MarketplaceShell from "@/components/MarketplaceShell";
import { ProductGrid } from "@/components/MarketplaceUI";
export default function Page(){return <MarketplaceShell eyebrow="SATIŞ MERKEZİ" title="İlanlarım" description="Aktif, taslak ve tamamlanan ilanlarını yönet."><div className="filterBarPremium"><button className="active">Aktif (12)</button><button>Taslak (3)</button><button>Tamamlandı (24)</button><button>Reddedildi (1)</button></div><ProductGrid/></MarketplaceShell>}
