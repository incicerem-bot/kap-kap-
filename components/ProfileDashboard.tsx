"use client";

import Link from "next/link";

const recent = [
  ["iPhone 15 Pro Max satıldı", "Bugün 14:32", "+30.250 TL"],
  ["Para çekme talebi", "Dün 10:15", "-10.000 TL"],
  ["ASUS ROG Strix RTX 4070 Ti", "Dün 08:45", "Teklif geldi"],
  ["Bakiyeye para yatırdınız", "2 gün önce", "+5.000 TL"],
];

const auctions = [
  ["iPhone 15 Pro Max 256GB", "32.100 TL", "00:12:45"],
  ["ASUS ROG Strix RTX 4070 Ti", "24.750 TL", "04:52:11"],
  ["PlayStation 5 Digital Edition", "18.750 TL", "23:33:10"],
];

export default function ProfileDashboard() {
  return (
    <div className="profileReferenceLayout">
      <section className="profileTopGrid">
        <article className="profileIdentityCard">
          <div className="profileIdentityMain">
            <div className="profilePhoto">K</div>
            <div>
              <h2>Kemal Akar <span>✓</span></h2>
              <p>Üye başlangıcı: Mayıs 2024</p>
              <b className="verifiedBadge">● Doğrulanmış Hesap</b>
            </div>
          </div>
          <div className="profileMetrics">
            <div><strong>4.8 ★★★★★</strong><span>(128 değerlendirme)</span></div>
            <div><strong>127</strong><span>Başarılı Satış</span></div>
            <div><strong>89</strong><span>Başarılı Alış</span></div>
            <div><strong>%98</strong><span>Olumlu Puan</span></div>
          </div>
          <div className="profileCardActions"><button>Profili Düzenle</button><button>Mağazamı Görüntüle</button></div>
        </article>

        <article className="profileCompactCard walletCardRef">
          <span className="cardEyebrow">CÜZDAN BAKİYESİ</span>
          <strong className="walletAmountRef">12.450,75 TL</strong>
          <small>Toplam Bakiye</small>
          <div className="walletRows"><p><span>Bekleyen Bakiye</span><b>2.350,00 TL</b></p><p><span>Çekilebilir Bakiye</span><b>10.100,75 TL</b></p></div>
          <div className="profileCardActions"><button className="orangeButton">Para Yatır</button><button>Para Çek</button></div>
          <Link href="/cuzdan">İşlemlerim →</Link>
        </article>

        <article className="profileCompactCard securityCardRef">
          <span className="cardEyebrow">HESAP GÜVENLİĞİ</span>
          <ul><li>Telefon Doğrulandı <b>✓</b></li><li>E-posta Doğrulandı <b>✓</b></li><li>Kimlik Doğrulandı <b>✓</b></li></ul>
          <button>Güvenlik Ayarları</button>
        </article>
      </section>

      <section className="profileBottomGrid">
        <article className="profilePanel chartPanelRef">
          <div className="panelTitleRef"><span>İLAN İSTATİSTİKLERİ</span><div><button>Son 30 Gün⌄</button><button>Tümü⌄</button></div></div>
          <div className="chartMetrics"><div><strong>1.248</strong><span>Görüntülenme</span><em>%12</em></div><div><strong>156</strong><span>Teklif</span><em>%8</em></div><div><strong>28</strong><span>Satış</span><em>%15</em></div><div><strong>12.450 TL</strong><span>Kazanç</span><em>%20</em></div></div>
          <svg viewBox="0 0 500 150" className="profileChart" aria-label="İlan istatistik grafiği"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f28a00" stopOpacity=".35"/><stop offset="1" stopColor="#f28a00" stopOpacity="0"/></linearGradient></defs><path d="M12 122 L80 84 L145 96 L215 46 L288 74 L355 34 L420 84 L488 26 L488 145 L12 145 Z" fill="url(#fill)"/><path d="M12 122 L80 84 L145 96 L215 46 L288 74 L355 34 L420 84 L488 26" fill="none" stroke="#f28a00" strokeWidth="4"/><g fill="#0b0d10" stroke="#f28a00" strokeWidth="4">{[[12,122],[80,84],[145,96],[215,46],[288,74],[355,34],[420,84],[488,26]].map(([x,y])=><circle key={x} cx={x} cy={y} r="7"/>)}</g></svg>
        </article>

        <article className="profilePanel auctionsPanelRef">
          <div className="panelTitleRef"><span>AKTİF İLANLARIM</span></div>
          {auctions.map(([name,price,time],i)=><div className="activeAuctionRow" key={name}><div className="thumbRef">{i+1}</div><div><b>{name}</b><small>En Yüksek Teklif: {price}</small></div><time>{time}</time></div>)}
          <Link href="/ilanlarim">Tüm ilanlarım →</Link>
        </article>

        <article className="profilePanel recentPanelRef">
          <div className="panelTitleRef"><span>SON İŞLEMLER</span></div>
          {recent.map(([name,date,value],i)=><div className="recentRowRef" key={name}><span>{i===1?'▣':i===2?'◆':'♙'}</span><div><b>{name}</b><small>{date}</small></div><strong className={value.startsWith('+')?'positiveRef':''}>{value}</strong></div>)}
        </article>
      </section>

      <section className="storePromoRef"><div><span>◎</span><div><strong>Mağazanızı Büyütün!</strong><p>Daha fazla kişiye ulaşın, satışlarınızı artırın.</p></div></div><button>Mağazamı Tanıt</button></section>
    </div>
  );
}
