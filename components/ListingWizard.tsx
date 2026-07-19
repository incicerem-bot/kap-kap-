"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

type IconName =
  | "phone"
  | "computer"
  | "game"
  | "electronics"
  | "home"
  | "collection"
  | "item"
  | "other"
  | "camera"
  | "trash"
  | "star"
  | "check"
  | "shield"
  | "truck"
  | "person"
  | "box"
  | "arrow"
  | "save"
  | "info";

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
    phone: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></>,
    computer: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    game: <><path d="M8 8h8a5 5 0 0 1 4.7 6.7l-1 3a2 2 0 0 1-3.3.8L14 16h-4l-2.4 2.5a2 2 0 0 1-3.3-.8l-1-3A5 5 0 0 1 8 8Z"/><path d="M8 11v4M6 13h4M16.5 12.5h.01M18.5 14.5h.01"/></>,
    electronics: <><path d="M5 5h14v14H5z"/><path d="M9 9h6v6H9zM2 9h3M19 9h3M2 15h3M19 15h3M9 2v3M15 2v3M9 19v3M15 19v3"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    collection: <><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 3h8v3M8 11h8M8 15h5"/></>,
    item: <><path d="m12 3 2.1 5.2L20 10l-4.5 3.7L17 20l-5-3-5 3 1.5-6.3L4 10l5.9-1.8L12 3Z"/></>,
    other: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9H2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></>,
    trash: <><path d="M4 7h16M9 3h6l1 4M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
    star: <path d="m12 3 2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L12 3Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    shield: <><path d="M12 3 4.5 6v5.4c0 4.6 3.1 8.1 7.5 9.6 4.4-1.5 7.5-5 7.5-9.6V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    person: <><path d="M3 20a9 9 0 0 1 18 0"/><circle cx="12" cy="7" r="4"/></>,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    save: <><path d="M5 3h12l2 2v16H5V3Z"/><path d="M8 3v6h8V3M8 21v-8h8v8"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

type Category = {
  name: string;
  icon: IconName;
  helper: string;
};

type PhotoItem = {
  id: string;
  src: string;
  name: string;
  local?: boolean;
};

type FormState = {
  title: string;
  condition: string;
  brand: string;
  model: string;
  storage: string;
  description: string;
  startPrice: string;
  reservePrice: string;
  buyNowPrice: string;
  increment: string;
  duration: string;
  shipping: string;
  shippingPayer: string;
  delivery: string;
};

const steps = ["Kategori", "Ürün bilgileri", "Fotoğraflar", "Açık artırma", "Teslimat", "Kontrol"];

const categories: Category[] = [
  { name: "Telefon", icon: "phone", helper: "Telefon ve aksesuar" },
  { name: "Bilgisayar", icon: "computer", helper: "Laptop, masaüstü, parça" },
  { name: "Oyun & Konsol", icon: "game", helper: "Konsol ve oyun ekipmanı" },
  { name: "Elektronik", icon: "electronics", helper: "Kamera, ses ve teknoloji" },
  { name: "Ev & Yaşam", icon: "home", helper: "Mobilya ve ev ürünleri" },
  { name: "Koleksiyon", icon: "collection", helper: "Nadir ve özel parçalar" },
  { name: "Nadir Oyun İtemleri", icon: "item", helper: "Dijital oyun ürünleri" },
  { name: "Diğer", icon: "other", helper: "Diğer kategoriler" },
];

const initialPhotos: PhotoItem[] = [
  { id: "demo-1", src: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=88", name: "iPhone ön görünüm" },
  { id: "demo-2", src: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85", name: "iPhone arka görünüm" },
  { id: "demo-3", src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85", name: "iPhone detay" },
];

const initialForm: FormState = {
  title: "iPhone 15 Pro Max 256 GB Titanyum Siyah",
  condition: "İkinci El - Çok İyi",
  brand: "Apple",
  model: "iPhone 15 Pro Max",
  storage: "256 GB",
  description: "Cihaz temiz kullanılmıştır. Ekranında veya kasasında belirgin çizik bulunmuyor. Kutu, şarj kablosu ve fatura ile gönderilecektir.",
  startPrice: "10000",
  reservePrice: "20000",
  buyNowPrice: "35000",
  increment: "250",
  duration: "7 Gün",
  shipping: "KapışKapış Kargo",
  shippingPayer: "Alıcı Öder",
  delivery: "1-2 İş Günü",
};

function priceNumber(value: string) {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

function formatPrice(value: string) {
  const amount = priceNumber(value);
  return `${new Intl.NumberFormat("tr-TR").format(amount)} TL`;
}

export default function ListingWizard() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("Telefon");
  const [form, setForm] = useState<FormState>(initialForm);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [coverId, setCoverId] = useState(initialPhotos[0].id);
  const [published, setPublished] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [draftStatus, setDraftStatus] = useState("Taslak kaydedilmedi");
  const localUrls = useRef<string[]>([]);

  useEffect(() => () => {
    localUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const coverPhoto = photos.find((photo) => photo.id === coverId) ?? photos[0];

  const setField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setDraftStatus("Kaydedilmemiş değişiklikler");
  };

  const validateStep = () => {
    if (step === 1) {
      if (form.title.trim().length < 10) return "İlan başlığı en az 10 karakter olmalı.";
      if (!form.brand.trim() || !form.model.trim()) return "Marka ve model bilgilerini doldurmalısın.";
      if (form.description.trim().length < 30) return "Açıklama en az 30 karakter olmalı.";
    }
    if (step === 2 && photos.length < 3) return "İlanı yayınlamak için en az 3 fotoğraf eklemelisin.";
    if (step === 3) {
      const start = priceNumber(form.startPrice);
      const reserve = priceNumber(form.reservePrice);
      const buyNow = priceNumber(form.buyNowPrice);
      if (start < 100) return "Başlangıç fiyatı en az 100 TL olmalı.";
      if (reserve && reserve < start) return "Gizli taban fiyat başlangıç fiyatından düşük olamaz.";
      if (buyNow && buyNow <= start) return "Hemen al fiyatı başlangıç fiyatından yüksek olmalı.";
    }
    if (step === 5 && !accepted) return "İlan kurallarını kabul ederek devam etmelisin.";
    return "";
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (step === steps.length - 1) {
      setPublished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previousStep = () => {
    setError("");
    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDraft = () => {
    setDraftStatus("Taslak şimdi kaydedildi");
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, 10 - photos.length));
    if (!files.length) return;

    const added = files.map((file, index) => {
      const src = URL.createObjectURL(file);
      localUrls.current.push(src);
      return { id: `local-${Date.now()}-${index}`, src, name: file.name, local: true };
    });

    setPhotos((current) => [...current, ...added]);
    if (!photos.length && added[0]) setCoverId(added[0].id);
    setDraftStatus("Kaydedilmemiş değişiklikler");
    setError("");
    event.target.value = "";
  };

  const removePhoto = (photo: PhotoItem) => {
    if (photo.local) URL.revokeObjectURL(photo.src);
    const remaining = photos.filter((item) => item.id !== photo.id);
    setPhotos(remaining);
    if (coverId === photo.id && remaining[0]) setCoverId(remaining[0].id);
    setDraftStatus("Kaydedilmemiş değişiklikler");
  };

  if (published) {
    return (
      <section className="publishSuccessV4">
        <div className="publishSuccessGlowV4" />
        <div className="publishSuccessIconV4"><Icon name="check" /></div>
        <span>İLAN YAYINDA</span>
        <h1>Açık artırman başladı</h1>
        <p>İlanın başarıyla yayınlandı. Teklifleri satış merkezinden anlık olarak takip edebilirsin.</p>
        <div className="publishListingNumberV4"><span>İlan numarası</span><strong>#985421</strong></div>
        <div className="publishSuccessActionsV4">
          <Link href="/urun/iphone-15-pro">İlanı görüntüle <Icon name="arrow" /></Link>
          <Link href="/ilanlarim">İlanlarıma git</Link>
        </div>
        <button type="button" onClick={() => { setPublished(false); setStep(0); setAccepted(false); }}>Yeni ilan oluştur</button>
      </section>
    );
  }

  return (
    <div className="listingWizardShellV4">
      <aside className="listingProgressPanelV4">
        <div className="listingProgressIntroV4">
          <span>İLAN OLUŞTURMA</span>
          <h1>Ürününü satışa hazırla</h1>
          <p>Doğru bilgiler ve kaliteli fotoğraflar daha fazla teklif almanı sağlar.</p>
        </div>

        <div className="listingProgressBarV4"><span style={{ width: `${progress}%` }} /></div>
        <ol className="listingStepsV4">
          {steps.map((label, index) => (
            <li key={label} className={index === step ? "active" : index < step ? "done" : ""}>
              <button type="button" onClick={() => index < step && setStep(index)} disabled={index > step}>
                <b>{index < step ? <Icon name="check" /> : index + 1}</b>
                <span><strong>{label}</strong><small>{index < step ? "Tamamlandı" : index === step ? "Şu an bu adımdasın" : "Bekliyor"}</small></span>
              </button>
            </li>
          ))}
        </ol>

        <div className="listingTrustNoteV4">
          <Icon name="shield" />
          <div><strong>Güvenli satış koruması</strong><p>Ödeme, ürün alıcıya ulaşana kadar güvenli hesapta tutulur.</p></div>
        </div>
      </aside>

      <section className="listingWizardMainV4">
        <div className="listingWizardTopV4">
          <div><span>ADIM {step + 1} / {steps.length}</span><strong>{steps[step]}</strong></div>
          <button type="button" onClick={saveDraft}><Icon name="save" /> Taslağı kaydet</button>
        </div>
        <div className="draftStatusV4" aria-live="polite">{draftStatus}</div>

        {step === 0 && (
          <div className="listingStageV4">
            <div className="listingStageHeadV4"><span>KATEGORİ</span><h2>Ürününü en doğru kategoriye yerleştir</h2><p>Doğru kategori, ilanının ilgili alıcılara daha hızlı ulaşmasını sağlar.</p></div>
            <div className="listingCategoryGridV4">
              {categories.map((item) => (
                <button type="button" key={item.name} className={category === item.name ? "selected" : ""} onClick={() => { setCategory(item.name); setDraftStatus("Kaydedilmemiş değişiklikler"); }}>
                  <span><Icon name={item.icon} /></span>
                  <div><b>{item.name}</b><small>{item.helper}</small></div>
                  <i>{category === item.name && <Icon name="check" />}</i>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="listingStageV4">
            <div className="listingStageHeadV4"><span>ÜRÜN BİLGİLERİ</span><h2>Alıcının bilmesi gerekenleri yaz</h2><p>Başlık ve açıklamada ürünün gerçek durumunu açıkça belirt.</p></div>
            <div className="listingFormV4">
              <label className="fullV4"><span>İlan başlığı <b>*</b></span><input value={form.title} onChange={(event) => setField("title", event.target.value)} maxLength={80} placeholder="Örn. iPhone 15 Pro Max 256 GB"/><small>{form.title.length}/80</small></label>
              <label><span>Kategori</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
              <label><span>Ürün durumu <b>*</b></span><select value={form.condition} onChange={(event) => setField("condition", event.target.value)}><option>Yeni</option><option>İkinci El - Yeni Gibi</option><option>İkinci El - Çok İyi</option><option>İkinci El - İyi</option><option>İkinci El - Kullanılmış</option></select></label>
              <label><span>Marka <b>*</b></span><input value={form.brand} onChange={(event) => setField("brand", event.target.value)} placeholder="Apple"/></label>
              <label><span>Model <b>*</b></span><input value={form.model} onChange={(event) => setField("model", event.target.value)} placeholder="iPhone 15 Pro Max"/></label>
              <label className="fullV4"><span>Varyant / özellik</span><input value={form.storage} onChange={(event) => setField("storage", event.target.value)} placeholder="256 GB, Titanyum Siyah"/></label>
              <label className="fullV4 listingTextareaV4"><span>Ürün açıklaması <b>*</b></span><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} maxLength={2000} rows={8} placeholder="Ürünün kullanım süresi, kozmetik durumu, kutu ve aksesuar bilgilerini yaz."/><small>{form.description.length}/2000</small></label>
            </div>
            <div className="listingInfoBoxV4"><Icon name="info" /><p><b>Güven veren açıklama yaz.</b> Kusurları gizlemek yerine açıkça belirtmek, satış sonrası anlaşmazlık riskini azaltır.</p></div>
          </div>
        )}

        {step === 2 && (
          <div className="listingStageV4">
            <div className="listingStageHeadV4"><span>FOTOĞRAFLAR</span><h2>Ürünü her açıdan göster</h2><p>En az 3, en fazla 10 fotoğraf yükleyebilirsin. İlk fotoğraf ilan kapağıdır.</p></div>
            <div className="photoCounterV4"><b>{photos.length}/10 fotoğraf</b><span>{photos.length >= 3 ? "Yayınlamak için yeterli" : `${3 - photos.length} fotoğraf daha gerekli`}</span></div>
            <div className="listingPhotoGridV4">
              {photos.map((photo) => (
                <article key={photo.id} className={coverId === photo.id ? "cover" : ""}>
                  <img src={photo.src} alt={photo.name} />
                  {coverId === photo.id && <span className="coverBadgeV4"><Icon name="star" /> Kapak</span>}
                  <div className="photoActionsV4">
                    {coverId !== photo.id && <button type="button" onClick={() => setCoverId(photo.id)} aria-label="Kapak fotoğrafı yap"><Icon name="star" /></button>}
                    <button type="button" onClick={() => removePhoto(photo)} aria-label="Fotoğrafı sil"><Icon name="trash" /></button>
                  </div>
                </article>
              ))}
              {photos.length < 10 && <label className="listingPhotoUploadV4"><Icon name="camera" /><b>Fotoğraf ekle</b><small>JPG veya PNG · En fazla 10 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoUpload}/></label>}
            </div>
            <div className="listingPhotoTipsV4"><div><Icon name="check" /><span>Gün ışığında net çekim</span></div><div><Icon name="check" /><span>Kusurları yakın planda göster</span></div><div><Icon name="check" /><span>Kutu ve aksesuarları ekle</span></div></div>
          </div>
        )}

        {step === 3 && (
          <div className="listingStageV4">
            <div className="listingStageHeadV4"><span>AÇIK ARTIRMA</span><h2>Fiyat ve süreyi belirle</h2><p>Rekabeti artıracak bir başlangıç fiyatı seç. Gizli taban fiyat alıcılara gösterilmez.</p></div>
            <div className="listingAuctionLayoutV4">
              <div className="listingFormV4">
                <label><span>Başlangıç fiyatı <b>*</b></span><div className="priceInputV4"><input inputMode="numeric" value={form.startPrice} onChange={(event) => setField("startPrice", event.target.value)} /><i>TL</i></div><small>Teklifler bu tutardan başlar.</small></label>
                <label><span>Gizli taban fiyat</span><div className="priceInputV4"><input inputMode="numeric" value={form.reservePrice} onChange={(event) => setField("reservePrice", event.target.value)} /><i>TL</i></div><small>Bu tutarın altında satış gerçekleşmez.</small></label>
                <label><span>Açık artırma süresi</span><select value={form.duration} onChange={(event) => setField("duration", event.target.value)}><option>1 Gün</option><option>3 Gün</option><option>5 Gün</option><option>7 Gün</option><option>10 Gün</option></select></label>
                <label><span>Teklif artış adımı</span><select value={form.increment} onChange={(event) => setField("increment", event.target.value)}><option value="100">100 TL</option><option value="250">250 TL</option><option value="500">500 TL</option><option value="1000">1.000 TL</option></select></label>
                <label className="fullV4"><span>Hemen al fiyatı <em>İsteğe bağlı</em></span><div className="priceInputV4"><input inputMode="numeric" value={form.buyNowPrice} onChange={(event) => setField("buyNowPrice", event.target.value)} /><i>TL</i></div><small>Alıcı bu tutarı ödeyerek açık artırmayı anında bitirebilir.</small></label>
              </div>
              <aside className="auctionPricePreviewV4">
                <span>FİYAT ÖZETİ</span>
                <div><small>Başlangıç</small><strong>{formatPrice(form.startPrice)}</strong></div>
                <p><span>Gizli taban</span><b>{formatPrice(form.reservePrice)}</b></p>
                <p><span>Artış adımı</span><b>{formatPrice(form.increment)}</b></p>
                <p><span>Hemen al</span><b>{formatPrice(form.buyNowPrice)}</b></p>
                <div className="pricePreviewNoteV4"><Icon name="shield" /><small>Satış gerçekleşmeden ücret alınmaz.</small></div>
              </aside>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="listingStageV4">
            <div className="listingStageHeadV4"><span>TESLİMAT</span><h2>Ürünün alıcıya nasıl ulaşacağını seç</h2><p>Takipli ve sigortalı gönderim, hem seni hem alıcıyı korur.</p></div>
            <div className="shippingOptionsV4">
              {[
                { name: "KapışKapış Kargo", icon: "truck" as IconName, helper: "Anlaşmalı, takipli ve sigortalı gönderim", badge: "Önerilen" },
                { name: "Kendi Kargom", icon: "box" as IconName, helper: "Kargo firmasını ve gönderimi kendin yönet", badge: "" },
                { name: "Elden Teslim", icon: "person" as IconName, helper: "Alıcıyla güvenli bir noktada buluş", badge: "" },
              ].map((option) => (
                <button type="button" key={option.name} className={form.shipping === option.name ? "selected" : ""} onClick={() => setField("shipping", option.name)}>
                  <span><Icon name={option.icon} /></span><div><b>{option.name}{option.badge && <em>{option.badge}</em>}</b><small>{option.helper}</small></div><i>{form.shipping === option.name && <Icon name="check" />}</i>
                </button>
              ))}
            </div>
            <div className="listingFormV4 shippingFieldsV4">
              <label><span>Kargo ücretini kim öder?</span><select value={form.shippingPayer} onChange={(event) => setField("shippingPayer", event.target.value)}><option>Alıcı Öder</option><option>Satıcı Öder</option></select></label>
              <label><span>Kargoya teslim süresi</span><select value={form.delivery} onChange={(event) => setField("delivery", event.target.value)}><option>Aynı Gün</option><option>1-2 İş Günü</option><option>3 İş Günü</option><option>5 İş Günü</option></select></label>
            </div>
            <div className="listingInfoBoxV4 secureV4"><Icon name="shield" /><p><b>KapışKapış Güvenli Ödeme:</b> Alıcının ödemesi teslimat onaylanana kadar güvenli hesapta tutulur.</p></div>
          </div>
        )}

        {step === 5 && (
          <div className="listingStageV4">
            <div className="listingStageHeadV4"><span>SON KONTROL</span><h2>İlanını yayınlamadan önce kontrol et</h2><p>Bilgiler doğruysa ilanını hemen açık artırmaya çıkarabilirsin.</p></div>
            <div className="listingPreviewLayoutV4">
              <article className="listingPreviewCardV4">
                <div className="listingPreviewImageV4">{coverPhoto && <img src={coverPhoto.src} alt="İlan kapak fotoğrafı"/>}<span>{form.condition}</span></div>
                <div className="listingPreviewBodyV4"><small>{category}</small><h3>{form.title}</h3><p>{form.brand} · {form.model} · {form.storage}</p><div><span>Başlangıç fiyatı</span><strong>{formatPrice(form.startPrice)}</strong></div><button type="button">Teklif Ver</button></div>
              </article>
              <article className="listingReviewV4">
                <div className="listingReviewHeadV4"><div><span>İLAN ÖZETİ</span><h3>Yayınlanacak bilgiler</h3></div><button type="button" onClick={() => setStep(1)}>Düzenle</button></div>
                <dl>
                  <div><dt>Kategori</dt><dd>{category}</dd></div>
                  <div><dt>Ürün durumu</dt><dd>{form.condition}</dd></div>
                  <div><dt>Başlangıç fiyatı</dt><dd>{formatPrice(form.startPrice)}</dd></div>
                  <div><dt>Gizli taban fiyat</dt><dd>{formatPrice(form.reservePrice)}</dd></div>
                  <div><dt>Açık artırma süresi</dt><dd>{form.duration}</dd></div>
                  <div><dt>Teklif artış adımı</dt><dd>{formatPrice(form.increment)}</dd></div>
                  <div><dt>Teslimat</dt><dd>{form.shipping}</dd></div>
                  <div><dt>Kargo ücreti</dt><dd>{form.shippingPayer}</dd></div>
                </dl>
              </article>
            </div>
            <label className="listingAgreementV4"><input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setError(""); }}/><span><b>İlan bilgilerinin doğru olduğunu onaylıyorum.</b> KapışKapış ilan kurallarını ve güvenli ödeme koşullarını kabul ediyorum.</span></label>
          </div>
        )}

        {error && <div className="listingErrorV4" role="alert"><Icon name="info" />{error}</div>}

        <footer className="listingWizardFooterV4">
          <div><span>{step + 1}. adım</span><small>{steps[step]}</small></div>
          <div>
            {step > 0 && <button type="button" className="listingBackV4" onClick={previousStep}>Geri</button>}
            <button type="button" className="listingNextV4" onClick={nextStep}>{step === steps.length - 1 ? "İlanı yayınla" : "Devam et"}<Icon name="arrow" /></button>
          </div>
        </footer>
      </section>
    </div>
  );
}
