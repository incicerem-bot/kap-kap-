import MarketplaceShell from "@/components/MarketplaceShell";
import { ProductGrid } from "@/components/MarketplaceUI";
export default function Page(){return <MarketplaceShell eyebrow="AÇIK ARTIRMA" title="Tekliflerim" description="Katıldığın açık artırmaları ve teklif durumunu takip et."><div className="filterBarPremium"><button className="active">Devam eden (6)</button><button>Kazandıklarım (8)</button><button>Kaybettiklerim (11)</button></div><ProductGrid/></MarketplaceShell>}
