import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSubMerchant, retrieveSubMerchant, type IyzicoResponse } from "@/lib/iyzico";
import { PaymentHttpError } from "@/lib/supabase-server";

export type SellerMerchantType = "PERSONAL" | "PRIVATE_COMPANY" | "LIMITED_OR_JOINT_STOCK_COMPANY";

export type SellerOnboardingInput = {
  merchantType?: string;
  storeName?: string;
  contactName?: string;
  contactSurname?: string;
  email?: string;
  gsmNumber?: string;
  address?: string;
  iban?: string;
  identityNumber?: string;
  taxNumber?: string;
  taxOffice?: string;
  legalCompanyTitle?: string;
  consent?: boolean;
};

export type SellerReviewEvent = {
  id: string;
  eventType: "submitted" | "resubmitted" | "approved" | "rejected" | "suspended" | "reactivated";
  note: string | null;
  createdAt: string;
};

export type SellerApplicationReadiness = {
  emailVerified: boolean;
  phoneVerified: boolean;
  storeReady: boolean;
  contactReady: boolean;
  payoutReady: boolean;
  readyForApproval: boolean;
};

export type SafePayoutStatus = {
  sellerId: string | null;
  sellerSlug: string | null;
  sellerName: string;
  onboardingStatus: "not_started" | "pending" | "active" | "rejected" | "suspended";
  merchantType: SellerMerchantType | null;
  maskedIban: string | null;
  providerExternalId: string | null;
  submittedAt: string | null;
  activatedAt: string | null;
  lastError: string | null;
  updatedAt: string | null;
  platformReviewStatus: "not_submitted" | "pending" | "approved" | "rejected" | "suspended";
  platformReviewNote: string | null;
  reviewSubmittedAt: string | null;
  reviewRevision: number;
  reviewedAt: string | null;
  readiness: SellerApplicationReadiness;
  history: SellerReviewEvent[];
};

function clean(value: unknown, max = 255) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function normalizePhone(value: unknown) {
  const digits = clean(value, 30).replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+9${digits}`;
  if (digits.length === 10) return `+90${digits}`;
  return digits ? `+${digits}` : "";
}

function normalizeIban(value: unknown) {
  return clean(value, 40).replace(/\s+/g, "").toUpperCase();
}

function normalizeDigits(value: unknown, max = 20) {
  return clean(value, max).replace(/\D/g, "");
}

function hashSensitive(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function maskIban(iban: string) {
  return `${iban.slice(0, 4)} •••• •••• •••• •••• ${iban.slice(-4)}`;
}

function merchantType(value: unknown): SellerMerchantType {
  if (value === "PERSONAL" || value === "PRIVATE_COMPANY" || value === "LIMITED_OR_JOINT_STOCK_COMPANY") return value;
  throw new PaymentHttpError(400, "Satıcı türünü seçmelisin.");
}

export function validateSellerOnboardingInput(raw: SellerOnboardingInput) {
  const type = merchantType(raw.merchantType);
  const storeName = clean(raw.storeName, 255);
  const contactName = clean(raw.contactName, 100);
  const contactSurname = clean(raw.contactSurname, 100);
  const email = clean(raw.email, 200).toLocaleLowerCase("tr-TR");
  const gsmNumber = normalizePhone(raw.gsmNumber);
  const address = clean(raw.address, 255);
  const iban = normalizeIban(raw.iban);
  const identityNumber = normalizeDigits(raw.identityNumber, 20);
  const taxNumber = normalizeDigits(raw.taxNumber, 20);
  const taxOffice = clean(raw.taxOffice, 255);
  const legalCompanyTitle = clean(raw.legalCompanyTitle, 255);

  if (!raw.consent) throw new PaymentHttpError(400, "Alt üye işyeri başvurusu için bilgi aktarım onayını vermelisin.");
  if (storeName.length < 2) throw new PaymentHttpError(400, "Mağaza adı en az 2 karakter olmalıdır.");
  if (contactName.length < 2 || contactSurname.length < 2) throw new PaymentHttpError(400, "Ad ve soyad bilgilerini eksiksiz gir.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new PaymentHttpError(400, "Geçerli bir e-posta adresi gir.");
  if (!/^\+90\d{10}$/.test(gsmNumber)) throw new PaymentHttpError(400, "Telefon numarasını Türkiye formatında gir.");
  if (address.length < 10) throw new PaymentHttpError(400, "Açık adres en az 10 karakter olmalıdır.");
  if (!/^TR\d{24}$/.test(iban)) throw new PaymentHttpError(400, "IBAN, TR ile başlayan 26 karakterlik geçerli formatta olmalıdır.");

  if (type === "PERSONAL") {
    if (!/^[1-9]\d{10}$/.test(identityNumber)) throw new PaymentHttpError(400, "T.C. kimlik numarası 11 haneli olmalıdır.");
  } else if (type === "PRIVATE_COMPANY") {
    if (!/^[1-9]\d{10}$/.test(identityNumber)) throw new PaymentHttpError(400, "Şahıs şirketi yetkilisinin T.C. kimlik numarasını gir.");
    if (!/^\d{10}$/.test(taxNumber)) throw new PaymentHttpError(400, "Vergi numarası 10 haneli olmalıdır.");
    if (taxOffice.length < 3 || legalCompanyTitle.length < 3) throw new PaymentHttpError(400, "Vergi dairesi ve şirket unvanını eksiksiz gir.");
  } else {
    if (!/^\d{10}$/.test(taxNumber)) throw new PaymentHttpError(400, "Vergi numarası 10 haneli olmalıdır.");
    if (taxOffice.length < 3 || legalCompanyTitle.length < 3) throw new PaymentHttpError(400, "Vergi dairesi ve şirket unvanını eksiksiz gir.");
  }

  const providerPayload: Record<string, unknown> = {
    locale: "tr",
    conversationId: `seller-${randomUUID()}`,
    name: storeName,
    email,
    gsmNumber,
    address,
    iban,
    contactName,
    contactSurname,
    currency: "TRY",
    identityNumber: identityNumber || undefined,
    taxNumber: taxNumber || undefined,
    taxOffice: taxOffice || undefined,
    legalCompanyTitle: legalCompanyTitle || undefined,
    subMerchantType: type,
  };

  return {
    type,
    storeName,
    contactName,
    contactSurname,
    email,
    gsmNumber,
    address,
    iban,
    identityNumber,
    taxNumber,
    taxOffice,
    legalCompanyTitle,
    providerPayload,
    safeFields: {
      merchant_type: type,
      contact_name: contactName,
      contact_surname: contactSurname,
      contact_email: email,
      contact_phone_masked: `${gsmNumber.slice(0, 6)}•••${gsmNumber.slice(-2)}`,
      iban_masked: maskIban(iban),
      identity_number_hash: identityNumber ? hashSensitive(identityNumber) : null,
      tax_number_hash: taxNumber ? hashSensitive(taxNumber) : null,
      tax_office: taxOffice || null,
      legal_company_title: legalCompanyTitle || null,
    },
  };
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "satici";
}

export async function ensureSellerForUser(admin: SupabaseClient, user: User, preferredName?: string) {
  await admin.from("kk_profiles").update({ seller_status: "pending", seller_requested_at: new Date().toISOString() }).eq("id", user.id).neq("role", "admin");

  const { data: existing, error: existingError } = await admin
    .from("kk_sellers")
    .select("id,slug,name,user_id,platform_review_status,platform_review_note")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingError) throw new PaymentHttpError(500, "Satıcı hesabı okunamadı.", existingError.code);
  if (existing) return existing as { id: string; slug: string; name: string; user_id: string };

  const { data: profile } = await admin.from("kk_profiles").select("full_name").eq("id", user.id).maybeSingle();
  const fallbackName = clean(preferredName || profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "KapışKapış Satıcısı", 255);
  const slug = `${slugify(fallbackName)}-${user.id.replaceAll("-", "").slice(0, 6)}`;
  const { data, error } = await admin.from("kk_sellers").insert({
    user_id: user.id,
    slug,
    name: fallbackName,
    initials: fallbackName.slice(0, 1).toLocaleUpperCase("tr-TR"),
    tagline: "KapışKapış satıcısı",
    about: "Bu mağaza KapışKapış üzerinden oluşturuldu.",
    verified: false,
    is_active: false,
  }).select("id,slug,name,user_id").single();
  if (error) {
    const { data: raced } = await admin.from("kk_sellers").select("id,slug,name,user_id").eq("user_id", user.id).maybeSingle();
    if (raced) return raced as { id: string; slug: string; name: string; user_id: string };
    throw new PaymentHttpError(500, "Satıcı hesabı oluşturulamadı.", error.code);
  }
  return data as { id: string; slug: string; name: string; user_id: string };
}

export async function getSafePayoutStatus(admin: SupabaseClient, user: User): Promise<SafePayoutStatus> {
  const [{ data: seller, error: sellerError }, { data: profile, error: profileError }] = await Promise.all([
    admin
      .from("kk_sellers")
      .select("id,slug,name,user_id,platform_review_status,platform_review_note,review_submitted_at,review_revision,platform_reviewed_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    admin
      .from("kk_profiles")
      .select("email_verified_at,phone_verified_at")
      .eq("id", user.id)
      .maybeSingle(),
  ]);
  if (sellerError) throw new PaymentHttpError(500, "Satıcı hesabı okunamadı.", sellerError.code);
  if (profileError) throw new PaymentHttpError(500, "Hesap doğrulama durumu okunamadı.", profileError.code);

  const emailVerified = Boolean(profile?.email_verified_at || user.email_confirmed_at);
  const phoneVerified = Boolean(profile?.phone_verified_at || user.phone_confirmed_at);

  if (!seller) {
    return {
      sellerId: null,
      sellerSlug: null,
      sellerName: String(user.user_metadata?.full_name || user.email?.split("@")[0] || "KapışKapış mağazan"),
      onboardingStatus: "not_started",
      merchantType: null,
      maskedIban: null,
      providerExternalId: null,
      submittedAt: null,
      activatedAt: null,
      lastError: null,
      updatedAt: null,
      platformReviewStatus: "not_submitted",
      platformReviewNote: null,
      reviewSubmittedAt: null,
      reviewRevision: 0,
      reviewedAt: null,
      readiness: {
        emailVerified,
        phoneVerified,
        storeReady: false,
        contactReady: false,
        payoutReady: false,
        readyForApproval: false,
      },
      history: [],
    };
  }

  const [{ data, error }, { data: events, error: eventsError }] = await Promise.all([
    admin
      .from("kk_seller_payout_accounts")
      .select("onboarding_status,merchant_type,iban_masked,provider_external_id,submitted_at,activated_at,last_error,updated_at,contact_name,contact_surname,contact_email,contact_phone_masked")
      .eq("seller_id", seller.id)
      .maybeSingle(),
    admin
      .from("kk_seller_review_events")
      .select("id,event_type,note,created_at")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (error) throw new PaymentHttpError(500, "Satıcı ödeme durumu okunamadı.", error.code);
  if (eventsError && eventsError.code !== "42P01") throw new PaymentHttpError(500, "Satıcı inceleme geçmişi okunamadı.", eventsError.code);

  const storeReady = seller.name.trim().length >= 3;
  const contactReady = Boolean(data?.contact_name && data?.contact_surname && data?.contact_email && data?.contact_phone_masked);
  const payoutReady = data?.onboarding_status === "active" && Boolean(data?.provider_external_id) && Boolean(data?.iban_masked);
  const readiness: SellerApplicationReadiness = {
    emailVerified,
    phoneVerified,
    storeReady,
    contactReady,
    payoutReady,
    readyForApproval: emailVerified && phoneVerified && storeReady && contactReady && payoutReady,
  };

  return {
    sellerId: seller.id,
    sellerSlug: seller.slug,
    sellerName: seller.name,
    onboardingStatus: (data?.onboarding_status ?? "not_started") as SafePayoutStatus["onboardingStatus"],
    merchantType: (data?.merchant_type ?? null) as SellerMerchantType | null,
    maskedIban: data?.iban_masked ?? null,
    providerExternalId: data?.provider_external_id ?? null,
    submittedAt: data?.submitted_at ?? null,
    activatedAt: data?.activated_at ?? null,
    lastError: data?.last_error ?? null,
    updatedAt: data?.updated_at ?? null,
    platformReviewStatus: (seller.platform_review_status ?? "not_submitted") as SafePayoutStatus["platformReviewStatus"],
    platformReviewNote: seller.platform_review_note ?? null,
    reviewSubmittedAt: seller.review_submitted_at ?? null,
    reviewRevision: Number(seller.review_revision ?? 0),
    reviewedAt: seller.platform_reviewed_at ?? null,
    readiness,
    history: ((events ?? []) as Array<{ id: string; event_type: SellerReviewEvent["eventType"]; note: string | null; created_at: string }>).map((event) => ({
      id: event.id,
      eventType: event.event_type,
      note: event.note,
      createdAt: event.created_at,
    })),
  };
}

export async function resubmitSellerReview(admin: SupabaseClient, user: User, noteInput?: string) {
  const note = clean(noteInput, 500) || null;
  const [{ data: profile, error: profileError }, { data: seller, error: sellerError }] = await Promise.all([
    admin.from("kk_profiles").select("account_status,email_verified_at,phone_verified_at,role").eq("id", user.id).maybeSingle(),
    admin.from("kk_sellers").select("id,platform_review_status,review_revision").eq("user_id", user.id).maybeSingle(),
  ]);
  if (profileError || !profile) throw new PaymentHttpError(403, "Kullanıcı hesabı doğrulanamadı.", profileError?.code);
  if (profile.account_status !== "active") throw new PaymentHttpError(403, "Hesap aktif değil.");
  if (!profile.email_verified_at || !profile.phone_verified_at) throw new PaymentHttpError(422, "E-posta ve telefon doğrulamalarını tamamlamalısın.");
  if (sellerError || !seller) throw new PaymentHttpError(404, "Satıcı başvurusu bulunamadı.", sellerError?.code);
  if (!["rejected", "not_submitted", "pending"].includes(String(seller.platform_review_status))) {
    throw new PaymentHttpError(422, "Bu başvuru yeniden incelemeye gönderilemez.");
  }

  const { data: payout, error: payoutError } = await admin
    .from("kk_seller_payout_accounts")
    .select("onboarding_status,submerchant_key,merchant_type,iban_masked")
    .eq("seller_id", seller.id)
    .maybeSingle();
  if (payoutError) throw new PaymentHttpError(500, "Satıcı ödeme hesabı okunamadı.", payoutError.code);
  if (payout?.onboarding_status !== "active" || !payout.submerchant_key) {
    throw new PaymentHttpError(422, "Yeniden inceleme için iyzico ödeme hesabının aktif olması gerekiyor.");
  }

  const now = new Date().toISOString();
  const nextRevision = Math.max(0, Number(seller.review_revision ?? 0)) + 1;
  const { error: sellerUpdateError } = await admin.from("kk_sellers").update({
    platform_review_status: "pending",
    platform_review_note: null,
    platform_reviewed_at: null,
    platform_reviewed_by: null,
    review_submitted_at: now,
    review_revision: nextRevision,
    is_active: false,
    verified: false,
    updated_at: now,
  }).eq("id", seller.id);
  if (sellerUpdateError) throw new PaymentHttpError(500, "Satıcı inceleme kaydı güncellenemedi. Paket 40 SQL dosyasını çalıştır.", sellerUpdateError.code);

  await admin.from("kk_profiles").update({
    role: profile.role === "admin" ? "admin" : "buyer",
    seller_status: "pending",
    seller_requested_at: now,
    updated_at: now,
  }).eq("id", user.id);

  const { error: eventError } = await admin.from("kk_seller_review_events").insert({
    seller_id: seller.id,
    actor_user_id: user.id,
    event_type: seller.platform_review_status === "rejected" ? "resubmitted" : "submitted",
    note,
    snapshot: {
      payoutStatus: payout.onboarding_status,
      merchantType: payout.merchant_type,
      ibanMasked: payout.iban_masked,
      revision: nextRevision,
    },
  });
  if (eventError) throw new PaymentHttpError(500, "Satıcı inceleme geçmişi kaydedilemedi. Paket 40 SQL dosyasını çalıştır.", eventError.code);

  return getSafePayoutStatus(admin, user);
}

function providerError(result: IyzicoResponse) {
  return clean(result.errorMessage || result.errorCode || "iyzico alt üye başvurusu tamamlanamadı.", 500);
}

async function audit(admin: SupabaseClient, sellerId: string, eventType: string, success: boolean, summary: Record<string, unknown>) {
  const { error } = await admin.from("kk_seller_payout_events").insert({
    seller_id: sellerId,
    event_type: eventType,
    success,
    provider_summary: summary,
  });
  if (error) console.error("[KapışKapış] Satıcı ödeme olayı kaydedilemedi:", error.message);
}

function safeProviderSummary(result: IyzicoResponse) {
  return {
    status: result.status ?? null,
    errorCode: result.errorCode ?? null,
    errorMessage: result.errorMessage ?? null,
    conversationId: result.conversationId ?? null,
    systemTime: result.systemTime ?? null,
    subMerchantType: result.subMerchantType ?? null,
  };
}

export async function submitSellerOnboarding(admin: SupabaseClient, user: User, raw: SellerOnboardingInput) {
  const validated = validateSellerOnboardingInput(raw);
  const seller = await ensureSellerForUser(admin, user, validated.storeName);
  const providerExternalId = `KK-${seller.id}`;

  const { data: current, error: currentError } = await admin
    .from("kk_seller_payout_accounts")
    .select("onboarding_status,submerchant_key,provider_external_id")
    .eq("seller_id", seller.id)
    .maybeSingle();
  if (currentError) throw new PaymentHttpError(500, "Satıcı ödeme hesabı kontrol edilemedi.", currentError.code);
  if (current?.onboarding_status === "active" && current.submerchant_key) return getSafePayoutStatus(admin, user);

  const baseRow = {
    seller_id: seller.id,
    provider: "iyzico",
    onboarding_status: "pending",
    provider_external_id: current?.provider_external_id || providerExternalId,
    submitted_at: new Date().toISOString(),
    last_error: null,
    ...validated.safeFields,
  };
  const { error: pendingError } = await admin.from("kk_seller_payout_accounts").upsert(baseRow, { onConflict: "seller_id" });
  if (pendingError) throw new PaymentHttpError(500, "Satıcı başvurusu kaydedilemedi.", pendingError.code);

  const payload = { ...validated.providerPayload, subMerchantExternalId: providerExternalId };
  let result: IyzicoResponse;
  try {
    result = await createSubMerchant(payload);
    if (result.status !== "success" && String(result.errorCode ?? "") === "2002") {
      result = await retrieveSubMerchant({ locale: "tr", conversationId: `seller-sync-${randomUUID()}`, subMerchantExternalId: providerExternalId });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "iyzico bağlantısı kurulamadı.";
    await admin.from("kk_seller_payout_accounts").update({ onboarding_status: "rejected", last_error: message.slice(0, 500) }).eq("seller_id", seller.id);
    await admin.from("kk_profiles").update({ role: "buyer", seller_status: "rejected" }).eq("id", user.id).neq("role", "admin");
    await audit(admin, seller.id, "create", false, { message });
    throw new PaymentHttpError(502, message);
  }

  const summary = safeProviderSummary(result);
  if (result.status !== "success" || !result.subMerchantKey) {
    const message = providerError(result);
    await admin.from("kk_seller_payout_accounts").update({
      onboarding_status: "rejected",
      last_error: message,
      provider_summary: summary,
      provider_checked_at: new Date().toISOString(),
    }).eq("seller_id", seller.id);
    await admin.from("kk_profiles").update({ role: "buyer", seller_status: "rejected" }).eq("id", user.id).neq("role", "admin");
    await audit(admin, seller.id, "create", false, summary);
    throw new PaymentHttpError(422, message, String(result.errorCode ?? "IYZICO_ONBOARDING_FAILED"));
  }

  const now = new Date().toISOString();
  const { error: activateError } = await admin.from("kk_seller_payout_accounts").update({
    submerchant_key: String(result.subMerchantKey),
    onboarding_status: "active",
    activated_at: now,
    provider_checked_at: now,
    provider_summary: summary,
    last_error: null,
  }).eq("seller_id", seller.id);
  if (activateError) throw new PaymentHttpError(500, "Alt üye anahtarı güvenli şekilde kaydedilemedi.", activateError.code);

  await admin.from("kk_sellers").update({
    name: validated.storeName,
    platform_review_status: "pending",
    platform_review_note: null,
    review_submitted_at: now,
    review_revision: 1,
    is_active: false,
    verified: false,
  }).eq("id", seller.id);
  await admin.from("kk_seller_review_events").insert({
    seller_id: seller.id,
    actor_user_id: user.id,
    event_type: "submitted",
    note: "iyzico ödeme hesabı etkinleştirildi ve mağaza incelemeye gönderildi.",
    snapshot: { merchantType: validated.type, ibanMasked: validated.safeFields.iban_masked },
  });
  await admin.from("kk_profiles").update({ role: "buyer", seller_status: "pending", seller_requested_at: new Date().toISOString() }).eq("id", user.id).neq("role", "admin");
  await audit(admin, seller.id, "create", true, summary);
  return getSafePayoutStatus(admin, user);
}

export async function syncSellerOnboarding(admin: SupabaseClient, user: User) {
  const seller = await ensureSellerForUser(admin, user);
  const { data: account, error } = await admin
    .from("kk_seller_payout_accounts")
    .select("provider_external_id,onboarding_status")
    .eq("seller_id", seller.id)
    .maybeSingle();
  if (error) throw new PaymentHttpError(500, "Satıcı ödeme hesabı okunamadı.", error.code);
  if (!account?.provider_external_id) throw new PaymentHttpError(404, "Henüz gönderilmiş bir satıcı ödeme başvurusu yok.");

  const result = await retrieveSubMerchant({
    locale: "tr",
    conversationId: `seller-sync-${randomUUID()}`,
    subMerchantExternalId: account.provider_external_id,
  });
  const summary = safeProviderSummary(result);
  const now = new Date().toISOString();
  if (result.status === "success" && result.subMerchantKey) {
    await admin.from("kk_seller_payout_accounts").update({
      submerchant_key: String(result.subMerchantKey),
      onboarding_status: "active",
      merchant_type: result.subMerchantType || undefined,
      activated_at: now,
      provider_checked_at: now,
      provider_summary: summary,
      last_error: null,
    }).eq("seller_id", seller.id);
    const { data: reviewRow } = await admin.from("kk_sellers").select("platform_review_status").eq("id", seller.id).maybeSingle();
    const reviewStatus = reviewRow?.platform_review_status === "approved" ? "approved" : "pending";
    const sellerSyncUpdate: Record<string, unknown> = {
      platform_review_status: reviewStatus,
      is_active: reviewStatus === "approved",
      verified: reviewStatus === "approved",
    };
    if (reviewStatus !== "approved") {
      sellerSyncUpdate.review_submitted_at = now;
      sellerSyncUpdate.review_revision = 1;
    }
    await admin.from("kk_sellers").update(sellerSyncUpdate).eq("id", seller.id);
    await admin.from("kk_profiles").update({
      role: reviewStatus === "approved" ? "seller" : "buyer",
      seller_status: reviewStatus === "approved" ? "active" : "pending",
      seller_requested_at: new Date().toISOString(),
    }).eq("id", user.id).neq("role", "admin");
    await audit(admin, seller.id, "retrieve", true, summary);
  } else {
    const message = providerError(result);
    await admin.from("kk_seller_payout_accounts").update({
      onboarding_status: account.onboarding_status === "active" ? "active" : "rejected",
      provider_checked_at: now,
      provider_summary: summary,
      last_error: message,
    }).eq("seller_id", seller.id);
    await audit(admin, seller.id, "retrieve", false, summary);
  }
  return getSafePayoutStatus(admin, user);
}
