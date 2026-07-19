"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type View = "disputes" | "support" | "guide";
type DisputeStatus = "open" | "seller" | "review" | "resolved";
type IconName = "shield" | "alert" | "clock" | "check" | "plus" | "search" | "file" | "message" | "box" | "chevron" | "lock" | "help" | "headset";

type Dispute = {
  id: string;
  orderId: string;
  product: string;
  seller: string;
  amount: string;
  reason: string;
  details: string;
  status: DisputeStatus;
  opened: string;
  deadline: string;
  image: string;
  evidence: string[];
};

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 3 4.5 6v5.2c0 4.6 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.2 7.5-9.8V6z"/><path d="m9 12 2 2 4-4"/></>,
    alert: <><path d="M12 3 2.5 20h19z"/><path d="M12 9v4M12 17h.01"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    file: <><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>,
    box: <><path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.7 1.8c-1.1 1-2.2 1.4-2.2 3.2M12 18h.01"/></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M18 19c0 1.1-.9 2-2 2h-4M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const statusLabels: Record<DisputeStatus, string> = { open: "Satıcı yanıtı bekleniyor", seller: "Satıcı yanıtladı", review: "Güven ekibi inceliyor", resolved: "Çözüldü" };

const initialDisputes: Dispute[] = [
  {
    id: "UY-2026-1842", orderId: "KK-24891", product: "Rolex Submariner Date 126610LN", seller: "Prestige Saat", amount: "125.000 TL", reason: "Ürün açıklamayla uyuşmuyor", details: "Saatin ilan açıklamasında belirtilmeyen kordon çizikleri bulunuyor. Teslim aldıktan sonra aynı gün fotoğrafları ekledim.", status: "review", opened: "19 Temmuz 2026 · 09:24", deadline: "Tahmini karar: 22 Temmuz", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=500&q=80", evidence: ["teslimat-kutusu.jpg", "kordon-detay-1.jpg", "kordon-detay-2.jpg"],
  },
  {
    id: "UY-2026-1794", orderId: "KK-24672", product: "PlayStation 5 Slim + 2 DualSense", seller: "GamePoint", amount: "18.250 TL", reason: "Eksik aksesuar", details: "İkinci kontrolcüye ait şarj kablosu paketten çıkmadı. Satıcı eksik parçayı göndereceğini belirtti.", status: "seller", opened: "17 Temmuz 2026 · 14:08", deadline: "Yanıt süresi: 14 saat", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80", evidence: ["kutu-icerigi.jpg"],
  },
  {
    id: "UY-2026-1631", orderId: "KK-23904", product: "AirPods Pro 2. Nesil", seller: "Mobil Plus", amount: "6.850 TL", reason: "Kargo gecikmesi", details: "Kargo firması kaynaklı gecikme yaşandı. Ürün daha sonra teslim edildi ve işlem tamamlandı.", status: "resolved", opened: "9 Temmuz 2026 · 11:16", deadline: "12 Temmuz 2026 tarihinde çözüldü", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500&q=80", evidence: ["kargo-takip.pdf"],
  },
];

const guideTopics = [
  { title: "Güvenli ödeme nasıl çalışır?", category: "Ödeme", text: "Ödeme teslimat onayına kadar güvenli havuzda tutulur." },
  { title: "Uyuşmazlık ne zaman açılmalı?", category: "İade", text: "Hasar, eksik ürün, yanlış ürün veya teslimat sorunu olduğunda kayıt açabilirsin." },
  { title: "Teklif güvencesi nasıl hesaplanır?", category: "Açık artırma", text: "Teklif tutarına göre kart doğrulaması, sabit güvence veya yüzdesel güvence otomatik uygulanır." },
  { title: "Satıcı ürünü göndermezse ne olur?", category: "Kargo", text: "Gönderim süresi aşılırsa ödeme satıcıya aktarılmaz ve işlem incelemeye alınır." },
  { title: "İade kargo ücretini kim öder?", category: "İade", text: "Karar, uyuşmazlığın nedenine ve güven ekibi incelemesine göre verilir." },
  { title: "Hesabımı nasıl doğrularım?", category: "Hesap", text: "Telefon, e-posta, kimlik ve ödeme yöntemi doğrulamalarını ayarlardan tamamlayabilirsin." },
];

export default function TrustCenterExperience({ initialView = "disputes" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [disputes, setDisputes] = useState(initialDisputes);
  const [selectedId, setSelectedId] = useState(initialDisputes[0].id);
  const [statusFilter, setStatusFilter] = useState<"all" | DisputeStatus>("all");
  const [query, setQuery] = useState("");
  const [newRequest, setNewRequest] = useState(false);
  const [notice, setNotice] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketText, setTicketText] = useState("");

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("order");
    if (orderId) {
      setView("disputes");
      setNewRequest(true);
    }
  }, []);

  const visibleDisputes = useMemo(() => disputes.filter((item) => statusFilter === "all" || item.status === statusFilter), [disputes, statusFilter]);
  const selected = disputes.find((item) => item.id === selectedId) ?? disputes[0];
  const guideResults = guideTopics.filter((item) => `${item.title} ${item.category} ${item.text}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));

  function toast(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function createDispute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const orderId = String(form.get("order") || "KK-00000");
    const reason = String(form.get("reason") || "Sipariş sorunu");
    const details = String(form.get("details") || "");
    const id = `UY-2026-${1900 + disputes.length}`;
    const dispute: Dispute = { id, orderId, product: "Seçili sipariş ürünü", seller: "Doğrulanmış satıcı", amount: "—", reason, details, status: "open", opened: "Şimdi", deadline: "Satıcı yanıt süresi: 48 saat", image: "/kapiskapis-icon.png", evidence: [] };
    setDisputes((items) => [dispute, ...items]);
    setSelectedId(id);
    setNewRequest(false);
    toast("Uyuşmazlık kaydı oluşturuldu. Ödeme güvenli havuzda tutulmaya devam edecek.");
  }

  function sendTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast("Destek talebin oluşturuldu: DST-2026-1854");
    setTicketSubject("");
    setTicketText("");
  }

  return (
    <div className="trustCenterV7">
      {notice && <button type="button" className="supportToastV7" onClick={() => setNotice("")}><Icon name="check"/><span>{notice}</span></button>}

      <section className="trustHeroV7">
        <div><span><Icon name="shield"/></span><p><small>KAPIŞKAPIŞ GÜVEN MERKEZİ</small><strong>İşlemin güvende, çözüm sürecin kayıt altında.</strong><em>Ödeme, teslimat ve görüşmeler tek dosyada incelenir.</em></p></div>
        <aside><article><small>Açık talep</small><strong>{disputes.filter((item) => item.status !== "resolved").length}</strong></article><article><small>Ort. ilk yanıt</small><strong>8 dk</strong></article><article><small>Korunan tutar</small><strong>143.250 TL</strong></article></aside>
      </section>

      <nav className="trustTabsV7" aria-label="Güven merkezi bölümleri">
        <button type="button" className={view === "disputes" ? "active" : ""} onClick={() => setView("disputes")}><Icon name="shield"/> Uyuşmazlıklarım</button>
        <button type="button" className={view === "support" ? "active" : ""} onClick={() => setView("support")}><Icon name="headset"/> Destek taleplerim</button>
        <button type="button" className={view === "guide" ? "active" : ""} onClick={() => setView("guide")}><Icon name="help"/> Yardım rehberi</button>
      </nav>

      {view === "disputes" && (
        <section className="disputeWorkspaceV7">
          <div className="disputeListPanelV7">
            <header><div><h2>Uyuşmazlık kayıtları</h2><p>İade, iptal ve teslimat sorunlarını buradan takip et.</p></div><button type="button" onClick={() => setNewRequest(true)}><Icon name="plus"/> Yeni talep</button></header>
            <nav>{([ ["all", "Tümü"], ["open", "Yanıt bekleyen"], ["review", "İncelemede"], ["resolved", "Çözülen"] ] as Array<["all" | DisputeStatus, string]>).map(([key, label]) => <button type="button" key={key} className={statusFilter === key ? "active" : ""} onClick={() => setStatusFilter(key)}>{label}</button>)}</nav>
            <div className="disputeListV7">{visibleDisputes.map((item) => <button type="button" key={item.id} className={selected.id === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><img src={item.image} alt=""/><div><span>{item.id}</span><strong>{item.product}</strong><p>{item.reason}</p><small>{item.opened}</small></div><aside><em className={`disputeStatusV7 status-${item.status}`}>{statusLabels[item.status]}</em><Icon name="chevron"/></aside></button>)}</div>
          </div>

          <aside className="disputeDetailV7">
            <header><div><span>TALEP #{selected.id}</span><h2>{selected.reason}</h2><p>Sipariş #{selected.orderId} · {selected.seller}</p></div><em className={`disputeStatusV7 status-${selected.status}`}>{statusLabels[selected.status]}</em></header>
            <section className="disputeProductV7"><img src={selected.image} alt=""/><div><strong>{selected.product}</strong><span>{selected.amount}</span><Link href="/siparisler">Siparişi görüntüle</Link></div></section>
            <section className="paymentHoldV7"><Icon name="lock"/><div><strong>Ödeme aktarımı durduruldu</strong><p>Talep sonuçlanana kadar para satıcıya aktarılmaz.</p></div></section>
            <section className="disputeStatementV7"><h3>Alıcı açıklaması</h3><p>{selected.details}</p></section>
            <section className="evidenceV7"><header><h3>Kanıtlar</h3><button type="button" onClick={() => toast("Dosya yükleme alanı backend bağlantısında aktif olacak.")}><Icon name="plus"/> Dosya ekle</button></header>{selected.evidence.length ? selected.evidence.map((file) => <div key={file}><span><Icon name="file"/></span><p><strong>{file}</strong><small>Güvenli dosya · İncelemeye açık</small></p><Icon name="check"/></div>) : <p className="noEvidenceV7">Henüz dosya eklenmedi.</p>}</section>
            <section className="disputeTimelineV7"><h3>Çözüm süreci</h3><article className="complete"><span><Icon name="check"/></span><p><strong>Talep oluşturuldu</strong><small>{selected.opened}</small></p></article><article className={selected.status !== "open" ? "complete" : ""}><span>{selected.status !== "open" ? <Icon name="check"/> : 2}</span><p><strong>Satıcı yanıtı</strong><small>{selected.status === "open" ? selected.deadline : "Satıcı açıklaması dosyaya eklendi"}</small></p></article><article className={["review", "resolved"].includes(selected.status) ? "complete" : ""}><span>{["review", "resolved"].includes(selected.status) ? <Icon name="check"/> : 3}</span><p><strong>Güven ekibi incelemesi</strong><small>{selected.status === "review" ? selected.deadline : "Belgeler ve mesajlar incelenir"}</small></p></article><article className={selected.status === "resolved" ? "complete" : ""}><span>{selected.status === "resolved" ? <Icon name="check"/> : 4}</span><p><strong>Nihai karar</strong><small>{selected.status === "resolved" ? "Talep sonuçlandırıldı" : "Karar taraflara bildirilir"}</small></p></article></section>
            <div className="disputeActionsV7"><Link href="/mesajlar"><Icon name="message"/> Satıcıyla güvenli mesajlaş</Link><button type="button" onClick={() => toast("Güven ekibine ek not gönderildi.")}>İncelemeye not ekle</button></div>
          </aside>
        </section>
      )}

      {view === "support" && (
        <section className="supportWorkspaceV7">
          <div className="supportTicketListV7"><header><span><Icon name="headset"/></span><div><small>AKTİF DESTEK</small><strong>Uzman ekibe doğrudan ulaş</strong><p>Ödeme, hesap, ilan ve teknik sorunlar için kayıt oluştur.</p></div></header><article><div><span>DST-2026-1842</span><strong>Ödeme yöntemi doğrulama</strong><p>Güven ekibine aktarıldı · Son yanıt 09:16</p></div><em>İncelemede</em></article><article><div><span>DST-2026-1738</span><strong>İlan görseli yükleme sorunu</strong><p>Çözüldü · 14 Temmuz</p></div><em className="resolved">Çözüldü</em></article></div>
          <form className="supportFormV7" onSubmit={sendTicket}><header><span>YENİ DESTEK TALEBİ</span><h2>Nasıl yardımcı olabiliriz?</h2><p>Hesap ve ödeme bilgilerini mesaj alanına yazma.</p></header><label>Konu<select value={ticketSubject} onChange={(event) => setTicketSubject(event.target.value)} required><option value="">Konu seç</option><option>Ödeme ve cüzdan</option><option>Hesap doğrulama</option><option>İlan ve açık artırma</option><option>Kargo ve teslimat</option><option>Teknik sorun</option></select></label><label>Açıklama<textarea value={ticketText} onChange={(event) => setTicketText(event.target.value)} minLength={20} maxLength={1000} rows={7} placeholder="Sorunu, gördüğün hata mesajını ve ne zaman başladığını anlat..." required/></label><button type="submit"><Icon name="message"/> Destek talebi oluştur</button><small>Ortalama ilk yanıt süresi bugün 8 dakika.</small></form>
        </section>
      )}

      {view === "guide" && (
        <section className="guideWorkspaceV7"><header><span>YARDIM REHBERİ</span><h2>Cevabını hızlıca bul</h2><p>Açık artırma, ödeme, kargo ve hesap işlemleri için kısa rehberler.</p><label><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sorunu veya aradığın konuyu yaz"/></label></header><div className="guideGridV7">{guideResults.map((topic) => <article key={topic.title}><span>{topic.category}</span><h3>{topic.title}</h3><p>{topic.text}</p><button type="button" onClick={() => toast("Detay rehberi yakında bu karta bağlanacak.")}>Adımları görüntüle <Icon name="chevron"/></button></article>)}</div><footer><div><Icon name="headset"/><p><strong>Aradığını bulamadın mı?</strong><span>Destek ekibine güvenli bir talep gönder.</span></p></div><button type="button" onClick={() => setView("support")}>Destek talebi oluştur</button></footer></section>
      )}

      {newRequest && <div className="requestModalBackdropV7" onMouseDown={() => setNewRequest(false)}><form className="requestModalV7" onMouseDown={(event) => event.stopPropagation()} onSubmit={createDispute}><button type="button" className="requestCloseV7" onClick={() => setNewRequest(false)}>×</button><header><span><Icon name="alert"/></span><div><small>GÜVENLİ İŞLEM MERKEZİ</small><h2>Uyuşmazlık talebi oluştur</h2><p>Talep açıldığında ödeme aktarımı inceleme sonuna kadar durdurulur.</p></div></header><label>Sipariş numarası<input name="order" defaultValue={new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("order") ?? ""} placeholder="Örn. KK-24891" required/></label><label>Sorun türü<select name="reason" required><option>Ürün açıklamayla uyuşmuyor</option><option>Ürün hasarlı geldi</option><option>Eksik veya yanlış ürün gönderildi</option><option>Satıcı ürünü göndermedi</option><option>Kargo / teslimat sorunu</option><option>Diğer</option></select></label><label>Detaylı açıklama<textarea name="details" minLength={25} maxLength={1000} rows={6} placeholder="Ürünün durumu, teslimat tarihi ve beklediğin çözümü açıkça yaz..." required/></label><div className="requestProtectionV7"><Icon name="shield"/><p><strong>Alıcı koruması aktif kalır</strong><span>Talebin sonuçlanana kadar tutar güvenli ödeme havuzunda tutulur.</span></p></div><button type="submit" className="requestSubmitV7">Talebi güven ekibine gönder</button></form></div>}
    </div>
  );
}
