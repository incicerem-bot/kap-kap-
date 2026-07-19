"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createVerifiedReview, loadReviewableOrder, type ReviewableOrder } from "@/lib/reviews";

type IconName = "star" | "check" | "shield" | "package" | "message" | "truck" | "image" | "arrow" | "lock";
type LoadState = "loading" | "ready" | "not-configured" | "signed-out" | "not-found" | "error";

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
    check: <path d="m5 12 4 4L19 6" />,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    package: <><path d="m3 7 9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7M12 11v10" /></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /><path d="M8 9h8M8 13h5" /></>,
    truck: <><path d="M3 5h11v12H3zM14 9h4l3 3v5h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const criteria = [
  { key: "accuracy", label: "Ürün açıklamasına uygunluk", icon: "package" as IconName },
  { key: "shipping", label: "Kargo ve paketleme", icon: "truck" as IconName },
  { key: "communication", label: "Satıcı iletişimi", icon: "message" as IconName },
];

const positiveTags = ["Açıklamaya uygun", "Hızlı kargo", "Güvenli paketleme", "İyi iletişim", "Eksiksiz içerik", "Güven veren satıcı"];
const negativeTags = ["Kargo gecikti", "Paketleme geliştirilmeli", "İletişim yavaştı", "Açıklamada eksik vardı"];

function RatingPicker({ value, onChange, compact = false }: { value: number; onChange: (value: number) => void; compact?: boolean }) {
  return <div className={compact ? "reviewStarsV15 compact" : "reviewStarsV15"}>{[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} className={rating <= value ? "active" : ""} onClick={() => onChange(rating)} aria-label={`${rating} yıldız`}><Icon name="star" /></button>)}</div>;
}

function formatDate(value: string) {
  if (!value) return "Teslimat tarihi";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function ReviewState({ icon = "shield", eyebrow, title, description, action }: { icon?: IconName; eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <section className="reviewSystemStateV16">
      <span><Icon name={icon} /></span>
      <em>{eyebrow}</em>
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
    </section>
  );
}

export default function ReviewFlowExperience({ orderId }: { orderId: string }) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [order, setOrder] = useState<ReviewableOrder | null>(null);
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ accuracy: 0, shipping: 0, communication: 0 });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successWarning, setSuccessWarning] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  useEffect(() => {
    let active = true;
    setLoadState("loading");
    loadReviewableOrder(orderId).then((result) => {
      if (!active) return;
      if (result.status === "ready") {
        setOrder(result.data);
        setLoadState("ready");
      } else if (result.status === "error") {
        setLoadError(result.message);
        setLoadState("error");
      } else {
        setLoadState(result.status);
      }
    }).catch((reason: unknown) => {
      if (!active) return;
      setLoadError(reason instanceof Error ? reason.message : "Sipariş bilgisi alınamadı.");
      setLoadState("error");
    });
    return () => { active = false; };
  }, [orderId]);

  const recommendedTags = useMemo(() => overall >= 4 ? positiveTags : overall > 0 ? negativeTags : positiveTags, [overall]);
  const completeCriteria = Object.values(scores).every((value) => value > 0);
  const canSubmit = overall > 0 && completeCriteria && comment.trim().length >= 20 && !submitting;

  function toggleTag(tag: string) {
    setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : current.length < 4 ? [...current, tag] : current);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order || !canSubmit) {
      setError("Genel puanı, üç hizmet puanını ve en az 20 karakterlik yorumunu tamamla.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await createVerifiedReview({
        orderNo: order.orderNo,
        rating: overall,
        accuracyRating: scores.accuracy,
        shippingRating: scores.shipping,
        communicationRating: scores.communication,
        title: title.trim() || (overall >= 4 ? "Güvenli ve başarılı alışveriş" : "Alışveriş deneyimim"),
        comment: comment.trim(),
        tags: selectedTags,
        anonymous,
        photos: photoFiles,
      });
      setSuccessWarning(result.photoWarning ?? "");
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Değerlendirme kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadState === "loading") return <ReviewState eyebrow="SİPARİŞ DOĞRULANIYOR" title="Değerlendirme hakkın kontrol ediliyor." description="Teslimat, oturum ve daha önce yorum yapılıp yapılmadığı Supabase üzerinden doğrulanıyor." />;
  if (loadState === "not-configured") return <ReviewState eyebrow="SUPABASE BAĞLANTISI EKSİK" title="Değerlendirme sistemi henüz veritabanına bağlanmamış." description="SQL kurulum dosyasını Supabase SQL Editor’da çalıştır ve Vercel ortam değişkenlerine Supabase URL ile anon anahtarını ekle." />;
  if (loadState === "signed-out") return <ReviewState icon="lock" eyebrow="OTURUM GEREKLİ" title="Bu siparişi değerlendirmek için giriş yapmalısın." description="Sistem yalnızca siparişin gerçek alıcısına değerlendirme formunu açar." action={<Link href={`/giris?returnTo=${encodeURIComponent(`/degerlendirme?order=${orderId}`)}`}>Giriş yap <Icon name="arrow" /></Link>} />;
  if (loadState === "not-found") return <ReviewState eyebrow="SİPARİŞ BULUNAMADI" title="Bu hesapta değerlendirilebilir sipariş bulunmuyor." description="Sipariş numarası sana ait değilse veya henüz gerçek sipariş tablosuna aktarılmadıysa form açılmaz." action={<Link href="/siparisler">Siparişlerime dön <Icon name="arrow" /></Link>} />;
  if (loadState === "error") return <ReviewState eyebrow="BAĞLANTI HATASI" title="Sipariş doğrulanamadı." description={loadError || "Supabase bağlantısını ve SQL kurulumunu kontrol et."} />;
  if (!order) return null;
  if (order.status !== "delivered") return <ReviewState icon="truck" eyebrow="TESLİMAT BEKLENİYOR" title="Bu sipariş henüz değerlendirilemez." description="Değerlendirme yalnızca ürün teslim edilip alıcı tarafından onaylandıktan sonra açılır." action={<Link href={`/kargo?order=${order.orderNo}`}>Kargoyu takip et <Icon name="arrow" /></Link>} />;
  if (order.alreadyReviewed && !submitted) return <ReviewState icon="check" eyebrow="DAHA ÖNCE DEĞERLENDİRİLDİ" title="Bu sipariş için değerlendirme hakkı kullanılmış." description="Her tamamlanmış sipariş yalnızca bir doğrulanmış değerlendirme oluşturabilir." action={<Link href={`/magaza/${order.sellerSlug}?tab=reviews`}>Mağaza yorumlarını gör <Icon name="arrow" /></Link>} />;

  if (submitted) {
    return (
      <section className="reviewSuccessV15">
        <span><Icon name="check" /></span>
        <em>DEĞERLENDİRMEN VERİTABANINA KAYDEDİLDİ</em>
        <h1>Teşekkürler, alışveriş deneyimin mağazaya eklendi.</h1>
        <p>Yorumun gerçek siparişe bağlı olduğu için <strong>Doğrulanmış alışveriş</strong> etiketiyle gösterilecek.</p>
        {successWarning && <div className="reviewPhotoWarningV16" role="status">{successWarning}</div>}
        <div><article><Icon name="shield" /><strong>Tek sipariş, tek yorum</strong><small>Bu kural Supabase fonksiyonu ve benzersiz veritabanı kısıtıyla korunur.</small></article><article><Icon name="lock" /><strong>Gizlilik korunur</strong><small>{anonymous ? "Adın mağazada maskeli gösterilecek." : "Profilindeki ad değerlendirmede açık gösterilecek."}</small></article></div>
        <Link href={`/magaza/${order.sellerSlug}?tab=reviews&reviewed=1`}>{order.sellerName} mağazasındaki yorumunu gör <Icon name="arrow" /></Link>
        <Link className="reviewSecondaryLinkV15" href="/siparisler">Siparişlerime dön</Link>
      </section>
    );
  }

  return (
    <form className="reviewFlowV15" onSubmit={submitReview}>
      {error && <div className="reviewErrorV15" role="alert">{error}</div>}
      <section className="reviewOrderCardV15">
        <img src={order.productImage} alt={order.productTitle} />
        <div><span>DOĞRULANMIŞ SİPARİŞ · #{order.orderNo}</span><h2>{order.productTitle}</h2><p>Satıcı: <Link href={`/magaza/${order.sellerSlug}`}>{order.sellerName}</Link></p><small><Icon name="check" /> {formatDate(order.deliveredAt)} tarihinde teslim edildi</small></div>
      </section>

      <section className="reviewMainGridV15">
        <div className="reviewFormPanelV15">
          <header><span>01</span><div><em>GENEL DENEYİM</em><h2>Bu alışverişi nasıl değerlendirirsin?</h2><p>Puanın satıcının Supabase üzerinden hesaplanan güven puanına yansır.</p></div></header>
          <RatingPicker value={overall} onChange={(value) => { setOverall(value); setSelectedTags([]); }} />
          <div className="reviewRatingWordsV15"><span>Çok kötü</span><strong>{overall === 0 ? "Puan seç" : overall === 1 ? "Çok kötü" : overall === 2 ? "Kötü" : overall === 3 ? "Orta" : overall === 4 ? "İyi" : "Mükemmel"}</strong><span>Mükemmel</span></div>

          <div className="reviewDividerV15" />
          <header><span>02</span><div><em>HİZMET PUANLARI</em><h2>Detayları ayrı ayrı puanla</h2></div></header>
          <div className="reviewCriteriaV15">{criteria.map((item) => <article key={item.key}><div><span><Icon name={item.icon} /></span><strong>{item.label}</strong></div><RatingPicker compact value={scores[item.key]} onChange={(value) => setScores((current) => ({ ...current, [item.key]: value }))} /></article>)}</div>

          {overall > 0 && <><div className="reviewDividerV15" /><header><span>03</span><div><em>ÖNE ÇIKANLAR</em><h2>Deneyimini en iyi anlatan seçenekler</h2><p>En fazla dört etiket seçebilirsin.</p></div></header><div className="reviewTagPickerV15">{recommendedTags.map((tag) => <button type="button" key={tag} className={selectedTags.includes(tag) ? "active" : ""} onClick={() => toggleTag(tag)}><Icon name="check" /> {tag}</button>)}</div></>}

          <div className="reviewDividerV15" />
          <header><span>04</span><div><em>YORUMUN</em><h2>Diğer alıcılara yardımcı ol</h2></div></header>
          <label className="reviewTextFieldV15"><span>Yorum başlığı <small>İsteğe bağlı</small></span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={70} placeholder="Örn. Ürün ilandaki gibi ve paketleme çok iyiydi" /></label>
          <label className="reviewTextFieldV15"><span>Alışveriş deneyimin <small>{comment.length}/500</small></span><textarea value={comment} onChange={(event) => setComment(event.target.value.slice(0, 500))} rows={6} placeholder="Ürün durumu, paketleme, kargo ve satıcı iletişimi hakkında deneyimini anlat..." /><em className={comment.length >= 20 ? "complete" : ""}>{comment.length >= 20 ? <><Icon name="check" /> Yeterli ayrıntı</> : `En az ${Math.max(0, 20 - comment.length)} karakter daha`}</em></label>
          <label className="reviewPhotoUploadV15"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setPhotoFiles(Array.from(event.target.files ?? []).slice(0, 4))} /><span><Icon name="image" /></span><div><strong>Fotoğraf ekle <small>İsteğe bağlı</small></strong><p>JPG, PNG veya WEBP; fotoğraf başına en fazla 8 MB.</p>{photoFiles.length > 0 && <em>{photoFiles.length} fotoğraf Supabase Storage’a yüklenecek</em>}</div></label>
        </div>

        <aside className="reviewSidebarV15">
          <section><header><Icon name="shield" /><div><span>DEĞERLENDİRME GÜVENLİĞİ</span><h3>Yorumun neden güvenilir?</h3></div></header><ul><li><Icon name="check" /> Sipariş sahipliği veritabanında doğrulanır</li><li><Icon name="check" /> Yalnızca teslim edilmiş sipariş kabul edilir</li><li><Icon name="check" /> Aynı sipariş ikinci kez değerlendirilemez</li><li><Icon name="check" /> Satıcı kendi mağazasını değerlendiremez</li></ul></section>
          <section className="reviewPrivacyV15"><header><Icon name="lock" /><div><span>GÖRÜNÜRLÜK</span><h3>Adını nasıl gösterelim?</h3></div></header><label><input type="radio" name="visibility" checked={anonymous} onChange={() => setAnonymous(true)} /><span><strong>Maskeli göster</strong><small>Adın veritabanında K••• A••• biçimine dönüştürülür.</small></span></label><label><input type="radio" name="visibility" checked={!anonymous} onChange={() => setAnonymous(false)} /><span><strong>Adımı göster</strong><small>Supabase profilindeki adın gösterilir.</small></span></label></section>
          <button type="submit" className="reviewSubmitV15" disabled={!canSubmit}>{submitting ? "Veritabanına kaydediliyor..." : "Değerlendirmeyi yayınla"} {!submitting && <Icon name="arrow" />}</button>
          <p className="reviewSubmitNoteV15"><Icon name="lock" /> Yayınlama işlemi RLS ve güvenli veritabanı fonksiyonuyla korunur.</p>
        </aside>
      </section>
    </form>
  );
}
