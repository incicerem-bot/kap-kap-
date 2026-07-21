"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { getSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

type MerchantType = "PERSONAL" | "PRIVATE_COMPANY" | "LIMITED_OR_JOINT_STOCK_COMPANY";
type OnboardingStatus = "not_started" | "pending" | "active" | "rejected" | "suspended";

type StatusPayload = {
  sellerId: string | null;
  sellerSlug: string | null;
  sellerName: string;
  onboardingStatus: OnboardingStatus;
  merchantType: MerchantType | null;
  maskedIban: string | null;
  providerExternalId: string | null;
  submittedAt: string | null;
  activatedAt: string | null;
  lastError: string | null;
  updatedAt: string | null;
};

type FormState = {
  merchantType: MerchantType;
  storeName: string;
  contactName: string;
  contactSurname: string;
  email: string;
  gsmNumber: string;
  address: string;
  iban: string;
  identityNumber: string;
  taxNumber: string;
  taxOffice: string;
  legalCompanyTitle: string;
  consent: boolean;
};

type IconName = "shield" | "store" | "bank" | "check" | "clock" | "alert" | "sync" | "lock" | "user" | "company" | "arrow";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.1 7.5 9.6 4.4-1.5 7.5-5 7.5-9.6V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/></>,
    store: <><path d="M4 9v11h16V9"/><path d="M3 9 5 3h14l2 6M8 20v-6h8v6"/></>,
    bank: <><path d="m3 10 9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
    sync: <><path d="M20 7h-6V1"/><path d="M20 7a8 8 0 1 0 1 8"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
    company: <><path d="M4 21V7l8-4 8 4v14"/><path d="M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-3h4v3"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const initialForm: FormState = {
  merchantType: "PERSONAL",
  storeName: "",
  contactName: "",
  contactSurname: "",
  email: "",
  gsmNumber: "",
  address: "",
  iban: "",
  identityNumber: "",
  taxNumber: "",
  taxOffice: "",
  legalCompanyTitle: "",
  consent: false,
};

const statusCopy: Record<OnboardingStatus, { title: string; description: string; icon: IconName }> = {
  not_started: { title: "Başvuru bekleniyor", description: "Satış gelirlerini alabilmek için ödeme hesabını oluştur.", icon: "bank" },
  pending: { title: "Başvuru işleniyor", description: "Bilgilerin iyzico alt üye sistemiyle eşleştiriliyor.", icon: "clock" },
  active: { title: "Ödeme hesabın aktif", description: "İlan yayınlayabilir ve teslimat sonrası satış gelirini alabilirsin.", icon: "check" },
  rejected: { title: "Başvuru tamamlanamadı", description: "Bilgilerini düzeltip başvuruyu yeniden gönderebilirsin.", icon: "alert" },
  suspended: { title: "Ödeme hesabı askıda", description: "Satış ödemeleri için destek ekibi incelemesi gerekiyor.", icon: "alert" },
};

function dateLabel(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function normalizeIbanInput(value: string) {
  return value.replace(/\s+/g, "").toUpperCase().slice(0, 26).replace(/(.{4})/g, "$1 ").trim();
}

export default function SellerOnboardingExperience() {
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const apiCall = useCallback(async (url: string, init?: RequestInit) => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("Oturum açmalısın.");
    const response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.message || "İşlem tamamlanamadı.");
    return body;
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = getSupabaseBrowserClient();
      const { data } = client ? await client.auth.getSession() : { data: { session: null } };
      const isSignedIn = Boolean(data.session);
      setSignedIn(isSignedIn);
      if (!isSignedIn) return;
      const body = await apiCall("/api/seller/onboarding");
      setStatus(body.status);
      setForm((current) => ({
        ...current,
        storeName: current.storeName || body.status?.sellerName || "",
        email: current.email || data.session?.user.email || "",
        merchantType: body.status?.merchantType || current.merchantType,
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Başvuru durumu alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  const active = status?.onboardingStatus === "active";
  const copy = statusCopy[status?.onboardingStatus ?? "not_started"];
  const companyFields = form.merchantType !== "PERSONAL";
  const privateCompany = form.merchantType === "PRIVATE_COMPANY";

  const completion = useMemo(() => {
    const base = [form.storeName, form.contactName, form.contactSurname, form.email, form.gsmNumber, form.address, form.iban];
    const extra = form.merchantType === "PERSONAL" ? [form.identityNumber] : privateCompany ? [form.identityNumber, form.taxNumber, form.taxOffice, form.legalCompanyTitle] : [form.taxNumber, form.taxOffice, form.legalCompanyTitle];
    const filled = [...base, ...extra].filter((item) => item.trim()).length + (form.consent ? 1 : 0);
    return Math.round((filled / (base.length + extra.length + 1)) * 100);
  }, [form, privateCompany]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, iban: form.iban.replace(/\s+/g, "") };
      const body = await apiCall("/api/seller/onboarding", { method: "POST", body: JSON.stringify(payload) });
      setStatus(body.status);
      await refreshProfile();
      setMessage("Satıcı hesabın ve ödeme yetkin başarıyla oluşturuldu.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Başvuru gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    setError("");
    setMessage("");
    try {
      const body = await apiCall("/api/seller/onboarding/sync", { method: "POST", body: "{}" });
      setStatus(body.status);
      await refreshProfile();
      setMessage("iyzico başvuru durumu ve satıcı yetkin yenilendi.");
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Başvuru durumu yenilenemedi.");
    } finally {
      setSyncing(false);
    }
  };

  if (!supabaseConfigured) {
    return <section className="sellerOnboardingStateV17"><Icon name="alert"/><h2>Supabase bağlantısı bulunamadı</h2><p>Satıcı doğrulama sistemi için Vercel ortam değişkenlerini tamamlamalısın.</p></section>;
  }

  if (loading) {
    return <section className="sellerOnboardingStateV17"><span className="sellerSpinnerV17"/><h2>Satıcı hesabın kontrol ediliyor</h2><p>Ödeme ve mağaza bilgileri güvenli şekilde hazırlanıyor.</p></section>;
  }

  if (signedIn === false) {
    return <section className="sellerOnboardingStateV17"><Icon name="lock"/><h2>Önce hesabına giriş yap</h2><p>Satıcı ödeme hesabı yalnızca giriş yapan kullanıcı adına oluşturulabilir.</p><Link href="/giris?returnTo=/satici-dogrulama">Giriş yap <Icon name="arrow"/></Link></section>;
  }

  return (
    <div className="sellerOnboardingV17">
      <section className={`sellerOnboardingHeroV17 status-${status?.onboardingStatus ?? "not_started"}`}>
        <div className="sellerOnboardingHeroIconV17"><Icon name={copy.icon}/></div>
        <div>
          <span>İYZİCO ALT ÜYE HESABI</span>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        <div className="sellerOnboardingHeroActionsV17">
          {status?.providerExternalId && !active && <button type="button" onClick={sync} disabled={syncing}><Icon name="sync"/>{syncing ? "Kontrol ediliyor" : "Durumu yenile"}</button>}
          {active && <Link href="/ilan-olustur">İlan oluştur <Icon name="arrow"/></Link>}
        </div>
      </section>

      {(message || error) && <div className={`sellerOnboardingNoticeV17 ${error ? "error" : "success"}`} role="status"><Icon name={error ? "alert" : "check"}/><span>{error || message}</span></div>}

      <section className="sellerOnboardingMetricsV17">
        <article><span><Icon name="store"/></span><div><small>Mağaza</small><strong>{status?.sellerName || "KapışKapış mağazan"}</strong><p>{status?.sellerSlug ? `/magaza/${status.sellerSlug}` : "Mağaza kaydı hazırlanıyor"}</p></div></article>
        <article><span><Icon name="bank"/></span><div><small>Ödeme hesabı</small><strong>{active ? "Aktif" : status?.onboardingStatus === "pending" ? "İşleniyor" : "Tamamlanmadı"}</strong><p>{status?.maskedIban || "IBAN henüz eklenmedi"}</p></div></article>
        <article><span><Icon name="shield"/></span><div><small>Satış güvenliği</small><strong>{active ? "Yayına hazır" : "%" + completion + " tamamlandı"}</strong><p>{active ? "Ödeme ve aktarım akışı açık" : "İlan yayınlamak için başvuruyu tamamla"}</p></div></article>
      </section>

      {active ? (
        <section className="sellerOnboardingActiveV17">
          <div className="sellerOnboardingActiveMarkV17"><Icon name="check"/></div>
          <div><span>DOĞRULAMA TAMAMLANDI</span><h3>Satış geliri hesabın hazır</h3><p>Ödeme sırasında satıcı eşleşmen otomatik yapılacak. Alt üye anahtarın yalnızca güvenli sunucu tarafında saklanıyor ve tarayıcıya gönderilmiyor.</p></div>
          <dl>
            <div><dt>Satıcı türü</dt><dd>{status?.merchantType === "PERSONAL" ? "Bireysel" : status?.merchantType === "PRIVATE_COMPANY" ? "Şahıs şirketi" : "Limited / anonim"}</dd></div>
            <div><dt>Aktivasyon</dt><dd>{dateLabel(status?.activatedAt ?? null)}</dd></div>
            <div><dt>IBAN</dt><dd>{status?.maskedIban || "Gizli"}</dd></div>
          </dl>
        </section>
      ) : (
        <form className="sellerOnboardingFormV17" onSubmit={submit}>
          <div className="sellerOnboardingFormHeadV17">
            <div><span>BAŞVURU FORMU</span><h3>Satıcı ödeme bilgileri</h3><p>Bilgiler yalnızca iyzico alt üye hesabını oluşturmak ve satış gelirlerini aktarmak için kullanılır.</p></div>
            <div className="sellerOnboardingProgressV17"><strong>%{completion}</strong><i><b style={{ width: `${completion}%` }}/></i><small>Form tamamlanma oranı</small></div>
          </div>

          <fieldset className="sellerMerchantTypesV17">
            <legend>Satıcı türü</legend>
            {([
              ["PERSONAL", "Bireysel satıcı", "Şirketi olmadan kendi adına satış yapan kullanıcı", "user"],
              ["PRIVATE_COMPANY", "Şahıs şirketi", "Vergi levhası bulunan gerçek kişi işletmesi", "store"],
              ["LIMITED_OR_JOINT_STOCK_COMPANY", "Limited / anonim", "Tüzel kişiliğe sahip şirket", "company"],
            ] as Array<[MerchantType, string, string, IconName]>).map(([value, title, helper, icon]) => (
              <label key={value} className={form.merchantType === value ? "active" : ""}>
                <input type="radio" name="merchantType" value={value} checked={form.merchantType === value} onChange={() => update("merchantType", value)}/>
                <span><Icon name={icon}/></span><div><strong>{title}</strong><small>{helper}</small></div>
              </label>
            ))}
          </fieldset>

          <div className="sellerOnboardingFieldsV17">
            <label><span>Mağaza adı</span><input value={form.storeName} onChange={(e) => update("storeName", e.target.value)} placeholder="Örn. TeknoCadde" maxLength={255} required/></label>
            <label><span>E-posta</span><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="satici@ornek.com" maxLength={200} required/></label>
            <label><span>Ad</span><input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} maxLength={100} required/></label>
            <label><span>Soyad</span><input value={form.contactSurname} onChange={(e) => update("contactSurname", e.target.value)} maxLength={100} required/></label>
            <label><span>Telefon</span><input type="tel" value={form.gsmNumber} onChange={(e) => update("gsmNumber", e.target.value)} placeholder="05xx xxx xx xx" maxLength={20} required/></label>
            <label><span>IBAN</span><input value={form.iban} onChange={(e) => update("iban", normalizeIbanInput(e.target.value))} placeholder="TR00 0000 0000 0000 0000 0000 00" maxLength={32} required/></label>
            {(form.merchantType === "PERSONAL" || privateCompany) && <label><span>T.C. kimlik numarası</span><input inputMode="numeric" value={form.identityNumber} onChange={(e) => update("identityNumber", e.target.value.replace(/\D/g, "").slice(0, 11))} maxLength={11} required/></label>}
            {companyFields && <label><span>Vergi numarası</span><input inputMode="numeric" value={form.taxNumber} onChange={(e) => update("taxNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} required/></label>}
            {companyFields && <label><span>Vergi dairesi</span><input value={form.taxOffice} onChange={(e) => update("taxOffice", e.target.value)} maxLength={255} required/></label>}
            {companyFields && <label className="wide"><span>Yasal şirket unvanı</span><input value={form.legalCompanyTitle} onChange={(e) => update("legalCompanyTitle", e.target.value)} maxLength={255} required/></label>}
            <label className="wide"><span>Açık adres</span><textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={4} maxLength={255} placeholder="Mahalle, cadde, sokak, bina ve daire bilgileri" required/></label>
          </div>

          <label className="sellerOnboardingConsentV17">
            <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)}/>
            <span><strong>Bilgi aktarımını onaylıyorum.</strong><small>Girdiğim gerçek satıcı bilgilerinin iyzico alt üye işyeri kaydı oluşturmak amacıyla paylaşılmasını ve KapışKapış tarafından güvenli şekilde işlenmesini kabul ediyorum.</small></span>
          </label>

          {status?.lastError && <div className="sellerOnboardingProviderErrorV17"><Icon name="alert"/><div><strong>Son başvuru mesajı</strong><p>{status.lastError}</p><small>Son güncelleme: {dateLabel(status.updatedAt)}</small></div></div>}

          <div className="sellerOnboardingSubmitV17">
            <div><Icon name="lock"/><p><strong>Hassas veriler tarayıcıda saklanmaz.</strong><span>T.C. kimlik ve vergi numarası düz metin olarak veritabanına yazılmaz; yalnız doğrulama sırasında iyzico’ya gönderilir.</span></p></div>
            <button type="submit" disabled={submitting || !form.consent}>{submitting ? "Başvuru gönderiliyor..." : status?.onboardingStatus === "rejected" ? "Bilgileri düzelt ve yeniden gönder" : "Ödeme hesabını oluştur"}<Icon name="arrow"/></button>
          </div>
        </form>
      )}

      <section className="sellerOnboardingStepsV17">
        <article><b>1</b><div><strong>Gerçek bilgilerini gir</strong><p>Satıcı türüne göre kimlik veya şirket bilgilerini tamamla.</p></div></article>
        <article><b>2</b><div><strong>iyzico alt üye kaydı oluşsun</strong><p>KapışKapış bilgileri güvenli sunucu üzerinden iyzico’ya iletir.</p></div></article>
        <article><b>3</b><div><strong>Satış gelirini güvenle al</strong><p>Alıcı teslimatı onayladığında hak edişin kayıtlı IBAN’a aktarılır.</p></div></article>
      </section>
    </div>
  );
}
