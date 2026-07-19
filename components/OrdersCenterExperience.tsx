"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { confirmBuyerDelivery, loadBuyerOrders, type BuyerOrder } from "@/lib/reviews";

type OrderState = BuyerOrder["state"];
type IconName = "package" | "card" | "truck" | "check" | "clock" | "shield" | "pin" | "box" | "chevron" | "search" | "alert";
type DisplayOrder = {
  id: string;
  title: string;
  seller: string;
  sellerSlug: string;
  amount: number;
  state: OrderState;
  date: string;
  image: string;
  tracking: string;
  carrier: string;
  eta: string;
  paymentDueAt?: string;
  paymentExpiredAt?: string;
  paymentStatus: string;
  winnerRank: number;
  offerType: BuyerOrder["offerType"];
};

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
const statusLabel: Record<OrderState, string> = {
  payment: "Ödeme bekliyor",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  expired: "Ödeme süresi doldu",
};

const demoOrders: DisplayOrder[] = [
  { id: "KK-24891", title: "Rolex Submariner Date 126610LN", seller: "Mert Saat & Koleksiyon", sellerSlug: "mert-saat-koleksiyon", amount: 125000, state: "shipped", date: "18 Temmuz 2026", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80", tracking: "KP048392019TR", carrier: "Yurtiçi Kargo", eta: "21 Temmuz Pazartesi", paymentStatus: "paid", winnerRank: 1, offerType: "winner" },
  { id: "KK-24672", title: "PlayStation 5 Slim + 2 DualSense", seller: "GamePort", sellerSlug: "gameport", amount: 18250, state: "delivered", date: "16 Temmuz 2026", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80", tracking: "YK284120994", carrier: "Yurtiçi Kargo", eta: "18 Temmuz 2026", paymentStatus: "paid", winnerRank: 1, offerType: "winner" },
  { id: "KK-24118", title: "Sony Alpha A7 IV Gövde", seller: "Foto Market", sellerSlug: "foto-market", amount: 62300, state: "payment", date: "19 Temmuz 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80", tracking: "", carrier: "KapışKapış Kargo", eta: "Ödeme sonrası hesaplanır", paymentDueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), paymentStatus: "unpaid", winnerRank: 1, offerType: "winner" },
  { id: "KK-23991", title: "ASUS RTX 4070 Super OC", seller: "Pro Bilgisayar", sellerSlug: "pro-bilgisayar", amount: 32000, state: "preparing", date: "15 Temmuz 2026", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=700&q=80", tracking: "", carrier: "Aras Kargo", eta: "22 Temmuz Salı", paymentStatus: "paid", winnerRank: 2, offerType: "second_chance" },
];

function toDisplayOrder(order: BuyerOrder): DisplayOrder {
  return {
    id: order.orderNo,
    title: order.title,
    seller: order.seller,
    sellerSlug: order.sellerSlug,
    amount: order.amount,
    state: order.state,
    date: order.date,
    image: order.image,
    tracking: order.tracking,
    carrier: order.carrier,
    eta: order.eta,
    paymentDueAt: order.paymentDueAt,
    paymentExpiredAt: order.paymentExpiredAt,
    paymentStatus: order.paymentStatus,
    winnerRank: order.winnerRank,
    offerType: order.offerType,
  };
}

function timeLeftText(deadline: string | undefined, now: number) {
  if (!deadline) return null;
  const seconds = Math.max(0, Math.floor((new Date(deadline).getTime() - now) / 1000));
  const minutes = Math.floor(seconds / 60);
  return {
    seconds,
    text: `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
  };
}

export default function OrdersCenterExperience() {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | OrderState>("all");
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<DisplayOrder[]>(demoOrders);
  const [selectedId, setSelectedId] = useState(demoOrders[0].id);
  const [dataMode, setDataMode] = useState<"loading" | "database" | "demo" | "signed-out" | "error">("loading");
  const [localStates, setLocalStates] = useState<Record<string, OrderState>>({});
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const expirationRefresh = useRef<string | null>(null);

  const hydrateOrders = useCallback(async () => {
    const result = await loadBuyerOrders();
    if (result.status === "ready") {
      const databaseOrders = result.data.map(toDisplayOrder);
      setOrders(databaseOrders);
      setSelectedId((current) => databaseOrders.some((order) => order.id === current) ? current : (databaseOrders[0]?.id ?? ""));
      setDataMode("database");
      return;
    }
    if (result.status === "not-configured") {
      setDataMode("demo");
      return;
    }
    if (result.status === "signed-out") {
      setOrders([]);
      setSelectedId("");
      setDataMode("signed-out");
      return;
    }
    setOrders([]);
    setSelectedId("");
    setDataMode("error");
    if (result.status === "error") setNotice(result.message);
  }, []);

  useEffect(() => {
    let active = true;
    hydrateOrders().catch((reason) => {
      if (!active) return;
      setDataMode("error");
      setNotice(reason instanceof Error ? reason.message : "Siparişler yüklenemedi.");
    });
    return () => { active = false; };
  }, [hydrateOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentOrders = orders.map((order) => ({ ...order, state: localStates[order.id] ?? order.state }));
  const selected = currentOrders.find((order) => order.id === selectedId) ?? currentOrders[0];
  const selectedDeadline = selected ? timeLeftText(selected.paymentDueAt, now) : null;

  useEffect(() => {
    if (!selected || dataMode !== "database" || selected.state !== "payment" || selectedDeadline?.seconds !== 0 || expirationRefresh.current === selected.id) return;
    expirationRefresh.current = selected.id;
    setNotice("Ödeme süresi doldu. Sıradaki teklif sahibi kontrol ediliyor.");
    void hydrateOrders();
  }, [dataMode, hydrateOrders, selected, selectedDeadline?.seconds]);

  const filtered = useMemo(() => currentOrders.filter((order) =>
    (tab === "all" || order.state === tab)
    && (`${order.id} ${order.title} ${order.seller}`).toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))),
  [currentOrders, query, tab]);

  function progress(state: OrderState) {
    return { expired: 0, payment: 1, preparing: 2, shipped: 3, delivered: 4 }[state];
  }

  async function nextAction() {
    if (!selected) return;
    if (selected.state === "expired") {
      router.push("/arama");
      return;
    }
    if (selected.state === "payment") {
      if (selectedDeadline?.seconds === 0) {
        await hydrateOrders();
        return;
      }
      if (dataMode === "database") {
        router.push(`/odeme?order=${encodeURIComponent(selected.id)}`);
      } else {
        setLocalStates((old) => ({ ...old, [selected.id]: "preparing" }));
        setNotice("Demo ödeme başarıyla tamamlandı. Tutar güvenli ödeme havuzuna alındı.");
      }
    } else if (selected.state === "shipped") {
      try {
        if (dataMode === "database") await confirmBuyerDelivery(selected.id);
        setLocalStates((old) => ({ ...old, [selected.id]: "delivered" }));
        setNotice(dataMode === "database" ? "Teslimat Supabase üzerinde onaylandı. Değerlendirme hakkın açıldı." : "Demo teslimat onaylandı.");
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Teslimat onaylanamadı.");
      }
    } else if (selected.state === "delivered") {
      router.push(`/degerlendirme?order=${selected.id}`);
    } else {
      setNotice("Satıcı ürünü hazırlıyor. Kargoya verildiğinde bildirim alacaksın.");
    }
  }

  if (dataMode === "loading") {
    return <div className="ordersEmptyV6 ordersDatabaseStateV16"><Icon name="shield" /><h3>Siparişlerin Supabase&apos;den yükleniyor</h3><p>Oturum, ödeme süresi ve sipariş sahipliği kontrol ediliyor.</p></div>;
  }

  if (!currentOrders.length) {
    return <div className="ordersEmptyV6 ordersDatabaseStateV16"><Icon name={dataMode === "signed-out" ? "shield" : "package"}/><h3>{dataMode === "signed-out" ? "Siparişlerini görmek için giriş yap" : "Henüz gerçek siparişin bulunmuyor"}</h3><p>{dataMode === "signed-out" ? "Siparişler yalnızca giriş yapan gerçek alıcıya gösterilir." : "Bir açık artırmayı kazandığında süreli ödeme teklifin burada görünecek."}</p><button type="button" onClick={() => router.push(dataMode === "signed-out" ? "/giris" : "/arama")}>{dataMode === "signed-out" ? "Giriş yap" : "Açık artırmaları keşfet"}</button></div>;
  }

  if (!selected) return null;

  const activeProtectedOrders = currentOrders.filter((order) => !["delivered", "expired"].includes(order.state));

  return (
    <div className="ordersCenterV6">
      {notice && <button className="financeToastV6" type="button" onClick={() => setNotice("")}><Icon name="check" /><span>{notice}</span></button>}

      <section className="ordersSummaryV6">
        <article><span><Icon name="card" /></span><div><small>Ödeme bekleyen</small><strong>{currentOrders.filter((order) => order.state === "payment").length} sipariş</strong><em>{money(currentOrders.filter((order) => order.state === "payment").reduce((sum, order) => sum + order.amount, 0))}</em></div></article>
        <article><span><Icon name="box" /></span><div><small>Hazırlanan</small><strong>{currentOrders.filter((order) => order.state === "preparing").length} sipariş</strong><em>Satıcı hazırlıyor</em></div></article>
        <article><span><Icon name="truck" /></span><div><small>Kargodaki</small><strong>{currentOrders.filter((order) => order.state === "shipped").length} sipariş</strong><em>Takip aktif</em></div></article>
        <article><span><Icon name="shield" /></span><div><small>Koruma altında</small><strong>{money(activeProtectedOrders.reduce((sum, order) => sum + order.amount, 0))}</strong><em>{activeProtectedOrders.length} aktif işlem</em></div></article>
      </section>

      <section className="ordersToolbarV6">
        <nav>
          {([ ["all", "Tümü"], ["payment", "Ödeme"], ["preparing", "Hazırlanıyor"], ["shipped", "Kargoda"], ["delivered", "Tamamlanan"], ["expired", "Süresi dolan"] ] as Array<["all" | OrderState, string]>).map(([key, label]) => <button key={key} type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}<small>{key === "all" ? currentOrders.length : currentOrders.filter((order) => order.state === key).length}</small></button>)}
        </nav>
        <label><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sipariş veya ürün ara" /></label>
      </section>

      <section className="ordersWorkspaceV6">
        <div className="ordersListV6">
          {filtered.length ? filtered.map((order) => {
            const deadline = timeLeftText(order.paymentDueAt, now);
            return (
              <button type="button" key={order.id} className={`orderListCardV6 ${selected.id === order.id ? "active" : ""} ${order.state === "expired" ? "expired" : ""}`} onClick={() => setSelectedId(order.id)}>
                <img src={order.image} alt={order.title} />
                <div className="orderListMainV6"><span>{order.offerType === "second_chance" ? `${order.winnerRank}. SIRA İKİNCİ ŞANS` : `SİPARİŞ #${order.id}`}</span><h3>{order.title}</h3><p>{order.seller} · {order.date}</p><div><em className={`status-${order.state}`}>{statusLabel[order.state]}</em><small>{order.state === "payment" && deadline ? `${deadline.text} kaldı` : order.state === "shipped" ? `${order.carrier} · ${order.tracking}` : order.eta}</small></div></div>
                <div className="orderListPriceV6"><strong>{money(order.amount)}</strong><Icon name="chevron" /></div>
              </button>
            );
          }) : <div className="ordersEmptyV6"><Icon name="package" /><h3>Sipariş bulunamadı</h3><p>Filtreyi veya arama kelimeni değiştir.</p></div>}
        </div>

        <aside className={`orderDetailV6 ${selected.state === "expired" ? "expired" : ""}`}>
          <header><div><span>{selected.offerType === "second_chance" ? `${selected.winnerRank}. SIRA İKİNCİ ŞANS TEKLİFİ` : "SİPARİŞ DETAYI"}</span><h2>#{selected.id}</h2></div><em className={`status-${selected.state}`}>{statusLabel[selected.state]}</em></header>
          <div className="orderDetailProductV6"><img src={selected.image} alt={selected.title} /><div><h3>{selected.title}</h3><p>Satıcı: <strong>{selected.seller}</strong></p><b>{money(selected.amount)}</b></div></div>

          {selected.state === "expired" ? (
            <section className="orderExpiredBannerV19"><span><Icon name="alert" /></span><div><strong>Kazanan ödeme süresi tamamlandı</strong><p>Bu sipariş kapatıldı. Sistem ürünü sıradaki uygun teklif sahibine sunar ve hesabın teklif güvenilirliği güncellenir.</p></div></section>
          ) : (
            <section className="safePaymentBannerV6"><span><Icon name="shield" /></span><div><strong>Ödemen KapışKapış korumasında</strong><p>Para, teslimat onaylanana kadar satıcıya aktarılmaz.</p></div></section>
          )}

          {selected.state === "payment" && selectedDeadline && (
            <section className="orderPaymentDeadlineV19"><span><Icon name="clock" /></span><div><small>ÖDEME İÇİN KALAN SÜRE</small><strong>{selectedDeadline.text}</strong><p>Ödemeyi başlattığında iyzico işlemini tamamlaman için kısa bir ek süre tanınır.</p></div></section>
          )}

          {selected.state !== "expired" && <div className="orderTimelineV6">
            {([
              ["payment", "Ödeme", selected.state === "payment" ? "Kazanan ödeme bekleniyor" : "3D Secure ile alındı"],
              ["preparing", "Satıcı hazırlıyor", "Ürün paketleniyor"],
              ["shipped", "Kargoya verildi", selected.tracking || "Takip kodu bekleniyor"],
              ["delivered", "Teslim edildi", "Alıcı teslimat onayı"],
            ] as Array<[Exclude<OrderState, "expired">, string, string]>).map(([step, label, detail], index) => {
              const complete = progress(selected.state) >= index + 1;
              return <article className={complete ? "complete" : ""} key={step}><span>{complete ? <Icon name="check" /> : index + 1}</span><div><strong>{label}</strong><small>{detail}</small></div></article>;
            })}
          </div>}

          {selected.state === "payment" ? (
            <section className="orderIyzicoBoxV16">
              <header><span><Icon name="shield" /></span><div><strong>iyzico Checkout Form</strong><small>3D Secure · Kart verisi KapışKapış&apos;a gelmez</small></div></header>
              <p>{selected.offerType === "second_chance" ? "Önceki kazanan ödemeyi tamamlamadığı için ürün sana teklif edildi. Süre içinde ödeme yaparsan satış kesinleşir." : "Açık artırmayı kazandın. Süre içinde ödeme yaparak satışı kesinleştir."}</p>
              <div className="orderPaymentBoxV6"><div><span>Ürün bedeli</span><strong>{money(selected.amount)}</strong></div><div><span>Alıcı koruma hizmeti</span><strong>{money(selected.amount * 0.025)}</strong></div><div className="total"><span>Toplam ödeme</span><strong>{money(selected.amount * 1.025)}</strong></div></div>
            </section>
          ) : selected.state !== "expired" ? (
            <section className="orderDeliveryBoxV6">
              <div><span><Icon name="pin" /></span><p><small>TESLİMAT ADRESİ</small><strong>Hesabındaki teslimat adresi</strong><em>Ödeme sırasında doğrulanan adres kullanılır.</em></p></div>
              <div><span><Icon name="truck" /></span><p><small>KARGO BİLGİSİ</small><strong>{selected.carrier}</strong><em>{selected.tracking || selected.eta}</em></p></div>
            </section>
          ) : null}

          <button className="orderPrimaryActionV6" type="button" onClick={nextAction}>
            {selected.state === "payment" ? "Güvenli ödemeyi tamamla" : selected.state === "shipped" ? "Ürünü teslim aldım" : selected.state === "delivered" ? "Satıcıyı değerlendir" : selected.state === "expired" ? "Yeni açık artırmaları keşfet" : "Sipariş durumunu kontrol et"}
          </button>
          {(selected.state === "shipped" || selected.state === "delivered") && <button className="orderTrackingButtonV13" type="button" onClick={() => router.push(`/kargo?order=${selected.id}`)}><Icon name="truck" /> {selected.state === "shipped" ? "Kargoyu canlı takip et" : "Teslimat ve iade işlemleri"}</button>}
          {selected.state !== "expired" && <button className="orderProblemButtonV6" type="button" onClick={() => router.push(`/uyusmazlik?order=${selected.id}`)}><Icon name="alert" /> Siparişle ilgili sorun bildir</button>}
          <small className="financeDemoNoteV6">{dataMode === "database" ? "Kazanan ödeme süresi, iyzico doğrulaması ve sıradaki teklif sahibine geçiş Supabase üzerinde çalışır." : "Supabase yapılandırılmadığı için demo siparişler gösteriliyor."}</small>
        </aside>
      </section>
    </div>
  );
}
