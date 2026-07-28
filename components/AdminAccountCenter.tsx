"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ReviewStatus = "not_submitted" | "pending" | "approved" | "rejected" | "suspended";
type AdminAction = "approve_seller" | "reject_seller" | "suspend_account" | "activate_account" | "grant_admin" | "revoke_admin";
type Filter = "all" | "seller_pending" | "admins" | "active" | "suspended";
type InvitationRole = "buyer" | "seller" | "operator";
type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

type Account = {
  id: string;
  email: string;
  fullName: string;
  username: string | null;
  role: "buyer" | "seller" | "admin";
  adminLevel: "none" | "operator" | "owner";
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

type Invitation = {
  id: string;
  email: string;
  fullName: string;
  role: InvitationRole;
  status: InvitationStatus;
  authUserId: string | null;
  invitedBy: string;
  invitedByName: string;
  redirectPath: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

type Notice = { type: "success" | "error"; text: string } | null;

function dateLabel(value: string | null) {
  if (!value) return "Henüz giriş yok";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function roleLabel(role: Account["role"]) {
  return role === "admin" ? "Yönetici" : role === "seller" ? "Satıcı" : "Alıcı";
}

function adminLevelLabel(level: Account["adminLevel"]) {
  return level === "owner" ? "Sahip yönetici" : level === "operator" ? "Operasyon yöneticisi" : "Yönetici değil";
}

function reviewLabel(status: ReviewStatus) {
  if (status === "approved") return "Onaylandı";
  if (status === "pending") return "İncelemede";
  if (status === "rejected") return "Düzeltme gerekli";
  if (status === "suspended") return "Askıda";
  return "Başlatılmadı";
}

function invitationRoleLabel(role: InvitationRole) {
  return role === "operator" ? "Operasyon yöneticisi" : role === "seller" ? "Satıcı" : "Alıcı";
}

function invitationStatusLabel(status: InvitationStatus) {
  if (status === "accepted") return "Kabul edildi";
  if (status === "revoked") return "İptal edildi";
  if (status === "expired") return "Süresi doldu";
  return "Davet bekleniyor";
}

export default function AdminAccountCenter({ compact = false }: { compact?: boolean }) {
  const { profile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<Account | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<Notice>(null);
  const [inviteForm, setInviteForm] = useState({ fullName: "", email: "", role: "buyer" as InvitationRole });
  const [inviteLoading, setInviteLoading] = useState(false);

  const authorizedFetch = useCallback(async <T,>(url: string, init?: RequestInit): Promise<T> => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase bağlantısı bulunamadı.");
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Yönetici oturumu bulunamadı.");
    const response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
    const body = await response.json().catch(() => ({})) as { ok?: boolean; message?: string } & T;
    if (!response.ok || !body.ok) throw new Error(body.message || "İşlem tamamlanamadı.");
    return body;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [accountsBody, invitationsBody] = await Promise.all([
        authorizedFetch<{ accounts: Account[] }>(`/api/admin/accounts?perPage=200&q=${encodeURIComponent(query)}`),
        authorizedFetch<{ invitations: Invitation[] }>("/api/admin/invitations"),
      ]);
      setAccounts(accountsBody.accounts ?? []);
      setInvitations(invitationsBody.invitations ?? []);
      setSelected((current) => current ? (accountsBody.accounts ?? []).find((item) => item.id === current.id) ?? null : null);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Yönetim verileri yüklenemedi." });
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
    if (filter === "admins") return account.role === "admin";
    if (filter === "suspended") return account.accountStatus === "suspended";
    if (filter === "active") return account.accountStatus === "active" && (!account.seller || account.seller.reviewStatus === "approved");
    return true;
  }), [accounts, filter]);

  const pendingInvitations = useMemo(() => invitations.filter((invite) => invite.status === "pending"), [invitations]);
  const metrics = useMemo(() => ({
    total: accounts.length,
    sellerPending: accounts.filter((account) => account.seller?.reviewStatus === "pending").length,
    invites: pendingInvitations.length,
    suspended: accounts.filter((account) => account.accountStatus === "suspended").length,
  }), [accounts, pendingInvitations.length]);

  async function runAction(account: Account, action: AdminAction) {
    const needsReason = action === "reject_seller" || action === "suspend_account" || action === "grant_admin" || action === "revoke_admin";
    if (needsReason && reason.trim().length < 5) {
      setMessage({ type: "error", text: "Bu işlem için en az 5 karakterlik açıklama yazmalısın." });
      return;
    }
    setProcessing(account.id);
    setMessage(null);
    try {
      await authorizedFetch<{ ok: true }>(`/api/admin/accounts/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, reason: reason.trim() }),
      });
      setMessage({ type: "success", text: action === "approve_seller" ? "Satıcı mağazası onaylandı." : action === "reject_seller" ? "Satıcı başvurusu düzeltmeye gönderildi." : action === "suspend_account" ? "Hesap askıya alındı." : action === "activate_account" ? "Hesap yeniden etkinleştirildi." : action === "grant_admin" ? "Operasyon yöneticisi yetkisi verildi." : "Yönetici yetkisi kaldırıldı." });
      setReason("");
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "İşlem tamamlanamadı." });
    } finally {
      setProcessing(null);
    }
  }

  async function sendInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inviteForm.role === "operator" && profile?.adminLevel !== "owner") {
      setMessage({ type: "error", text: "Operasyon yöneticisi davetini yalnız sahip yönetici gönderebilir." });
      return;
    }
    setInviteLoading(true);
    setMessage(null);
    try {
      await authorizedFetch<{ ok: true }>("/api/admin/invitations", {
        method: "POST",
        body: JSON.stringify(inviteForm),
      });
      setMessage({ type: "success", text: `${inviteForm.fullName} için ${invitationRoleLabel(inviteForm.role).toLocaleLowerCase("tr-TR")} daveti gönderildi.` });
      setInviteForm({ fullName: "", email: "", role: "buyer" });
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Davet gönderilemedi." });
    } finally {
      setInviteLoading(false);
    }
  }

  async function revokeInvitation(invitation: Invitation) {
    setProcessing(invitation.id);
    setMessage(null);
    try {
      await authorizedFetch<{ ok: true }>(`/api/admin/invitations/${invitation.id}?role=${invitation.role}`, { method: "DELETE" });
      setMessage({ type: "success", text: `${invitation.email} adresine gönderilen davet iptal edildi.` });
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Davet iptal edilemedi." });
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
        <article><span>Bekleyen davet</span><strong>{metrics.invites}</strong></article>
        <article><span>Askıdaki hesap</span><strong>{metrics.suspended}</strong></article>
      </section>

      <section className="adminInvitationCenterV25">
        <div className="adminInvitationIntroV25">
          <div><span>HESAP DAVETİ</span><h3>Yeni kullanıcıyı güvenli davet et</h3><p>Alıcı, satıcı veya operasyon yöneticisi için tek kullanımlık Supabase daveti gönder. Davet edilen kişi şifresini oluşturur ve rolüne uygun merkeze yönlendirilir.</p></div>
          <small>Davet bağlantısı 24 saat geçerlidir.</small>
        </div>
        <form onSubmit={sendInvitation} className="adminInvitationFormV25">
          <label>Ad soyad<input value={inviteForm.fullName} onChange={(event) => setInviteForm((current) => ({ ...current, fullName: event.target.value }))} minLength={3} maxLength={120} required placeholder="Davet edilecek kişinin adı" /></label>
          <label>E-posta<input type="email" value={inviteForm.email} onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))} required placeholder="ornek@email.com" /></label>
          <label>Hesap rolü<select value={inviteForm.role} onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value as InvitationRole }))}>
            <option value="buyer">Alıcı</option>
            <option value="seller">Satıcı</option>
            {profile.adminLevel === "owner" && <option value="operator">Operasyon yöneticisi</option>}
          </select></label>
          <button type="submit" disabled={inviteLoading}>{inviteLoading ? "Gönderiliyor…" : "Davet gönder"}</button>
        </form>
        <div className="adminInvitationListV25">
          {invitations.length ? invitations.slice(0, 8).map((invitation) => (
            <article key={invitation.id}>
              <div><strong>{invitation.fullName}</strong><span>{invitation.email}</span><small>{invitationRoleLabel(invitation.role)} · {invitation.invitedByName}</small></div>
              <div className={`inviteStatus-${invitation.status}`}><strong>{invitationStatusLabel(invitation.status)}</strong><small>{invitation.status === "accepted" ? dateLabel(invitation.acceptedAt) : invitation.status === "pending" ? `Son: ${dateLabel(invitation.expiresAt)}` : dateLabel(invitation.createdAt)}</small></div>
              {invitation.status === "pending" && <button type="button" onClick={() => void revokeInvitation(invitation)} disabled={processing === invitation.id}>İptal et</button>}
            </article>
          )) : <p className="adminInvitationEmptyV25">Henüz yönetici tarafından gönderilmiş davet bulunmuyor.</p>}
        </div>
      </section>

      <section className="adminAccountsToolbarV22">
        <label><span>Hesap ara</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ad, e-posta, kullanıcı adı veya mağaza" /></label>
        <div>{([['all','Tümü'],['seller_pending','Satıcı onayı'],['admins','Yöneticiler'],['active','Aktif'],['suspended','Askıda']] as Array<[Filter,string]>).map(([value,label]) => <button type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
        <button type="button" onClick={() => void load()} disabled={loading}>Yenile</button>
      </section>

      {profile.adminLevel === "owner" && <div className="adminOwnerSecurityV23"><span>SAHİP YÖNETİCİ GÜVENLİĞİ</span><p>Operasyon yöneticisi daveti ve rol değişiklikleri için Authenticator ile iki adımlı doğrulama zorunludur.</p><Link href="/ayarlar?tab=security">Güvenliği yönet</Link></div>}
      {message && <div className={`adminAccountsNoticeV22 ${message.type}`} aria-live="polite">{message.text}</div>}

      <section className="adminAccountsLayoutV22">
        <div className="adminAccountsListV22">
          {loading ? <div className="adminAccountsLoadingV22">Kullanıcı hesapları yükleniyor…</div> : filtered.length ? filtered.map((account) => (
            <button type="button" key={account.id} className={selected?.id === account.id ? "selected" : ""} onClick={() => { setSelected(account); setReason(""); }}>
              <span className="adminAccountAvatarV22">{account.fullName.slice(0, 2).toLocaleUpperCase("tr-TR")}</span>
              <span className="adminAccountIdentityV22"><strong>{account.fullName}</strong><small>{account.email}</small><em>{account.username ? `@${account.username}` : "Kullanıcı adı eksik"} · {account.city || "Şehir eksik"}</em></span>
              <span className="adminAccountBadgesV22"><i className={`role-${account.role}`}>{account.role === "admin" ? adminLevelLabel(account.adminLevel) : roleLabel(account.role)}</i><i className={`status-${account.accountStatus}`}>{account.accountStatus === "active" ? "Aktif" : account.accountStatus === "suspended" ? "Askıda" : "Kapalı"}</i>{account.seller && <i className={`review-${account.seller.reviewStatus}`}>{reviewLabel(account.seller.reviewStatus)}</i>}</span>
            </button>
          )) : <div className="adminAccountsLoadingV22">Bu filtrede hesap bulunamadı.</div>}
        </div>

        <aside className="adminAccountDetailV22">
          {selected ? <>
            <header><span className="adminAccountAvatarV22 large">{selected.fullName.slice(0, 2).toLocaleUpperCase("tr-TR")}</span><div><small>{roleLabel(selected.role)} hesabı</small><h3>{selected.fullName}</h3><p>{selected.email}</p></div></header>
            <dl>
              <div><dt>E-posta</dt><dd>{selected.emailVerified ? "Doğrulandı" : "Eksik"}</dd></div>
              <div><dt>Telefon</dt><dd>{selected.phoneVerified ? "Doğrulandı" : "Eksik"}</dd></div>
              <div><dt>Ek profil bilgisi</dt><dd>{selected.profileCompleted ? "Kayıtlı" : "İsteğe bağlı"}</dd></div>
              <div><dt>Yetki seviyesi</dt><dd>{selected.role === "admin" ? adminLevelLabel(selected.adminLevel) : roleLabel(selected.role)}</dd></div>
              <div><dt>Son giriş</dt><dd>{dateLabel(selected.lastLoginAt)}</dd></div>
            </dl>
            {selected.seller && <section className="adminSellerReviewV22"><span>SATICI BAŞVURUSU</span><h4>{selected.seller.name}</h4><p>iyzico: <strong>{selected.seller.payoutStatus === "active" ? "Aktif" : selected.seller.payoutStatus}</strong> · KapışKapış: <strong>{reviewLabel(selected.seller.reviewStatus)}</strong></p>{selected.seller.reviewNote && <blockquote>{selected.seller.reviewNote}</blockquote>}<Link href={`/magaza/${selected.seller.slug}`} target="_blank">Mağaza önizlemesini aç</Link></section>}
            <label className="adminReasonV22">İşlem açıklaması<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Onay notu veya reddetme/askıya alma gerekçesi" /></label>
            <div className="adminAccountActionsV22">
              {selected.seller?.reviewStatus === "pending" && <><button type="button" onClick={() => void runAction(selected, "approve_seller")} disabled={processing === selected.id}>Satıcıyı onayla</button><button type="button" className="warning" onClick={() => void runAction(selected, "reject_seller")} disabled={processing === selected.id}>Düzeltmeye gönder</button></>}
              {profile.adminLevel === "owner" && selected.role !== "admin" && <button type="button" className="adminRole" onClick={() => void runAction(selected, "grant_admin")} disabled={processing === selected.id}>Operasyon yöneticisi yap</button>}
              {profile.adminLevel === "owner" && selected.role === "admin" && selected.adminLevel === "operator" && <button type="button" className="warning" onClick={() => void runAction(selected, "revoke_admin")} disabled={processing === selected.id}>Yönetici yetkisini kaldır</button>}
              {selected.accountStatus === "active" ? <button type="button" className="danger" onClick={() => void runAction(selected, "suspend_account")} disabled={processing === selected.id || selected.role === "admin"}>Hesabı askıya al</button> : <button type="button" onClick={() => void runAction(selected, "activate_account")} disabled={processing === selected.id}>Hesabı etkinleştir</button>}
            </div>
          </> : <div className="adminAccountEmptyV22"><strong>Bir hesap seç</strong><p>Doğrulamalar, satıcı incelemesi ve hesap işlemleri burada görüntülenir.</p></div>}
        </aside>
      </section>
    </div>
  );
}
