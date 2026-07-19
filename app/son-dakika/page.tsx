import MarketplaceShell from "@/components/MarketplaceShell";
import { ProductGrid } from "@/components/MarketplaceUI";
export default function Page(){return <MarketplaceShell eyebrow="SON ŞANS" title="Son dakika fırsatları" description="Bitmesine az kalan açık artırmaları kaçırma."><div className="alertBannerPremium"><strong>⚡ Son 30 dakika</strong><span>Bu ürünlerde karar anı. Kazanan teklif seninki olabilir.</span></div><ProductGrid variant="ending"/></MarketplaceShell>}
