"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchAccountDashboard } from "@/lib/dashboard";
import type { AccountDashboard, DashboardTone } from "@/types/dashboard";

type IconName = "buyer" | "seller" | "admin" | "check" | "warning" | "arrow" | "refresh" | "activity" | "workspace";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    buyer: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
    seller: <><path d="M4 9v11h16V9"/><path d="M3 9 5 3h14l2 6M8 20v-6h8v6"/></>,
    admin: <><path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.1 7.5 9.6 4.4-1.5 7.5-5 7.5-9.6V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    warning: <><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    refresh: <><path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 11M5.5 15A7 7 0 0 0 18 17.5l2-4.5"/></>,
    activity: <><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/></>,
    workspace: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9h8M8 13h5M8 17h7"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function roleLabel(role: AccountDashboard["role"], adminLevel: AccountDashboard["identity"]["adminLevel"]) {
  if (role === "admin") return adminLevel === "owner" ? "Sahip yönetici" : "Operasyon yöneticisi";
  if (role === "seller") return "Satıcı hesabı";
  return "Alıcı hesabı";
}

function roleIcon(role: AccountDashboard["role"]): IconName {
  return role === "admin" ? "admin" : role === "seller" ? "seller" : "buyer";
}

function roleDescription(role: AccountDashboard["role"]) {
  if (role === "admin") return "Platform güvenliği, kullanıcı onayları ve operasyon kuyruğunu yönet.";
  if (role === "seller") return "İlanlarını, satışlarını, kargolarını ve mağaza durumunu takip et.";
  return "Tekliflerini, siparişlerini ve hesap doğrulamalarını tek merkezden takip et.";
}

function relativeTime(value: string) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
  if (seconds < 60) return "Az önce";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days} gün önce` : new Date(value).toLocaleDateString("tr-TR");
}

function toneClass(tone: DashboardTone) {
  return `dashboardTone-${tone}`;
}

export default function ProfileDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<AccountDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      setDashboard(await fetchAccountDashboard());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Hesap merkezi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) void load();
    if (!authLoading && !user) setLoading(false);
  }, [authLoading, load, user]);

  const completion = useMemo(() => {
    if (!dashboard) return { percent: 0 };
    const required = dashboard.tasks.filter((task) => task.key !== "seller");
    const complete = required.filter((task) => task.complete).length;
    return { percent: required.length ? Math.round((complete / required.length) * 100) : 100 };
  }, [dashboard]);

  if (authLoading || loading) {
    return <div className="roleDashboardV24" aria-busy="true"><div className="dashboardLoadingV24"><span/><span/><span/><span/></div></div>;
  }

  if (!user) {
    return <div className="dashboardStateV24"><h2>Hesabına giriş yap</h2><p>Kişisel hesap merkezini görmek için oturum açmalısın.</p><Link href="/giris?returnTo=/profil">Giriş yap</Link></div>;
  }

  if (error || !dashboard) {
    return <div className="dashboardStateV24 dashboardErrorV24"><Icon name="warning"/><h2>Hesap özeti yüklenemedi</h2><p>{error || "Beklenmeyen bir bağlantı hatası oluştu."}</p><button type="button" onClick={() => void load()}><Icon name="refresh"/> Yeniden dene</button></div>;
  }

  const firstName = dashboard.identity.fullName.split(/\s+/)[0] || "Hoş geldin";
  const incompleteTasks = dashboard.tasks.filter((task) => !task.complete && task.key !== "seller");

  return (
    <div className="roleDashboardV24">
      <section className={`dashboardHeroV24 dashboardRole-${dashboard.role}`}>
        <div className="dashboardRoleIconV24"><Icon name={roleIcon(dashboard.role)}/></div>
        <div className="dashboardHeroCopyV24">
          <span>{roleLabel(dashboard.role, dashboard.identity.adminLevel)}</span>
          <h2>Merhaba {firstName}</h2>
          <p>{roleDescription(dashboard.role)}</p>
          <div className="dashboardIdentityChipsV24">
            {dashboard.identity.username && <small>@{dashboard.identity.username}</small>}
            <small className={dashboard.identity.emailVerified ? "complete" : "missing"}>{dashboard.identity.emailVerified ? "E-posta doğrulandı" : "E-posta eksik"}</small>
            <small className={dashboard.identity.phoneVerified ? "complete" : "missing"}>{dashboard.identity.phoneVerified ? "Telefon doğrulandı" : "Telefon eksik"}</small>
          </div>
        </div>
        <div className="dashboardHeroActionsV24">
          {dashboard.role === "buyer" && <Link href="/arama">Açık artırmaları keşfet</Link>}
          {dashboard.role === "seller" && <Link href="/ilan-olustur">Yeni ilan oluştur</Link>}
          {dashboard.role === "admin" && <Link href="/yonetim/kullanicilar">Kullanıcı yönetimi</Link>}
          <button type="button" onClick={() => void load()} aria-label="Hesap özetini yenile"><Icon name="refresh"/></button>
        </div>
      </section>

      {incompleteTasks.length > 0 && (
        <section className="dashboardCompletionV24">
          <div><span>HESAP HAZIRLIĞI</span><h3>Hesabını tamamla · %{completion.percent}</h3><p>{incompleteTasks[0]?.description}</p></div>
          <div className="dashboardCompletionProgressV24" aria-label={`Hesap tamamlanma oranı yüzde ${completion.percent}`}><i style={{ width: `${completion.percent}%` }}/></div>
          <Link href={incompleteTasks[0]?.href || "/ayarlar"}>Şimdi tamamla <Icon name="arrow"/></Link>
        </section>
      )}

      <section className="dashboardMetricsV24" aria-label="Hesap metrikleri">
        {dashboard.metrics.map((metric) => (
          <Link href={metric.href} key={metric.key} className={toneClass(metric.tone)}>
            <small>{metric.label}</small><strong>{metric.value}</strong><p>{metric.helper}</p><Icon name="arrow"/>
          </Link>
        ))}
      </section>

      <section className="dashboardMainGridV24">
        <article className="dashboardPanelV24">
          <header><div><span>ÖNCELİKLİ İŞLEMLER</span><h3>Hesap kontrol listesi</h3></div><b>{dashboard.tasks.filter((task) => task.complete).length}/{dashboard.tasks.length}</b></header>
          <div className="dashboardTaskListV24">
            {dashboard.tasks.map((task) => (
              <Link href={task.href} key={task.key} className={task.complete ? "complete" : task.important ? "important" : ""}>
                <span>{task.complete ? <Icon name="check"/> : <Icon name="warning"/>}</span>
                <div><b>{task.title}</b><p>{task.description}</p></div><Icon name="arrow"/>
              </Link>
            ))}
          </div>
        </article>

        <article className="dashboardPanelV24">
          <header><div><span>SON HAREKETLER</span><h3>Hesabındaki gelişmeler</h3></div><Link href="/bildirimler">Tümü</Link></header>
          {dashboard.activity.length ? <div className="dashboardActivityListV24">
            {dashboard.activity.map((item) => (
              <Link href={item.href} key={item.id} className={toneClass(item.tone)}>
                <span><Icon name="activity"/></span><div><b>{item.title}</b><p>{item.description}</p><small>{relativeTime(item.createdAt)}</small></div>
              </Link>
            ))}
          </div> : <div className="dashboardEmptyV24"><Icon name="activity"/><b>Henüz yeni hareket yok</b><p>Teklif, sipariş ve güvenlik gelişmeleri burada görünecek.</p></div>}
        </article>
      </section>

      <section className="dashboardPanelV24 dashboardWorkspaceV24">
        <header>
          <div><span>{dashboard.role === "admin" ? "OPERASYON" : dashboard.role === "seller" ? "İLANLAR" : "AÇIK ARTIRMALAR"}</span><h3>{dashboard.role === "admin" ? "Son güvenlik hareketleri" : dashboard.role === "seller" ? "Son ilanların" : "Katıldığın açık artırmalar"}</h3></div>
          <Link href={dashboard.role === "admin" ? "/yonetim" : dashboard.role === "seller" ? "/ilanlarim" : "/tekliflerim"}>Merkeze git</Link>
        </header>
        {dashboard.workspace.length ? <div className="dashboardWorkspaceListV24">
          {dashboard.workspace.map((item) => (
            <Link href={item.href} key={item.id}>
              <span className={toneClass(item.tone)}><Icon name="workspace"/></span>
              <div><b>{item.title}</b><p>{item.description}</p><small>{item.meta}</small></div>
              <em className={toneClass(item.tone)}>{item.status}</em><Icon name="arrow"/>
            </Link>
          ))}
        </div> : <div className="dashboardEmptyV24"><Icon name="workspace"/><b>{dashboard.role === "seller" ? "Henüz ilan bulunmuyor" : dashboard.role === "admin" ? "Yeni operasyon kaydı yok" : "Henüz teklif vermedin"}</b><p>{dashboard.role === "seller" ? "İlk ürününü yayınlayarak satışa başlayabilirsin." : dashboard.role === "buyer" ? "İlgini çeken bir açık artırmaya katıl." : "Yeni kayıtlar burada listelenecek."}</p>{dashboard.role === "seller" && <Link href="/ilan-olustur">İlan oluştur</Link>}{dashboard.role === "buyer" && <Link href="/arama">Ürünleri keşfet</Link>}</div>}
      </section>

      {dashboard.role === "buyer" && <section className="dashboardSellerCtaV24"><div><span>SATICI OL</span><h3>Kullanmadığın ürünleri açık artırmaya çıkar</h3><p>Satıcı doğrulamasını tamamla, mağazanı aç ve güvenli ödeme ile satış yap.</p></div><Link href="/satici-dogrulama">Satıcı başvurusunu başlat <Icon name="arrow"/></Link></section>}
      {dashboard.role === "seller" && dashboard.identity.storeSlug && <section className="dashboardSellerCtaV24"><div><span>MAĞAZAN</span><h3>Herkese açık mağazanı kontrol et</h3><p>İlanların, değerlendirmelerin ve satıcı güven göstergelerin müşterilere nasıl görünüyor incele.</p></div><Link href={`/magaza/${dashboard.identity.storeSlug}`}>Mağazayı görüntüle <Icon name="arrow"/></Link></section>}
    </div>
  );
}
