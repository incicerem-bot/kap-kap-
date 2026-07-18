import MarketplaceShell from "@/components/MarketplaceShell";
import { ProductGrid, StatsRow } from "@/components/MarketplaceUI";
export default function Page(){return <MarketplaceShell eyebrow="CANLI MERKEZ" title="Canlı açık artırmalar" description="Tekliflerin saniye saniye değiştiği odalara katıl."><StatsRow/><div className="sectionTitlePremium"><div><span>ŞİMDİ YAYINDA</span><h2>Kapışma başladı</h2></div><button>En yakın biten</button></div><ProductGrid/></MarketplaceShell>}
