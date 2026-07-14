"use client";

type HeroProps = {
  onOpenSell: () => void;
};

export default function Hero({ onOpenSell }: HeroProps) {
  return (
    <section className="brandHero">
      <img src="/kapiskapis-hero.jpg" alt="KapışKapış açık artırma fırsatları" />
      <div className="brandHeroActions">
        <button className="goldButton" type="button" onClick={onOpenSell}>
          Hemen Katıl
        </button>
        <button
          className="outlineButton"
          type="button"
          onClick={() =>
            document.getElementById("live-auctions")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Canlı Teklifleri İzle
        </button>
      </div>
    </section>
  );
}
