"use client";

import Link from "next/link";

type HeroProps = { onOpenSell: () => void };

export default function Hero({ onOpenSell }: HeroProps) {
  return (
    <section className="premiumHero" aria-labelledby="home-hero-title">
      <div className="premiumHeroGlow" aria-hidden="true" />

      <div className="premiumHeroContent">
        <span className="heroKicker">
          <i aria-hidden="true" /> CANLI, GÜVENLİ, ŞEFFAF
        </span>
        <h1 id="home-hero-title">
          Beğendiysen bekleme,
          <strong>KapışKapış kap.</strong>
        </h1>
        <p>
          Doğrulanmış satıcılardan teknoloji, oyun ve koleksiyon ürünlerine
          teklif ver. Kazandığında ödeme, teslimat tamamlanana kadar koruma altında.
        </p>

        <div className="heroButtons">
          <button
            className="heroPrimaryButton"
            type="button"
            onClick={() =>
              document.getElementById("live-auctions")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Canlı açık artırmaları gör
          </button>
          <button className="heroSecondaryButton" type="button" onClick={onOpenSell}>
            Ücretsiz ilan ver
          </button>
        </div>

        <div className="heroTrustRow" aria-label="KapışKapış güvenceleri">
          <span><b>✓</b> Güvenli ödeme</span>
          <span><b>✓</b> Doğrulanmış satıcı</span>
          <span><b>✓</b> Alıcı koruması</span>
        </div>
      </div>

      <div className="premiumHeroVisual" aria-hidden="true">
        <img src="/kapiskapis-hero.jpg" alt="" />
        <div className="heroLiveCard">
          <span><i /> CANLI</span>
          <strong>47.850 TL</strong>
          <small>41 teklif · 18:42 kaldı</small>
        </div>
      </div>

      <Link className="heroHowLink" href="/nasil-calisir">
        Nasıl çalışır? <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
