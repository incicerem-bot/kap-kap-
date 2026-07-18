"use client";

type HeroProps = { onOpenSell: () => void };

export default function Hero({ onOpenSell }: HeroProps) {
  return (
    <section className="premiumHero">
      <div className="premiumHeroGlow" />
      <div className="premiumHeroContent">
        <span className="heroKicker">TÜRKİYE'NİN YENİ NESİL AÇIK ARTIRMA PLATFORMU</span>
        <h1>En iyi teklifler,<br />en hızlı şekilde<br /><em>KAPIŞKAPIŞ’ta!</em></h1>
        <p>Binlerce ürüne teklif ver, doğrulanmış satıcılardan güvenle kazan.</p>
        <div className="heroTrustRow">
          <span>◈ Güvenli Ödeme</span><span>✓ Doğrulanmış Satıcılar</span><span>▣ Alıcı Koruması</span>
        </div>
        <div className="heroButtons">
          <button className="goldButton" type="button" onClick={() => document.getElementById("live-auctions")?.scrollIntoView({ behavior: "smooth" })}>Hemen Teklif Ver</button>
          <button className="outlineButton" type="button" onClick={onOpenSell}>Ücretsiz İlan Ver</button>
        </div>
      </div>
      <div className="premiumHeroVisual">
        <img src="/kapiskapis-hero.jpg" alt="KapışKapış açık artırma" />
      </div>
      <div className="heroDots"><i/><i/><i/><i/></div>
    </section>
  );
}
