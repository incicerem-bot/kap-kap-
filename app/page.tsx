"use client";

import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import MarketplaceShell from "@/components/MarketplaceShell";
import { ProductGrid, StatsRow } from "@/components/MarketplaceUI";

export default function HomePage() {
  const router = useRouter();

  return (
    <MarketplaceShell
      title="KapışKapış"
      eyebrow="TÜRKİYE'NİN YENİ NESİL AÇIK ARTIRMA PLATFORMU"
      description="Doğrulanmış satıcılardan güvenle teklif ver, açık artırmayı kazan."
      compact
    >
      <Hero onOpenSell={() => router.push("/ilan-olustur")} />

      <StatsRow />

      <section id="live-auctions">
        <div className="sectionTitlePremium">
          <div>
            <span>ŞİMDİ YAYINDA</span>
            <h2>Canlı açık artırmalar</h2>
          </div>
          <button type="button" onClick={() => router.push("/canli")}>
            Tümünü Gör
          </button>
        </div>
        <ProductGrid />
      </section>

      <section>
        <div className="sectionTitlePremium">
          <div>
            <span>SON ŞANS</span>
            <h2>Bitmesine az kalanlar</h2>
          </div>
          <button type="button" onClick={() => router.push("/son-dakika")}>
            Tümünü Gör
          </button>
        </div>
        <ProductGrid />
      </section>
    </MarketplaceShell>
  );
}
