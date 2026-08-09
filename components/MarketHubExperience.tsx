import Link from "next/link";
import { collectionMenuItems, equipmentMenuItems, gameItemMenuItems, gameProductMenuItems, marketModeItems, type NavigationItem } from "@/components/marketplaceNavigation";

type MarketMode = "overview" | "auction" | "fixed" | "game-items";

type Props = {
  mode: MarketMode;
  selectedGame?: string;
};

const gameNames: Record<string, string> = {
  cs2: "Counter-Strike 2",
  valorant: "Valorant",
  "knight-online": "Knight Online",
  metin2: "Metin2",
  "league-of-legends": "League of Legends",
  "pubg-mobile": "PUBG Mobile",
  roblox: "Roblox",
  "mobile-legends": "Mobile Legends",
  "silkroad-online": "Silkroad Online",
  "rise-online": "Rise Online",
  "black-desert": "Black Desert",
  fortnite: "Fortnite",
  minecraft: "Minecraft",
};

const auctionLinks = [
  ["/canli", "Canlı Açık Artırmalar", "Tekliflerin anlık değiştiği odalara katıl.", "CANLI"],
  ["/son-dakika", "Son Dakika", "Bitmesine az kalan fırsatları yakala.", "HIZLI"],
  ["/arama", "Tüm İlanlar", "Kategori ve gelişmiş filtrelerle keşfet.", "KEŞFET"],
  ["/teklif-guvencesi", "Teklif Güvencesi", "Limitini ve güvence durumunu kontrol et.", "GÜVENLİ"],
] as const;

const fixedLinks = [
  ["/kategori/bilgisayar-oyunlari", "Bilgisayar Oyunları", "PC oyunlarını doğrudan satın al."],
  ["/kategori/playstation-oyunlari", "PlayStation Oyunları", "PlayStation oyunlarını keşfet."],
  ["/kategori/xbox-oyunlari", "Xbox Oyunları", "Xbox oyunlarını keşfet."],
  ["/kategori/nintendo-oyunlari", "Nintendo Oyunları", "Switch oyunlarını ve özel sürümleri keşfet."],
  ["/kategori/steam-kodlari", "Steam Cüzdan ve Kod", "Steam oyun kodu ve cüzdan ürünleri."],
  ["/kategori/epin-hediye-karti", "E-pin ve Hediye Kartı", "Platform ve oyunlara özel dijital kodlar."],
  ["/kategori/gaming-mouse", "Gaming Mouse", "FPS ve e-spor odaklı oyuncu mouse modelleri."],
  ["/kategori/gaming-klavye", "Gaming Klavye", "Mekanik ve düşük gecikmeli oyuncu klavyeleri."],
  ["/kategori/gaming-kulaklik", "Gaming Kulaklık", "Mikrofonlu kablolu ve kablosuz kulaklıklar."],
  ["/kategori/gaming-monitor", "Gaming Monitör", "Yüksek yenileme hızlı oyuncu monitörleri."],
  ["/kategori/gamepad-joystick", "Gamepad ve Simülasyon", "Gamepad, joystick ve direksiyon setleri."],
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

function DirectoryGroup({ title, eyebrow, items }: { title: string; eyebrow: string; items: NavigationItem[] }) {
  return (
    <section className="marketDirectoryGroupV32">
      <header><span>{eyebrow}</span><h2>{title}</h2><small>{items.length} kategori</small></header>
      <nav>
        {items.map((item) => <Link href={item.href} key={item.href}><div><strong>{item.label}</strong><small>{item.description || "İlanları ve fırsatları keşfet"}</small></div><b>→</b></Link>)}
      </nav>
    </section>
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
          <p>Oyunlar, oyun itemleri ve özel seri oyuncu ürünleri aynı güvenli hesap, ödeme ve destek altyapısında birleşir.</p>
        </section>
        <MarketCards />
        <div className="marketDirectoryV32">
          <DirectoryGroup eyebrow="OYUN MAĞAZASI" title="Oyunlar ve dijital kodlar" items={gameProductMenuItems} />
          <DirectoryGroup eyebrow="OYUNCU DONANIMI" title="Oyuncu ekipmanları" items={equipmentMenuItems} />
          <DirectoryGroup eyebrow="DİJİTAL ENVANTER" title="Oyun itemleri" items={gameItemMenuItems} />
          <DirectoryGroup eyebrow="KOLEKSİYON" title="Özel seri ürünler" items={collectionMenuItems} />
        </div>
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
        <section className="auctionFlowV33" aria-label="Açık artırma adımları">
          <article><b>01</b><div><strong>Ürünü incele</strong><span>İlan detayını, satıcıyı ve teklif artışını kontrol et.</span></div></article>
          <article><b>02</b><div><strong>Teklifini belirle</strong><span>Bütçene uygun tutarı seç ve teklifini güvenle gönder.</span></div></article>
          <article><b>03</b><div><strong>Süreyi takip et</strong><span>Canlı akışı izle; kalan süreyi ve lider teklifi kaçırma.</span></div></article>
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
