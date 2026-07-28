"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ReviewStatus = "not_submitted" | "pending" | "approved" | "rejected" | "suspended";
type AdminAction = "approve_seller" | "reject_seller" | "suspend_account" | "activate_account";
type Filter = "all" | "seller_pending" | "active" | "suspended";

type Account = {
  id: string;
  email: string;
  fullName: string;
  username: string | null;
  role: "buyer" | "seller" | "admin";
  accountStatus: "active" | "suspended" | "closed";
  sellerStatus: "not_started" | "pending" | "active" | "rejected" | "suspended";
  emailVerified: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  city: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  seller: null | {
    id: string;
    slug: string;
    name: string;
    reviewStatus: ReviewStatus;
    reviewNote: string | null;
    payoutStatus: string;
    payoutActivatedAt: string | null;
  };
};

function dateLabel(value: string | null) {
  if (!value) return "Henüz giriş yok";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function roleLabel(role: Account["role"]) {
  return role === "admin" ? "Yönetici" : role === "seller" ? "Satıcı" : "Alıcı";
}

function reviewLabel(status: ReviewStatus) {
  if (status === "approved") return "Onaylandı";
  if (status === "pending") return "İncelemede";
  if (status === "rejected") return "Düzeltme gerekli";
  if (status === "suspended") return "Askıda";
  return "Başlatılmadı";
}

export default function AdminAccountCenter({ compact = false }: { compact?: boolean }) {
  const { profile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<Account | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const authorizedFetch = useCallback(async (url: string, init?: RequestInit) => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase bağlantısı bulunamadı.");
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Yönetici oturumu bulunamadı.");
    const response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.message || "İşlem tamamlanamadı.");
    return body;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const body = await authorizedFetch(`/api/admin/accounts?perPage=200&q=${encodeURIComponent(query)}`);
      setAccounts(body.accounts ?? []);
      setSelected((current) => current ? (body.accounts ?? []).find((item: Account) => item.id === current.id) ?? null : null);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Hesaplar yüklenemedi." });
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), query ? 350 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  const filtered = useMemo(() => accounts.filter((account) => {
    if (filter === "seller_pending") return account.seller?.reviewStatus === "pending";
    if (filter === "suspended") return account.accountStatus === "suspended";
    if (filter === "active") return account.accountStatus === "active" && (!account.seller || account.seller.reviewStatus === "approved");
    return true;
  }), [accounts, filter]);

  const metrics = useMemo(() => ({
    total: accounts.length,
    sellerPending: accounts.filter((account) => account.seller?.reviewStatus === "pending").length,
    incomplete: accounts.filter((account) => !account.profileCompleted || !account.emailVerified || !account.phoneVerified).length,
    suspended: accounts.filter((account) => account.accountStatus === "suspended").length,
  }), [accounts]);

  async function runAction(account: Account, action: AdminAction) {
    const needsReason = action === "reject_seller" || action === "suspend_account";
    if (needsReason && reason.trim().length < 5) {
      setMessage({ type: "error", text: "Bu işlem için en az 5 karakterlik açıklama yazmalısın." });
      return;
    }
    setProcessing(account.id);
    setMessage(null);
    try {
      await authorizedFetch(`/api/admin/accounts/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, reason: reason.trim() }),
      });
      setMessage({ type: "success", text: action === "approve_seller" ? "Satıcı mağazası onaylandı." : action === "reject_seller" ? "Satıcı başvurusu düzeltmeye gönderildi." : action === "suspend_account" ? "Hesap askıya alındı." : "Hesap yeniden etkinleştirildi." });
      setReason("");
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "İşlem tamamlanamadı." });
    } finally {
      setProcessing(null);
    }
  }

  if (profile?.role !== "admin") {
    return <section className="adminAccountsStateV22"><h3>Yönetici yetkisi gerekiyor</h3><p>Bu alan yalnız KapışKapış yönetici hesaplarına açıktır.</p><Link href="/yetkisiz">Geri dön</Link></section>;
  }

  return (
    <div className={`adminAccountsV22 ${compact ? "compact" : ""}`}>
      <section className="adminAccountsMetricsV22">
        <article><span>Toplam hesap</span><strong>{metrics.total}</strong></article>
        <article><span>Satıcı onayı</span><strong>{metrics.sellerPending}</strong></article>
        <article><span>Eksik doğrulama</span><strong>{metrics.incomplete}</strong></article>
        <article><span>Askıdaki hesap</span><strong>{metrics.suspended}</strong></article>
      </section>

      <section className="adminAccountsToolbarV22">
        <label><span>Hesap ara</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ad, e-posta, kullanıcı adı veya mağaza" /></label>
        <div>
          {([['all','Tümü'],['seller_pending','Satıcı onayı'],['active','Aktif'],['suspended','Askıda']] as Array<[Filter,string]>).map(([value,label]) => <button type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>)}
        </div>
        <button type="button" onClick={() => void load()} disabled={loading}>Yenile</button>
      </section>

      {message && <div className={`adminAccountsNoticeV22 ${message.type}`} aria-live="polite">{message.text}</div>}

      <section className="adminAccountsLayoutV22">
        <div className="adminAccountsListV22">
          {loading ? <div className="adminAccountsLoadingV22">Kullanıcı hesapları yükleniyor…</div> : filtered.length ? filtered.map((account) => (
            <button type="button" key={account.id} className={selected?.id === account.id ? "selected" : ""} onClick={() => { setSelected(account); setReason(""); }}>
              <span className="adminAccountAvatarV22">{account.fullName.slice(0, 2).toLocaleUpperCase("tr-TR")}</span>
              <span className="adminAccountIdentityV22"><strong>{account.fullName}</strong><small>{account.email}</small><em>{account.username ? `@${account.username}` : "Kullanıcı adı eksik"} · {account.city || "Şehir eksik"}</em></span>
              <span className="adminAccountBadgesV22"><i className={`role-${account.role}`}>{roleLabel(account.role)}</i><i className={`status-${account.accountStatus}`}>{account.accountStatus === "active" ? "Aktif" : account.accountStatus === "suspended" ? "Askıda" : "Kapalı"}</i>{account.seller && <i className={`review-${account.seller.reviewStatus}`}>{reviewLabel(account.seller.reviewStatus)}</i>}</span>
            </button>
          )) : <div className="adminAccountsLoadingV22">Bu filtrede hesap bulunamadı.</div>}
        </div>

        <aside className="adminAccountDetailV22">
          {selected ? <>
            <header><span className="adminAccountAvatarV22 large">{selected.fullName.slice(0, 2).toLocaleUpperCase("tr-TR")}</span><div><small>{roleLabel(selected.role)} hesabı</small><h3>{selected.fullName}</h3><p>{selected.email}</p></div></header>
            <dl>
              <div><dt>E-posta</dt><dd>{selected.emailVerified ? "Doğrulandı" : "Eksik"}</dd></div>
              <div><dt>Telefon</dt><dd>{selected.phoneVerified ? "Doğrulandı" : "Eksik"}</dd></div>
              <div><dt>Profil</dt><dd>{selected.profileCompleted ? "Tamamlandı" : "Eksik"}</dd></div>
              <div><dt>Son giriş</dt><dd>{dateLabel(selected.lastLoginAt)}</dd></div>
            </dl>
            {selected.seller && <section className="adminSellerReviewV22"><span>SATICI BAŞVURUSU</span><h4>{selected.seller.name}</h4><p>iyzico: <strong>{selected.seller.payoutStatus === "active" ? "Aktif" : selected.seller.payoutStatus}</strong> · KapışKapış: <strong>{reviewLabel(selected.seller.reviewStatus)}</strong></p>{selected.seller.reviewNote && <blockquote>{selected.seller.reviewNote}</blockquote>}<Link href={`/magaza/${selected.seller.slug}`} target="_blank">Mağaza önizlemesini aç</Link></section>}
            <label className="adminReasonV22">İşlem açıklaması<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Onay notu veya reddetme/askıya alma gerekçesi" /></label>
            <div className="adminAccountActionsV22">
              {selected.seller?.reviewStatus === "pending" && <><button type="button" onClick={() => void runAction(selected, "approve_seller")} disabled={processing === selected.id}>Satıcıyı onayla</button><button type="button" className="warning" onClick={() => void runAction(selected, "reject_seller")} disabled={processing === selected.id}>Düzeltmeye gönder</button></>}
              {selected.accountStatus === "active" ? <button type="button" className="danger" onClick={() => void runAction(selected, "suspend_account")} disabled={processing === selected.id || selected.role === "admin"}>Hesabı askıya al</button> : <button type="button" onClick={() => void runAction(selected, "activate_account")} disabled={processing === selected.id}>Hesabı etkinleştir</button>}
            </div>
          </> : <div className="adminAccountEmptyV22"><strong>Bir hesap seç</strong><p>Doğrulamalar, satıcı incelemesi ve hesap işlemleri burada görüntülenir.</p></div>}
        </aside>
      </section>
    </div>
  );
}
