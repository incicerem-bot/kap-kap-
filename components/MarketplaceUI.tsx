"use client";

import Link from "next/link";
import { useState } from "react";
import { demoProducts, timeToSeconds, type Product } from "@/components/productData";

export function ProductGrid({
  filter,
  variant = "all",
}: {
  filter?: string;
  variant?: "all" | "live" | "ending";
}) {
  const normalized = filter?.trim().toLocaleLowerCase("tr");
  let products = [...demoProducts];

  if (variant === "live") products = products.filter((product) => product.live);
  if (variant === "ending") products = products.sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time)).slice(0, 4);

  if (normalized) {
    products = products.filter((product) =>
      `${product.category} ${product.title} ${product.condition}`.toLocaleLowerCase("tr").includes(normalized)
    );
  }

  if (!products.length) {
    return <EmptyState title="Eşleşen açık artırma bulunamadı" text="Arama ifadesini veya seçtiğin filtreyi değiştirerek tekrar dene." />;
  }

  return <div className="productGridPremium">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

export function ProductCard({ product }: { product: Product }) {
  const [favorite, setFavorite] = useState(false);
  const urgent = timeToSeconds(product.time) < 3600;

  return (
    <article className="productCardPremium">
      <div className="productImagePremium">
        <Link href={`/urun/${product.id}`} aria-label={`${product.title} detayını aç`}>
          <img src={product.image} alt={product.title} loading="lazy" />
        </Link>
        {product.live && <span className="livePill"><i /> CANLI</span>}
        <button
          className={favorite ? "favoriteProductButton active" : "favoriteProductButton"}
          type="button"
          aria-label={favorite ? "Favorilerden çıkar" : "Favoriye ekle"}
          aria-pressed={favorite}
          onClick={() => setFavorite((value) => !value)}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="productCardBody">
        <div className="productCardTopline">
          <span className="productCategoryPremium">{product.category}</span>
          <span className="productCondition">{product.condition}</span>
        </div>
        <Link href={`/urun/${product.id}`}><h3>{product.title}</h3></Link>
        <div className="sellerTrustLine">
          <span className={product.verified ? "verifiedSellerDot" : "sellerDot"} />
          {product.verified ? "Doğrulanmış satıcı" : "Bireysel satıcı"}
        </div>
        <div className="bidLine"><span>Güncel teklif</span><strong>{product.price}</strong></div>
        <div className="cardMeta">
          <span className={urgent ? "urgentTime" : ""}>◷ {product.time}</span>
          <span>{product.bids} teklif</span>
        </div>
        <Link className="bidButtonPremium" href={`/urun/${product.id}`}>Açık artırmaya git</Link>
      </div>
    </article>
  );
}

export function StatsRow() {
  return (
    <section className="statsRowPremium" aria-label="KapışKapış platform güvenceleri">
      <div><span className="trustIcon">₺</span><strong>Güvenli ödeme</strong><small>Para, teslimat tamamlanana kadar koruma altında.</small></div>
      <div><span className="trustIcon">✓</span><strong>Kimlik doğrulama</strong><small>Satıcı ve alıcı hesapları doğrulama sürecinden geçer.</small></div>
      <div><span className="trustIcon">⌁</span><strong>Şeffaf teklif</strong><small>Teklif geçmişi ve kalan süre herkes için görünür.</small></div>
      <div><span className="trustIcon">◈</span><strong>Alıcı koruması</strong><small>Sorunlu işlemlerde uyuşmazlık merkezi devreye girer.</small></div>
    </section>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="premiumEmpty"><span>◇</span><h3>{title}</h3><p>{text}</p><Link href="/">Açık artırmaları keşfet</Link></div>;
}
