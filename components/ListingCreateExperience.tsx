"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type SaleType = "auction" | "fixed";
type Notice = { type: "success" | "error" | "info"; text: string } | null;
type PhotoItem = { id: string; file: File; preview: string };

type IconName = "gavel" | "tag" | "camera" | "check" | "shield" | "truck" | "box" | "arrow" | "trash" | "save";

const categories = [
  { id: "pc-games", db: "gaming", label: "Bilgisayar Oyunları" },
  { id: "xbox-games", db: "gaming", label: "Xbox Oyunları" },
  { id: "playstation-games", db: "gaming", label: "PlayStation Oyunları" },
  { id: "steam-games", db: "gaming", label: "Steam Oyunları" },
  { id: "knight-online", db: "gaming", label: "Knight Online İtemleri" },
  { id: "metin2", db: "gaming", label: "Metin2 İtemleri" },
  { id: "cs2", db: "gaming", label: "CS2 İtemleri" },
  { id: "limited-gaming", db: "collection", label: "Özel Seri Oyuncu Ürünleri" },
] as const;

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
  const icons: Record<IconName, ReactNode> = {
    gavel: <><path d="m14 5 5 5"/><path d="m12 7 5 5"/><path d="m4 20 8-8"/><path d="m9 4 4-2 6 6-2 4Z"/><path d="M3 21h10"/></>,
    tag: <><path d="M20 13 13 20l-9-9V4h7Z"/><circle cx="8.5" cy="8.5" r="1"/></>,
    camera: <><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11h18V7a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
    truck: <><path d="M3 6h11v10H3Z"/><path d="M14 9h4l3 3v4h-7Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    box: <><path d="m4 7 8-4 8 4-8 4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4Z"/><path d="M12 11v10"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    trash: <><path d="M4 7h16"/><path d="m9 7 1-3h4l1 3"/><path d="m7 7 1 14h8l1-14"/></>,
    save: <><path d="M5 3h12l2 2v16H5Z"/><path d="M8 3v6h8V3"/><path d="M8 21v-7h8v7"/></>,
  };
  return <svg {...common}>{icons[name]}</svg>;
}

function numeric(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ListingCreateExperience() {
  const router = useRouter();
  const [saleType, setSaleType] = useState<SaleType>("auction");
  const [categoryId, setCategoryId] = useState("pc-games");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("good");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("İzmir");
  const [warrantyStatus, setWarrantyStatus] = useState("none");
  const [boxContents, setBoxContents] = useState("");
  const [shippingMethod, setShippingMethod] = useState("kapiskapis");
  const [shippingPayer, setShippingPayer] = useState("buyer");
  const [startPrice, setStartPrice] = useState("1000");
  const [minIncrement, setMinIncrement] = useState("100");
  const [reservePrice, setReservePrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("1000");
  const [durationHours, setDurationHours] = useState("24");
  const [stock, setStock] = useState("1");
  const [specificationNote, setSpecificationNote] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [savedListingId, setSavedListingId] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === categoryId) ?? categories[2],
    [categoryId],
  );

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!incoming.length) return;

    const invalid = incoming.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (invalid) {
      setNotice({ type: "error", text: "Yalnız JPG, PNG veya WEBP fotoğraf yükleyebilirsin." });
      return;
    }
    const oversized = incoming.find((file) => file.size > 10 * 1024 * 1024);
    if (oversized) {
      setNotice({ type: "error", text: `${oversized.name} 10 MB sınırını aşıyor.` });
      return;
    }
    if (photos.length + incoming.length > 8) {
      setNotice({ type: "error", text: "Bir ilana en fazla 8 fotoğraf eklenebilir." });
      return;
    }

    const items = incoming.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((current) => [...current, ...items]);
    setNotice(null);
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
  }

  function validate(publish: boolean) {
    if (title.trim().length < 8) return "İlan başlığı en az 8 karakter olmalı.";
    if (description.trim().length < 40) return "Ürünü açıkça anlatan en az 40 karakterlik açıklama yaz.";
    if (!location.trim()) return "Ürünün bulunduğu şehri yaz.";
    if (publish && photos.length < 3) return "İlanı yayınlamak için en az 3 fotoğraf eklemelisin.";
    if (saleType === "auction") {
      if (numeric(startPrice) <= 0 || numeric(minIncrement) <= 0) return "Başlangıç fiyatı ve teklif artışı sıfırdan büyük olmalı.";
      if (reservePrice && numeric(reservePrice) < numeric(startPrice)) return "Gizli taban fiyat başlangıç fiyatından düşük olamaz.";
    } else if (numeric(buyNowPrice) <= 0) {
      return "Sabit satış fiyatı sıfırdan büyük olmalı.";
    }
    return "";
  }

  async function saveListing(publish: boolean) {
    const validationError = validate(publish);
    if (validationError) {
      setNotice({ type: "error", text: validationError });
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setNotice({ type: "error", text: "Supabase bağlantısı yapılandırılmamış." });
      return;
    }

    setSaving(true);
    setNotice({ type: "info", text: "İlan taslağın güvenli şekilde hazırlanıyor…" });
    setSavedListingId("");

    try {
      const { data: userResult, error: userError } = await client.auth.getUser();
      if (userError || !userResult.user) throw new Error("İlan oluşturmak için yeniden giriş yapmalısın.");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        saleType,
        category: selectedCategory.db,
        subcategory: selectedCategory.label,
        condition,
        brand: brand.trim(),
        model: model.trim(),
        location: location.trim(),
        warrantyStatus,
        boxContents: boxContents.trim(),
        shippingMethod,
        shippingPayer,
        startPrice: numeric(startPrice),
        minIncrement: numeric(minIncrement),
        reservePrice: reservePrice ? numeric(reservePrice) : null,
        buyNowPrice: saleType === "fixed" ? numeric(buyNowPrice) : null,
        durationHours: numeric(durationHours),
        stock: saleType === "fixed" ? numeric(stock) : 1,
        specifications: specificationNote.trim() ? { note: specificationNote.trim() } : {},
      };

      const { data: createdRaw, error: createError } = await client.rpc("kk_create_listing_draft", { p_payload: payload });
      if (createError) throw createError;

      const created = (Array.isArray(createdRaw) ? createdRaw[0] : createdRaw) as { id?: string; slug?: string } | null;
      const listingId = created?.id;
      if (!listingId) throw new Error("İlan taslağı oluşturuldu ancak ilan kimliği alınamadı.");
      setSavedListingId(listingId);

      const uploadedPaths: string[] = [];
      try {
        for (let index = 0; index < photos.length; index += 1) {
          const photo = photos[index];
          const extension = photo.file.name.split(".").pop()?.toLowerCase() || "jpg";
          const storagePath = `${userResult.user.id}/${listingId}/${String(index + 1).padStart(2, "0")}-${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await client.storage
            .from("listing-assets")
            .upload(storagePath, photo.file, { cacheControl: "3600", upsert: false });
          if (uploadError) throw uploadError;
          uploadedPaths.push(storagePath);

          const { error: attachError } = await client.rpc("kk_attach_listing_image", {
            p_listing_id: listingId,
            p_storage_path: storagePath,
            p_sort_order: index,
          });
          if (attachError) throw attachError;
        }
      } catch (photoError) {
        if (uploadedPaths.length) await client.storage.from("listing-assets").remove(uploadedPaths);
        throw new Error(`Taslak oluşturuldu fakat fotoğraflar tamamlanamadı: ${photoError instanceof Error ? photoError.message : "Yükleme hatası"}`);
      }

      if (publish) {
        const { error: publishError } = await client.rpc("kk_publish_listing", { p_listing_id: listingId });
        if (publishError) {
          setNotice({
            type: "info",
            text: `İlan taslak olarak kaydedildi. Yayın için kalan kontrol: ${publishError.message}`,
          });
          return;
        }
      }

      photos.forEach((item) => URL.revokeObjectURL(item.preview));
      setNotice({ type: "success", text: publish ? "İlanın yayınlandı." : "İlanın taslak olarak kaydedildi." });
      router.push(`/ilanlarim?created=${encodeURIComponent(listingId)}`);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "İlan kaydedilemedi." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="listingCreateV27" onSubmit={(event) => { event.preventDefault(); void saveListing(false); }}>
      {notice && <div className={`listingNoticeV27 ${notice.type}`}>{notice.text}</div>}
      {savedListingId && notice?.type !== "success" && (
        <div className="listingSavedDraftV27"><Icon name="save" /><p><strong>Taslağın kaybolmadı</strong><span>İlanlarım ekranından yayına hazırlamaya devam edebilirsin.</span></p><Link href="/ilanlarim">Taslağı aç <Icon name="arrow" /></Link></div>
      )}

      <section className="listingSaleTypeV27">
        <button type="button" className={saleType === "auction" ? "active auction" : "auction"} onClick={() => setSaleType("auction")}>
          <i><Icon name="gavel" /></i><span><b>Açık artırma</b><small>Teklifler yarışır, süre sonunda en yüksek teklif kazanır.</small></span><em>{saleType === "auction" && <Icon name="check" />}</em>
        </button>
        <button type="button" className={saleType === "fixed" ? "active fixed" : "fixed"} onClick={() => setSaleType("fixed")}>
          <i><Icon name="tag" /></i><span><b>Sabit fiyat</b><small>Ürünü belirlediğin net fiyat üzerinden doğrudan sat.</small></span><em>{saleType === "fixed" && <Icon name="check" />}</em>
        </button>
      </section>

      <div className="listingCreateGridV27">
        <div className="listingCreateMainV27">
          <section className="listingFormCardV27">
            <header><span>01</span><div><small>ÜRÜN BİLGİLERİ</small><h2>Ne satıyorsun?</h2></div></header>
            <div className="listingFieldsV27 two">
              <label><span>Kategori</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
              <label><span>Ürün durumu</span><select value={condition} onChange={(event) => setCondition(event.target.value)}><option value="new">Sıfır / kullanılmamış</option><option value="like_new">Yeni gibi</option><option value="good">İyi</option><option value="fair">Kullanılmış</option></select></label>
            </div>
            <label className="listingFieldV27"><span>İlan başlığı <small>{title.length}/120</small></span><input maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn. PlayStation 5 Slim Diskli + 2 Kol" /></label>
            <div className="listingFieldsV27 two"><label><span>Marka</span><input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Sony" /></label><label><span>Model</span><input value={model} onChange={(event) => setModel(event.target.value)} placeholder="PS5 Slim" /></label></div>
            <label className="listingFieldV27"><span>Açıklama <small>{description.length}/4000</small></span><textarea maxLength={4000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ürünün kozmetik durumunu, çalışma durumunu, varsa kusurlarını ve önemli ayrıntıları açıkça yaz." /></label>
            <label className="listingFieldV27"><span>Teknik özellik notu</span><textarea className="short" value={specificationNote} onChange={(event) => setSpecificationNote(event.target.value)} placeholder="Depolama, RAM, ölçü, renk, pil sağlığı, seri veya test bilgileri…" /></label>
          </section>

          <section className="listingFormCardV27">
            <header><span>02</span><div><small>FOTOĞRAFLAR</small><h2>Ürünü açıkça göster</h2></div><em>{photos.length}/8</em></header>
            <label className="listingPhotoDropV27"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} /><Icon name="camera" /><strong>Fotoğraf seç veya buraya bırak</strong><span>Yayın için en az 3, en fazla 8 fotoğraf · Her biri en fazla 10 MB</span></label>
            {photos.length > 0 && <div className="listingPhotoGridV27">{photos.map((photo, index) => <article key={photo.id}><img src={photo.preview} alt={`Ürün fotoğrafı ${index + 1}`} />{index === 0 && <span>Kapak</span>}<button type="button" onClick={() => removePhoto(photo.id)} aria-label="Fotoğrafı kaldır"><Icon name="trash" /></button></article>)}</div>}
          </section>

          <section className="listingFormCardV27">
            <header><span>03</span><div><small>FİYATLANDIRMA</small><h2>{saleType === "auction" ? "Teklif kurallarını belirle" : "Satış fiyatını belirle"}</h2></div></header>
            {saleType === "auction" ? <>
              <div className="listingFieldsV27 three"><label><span>Başlangıç fiyatı</span><div className="moneyInputV27"><input inputMode="decimal" value={startPrice} onChange={(event) => setStartPrice(event.target.value)} /><b>₺</b></div></label><label><span>Minimum artış</span><div className="moneyInputV27"><input inputMode="decimal" value={minIncrement} onChange={(event) => setMinIncrement(event.target.value)} /><b>₺</b></div></label><label><span>Süre</span><select value={durationHours} onChange={(event) => setDurationHours(event.target.value)}><option value="1">1 saat</option><option value="6">6 saat</option><option value="12">12 saat</option><option value="24">1 gün</option><option value="48">2 gün</option><option value="72">3 gün</option><option value="168">7 gün</option></select></label></div>
              <label className="listingFieldV27"><span>Gizli taban fiyat <small>Alıcılara gösterilmez</small></span><div className="moneyInputV27"><input inputMode="decimal" value={reservePrice} onChange={(event) => setReservePrice(event.target.value)} placeholder="İsteğe bağlı" /><b>₺</b></div></label>
            </> : <div className="listingFieldsV27 two"><label><span>Sabit satış fiyatı</span><div className="moneyInputV27"><input inputMode="decimal" value={buyNowPrice} onChange={(event) => setBuyNowPrice(event.target.value)} /><b>₺</b></div></label><label><span>Stok adedi</span><input type="number" min="1" max="99" value={stock} onChange={(event) => setStock(event.target.value)} /></label></div>}
          </section>

          <section className="listingFormCardV27">
            <header><span>04</span><div><small>TESLİMAT</small><h2>Gönderim ve ürün içeriği</h2></div></header>
            <div className="listingFieldsV27 two"><label><span>Gönderim yöntemi</span><select value={shippingMethod} onChange={(event) => setShippingMethod(event.target.value)}><option value="kapiskapis">KapışKapış anlaşmalı kargo</option><option value="seller_delivery">Satıcı teslimatı</option><option value="digital">Dijital teslimat</option></select></label><label><span>Kargo ücreti</span><select value={shippingPayer} onChange={(event) => setShippingPayer(event.target.value)}><option value="buyer">Alıcı öder</option><option value="seller">Satıcı öder</option></select></label></div>
            <div className="listingFieldsV27 two"><label><span>Ürünün bulunduğu şehir</span><input value={location} onChange={(event) => setLocation(event.target.value)} /></label><label><span>Garanti / belge</span><select value={warrantyStatus} onChange={(event) => setWarrantyStatus(event.target.value)}><option value="none">Garanti yok</option><option value="invoice">Fatura mevcut</option><option value="manufacturer">Üretici garantisi</option><option value="seller">Satıcı garantisi</option></select></label></div>
            <label className="listingFieldV27"><span>Kutu içeriği</span><input value={boxContents} onChange={(event) => setBoxContents(event.target.value)} placeholder="Ürün, kutu, fatura, adaptör, kablo, aksesuarlar…" /></label>
          </section>
        </div>

        <aside className="listingCreateAsideV27">
          <section className="listingPreviewV27"><span>İLAN ÖNİZLEMESİ</span><div className="listingPreviewImageV27">{photos[0] ? <img src={photos[0].preview} alt="Kapak önizlemesi" /> : <Icon name="camera" />}{saleType === "auction" ? <em className="auction">Açık artırma</em> : <em className="fixed">Sabit fiyat</em>}</div><small>{selectedCategory.label}</small><h3>{title.trim() || "İlan başlığın burada görünecek"}</h3><strong>{saleType === "auction" ? `${numeric(startPrice).toLocaleString("tr-TR")} ₺ başlangıç` : `${numeric(buyNowPrice).toLocaleString("tr-TR")} ₺`}</strong><p>{description.trim() || "Ürün açıklamasının ilk bölümü burada gösterilecek."}</p></section>
          <section className="listingTrustV27"><header><Icon name="shield" /><div><span>GÜVENLİ İLAN</span><strong>Yayın kontrolleri</strong></div></header><ul><li className={title.trim().length >= 8 ? "done" : ""}><Icon name="check" /> Açık ve doğru başlık</li><li className={description.trim().length >= 40 ? "done" : ""}><Icon name="check" /> Ayrıntılı ürün açıklaması</li><li className={photos.length >= 3 ? "done" : ""}><Icon name="check" /> En az 3 gerçek fotoğraf</li><li className="done"><Icon name="check" /> Güvenli ödeme akışı</li></ul></section>
          <section className="listingDeliveryHintV27"><Icon name={shippingMethod === "digital" ? "box" : "truck"} /><p><strong>{shippingMethod === "digital" ? "Dijital teslimat" : "Kargo akışı"}</strong><span>Satış tamamlanınca teslimat adımları Siparişler bölümünde açılacak.</span></p></section>
          <div className="listingSubmitV27"><button type="submit" disabled={saving}><Icon name="save" /> {saving ? "Kaydediliyor…" : "Taslak kaydet"}</button><button type="button" className="publish" disabled={saving} onClick={() => void saveListing(true)}>Kaydet ve yayınla <Icon name="arrow" /></button><small>Yayınlama sırasında mağaza, ödeme hesabı, iletişim doğrulaması ve fotoğraf kontrolleri otomatik yapılır.</small></div>
        </aside>
      </div>
    </form>
  );
}
