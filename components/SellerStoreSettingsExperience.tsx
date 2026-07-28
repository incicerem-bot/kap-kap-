"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const categoryOptions = ["Telefon", "Bilgisayar", "Oyun & Konsol", "Saat", "Koleksiyon", "Elektronik", "Ev & Yaşam", "Fotoğraf", "Parça & Donanım"];

type StoreRow = {
  seller_id: string;
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  location: string;
  about: string;
  categories: string[];
  logo_path: string | null;
  cover_path: string | null;
  shipping_note: string;
  return_note: string;
  platform_review_status: string;
  verified: boolean;
  is_active: boolean;
  store_setup_completed_at: string | null;
};

type StoreForm = {
  name: string;
  slug: string;
  tagline: string;
  location: string;
  about: string;
  categories: string[];
  shippingNote: string;
  returnNote: string;
  logoPath: string | null;
  coverPath: string | null;
};

const emptyForm: StoreForm = {
  name: "",
  slug: "",
  tagline: "",
  location: "",
  about: "",
  categories: [],
  shippingNote: "Siparişler güvenli paketlenerek anlaşmalı kargoya teslim edilir.",
  returnNote: "İade ve uyuşmazlık işlemleri KapışKapış güvenli ödeme kurallarına göre yürütülür.",
  logoPath: null,
  coverPath: null,
};

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function storageUrl(path: string | null) {
  const client = getSupabaseBrowserClient();
  if (!client || !path) return "";
  return client.storage.from("seller-assets").getPublicUrl(path).data.publicUrl;
}

function fileExtension(file: File) {
  const fallback = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  return file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || fallback;
}

export default function SellerStoreSettingsExperience() {
  const [form, setForm] = useState<StoreForm>(emptyForm);
  const [original, setOriginal] = useState<StoreRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data, error: rpcError } = await client.rpc("kk_get_my_store_profile");
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] as StoreRow | undefined : undefined;
      if (!row) throw new Error("Onaylı satıcı mağazası bulunamadı.");
      setOriginal(row);
      setForm({
        name: row.name || "",
        slug: row.slug || "",
        tagline: row.tagline || "",
        location: row.location || "",
        about: row.about || "",
        categories: Array.isArray(row.categories) ? row.categories : [],
        shippingNote: row.shipping_note || emptyForm.shippingNote,
        returnNote: row.return_note || emptyForm.returnNote,
        logoPath: row.logo_path,
        coverPath: row.cover_path,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Mağaza bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const completion = useMemo(() => {
    const checks = [
      form.name.trim().length >= 3,
      form.slug.trim().length >= 3,
      form.tagline.trim().length >= 3,
      form.location.trim().length >= 2,
      form.about.trim().length >= 20,
      form.categories.length > 0,
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [form]);

  function update<K extends keyof StoreForm>(key: K, value: StoreForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCategory(category: string) {
    setForm((current) => {
      const selected = current.categories.includes(category);
      if (!selected && current.categories.length >= 6) return current;
      return { ...current, categories: selected ? current.categories.filter((item) => item !== category) : [...current.categories, category] };
    });
  }

  async function uploadAsset(kind: "logo" | "cover", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Yalnızca JPG, PNG veya WEBP yükleyebilirsin.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Görsel en fazla 8 MB olabilir.");
      return;
    }

    setUploading(kind);
    setError("");
    setMessage("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) throw new Error("Oturumun süresi dolmuş. Yeniden giriş yap.");
      const path = `${userData.user.id}/${kind}-${Date.now()}.${fileExtension(file)}`;
      const { error: uploadError } = await client.storage.from("seller-assets").upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const previous = kind === "logo" ? form.logoPath : form.coverPath;
      update(kind === "logo" ? "logoPath" : "coverPath", path);
      if (previous) await client.storage.from("seller-assets").remove([previous]);
      setMessage(kind === "logo" ? "Mağaza logosu yüklendi. Kaydetmeyi unutma." : "Kapak görseli yüklendi. Kaydetmeyi unutma.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Görsel yüklenemedi.");
    } finally {
      setUploading(null);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
      const { data, error: rpcError } = await client.rpc("kk_update_my_store_profile", {
        p_name: form.name,
        p_slug: form.slug,
        p_tagline: form.tagline,
        p_location: form.location,
        p_about: form.about,
        p_categories: form.categories,
        p_shipping_note: form.shippingNote,
        p_return_note: form.returnNote,
        p_logo_path: form.logoPath,
        p_cover_path: form.coverPath,
      });
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] as StoreRow | undefined : undefined;
      if (!row) throw new Error("Mağaza bilgileri güncellenemedi.");
      setOriginal(row);
      setMessage(row.is_active ? "Mağaza bilgilerin kaydedildi ve vitrinin yayında." : "Mağaza bilgilerin kaydedildi.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Mağaza bilgileri kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className="storeSettingsLoadingV25"><span /><p>Mağaza bilgileri hazırlanıyor...</p></section>;

  if (error && !original) {
    return <section className="storeSettingsGateV25"><h2>Mağaza ayarları açılamadı</h2><p>{error}</p><div><Link href="/satici-dogrulama">Satıcı başvurusuna git</Link><button type="button" onClick={() => void load()}>Tekrar dene</button></div></section>;
  }

  const logoUrl = storageUrl(form.logoPath);
  const coverUrl = storageUrl(form.coverPath);

  return (
    <form className="storeSettingsV25" onSubmit={save}>
      {(error || message) && <button type="button" className={error ? "storeSettingsNoticeV25 error" : "storeSettingsNoticeV25"} onClick={() => { setError(""); setMessage(""); }}>{error || message}</button>}

      <section className="storeSettingsStatusV25">
        <div><span>MAĞAZA AÇILIŞI</span><h2>{original?.is_active ? "Mağazan yayında" : "Vitrinini tamamla"}</h2><p>{original?.is_active ? "Mağaza sayfan müşteriler tarafından görüntülenebilir." : "Zorunlu alanları tamamladığında mağazan otomatik olarak yayına alınır."}</p></div>
        <div className="storeCompletionV25"><strong>%{completion}</strong><span><i style={{ width: `${completion}%` }} /></span><small>Vitrin tamamlanma oranı</small></div>
        {original?.slug && <Link href={`/magaza/${original.slug}`} target="_blank">Mağazayı görüntüle</Link>}
      </section>

      <section className="storeVisualEditorV25">
        <div className="storeCoverPreviewV25" style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}>
          <label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadAsset("cover", event)} disabled={uploading !== null} /><span>{uploading === "cover" ? "Yükleniyor..." : "Kapak görselini değiştir"}</span></label>
        </div>
        <div className="storeLogoPreviewV25">
          {logoUrl ? <img src={logoUrl} alt="Mağaza logosu önizlemesi" /> : <strong>{form.name.slice(0, 2).toLocaleUpperCase("tr-TR") || "KK"}</strong>}
          <label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadAsset("logo", event)} disabled={uploading !== null} /><span>{uploading === "logo" ? "Yükleniyor..." : "Logo yükle"}</span></label>
        </div>
        <div className="storeVisualCopyV25"><span>MAĞAZA KİMLİĞİ</span><h2>{form.name || "Mağaza adın"}</h2><p>{form.tagline || "Kısa mağaza sloganın burada görünür."}</p><small>Logo için kare, kapak için yatay görsel kullan. En fazla 8 MB.</small></div>
      </section>

      <div className="storeSettingsGridV25">
        <section className="storeSettingsCardV25">
          <header><span>01</span><div><h2>Temel bilgiler</h2><p>Mağazanın müşterilere görünen kimliği.</p></div></header>
          <label>Mağaza adı<input value={form.name} maxLength={80} onChange={(event) => update("name", event.target.value)} onBlur={() => { if (!form.slug.trim()) update("slug", slugify(form.name)); }} required /></label>
          <label>Mağaza bağlantısı<div className="storeSlugFieldV25"><span>kapiskapis.com/magaza/</span><input value={form.slug} maxLength={60} onChange={(event) => update("slug", slugify(event.target.value))} required /></div></label>
          <label>Kısa slogan<input value={form.tagline} maxLength={140} onChange={(event) => update("tagline", event.target.value)} required /></label>
          <label>Konum<input value={form.location} maxLength={100} placeholder="İzmir, Karşıyaka" onChange={(event) => update("location", event.target.value)} required /></label>
          <label>Mağaza hakkında<textarea value={form.about} maxLength={1200} rows={7} onChange={(event) => update("about", event.target.value)} required /><small>{form.about.length}/1200</small></label>
        </section>

        <section className="storeSettingsCardV25">
          <header><span>02</span><div><h2>Kategoriler ve kurallar</h2><p>Uzmanlık alanlarını ve teslimat açıklamalarını belirle.</p></div></header>
          <fieldset><legend>Satış kategorileri <small>En fazla 6</small></legend><div className="storeCategoryPickerV25">{categoryOptions.map((category) => <button key={category} type="button" className={form.categories.includes(category) ? "active" : ""} onClick={() => toggleCategory(category)}>{category}</button>)}</div></fieldset>
          <label>Kargo açıklaması<textarea value={form.shippingNote} maxLength={500} rows={4} onChange={(event) => update("shippingNote", event.target.value)} required /><small>{form.shippingNote.length}/500</small></label>
          <label>İade ve uyuşmazlık açıklaması<textarea value={form.returnNote} maxLength={500} rows={4} onChange={(event) => update("returnNote", event.target.value)} required /><small>{form.returnNote.length}/500</small></label>
          <aside className="storeRulesInfoV25"><strong>Değiştirilemeyen güven bilgileri</strong><p>Doğrulanmış satıcı rozeti, satış puanı, kargo performansı ve iptal oranı sistem tarafından hesaplanır. Satıcı bu alanları kendisi değiştiremez.</p></aside>
        </section>
      </div>

      <footer className="storeSettingsFooterV25"><div><strong>{original?.platform_review_status === "approved" ? "KapışKapış mağaza onayı tamamlandı" : "Mağaza onayı bekleniyor"}</strong><span>Kaydettiğinde uygun mağaza otomatik olarak yayına alınır.</span></div><button type="submit" disabled={saving || uploading !== null}>{saving ? "Kaydediliyor..." : "Mağazayı kaydet"}</button></footer>
    </form>
  );
}
