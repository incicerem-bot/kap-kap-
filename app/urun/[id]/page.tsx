import MarketplaceShell from "@/components/MarketplaceShell";
import { demoProducts, parsePrice } from "@/components/productData";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = demoProducts.find((item) => item.id === id) ?? demoProducts[0];
  const currentPrice = parsePrice(product.price);
  const recentBidders = ["k***7", "a***2", "m***9", "s***4"];

  return (
    <MarketplaceShell
      eyebrow={product.category}
      title={product.title}
      description={`${product.verified ? "Doğrulanmış satıcı" : "Bireysel satıcı"} · Alıcı koruması kapsamında`}
    >
      <div className="productDetailPremium">
        <section className="productGalleryPremium">
          <img src={product.image} alt={product.title} />
          <div>
            {[1, 2, 3].map((item) => <img key={item} src={product.image} alt={`${product.title} ürün detayı ${item}`} />)}
          </div>
        </section>

        <aside className="bidPanelPremium">
          {product.live && <span className="livePill"><i /> CANLI AÇIK ARTIRMA</span>}
          <div className="currentBidPremium">
            <span>Güncel teklif</span>
            <strong>{product.price}</strong>
            <small>{product.bids} teklif · 18 izleyici</small>
          </div>
          <div className="countdownPremium">
            <div><strong>{product.time.split(":")[0]}</strong><span>Saat</span></div>
            <div><strong>{product.time.split(":")[1]}</strong><span>Dakika</span></div>
            <div><strong>{product.time.split(":")[2]}</strong><span>Saniye</span></div>
          </div>
          <label>
            Teklif tutarın
            <div><input defaultValue={product.next} /><button type="button">Teklif Ver</button></div>
          </label>
          <div className="quickBidPremium">
            <button type="button">+250 TL</button>
            <button type="button">+500 TL</button>
            <button type="button">+1.000 TL</button>
          </div>
          <div className="autoBidPremium">
            <div><b>Otomatik teklif</b><small>Maksimum bütçene kadar senin adına teklif verir.</small></div>
            <button type="button">Etkinleştir</button>
          </div>
          <div className="sellerMiniPremium">
            <span>MT</span>
            <div><b>Mert Teknoloji {product.verified ? "✓" : ""}</b><small>4.9 ★ · 326 başarılı satış</small></div>
            <button type="button">Mağaza</button>
          </div>
        </aside>
      </div>

      <div className="twoColPremium">
        <section className="panelPremium">
          <div className="panelHead"><h3>Ürün açıklaması</h3></div>
          <p className="detailTextPremium">Ürün çok temiz durumdadır. Tüm fonksiyonları sorunsuz çalışmaktadır. Orijinal kutusu, faturası ve aksesuarlarıyla gönderilecektir. Fotoğraflar ürüne aittir.</p>
          <div className="specGridPremium">
            <div><span>Durum</span><b>{product.condition}</b></div>
            <div><span>Garanti</span><b>12 ay</b></div>
            <div><span>Kargo</span><b>Ücretsiz</b></div>
            <div><span>Konum</span><b>İzmir</b></div>
          </div>
        </section>
        <section className="panelPremium">
          <div className="panelHead"><h3>Teklif geçmişi</h3></div>
          {recentBidders.map((user, index) => (
            <div className="bidHistoryPremium" key={user}>
              <span>{user}</span>
              <strong>{Math.max(currentPrice - index * 250, 0).toLocaleString("tr-TR")} TL</strong>
              <small>{index + 2} dk önce</small>
            </div>
          ))}
        </section>
      </div>
    </MarketplaceShell>
  );
}
