"use client";

import { ReactNode, useMemo, useState } from "react";

type OrderState = "payment" | "preparing" | "shipped" | "delivered";
type IconName = "package" | "card" | "truck" | "check" | "clock" | "shield" | "pin" | "box" | "chevron" | "search" | "alert";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    package: <><path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
    truck: <><path d="M3 5h11v12H3zM14 9h4l3 3v5h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    shield: <><path d="M12 3 4.5 6v5.2c0 4.6 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.2 7.5-9.8V6z"/><path d="m9 12 2 2 4-4"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    box: <><path d="M4 6h16v14H4z"/><path d="M8 6V4h8v2M4 11h16"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    alert: <><path d="M12 3 2.5 20h19z"/><path d="M12 9v4M12 17h.01"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);

const statusLabel: Record<OrderState, string> = { payment: "Ödeme bekliyor", preparing: "Hazırlanıyor", shipped: "Kargoda", delivered: "Teslim edildi" };

const orders = [
  { id: "KK-24891", title: "Rolex Submariner Date 126610LN", seller: "Prestige Saat", amount: 125000, state: "shipped" as OrderState, date: "18 Temmuz 2026", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80", tracking: "KP048392019TR", carrier: "Yurtiçi Kargo", eta: "21 Temmuz Pazartesi" },
  { id: "KK-24672", title: "PlayStation 5 Slim + 2 DualSense", seller: "GamePoint", amount: 18250, state: "delivered" as OrderState, date: "16 Temmuz 2026", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80", tracking: "YK284120994", carrier: "Yurtiçi Kargo", eta: "18 Temmuz 2026" },
  { id: "KK-24118", title: "Sony Alpha A7 IV Gövde", seller: "FotoMarket", amount: 62300, state: "payment" as OrderState, date: "19 Temmuz 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80", tracking: "", carrier: "KapışKapış Kargo", eta: "Ödeme sonrası hesaplanır" },
  { id: "KK-23991", title: "ASUS RTX 4070 Super OC", seller: "PC Dünyası", amount: 32000, state: "preparing" as OrderState, date: "15 Temmuz 2026", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=700&q=80", tracking: "", carrier: "Aras Kargo", eta: "22 Temmuz Salı" },
];

export default function OrdersCenterExperience() {
  const [tab, setTab] = useState<"all" | OrderState>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(orders[0].id);
  const [localStates, setLocalStates] = useState<Record<string, OrderState>>({});
  const [notice, setNotice] = useState("");

  const currentOrders = orders.map((order) => ({ ...order, state: localStates[order.id] ?? order.state }));
  const selected = currentOrders.find((order) => order.id === selectedId) ?? currentOrders[0];
  const filtered = useMemo(() => currentOrders.filter((order) => (tab === "all" || order.state === tab) && (`${order.id} ${order.title} ${order.seller}`).toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))), [currentOrders, query, tab]);

  function progress(state: OrderState) {
    return { payment: 1, preparing: 2, shipped: 3, delivered: 4 }[state];
  }

  function nextAction() {
    if (selected.state === "payment") {
      setLocalStates((old) => ({ ...old, [selected.id]: "preparing" }));
      setNotice("Demo ödeme başarıyla tamamlandı. Tutar güvenli ödeme havuzuna alındı.");
    } else if (selected.state === "shipped") {
      setLocalStates((old) => ({ ...old, [selected.id]: "delivered" }));
      setNotice("Teslimat onaylandı. Ödeme satıcının çekilebilir bakiyesine aktarılacak.");
    } else if (selected.state === "delivered") {
      setNotice("Değerlendirme ekranı sonraki geliştirme turunda bağlanacak.");
    } else {
      setNotice("Satıcı ürünü hazırlıyor. Kargoya verildiğinde bildirim alacaksın.");
    }
  }

  return (
    <div className="ordersCenterV6">
      {notice && <button className="financeToastV6" type="button" onClick={() => setNotice("")}><Icon name="check" /><span>{notice}</span></button>}

      <section className="ordersSummaryV6">
        <article><span><Icon name="card" /></span><div><small>Ödeme bekleyen</small><strong>1 sipariş</strong><em>{money(62300)}</em></div></article>
        <article><span><Icon name="box" /></span><div><small>Hazırlanan</small><strong>1 sipariş</strong><em>Satıcı hazırlıyor</em></div></article>
        <article><span><Icon name="truck" /></span><div><small>Kargodaki</small><strong>1 sipariş</strong><em>Takip aktif</em></div></article>
        <article><span><Icon name="shield" /></span><div><small>Koruma altında</small><strong>{money(205300)}</strong><em>3 aktif işlem</em></div></article>
      </section>

      <section className="ordersToolbarV6">
        <nav>
          {([ ["all", "Tümü"], ["payment", "Ödeme"], ["preparing", "Hazırlanıyor"], ["shipped", "Kargoda"], ["delivered", "Tamamlanan"] ] as Array<["all" | OrderState, string]>).map(([key, label]) => <button key={key} type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}<small>{key === "all" ? currentOrders.length : currentOrders.filter((order) => order.state === key).length}</small></button>)}
        </nav>
        <label><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sipariş veya ürün ara" /></label>
      </section>

      <section className="ordersWorkspaceV6">
        <div className="ordersListV6">
          {filtered.length ? filtered.map((order) => (
            <button type="button" key={order.id} className={`orderListCardV6 ${selected.id === order.id ? "active" : ""}`} onClick={() => setSelectedId(order.id)}>
              <img src={order.image} alt={order.title} />
              <div className="orderListMainV6"><span>SİPARİŞ #{order.id}</span><h3>{order.title}</h3><p>{order.seller} · {order.date}</p><div><em className={`status-${order.state}`}>{statusLabel[order.state]}</em><small>{order.state === "shipped" ? `${order.carrier} · ${order.tracking}` : order.eta}</small></div></div>
              <div className="orderListPriceV6"><strong>{money(order.amount)}</strong><Icon name="chevron" /></div>
            </button>
          )) : <div className="ordersEmptyV6"><Icon name="package" /><h3>Sipariş bulunamadı</h3><p>Filtreyi veya arama kelimeni değiştir.</p></div>}
        </div>

        <aside className="orderDetailV6">
          <header><div><span>SİPARİŞ DETAYI</span><h2>#{selected.id}</h2></div><em className={`status-${selected.state}`}>{statusLabel[selected.state]}</em></header>
          <div className="orderDetailProductV6"><img src={selected.image} alt={selected.title} /><div><h3>{selected.title}</h3><p>Satıcı: <strong>{selected.seller}</strong></p><b>{money(selected.amount)}</b></div></div>

          <section className="safePaymentBannerV6"><span><Icon name="shield" /></span><div><strong>Ödemen KapışKapış korumasında</strong><p>Para, teslimat onaylanana kadar satıcıya aktarılmaz.</p></div></section>

          <div className="orderTimelineV6">
            {([
              ["payment", "Ödeme alındı", "3D Secure ile güvenli ödeme"],
              ["preparing", "Satıcı hazırlıyor", "Ürün paketleniyor"],
              ["shipped", "Kargoya verildi", selected.tracking || "Takip kodu bekleniyor"],
              ["delivered", "Teslim edildi", "Alıcı teslimat onayı"],
            ] as Array<[OrderState, string, string]>).map(([step, label, detail], index) => {
              const complete = progress(selected.state) >= index + 1;
              return <article className={complete ? "complete" : ""} key={step}><span>{complete ? <Icon name="check" /> : index + 1}</span><div><strong>{label}</strong><small>{detail}</small></div></article>;
            })}
          </div>

          {selected.state === "payment" ? (
            <section className="orderPaymentBoxV6">
              <header><span><Icon name="card" /></span><div><strong>Kayıtlı kart</strong><small>•••• 4821 · 3D Secure</small></div><button type="button">Değiştir</button></header>
              <div><span>Ürün bedeli</span><strong>{money(selected.amount)}</strong></div><div><span>Alıcı koruma hizmeti</span><strong>{money(selected.amount * 0.025)}</strong></div><div className="total"><span>Toplam ödeme</span><strong>{money(selected.amount * 1.025)}</strong></div>
            </section>
          ) : (
            <section className="orderDeliveryBoxV6">
              <div><span><Icon name="pin" /></span><p><small>TESLİMAT ADRESİ</small><strong>Kemal Akar</strong><em>Bostanlı Mah. 1817/2 Sok. No: 14, Karşıyaka / İzmir</em></p></div>
              <div><span><Icon name="truck" /></span><p><small>KARGO BİLGİSİ</small><strong>{selected.carrier}</strong><em>{selected.tracking || selected.eta}</em></p></div>
            </section>
          )}

          <button className="orderPrimaryActionV6" type="button" onClick={nextAction}>
            {selected.state === "payment" ? "Güvenli ödemeyi tamamla" : selected.state === "shipped" ? "Ürünü teslim aldım" : selected.state === "delivered" ? "Satıcıyı değerlendir" : "Sipariş durumunu kontrol et"}
          </button>
          <button className="orderProblemButtonV6" type="button"><Icon name="alert" /> Siparişle ilgili sorun bildir</button>
          <small className="financeDemoNoteV6">Ödeme ve durum değişiklikleri bu aşamada demo olarak çalışır.</small>
        </aside>
      </section>
    </div>
  );
}
