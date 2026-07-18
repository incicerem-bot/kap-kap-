import Link from "next/link";

export const demoProducts = [
  { id: "rolex-submariner", title: "Rolex Submariner Date", category: "Saat", price: "125.000 TL", next: "126.000 TL", bids: 28, time: "03:35:10", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85", live: true },
  { id: "iphone-15-pro", title: "iPhone 15 Pro 256 GB", category: "Telefon", price: "47.850 TL", next: "48.100 TL", bids: 41, time: "00:18:42", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85", live: true },
  { id: "ps5-slim", title: "PlayStation 5 Slim", category: "Oyun & Konsol", price: "18.250 TL", next: "18.500 TL", bids: 19, time: "01:42:16", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85", live: false },
  { id: "macbook-pro", title: "MacBook Pro M3 Pro", category: "Bilgisayar", price: "79.900 TL", next: "80.500 TL", bids: 33, time: "05:21:08", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85", live: true },
  { id: "sony-alpha", title: "Sony Alpha A7 IV", category: "Elektronik", price: "62.300 TL", next: "62.750 TL", bids: 22, time: "08:11:54", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", live: false },
  { id: "lego-technic", title: "LEGO Technic Koleksiyon", category: "Koleksiyon", price: "9.750 TL", next: "9.900 TL", bids: 14, time: "12:08:30", image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=900&q=85", live: false },
];

export function ProductGrid({ filter }: { filter?: string }) {
  const normalized = filter?.toLocaleLowerCase("tr");
  const products = normalized
    ? demoProducts.filter((p) => p.category.toLocaleLowerCase("tr").includes(normalized) || p.title.toLocaleLowerCase("tr").includes(normalized))
    : demoProducts;
  const shown = products.length ? products : demoProducts.slice(0, 4);
  return <div className="productGridPremium">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}

export function ProductCard({ product }: { product: (typeof demoProducts)[number] }) {
  return (
    <article className="productCardPremium">
      <Link href={`/urun/${product.id}`} className="productImagePremium">
        <img src={product.image} alt={product.title} />
        {product.live && <span className="livePill"><i /> CANLI</span>}
        <button type="button" aria-label="Favoriye ekle">♡</button>
      </Link>
      <div className="productCardBody">
        <span className="productCategoryPremium">{product.category}</span>
        <Link href={`/urun/${product.id}`}><h3>{product.title}</h3></Link>
        <div className="bidLine"><span>Güncel teklif</span><strong>{product.price}</strong></div>
        <div className="cardMeta"><span>◷ {product.time}</span><span>{product.bids} teklif</span></div>
        <Link className="bidButtonPremium" href={`/urun/${product.id}`}>Teklif Ver</Link>
      </div>
    </article>
  );
}

export function StatsRow() {
  return <div className="statsRowPremium">
    <div><strong>28.4K</strong><span>Aktif kullanıcı</span></div>
    <div><strong>6.820</strong><span>Aktif açık artırma</span></div>
    <div><strong>₺18.6M</strong><span>Güvenli işlem hacmi</span></div>
    <div><strong>%98.7</strong><span>Memnuniyet oranı</span></div>
  </div>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="premiumEmpty"><span>◇</span><h3>{title}</h3><p>{text}</p><Link href="/">Açık artırmaları keşfet</Link></div>;
}
