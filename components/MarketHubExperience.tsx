import Link from "next/link";
import { gameItemMenuItems, marketModeItems } from "@/components/marketplaceNavigation";

type MarketMode = "overview" | "auction" | "fixed" | "game-items";

type Props = {
  mode: MarketMode;
  selectedGame?: string;
};

const gameNames: Record<string, string> = {
  cs2: "Counter-Strike 2",
  valorant: "VALORANT",
  "dota-2": "Dota 2",
  rust: "Rust",
  lol: "League of Legends",
  steam: "Steam Envanteri",
};

const auctionLinks = [
  ["/canli", "Canlı Açık Artırmalar", "Tekliflerin anlık değiştiği odalara katıl.", "CANLI"],
  ["/son-dakika", "Son Dakika", "Bitmesine az kalan fırsatları yakala.", "HIZLI"],
  ["/arama", "Tüm İlanlar", "Kategori ve gelişmiş filtrelerle keşfet.", "KEŞFET"],
  ["/teklif-guvencesi", "Teklif Güvencesi", "Limitini ve güvence durumunu kontrol et.", "GÜVENLİ"],
] as const;

const fixedLinks = [
  ["/sabit-fiyat?category=teknoloji", "Teknoloji Pazarı", "Telefon, bilgisayar ve elektronik ürünleri."],
  ["/sabit-fiyat?category=oyun", "Oyun & Konsol", "Konsol, ekipman ve aksesuarlar."],
  ["/sabit-fiyat?category=koleksiyon", "Koleksiyon", "Nadir ve özel ürünleri doğrudan satın al."],
  ["/sabit-fiyat?category=ev-yasam", "Ev & Yaşam", "Ev, yaşam ve kişisel kullanım ürünleri."],
] as const;

function MarketCards() {
  return (
    <div className="marketHubModeGridV30">
      {marketModeItems.map((item, index) => (
        <Link href={item.href} key={item.href} className={`marketHubModeCardV30 mode-${index + 1}`}>
          <div className="marketHubModeNumberV30">0{index + 1}</div>
          <div>
            <span>{item.badge || "PAZAR"}</span>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
          </div>
          <b aria-hidden="true">→</b>
        </Link>
      ))}
    </div>
  );
}

export function MarketEntryStrip() {
  return (
    <section className="marketEntryStripV30" aria-label="KapışKapış satış sistemleri">
      {marketModeItems.map((item, index) => (
        <Link href={item.href} key={item.href}>
          <small>0{index + 1}</small>
          <div><strong>{item.label}</strong><span>{item.description}</span></div>
          <b>→</b>
        </Link>
      ))}
    </section>
  );
}

export default function MarketHubExperience({ mode, selectedGame }: Props) {
  if (mode === "overview") {
    return (
      <div className="marketHubV30">
        <section className="marketHubIntroV30">
          <span>TEK HESAP · ÜÇ PAZAR</span>
          <h1>Nasıl almak veya satmak istediğini seç.</h1>
          <p>Açık artırma, doğrudan satın alma ve oyun itemi işlemleri aynı güvenli hesap, ödeme ve destek altyapısında birleşir.</p>
        </section>
        <MarketCards />
      </div>
    );
  }

  if (mode === "auction") {
    return (
      <div className="marketHubV30">
        <section className="marketHubIntroV30 auction">
          <span>AÇIK ARTIRMA PAZARI</span>
          <h1>Teklif ver, süreyi takip et, kazanan sen ol.</h1>
          <p>Canlı ve süreli açık artırmalar, şeffaf teklif geçmişi ve Akıllı Teklif Güvencesiyle tek merkezde.</p>
          <div className="marketHubActionsV30"><Link href="/canli">Canlıya katıl</Link><Link href="/ilan-olustur?mode=auction">Açık artırma oluştur</Link></div>
        </section>
        <div className="marketHubLinkGridV30">
          {auctionLinks.map(([href, title, text, badge]) => <Link href={href} key={href}><span>{badge}</span><h2>{title}</h2><p>{text}</p><b>→</b></Link>)}
        </div>
      </div>
    );
  }

  if (mode === "fixed") {
    return (
      <div className="marketHubV30">
        <section className="marketHubIntroV30 fixed">
          <span>SABİT FİYAT PAZARI</span>
          <h1>Fiyat belli. Karar ver, satın al.</h1>
          <p>Açık artırma beklemeden, doğrulanmış satıcılardan güvenli ödeme ve alıcı korumasıyla doğrudan alışveriş yap.</p>
          <div className="marketHubActionsV30"><Link href="/sabit-fiyat?view=all">Ürünleri keşfet</Link><Link href="/ilan-olustur?mode=fixed">Sabit fiyatlı ilan ver</Link></div>
        </section>
        <div className="marketHubLinkGridV30">
          {fixedLinks.map(([href, title, text]) => <Link href={href} key={href}><span>DOĞRUDAN AL</span><h2>{title}</h2><p>{text}</p><b>→</b></Link>)}
        </div>
      </div>
    );
  }

  const activeGame = selectedGame ? gameNames[selectedGame] : undefined;
  return (
    <div className="marketHubV30">
      <section className="marketHubIntroV30 gameItems">
        <span>OYUN İTEMLERİ PAZARI</span>
        <h1>{activeGame ? `${activeGame} item pazarı` : "Oyun envanterini güvenle değerlendir."}</h1>
        <p>Yalnızca aktarımı ve satışı izin verilen dijital ürünler; işlem kaydı, kullanıcı doğrulaması ve uyuşmazlık desteğiyle listelenir.</p>
        <div className="marketHubActionsV30"><Link href="/oyun-itemleri">Tüm oyunlar</Link><Link href="/ilan-olustur?mode=game-item">İtem sat</Link></div>
      </section>
      <div className="gameItemMenuGridV30">
        {gameItemMenuItems.map((item) => (
          <Link href={item.href} key={item.href} className={selectedGame && item.href.endsWith(`/${selectedGame}`) ? "active" : ""}>
            <span>{item.label.slice(0, 2).toLocaleUpperCase("tr-TR")}</span>
            <div><strong>{item.label}</strong><small>Skin, kozmetik ve aktarılabilir itemler</small></div>
            <b>→</b>
          </Link>
        ))}
      </div>
      <section className="gameItemSafetyV30">
        <div><strong>Hesap satışı yok</strong><span>Kişisel oyun hesabı devri yerine izinli ürün transferi.</span></div>
        <div><strong>İşlem kaydı</strong><span>Teklif, ödeme ve teslim adımları kayıt altında.</span></div>
        <div><strong>Uyuşmazlık desteği</strong><span>Sorunlu dijital teslimatlar için inceleme akışı.</span></div>
      </section>
    </div>
  );
}
