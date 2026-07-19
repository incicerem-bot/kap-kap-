"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useMemo, useState } from "react";

type LogisticsTab = "all" | "incoming" | "outgoing" | "returns";
type LogisticsStatus =
  | "label_required"
  | "ready"
  | "transit"
  | "delivery"
  | "delivered"
  | "return_requested"
  | "return_transit"
  | "refunded";
type LogisticsRole = "buyer" | "seller";
type IconName =
  | "truck"
  | "box"
  | "return"
  | "check"
  | "clock"
  | "pin"
  | "copy"
  | "download"
  | "shield"
  | "search"
  | "chevron"
  | "barcode"
  | "scale"
  | "home"
  | "store"
  | "alert"
  | "camera"
  | "close"
  | "card"
  | "message"
  | "route";

function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<IconName, ReactNode> = {
    truck: <><path d="M3 5h11v12H3zM14 9h4l3 3v5h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    box: <><path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>,
    return: <><path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 6 6v1"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>,
    shield: <><path d="M12 3 4.5 6v5.2c0 4.6 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.2 7.5-9.8V6z"/><path d="m9 12 2 2 4-4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    barcode: <><path d="M4 5v14M7 5v14M11 5v14M14 5v14M18 5v14M20 5v14"/></>,
    scale: <><path d="M6 3h12l2 18H4z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    store: <><path d="M4 9v11h16V9"/><path d="M3 9 5 3h14l2 6"/><path d="M3 9a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2"/></>,
    alert: <><path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    camera: <><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11h18V7a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="4"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>,
    route: <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

type TrackingEvent = {
  title: string;
  detail: string;
  time: string;
  done: boolean;
  current?: boolean;
};

type LogisticsItem = {
  id: string;
  orderId: string;
  role: LogisticsRole;
  product: string;
  counterparty: string;
  amount: number;
  image: string;
  status: LogisticsStatus;
  carrier: string;
  tracking: string;
  eta: string;
  origin: string;
  destination: string;
  packageInfo: string;
  protectedAmount: number;
  returnDeadline?: string;
  events: TrackingEvent[];
};

const statusText: Record<LogisticsStatus, string> = {
  label_required: "Kargo kodu bekliyor",
  ready: "Gönderime hazır",
  transit: "Transfer merkezinde",
  delivery: "Dağıtıma çıktı",
  delivered: "Teslim edildi",
  return_requested: "İade talebi açıldı",
  return_transit: "İade kargoda",
  refunded: "İade tamamlandı",
};

const initialItems: LogisticsItem[] = [
  {
    id: "LG-24891",
    orderId: "KK-24891",
    role: "buyer",
    product: "Rolex Submariner Date 126610LN",
    counterparty: "Prestige Saat",
    amount: 125000,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80",
    status: "delivery",
    carrier: "Yurtiçi Kargo",
    tracking: "KP048392019TR",
    eta: "Bugün 14:00–18:00",
    origin: "Kadıköy / İstanbul",
    destination: "Karşıyaka / İzmir",
    packageInfo: "Değerli ürün · Sigortalı özel paket",
    protectedAmount: 125000,
    returnDeadline: "Teslimden sonra 2 gün",
    events: [
      { title: "Gönderi oluşturuldu", detail: "Satıcı ürünü güvenli şekilde paketledi.", time: "18 Tem · 11:42", done: true },
      { title: "Kargoya teslim edildi", detail: "Kadıköy transfer merkezine kabul edildi.", time: "18 Tem · 17:18", done: true },
      { title: "İzmir transfer merkezinde", detail: "Gönderi varış şubesine yönlendirildi.", time: "19 Tem · 06:35", done: true },
      { title: "Dağıtıma çıktı", detail: "Kurye teslimat adresine doğru yola çıktı.", time: "19 Tem · 09:12", done: true, current: true },
      { title: "Teslimat onayı", detail: "Teslim aldıktan sonra ürünü kontrol et.", time: "Bekleniyor", done: false },
    ],
  },
  {
    id: "LG-07184",
    orderId: "KK-2026-07184",
    role: "seller",
    product: "iPhone 15 Pro 256 GB",
    counterparty: "Mert K.",
    amount: 48100,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&q=80",
    status: "label_required",
    carrier: "KapışKapış Kargo",
    tracking: "",
    eta: "Bugün 18:00'e kadar kargola",
    origin: "Karşıyaka / İzmir",
    destination: "Çankaya / Ankara",
    packageInfo: "Paket ölçüsü ve ağırlık bekleniyor",
    protectedAmount: 48100,
    events: [
      { title: "Ödeme güvenceye alındı", detail: "Alıcının ödemesi KapışKapış korumasında.", time: "19 Tem · 10:14", done: true, current: true },
      { title: "Kargo kodu oluştur", detail: "Ürünü bugün 18:00'e kadar gönderime hazırla.", time: "Bekleniyor", done: false },
      { title: "Kargoya teslim", detail: "Takip hareketleri otomatik başlayacak.", time: "Bekleniyor", done: false },
      { title: "Teslimat ve ödeme", detail: "Alıcı onayından sonra ödeme aktarılır.", time: "Bekleniyor", done: false },
    ],
  },
  {
    id: "LG-07155",
    orderId: "KK-2026-07155",
    role: "seller",
    product: "PlayStation 5 Slim",
    counterparty: "Burak A.",
    amount: 18500,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80",
    status: "transit",
    carrier: "Aras Kargo",
    tracking: "AR932810573",
    eta: "21 Temmuz Pazartesi",
    origin: "Bornova / İzmir",
    destination: "Nilüfer / Bursa",
    packageInfo: "5,8 kg · 48 × 42 × 18 cm",
    protectedAmount: 18500,
    events: [
      { title: "Kargo kodu oluşturuldu", detail: "AR932810573 takip numarası tanımlandı.", time: "18 Tem · 09:30", done: true },
      { title: "Kargoya teslim edildi", detail: "Bornova şubesi gönderiyi kabul etti.", time: "18 Tem · 15:46", done: true },
      { title: "Transfer merkezinde", detail: "Bursa aktarma merkezine hareket etti.", time: "19 Tem · 03:22", done: true, current: true },
      { title: "Teslimat", detail: "Alıcı teslimat onayı bekleniyor.", time: "Tahmini 21 Tem", done: false },
    ],
  },
  {
    id: "LG-24672",
    orderId: "KK-24672",
    role: "buyer",
    product: "PlayStation 5 Slim + 2 DualSense",
    counterparty: "GamePoint",
    amount: 18250,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80",
    status: "delivered",
    carrier: "Yurtiçi Kargo",
    tracking: "YK284120994",
    eta: "18 Temmuz 2026 tarihinde teslim edildi",
    origin: "Şişli / İstanbul",
    destination: "Karşıyaka / İzmir",
    packageInfo: "6,2 kg · Kutu ve aksesuarlar",
    protectedAmount: 18250,
    returnDeadline: "20 Temmuz 23:59'a kadar",
    events: [
      { title: "Kargoya teslim edildi", detail: "Gönderi satıcıdan teslim alındı.", time: "16 Tem · 16:24", done: true },
      { title: "İzmir transfer merkezi", detail: "Gönderi varış şubesine ulaştı.", time: "18 Tem · 06:10", done: true },
      { title: "Teslim edildi", detail: "Kemal Akar tarafından teslim alındı.", time: "18 Tem · 13:08", done: true, current: true },
      { title: "Kontrol süresi", detail: "Sorun varsa iade veya uyuşmazlık talebi açabilirsin.", time: "20 Tem · 23:59", done: false },
    ],
  },
  {
    id: "LG-23912",
    orderId: "KK-23912",
    role: "buyer",
    product: "AirPods Max Gece Yarısı",
    counterparty: "AudioPlus",
    amount: 21400,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=700&q=80",
    status: "return_transit",
    carrier: "Sürat Kargo",
    tracking: "IADE63820192",
    eta: "22 Temmuz'da satıcıya ulaşması bekleniyor",
    origin: "Karşıyaka / İzmir",
    destination: "Beşiktaş / İstanbul",
    packageInfo: "İade paketi · Fotoğraflı kanıt eklendi",
    protectedAmount: 21400,
    events: [
      { title: "İade talebi onaylandı", detail: "Ürün açıklamayla uyuşmadığı için talep kabul edildi.", time: "18 Tem · 18:42", done: true },
      { title: "İade kodu oluşturuldu", detail: "Ücretsiz gönderim kodu tanımlandı.", time: "18 Tem · 18:45", done: true },
      { title: "İade kargoya verildi", detail: "Gönderi satıcıya doğru yolda.", time: "19 Tem · 10:06", done: true, current: true },
      { title: "Satıcı kontrolü", detail: "Teslimden sonra 24 saat içinde kontrol edilecek.", time: "Bekleniyor", done: false },
      { title: "Ücret iadesi", detail: "Onay sonrası kartına aktarılacak.", time: "Bekleniyor", done: false },
    ],
  },
];

const currency = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);

export default function LogisticsCenterExperience({ initialOrder, initialMode }: { initialOrder?: string; initialMode?: string }) {
  const requested = initialItems.find((item) => item.orderId === initialOrder);
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(requested?.id ?? initialItems[0].id);
  const [tab, setTab] = useState<LogisticsTab>(initialMode === "shipping" ? "outgoing" : requested?.role === "seller" ? "outgoing" : "all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [labelOpen, setLabelOpen] = useState(initialMode === "shipping" && requested?.status === "label_required");
  const [returnOpen, setReturnOpen] = useState(false);
  const [carrier, setCarrier] = useState("KapışKapış Kargo");
  const [parcelSize, setParcelSize] = useState("Orta");
  const [weight, setWeight] = useState("2.5");
  const [pickup, setPickup] = useState("sube");
  const [returnReason, setReturnReason] = useState("");
  const [returnDetail, setReturnDetail] = useState("");
  const [evidenceName, setEvidenceName] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const filtered = useMemo(() => {
    const normalized = query.toLocaleLowerCase("tr-TR");
    return items.filter((item) => {
      const inTab = tab === "all" || (tab === "incoming" && item.role === "buyer" && !item.status.startsWith("return")) || (tab === "outgoing" && item.role === "seller") || (tab === "returns" && (item.status.startsWith("return") || item.status === "refunded"));
      return inTab && `${item.orderId} ${item.product} ${item.counterparty} ${item.tracking}`.toLocaleLowerCase("tr-TR").includes(normalized);
    });
  }, [items, query, tab]);

  const counts = {
    incoming: items.filter((item) => item.role === "buyer" && !item.status.startsWith("return")).length,
    outgoing: items.filter((item) => item.role === "seller").length,
    returns: items.filter((item) => item.status.startsWith("return") || item.status === "refunded").length,
  };

  function updateSelected(patch: Partial<LogisticsItem>) {
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch } : item));
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3600);
  }

  async function copyTracking() {
    if (!selected.tracking) return;
    try {
      await navigator.clipboard.writeText(selected.tracking);
      showNotice("Takip numarası panoya kopyalandı.");
    } catch {
      showNotice(`Takip numarası: ${selected.tracking}`);
    }
  }

  function createLabel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tracking = `KK${Math.floor(100000000 + Math.random() * 900000000)}`;
    updateSelected({
      status: "ready",
      carrier,
      tracking,
      eta: pickup === "pickup" ? "Kurye bugün 17:00–20:00 arasında gelecek" : "Kodu şubede göstererek ücretsiz gönder",
      packageInfo: `${weight} kg · ${parcelSize} paket`,
      events: [
        ...selected.events.map((eventItem) => ({ ...eventItem, current: false })),
        { title: "Kargo kodu oluşturuldu", detail: `${carrier} · ${tracking}`, time: "Şimdi", done: true, current: true },
        { title: pickup === "pickup" ? "Kurye alımı" : "Şubeye teslim", detail: pickup === "pickup" ? "Kurye adresinden teslim alacak." : "Paketi seçtiğin kargo şubesine bırak.", time: "Bekleniyor", done: false },
      ],
    });
    setLabelOpen(false);
    showNotice(`Kargo kodu oluşturuldu: ${tracking}`);
  }

  function submitReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!returnReason || returnDetail.trim().length < 20) {
      showNotice("İade nedeni seç ve en az 20 karakter açıklama yaz.");
      return;
    }
    updateSelected({
      status: "return_requested",
      eta: "KapışKapış güven ekibi satıcı yanıtını bekliyor",
      events: [
        ...selected.events.map((eventItem) => ({ ...eventItem, current: false })),
        { title: "İade talebi açıldı", detail: returnReason, time: "Şimdi", done: true, current: true },
        { title: "Satıcı yanıtı", detail: "Satıcının 24 saat içinde yanıt vermesi bekleniyor.", time: "Bekleniyor", done: false },
        { title: "İade gönderimi", detail: "Onaylanırsa ücretsiz iade kodu oluşturulacak.", time: "Bekleniyor", done: false },
      ],
    });
    setReturnOpen(false);
    setTab("returns");
    showNotice("İade talebin oluşturuldu. Ödeme aktarımı durduruldu.");
  }

  function confirmDelivery() {
    updateSelected({
      status: "delivered",
      eta: "Teslimat onaylandı",
      events: selected.events.map((eventItem, index) => ({ ...eventItem, done: true, current: index === selected.events.length - 1 })),
    });
    showNotice("Teslimat onaylandı. Ürün kontrol süren başladı.");
  }

  return (
    <div className="logisticsCenterV13">
      {notice && <button className="logisticsToastV13" type="button" onClick={() => setNotice("")}><Icon name="check"/><span>{notice}</span></button>}

      <section className="logisticsSummaryV13">
        <article><span><Icon name="box"/></span><div><small>KOD BEKLEYEN</small><strong>{items.filter((item) => item.status === "label_required").length} gönderi</strong><em>Bugün işlem gerekli</em></div></article>
        <article><span><Icon name="truck"/></span><div><small>YOLDA</small><strong>{items.filter((item) => ["transit", "delivery"].includes(item.status)).length} gönderi</strong><em>Canlı takip açık</em></div></article>
        <article><span><Icon name="return"/></span><div><small>AKTİF İADE</small><strong>{counts.returns} talep</strong><em>Ödeme korumasında</em></div></article>
        <article><span><Icon name="shield"/></span><div><small>KORUNAN TUTAR</small><strong>{currency(items.reduce((sum, item) => sum + (["delivered", "refunded"].includes(item.status) ? 0 : item.protectedAmount), 0))}</strong><em>Güvenli ödeme havuzu</em></div></article>
      </section>

      <section className="logisticsToolbarV13">
        <nav>
          {([
            ["all", "Tümü", items.length],
            ["incoming", "Gelenler", counts.incoming],
            ["outgoing", "Göndereceklerim", counts.outgoing],
            ["returns", "İadeler", counts.returns],
          ] as Array<[LogisticsTab, string, number]>).map(([key, label, count]) => (
            <button type="button" key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}<small>{count}</small></button>
          ))}
        </nav>
        <label><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sipariş, ürün veya takip no ara"/></label>
      </section>

      <section className="logisticsWorkspaceV13">
        <div className="logisticsListV13">
          {filtered.length ? filtered.map((item) => (
            <button type="button" key={item.id} className={`logisticsListCardV13 ${selected.id === item.id ? "active" : ""}`} onClick={() => setSelectedId(item.id)}>
              <img src={item.image} alt={item.product}/>
              <div className="logisticsListMainV13">
                <span>{item.role === "buyer" ? "ALIŞVERİŞ" : "SATIŞ"} · {item.orderId}</span>
                <h3>{item.product}</h3>
                <p>{item.role === "buyer" ? "Satıcı" : "Alıcı"}: <b>{item.counterparty}</b></p>
                <div><em className={`logisticsStatusV13 status-${item.status}`}>{statusText[item.status]}</em><small>{item.tracking || item.eta}</small></div>
              </div>
              <div className="logisticsListAsideV13"><strong>{currency(item.amount)}</strong><Icon name="chevron"/></div>
            </button>
          )) : <div className="logisticsEmptyV13"><Icon name="box"/><h3>Gönderi bulunamadı</h3><p>Arama kelimesini veya görünüm filtresini değiştir.</p></div>}
        </div>

        <aside className="logisticsDetailV13">
          <header className="logisticsDetailHeadV13">
            <div><span>{selected.role === "buyer" ? "GELEN GÖNDERİ" : "GİDEN GÖNDERİ"}</span><h2>{selected.orderId}</h2></div>
            <em className={`logisticsStatusV13 status-${selected.status}`}>{statusText[selected.status]}</em>
          </header>

          <div className="logisticsProductV13">
            <img src={selected.image} alt={selected.product}/>
            <div><h3>{selected.product}</h3><p>{selected.role === "buyer" ? "Satıcı" : "Alıcı"}: <strong>{selected.counterparty}</strong></p><b>{currency(selected.amount)}</b></div>
          </div>

          <section className="logisticsProtectionV13"><span><Icon name="shield"/></span><div><strong>{currency(selected.protectedAmount)} KapışKapış korumasında</strong><p>Teslimat ve ürün kontrolü tamamlanana kadar ödeme güvenli havuzda tutulur.</p></div></section>

          <section className="logisticsRouteV13">
            <div><span><Icon name={selected.role === "seller" ? "store" : "home"}/></span><p><small>ÇIKIŞ</small><strong>{selected.origin}</strong></p></div>
            <i><span/><Icon name="route"/><span/></i>
            <div><span><Icon name={selected.role === "seller" ? "home" : "pin"}/></span><p><small>VARIŞ</small><strong>{selected.destination}</strong></p></div>
          </section>

          {selected.tracking ? (
            <section className="trackingCodeV13">
              <div><span><Icon name="barcode"/></span><p><small>{selected.carrier.toLocaleUpperCase("tr-TR")}</small><strong>{selected.tracking}</strong></p></div>
              <button type="button" onClick={copyTracking}><Icon name="copy"/> Kopyala</button>
            </section>
          ) : (
            <section className="trackingMissingV13"><Icon name="alert"/><div><strong>Kargo kodu henüz oluşturulmadı</strong><p>Gönderim süresini kaçırmamak için paket bilgilerini girerek kodunu oluştur.</p></div></section>
          )}

          <div className="logisticsMetaV13">
            <article><span><Icon name="clock"/></span><p><small>TAHMİNİ / SON SÜRE</small><strong>{selected.eta}</strong></p></article>
            <article><span><Icon name="scale"/></span><p><small>PAKET</small><strong>{selected.packageInfo}</strong></p></article>
          </div>

          <section className="logisticsTimelineV13">
            <header><span>GÖNDERİ HAREKETLERİ</span><small>Otomatik güncellenir</small></header>
            {selected.events.map((eventItem, index) => (
              <article key={`${eventItem.title}-${index}`} className={`${eventItem.done ? "done" : ""} ${eventItem.current ? "current" : ""}`}>
                <span>{eventItem.done ? <Icon name="check"/> : index + 1}</span>
                <div><strong>{eventItem.title}</strong><p>{eventItem.detail}</p></div>
                <time>{eventItem.time}</time>
              </article>
            ))}
          </section>

          <div className="logisticsActionsV13">
            {selected.role === "seller" && selected.status === "label_required" && <button className="primary" type="button" onClick={() => setLabelOpen(true)}><Icon name="barcode"/> Kargo kodu oluştur</button>}
            {selected.role === "seller" && selected.status === "ready" && <button className="primary" type="button" onClick={() => { updateSelected({ status: "transit", eta: "Kargo hareketleri takip ediliyor" }); showNotice("Gönderi kargoya teslim edildi olarak işaretlendi."); }}><Icon name="truck"/> Kargoya teslim ettim</button>}
            {selected.role === "buyer" && ["transit", "delivery"].includes(selected.status) && <button className="primary" type="button" onClick={confirmDelivery}><Icon name="check"/> Ürünü teslim aldım</button>}
            {selected.role === "buyer" && selected.status === "delivered" && <button className="primary" type="button" onClick={() => setReturnOpen(true)}><Icon name="return"/> İade veya sorun bildir</button>}
            {selected.status === "return_requested" && <button className="primary" type="button" onClick={() => { updateSelected({ status: "return_transit", tracking: `IADE${Math.floor(10000000 + Math.random() * 90000000)}`, carrier: "KapışKapış İade" }); showNotice("Ücretsiz iade kodu oluşturuldu."); }}><Icon name="barcode"/> Ücretsiz iade kodu oluştur</button>}
            {selected.tracking && <button type="button" onClick={() => showNotice("Kargo etiketi PDF önizlemesi açıldı.")}><Icon name="download"/> Etiketi indir</button>}
            <Link href={`/mesajlar?order=${selected.orderId}`}><Icon name="message"/> {selected.role === "buyer" ? "Satıcıya yaz" : "Alıcıya yaz"}</Link>
          </div>

          <div className="logisticsFooterLinksV13">
            <Link href={`/siparisler?order=${selected.orderId}`}><Icon name="card"/> Sipariş ve ödeme detayları</Link>
            <Link href={`/uyusmazlik?order=${selected.orderId}`}><Icon name="alert"/> Güven ekibine bildir</Link>
          </div>
          <small className="logisticsDemoNoteV13">Kargo kodu, takip hareketleri ve iade işlemleri bu aşamada demo verilerle çalışır.</small>
        </aside>
      </section>

      {labelOpen && (
        <div className="logisticsModalBackdropV13" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLabelOpen(false); }}>
          <form className="logisticsModalV13" onSubmit={createLabel}>
            <header><div><span>KAPIŞKAPIŞ KARGO</span><h2>Kargo kodu oluştur</h2><p>{selected.product} için ücretsiz gönderim bilgilerini tamamla.</p></div><button type="button" onClick={() => setLabelOpen(false)} aria-label="Kapat"><Icon name="close"/></button></header>
            <section className="logisticsModalOrderV13"><img src={selected.image} alt=""/><div><small>{selected.orderId}</small><strong>{selected.product}</strong><span>{selected.destination}</span></div></section>
            <div className="logisticsFormGridV13">
              <label><span>Kargo seçimi</span><select value={carrier} onChange={(event) => setCarrier(event.target.value)}><option>KapışKapış Kargo</option><option>Yurtiçi Kargo</option><option>Aras Kargo</option><option>Sürat Kargo</option></select><small>Anlaşmalı fiyat gönderi ücretine uygulanır.</small></label>
              <label><span>Paket boyutu</span><select value={parcelSize} onChange={(event) => setParcelSize(event.target.value)}><option>Küçük</option><option>Orta</option><option>Büyük</option><option>Çok büyük</option></select></label>
              <label><span>Ağırlık (kg)</span><input type="number" min="0.1" max="30" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} required/></label>
              <fieldset><legend>Teslim şekli</legend><button type="button" className={pickup === "sube" ? "active" : ""} onClick={() => setPickup("sube")}><Icon name="store"/><span><b>Şubeye bırak</b><small>En yakın anlaşmalı şube</small></span></button><button type="button" className={pickup === "pickup" ? "active" : ""} onClick={() => setPickup("pickup")}><Icon name="truck"/><span><b>Adresten alım</b><small>Kurye randevusu oluştur</small></span></button></fieldset>
            </div>
            <section className="packingGuideV13"><Icon name="shield"/><div><strong>Güvenli paketleme zorunlu</strong><p>Ürünü hareket etmeyecek şekilde sabitle, kutu kapanmadan önce fotoğrafını çek ve seri numarasını görünür bırak.</p></div></section>
            <footer><button type="button" onClick={() => setLabelOpen(false)}>Vazgeç</button><button className="primary" type="submit"><Icon name="barcode"/> Kodu oluştur</button></footer>
          </form>
        </div>
      )}

      {returnOpen && (
        <div className="logisticsModalBackdropV13" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReturnOpen(false); }}>
          <form className="logisticsModalV13 returnModalV13" onSubmit={submitReturn}>
            <header><div><span>ALICI KORUMASI</span><h2>İade veya sorun bildir</h2><p>Ödeme aktarımı inceleme tamamlanana kadar otomatik olarak durdurulur.</p></div><button type="button" onClick={() => setReturnOpen(false)} aria-label="Kapat"><Icon name="close"/></button></header>
            <section className="logisticsModalOrderV13"><img src={selected.image} alt=""/><div><small>{selected.orderId}</small><strong>{selected.product}</strong><span>İade son süresi: {selected.returnDeadline}</span></div></section>
            <div className="returnFormV13">
              <label><span>İade nedeni</span><select value={returnReason} onChange={(event) => setReturnReason(event.target.value)} required><option value="">Bir neden seç</option><option>Ürün açıklamayla uyuşmuyor</option><option>Hasarlı veya çalışmıyor</option><option>Eksik parça / aksesuar</option><option>Sahte veya şüpheli ürün</option><option>Yanlış ürün gönderildi</option></select></label>
              <label><span>Sorunu ayrıntılı anlat</span><textarea value={returnDetail} onChange={(event) => setReturnDetail(event.target.value)} rows={5} placeholder="Ürünü teslim aldığında ne gördüğünü, test sonucunu ve sorunu açıkça yaz..."/><small>{returnDetail.trim().length}/20 minimum karakter</small></label>
              <label className="evidenceUploadV13"><input type="file" accept="image/*,.pdf" onChange={(event) => setEvidenceName(event.target.files?.[0]?.name ?? "")}/><Icon name="camera"/><span><b>{evidenceName || "Fotoğraf veya belge ekle"}</b><small>Kutu, ürün, seri numarası ve hasarı net göster.</small></span></label>
            </div>
            <section className="returnProtectionV13"><Icon name="shield"/><div><strong>{currency(selected.protectedAmount)} satıcıya aktarılmayacak</strong><p>Kanıtlar incelenirken ödeme güvenli havuzda kalır. Satıcı 24 saat içinde yanıt verebilir.</p></div></section>
            <footer><button type="button" onClick={() => setReturnOpen(false)}>Vazgeç</button><button className="primary danger" type="submit"><Icon name="return"/> Talebi oluştur</button></footer>
          </form>
        </div>
      )}
    </div>
  );
}
