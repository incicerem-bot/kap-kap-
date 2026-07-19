"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

type IconName =
  | "wallet"
  | "arrowUp"
  | "arrowDown"
  | "shield"
  | "card"
  | "bank"
  | "clock"
  | "check"
  | "filter"
  | "download"
  | "lock"
  | "chevron";

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
    wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12"/><path d="M16 12h6v4h-6a2 2 0 0 1 0-4Z"/><path d="M17.5 14h.01"/></>,
    arrowUp: <><path d="m7 11 5-5 5 5"/><path d="M12 6v12"/></>,
    arrowDown: <><path d="m7 13 5 5 5-5"/><path d="M12 18V6"/></>,
    shield: <><path d="M12 3 4.5 6v5.2c0 4.6 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.2 7.5-9.8V6z"/><path d="m9 12 2 2 4-4"/></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
    bank: <><path d="m3 10 9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const money = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);

type Transaction = {
  id: string;
  title: string;
  detail: string;
  date: string;
  amount: number;
  status: "completed" | "pending";
  kind: "income" | "expense";
};

const transactions: Transaction[] = [
  { id: "TX-34920", title: "Satış geliri", detail: "PlayStation 5 Slim · #KK-24672", date: "18 Temmuz 2026, 14:22", amount: 17337.5, status: "completed", kind: "income" },
  { id: "TX-34904", title: "Güvenli ödeme beklemede", detail: "Rolex Submariner Date · #KK-24891", date: "18 Temmuz 2026, 11:08", amount: 118750, status: "pending", kind: "income" },
  { id: "TX-34851", title: "Banka hesabına çekim", detail: "İş Bankası · TR•• •••• 0842", date: "17 Temmuz 2026, 09:40", amount: -20000, status: "completed", kind: "expense" },
  { id: "TX-34798", title: "Platform hizmet bedeli", detail: "Sony Alpha A7 IV · #KK-24118", date: "16 Temmuz 2026, 18:12", amount: -3115, status: "completed", kind: "expense" },
  { id: "TX-34730", title: "Satış geliri", detail: "RTX 4070 Super · #KK-23991", date: "15 Temmuz 2026, 16:55", amount: 30400, status: "completed", kind: "income" },
];

export default function WalletCenterExperience() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");
  const availableBalance = 24850;

  const filtered = useMemo(
    () => transactions.filter((item) => filter === "all" || item.kind === filter),
    [filter],
  );

  function submitWithdraw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 100) {
      setNotice("Minimum çekim tutarı 100 TL olmalıdır.");
      return;
    }
    if (parsed > availableBalance) {
      setNotice("Çekim tutarı kullanılabilir bakiyeyi aşamaz.");
      return;
    }
    setWithdrawOpen(false);
    setAmount("");
    setNotice(`${money(parsed)} tutarındaki çekim talebi demo olarak oluşturuldu.`);
  }

  return (
    <div className="walletCenterV6">
      {notice && (
        <button className="financeToastV6" type="button" onClick={() => setNotice("")}>
          <Icon name="check" />
          <span>{notice}</span>
        </button>
      )}

      <section className="walletHeroV6">
        <div className="walletHeroMainV6">
          <span className="walletHeroLabelV6"><Icon name="wallet" /> KULLANILABİLİR BAKİYE</span>
          <strong>{money(availableBalance)}</strong>
          <p>Tamamlanan satışlardan çekilebilir net bakiyen.</p>
          <div className="walletHeroActionsV6">
            <button type="button" onClick={() => setWithdrawOpen(true)}><Icon name="arrowUp" /> Para çek</button>
            <button type="button" className="secondary"><Icon name="bank" /> Hesaplarım</button>
          </div>
        </div>
        <div className="walletHeroReserveV6">
          <div>
            <span>Güvenli ödemede bekleyen</span>
            <strong>{money(118750)}</strong>
            <small>Alıcı teslimatı onayladığında bakiyene aktarılır.</small>
          </div>
          <div className="reserveProgressV6"><i style={{ width: "64%" }} /></div>
          <footer><Icon name="clock" /> Tahmini çözülme: 2–4 iş günü</footer>
        </div>
      </section>

      <section className="walletMetricGridV6">
        <article><span><Icon name="arrowDown" /></span><div><small>Bu ay satış</small><strong>{money(38700)}</strong><em>Geçen aya göre +%18</em></div></article>
        <article><span><Icon name="shield" /></span><div><small>Koruma altındaki bakiye</small><strong>{money(118750)}</strong><em>1 aktif sipariş</em></div></article>
        <article><span><Icon name="card" /></span><div><small>Teklif limiti</small><strong>{money(30000)}</strong><em>Kart doğrulaması aktif</em></div></article>
        <article><span><Icon name="bank" /></span><div><small>Bu ay çekilen</small><strong>{money(20000)}</strong><em>Son çekim 17 Temmuz</em></div></article>
      </section>

      <section className="walletLayoutV6">
        <div className="financePanelV6 walletMovementsV6">
          <header className="financePanelHeadV6">
            <div><span>HESAP HAREKETLERİ</span><h2>Son işlemler</h2></div>
            <div className="financeFiltersV6">
              <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Tümü</button>
              <button type="button" className={filter === "income" ? "active" : ""} onClick={() => setFilter("income")}>Gelen</button>
              <button type="button" className={filter === "expense" ? "active" : ""} onClick={() => setFilter("expense")}>Giden</button>
            </div>
          </header>
          <div className="walletTransactionListV6">
            {filtered.map((item) => (
              <article key={item.id}>
                <span className={`transactionIconV6 ${item.kind}`}><Icon name={item.kind === "income" ? "arrowDown" : "arrowUp"} /></span>
                <div className="transactionNameV6"><strong>{item.title}</strong><small>{item.detail}</small></div>
                <div className="transactionMetaV6"><small>{item.date}</small><em className={item.status}>{item.status === "completed" ? "Tamamlandı" : "Beklemede"}</em></div>
                <b className={item.amount > 0 ? "positive" : ""}>{item.amount > 0 ? "+" : ""}{money(item.amount)}</b>
                <button type="button" aria-label={`${item.title} detayları`}><Icon name="chevron" /></button>
              </article>
            ))}
          </div>
          <footer className="financePanelFooterV6">
            <button type="button"><Icon name="download" /> Hesap ekstresini indir</button>
            <small>Gösterilen değerler tasarım önizlemesi için örnek veridir.</small>
          </footer>
        </div>

        <aside className="walletAsideV6">
          <section className="financePanelV6 bidLimitCardV6">
            <div className="financePanelHeadV6"><div><span>TEKLİF GÜVENCESİ</span><h2>Kart ile limit</h2></div><i className="verifiedDotV6"><Icon name="check" /></i></div>
            <div className="limitCardVisualV6">
              <span>KAPIŞKAPIŞ</span>
              <strong>•••• 4821</strong>
              <small>Doğrulanmış kart</small>
            </div>
            <div className="limitRowsV6">
              <div><span>Tanımlı teklif limiti</span><strong>{money(30000)}</strong></div>
              <div><span>Kullanılan limit</span><strong>{money(12500)}</strong></div>
            </div>
            <div className="limitBarV6"><i style={{ width: "41.6%" }} /></div>
            <button type="button" className="financeOutlineButtonV6">Limit ayarlarını yönet</button>
          </section>

          <section className="financePanelV6 securityFinanceV6">
            <span className="securityIconV6"><Icon name="lock" /></span>
            <div><span>GÜVENLİ PARA SİSTEMİ</span><h2>Para doğrudan satıcıya gitmez</h2></div>
            <p>Ödeme KapışKapış korumasında tutulur. Ürün teslim edilip onaylandıktan sonra satıcının çekilebilir bakiyesine geçer.</p>
            <ul>
              <li><Icon name="check" /> 3D Secure ödeme</li>
              <li><Icon name="check" /> Teslimat onayı</li>
              <li><Icon name="check" /> Uyuşmazlıkta ödeme blokesi</li>
            </ul>
          </section>
        </aside>
      </section>

      {withdrawOpen && (
        <div className="financeModalBackdropV6" onMouseDown={() => setWithdrawOpen(false)}>
          <form className="financeModalV6" onSubmit={submitWithdraw} onMouseDown={(event) => event.stopPropagation()}>
            <header><span>PARA ÇEKME</span><h2>Bakiyeni banka hesabına aktar</h2><button type="button" onClick={() => setWithdrawOpen(false)}>×</button></header>
            <div className="withdrawBalanceV6"><span>Çekilebilir bakiye</span><strong>{money(availableBalance)}</strong></div>
            <label>Çekim yapılacak hesap<select defaultValue="isbank"><option value="isbank">İş Bankası · TR•• •••• 0842</option><option value="garanti">Garanti BBVA · TR•• •••• 1920</option></select></label>
            <label>Çekilecek tutar<div className="moneyInputV6"><span>₺</span><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0,00" autoFocus /></div></label>
            <div className="withdrawQuickV6"><button type="button" onClick={() => setAmount("5000")}>5.000 TL</button><button type="button" onClick={() => setAmount("10000")}>10.000 TL</button><button type="button" onClick={() => setAmount(String(availableBalance))}>Tüm bakiye</button></div>
            {notice && <p className="financeFormErrorV6">{notice}</p>}
            <div className="withdrawInfoV6"><Icon name="clock" /><span>Talebin banka yoğunluğuna göre 1–2 iş gününde hesabına ulaşır.</span></div>
            <button className="financePrimaryButtonV6" type="submit">Çekim talebi oluştur</button>
            <small className="financeDemoNoteV6">Bu ekran şu an tasarım/demo akışıdır; gerçek para transferi ödeme kuruluşu entegrasyonuyla açılır.</small>
          </form>
        </div>
      )}
    </div>
  );
}
