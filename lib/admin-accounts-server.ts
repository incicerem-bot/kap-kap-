import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { logAdminRoleSecurityEvent } from "@/lib/account-security-server";
import { PaymentHttpError } from "@/lib/supabase-server";

export type AdminAccountAction = "approve_seller" | "reject_seller" | "suspend_account" | "activate_account" | "grant_admin" | "revoke_admin";

export type AdminAccountRow = {
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
    reviewStatus: "not_submitted" | "pending" | "approved" | "rejected" | "suspended";
    reviewNote: string | null;
    payoutStatus: string;
    payoutActivatedAt: string | null;
  };
};

type ProfileDbRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
  admin_level: string | null;
  role_before_admin: string | null;
  account_status: string | null;
  seller_status: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  profile_completed_at: string | null;
  city: string | null;
  last_login_at: string | null;
  created_at: string;
};

type SellerDbRow = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  platform_review_status: string | null;
  platform_review_note: string | null;
};

type PayoutDbRow = { seller_id: string; onboarding_status: string | null; activated_at: string | null };

function safeRole(value: unknown): AdminAccountRow["role"] { return value === "seller" || value === "admin" ? value : "buyer"; }
function safeAdminLevel(value: unknown): AdminAccountRow["adminLevel"] { return value === "owner" || value === "operator" ? value : "none"; }
function safeAccountStatus(value: unknown): AdminAccountRow["accountStatus"] { return value === "suspended" || value === "closed" ? value : "active"; }
function safeSellerStatus(value: unknown): AdminAccountRow["sellerStatus"] { return value === "pending" || value === "active" || value === "rejected" || value === "suspended" ? value : "not_started"; }
function safeReviewStatus(value: unknown): NonNullable<AdminAccountRow["seller"]>["reviewStatus"] { return value === "pending" || value === "approved" || value === "rejected" || value === "suspended" ? value : "not_submitted"; }

export async function listAdminAccounts(admin: SupabaseClient, page = 1, perPage = 100, query = "") {
  const safePage = Math.max(1, Math.floor(page));
  const safePerPage = Math.min(200, Math.max(10, Math.floor(perPage)));
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({ page: safePage, perPage: safePerPage });
  if (authError) throw new PaymentHttpError(500, "Kullanıcı hesapları okunamadı.", authError.message);

  const authUsers = authData.users ?? [];
  const userIds = authUsers.map((user) => user.id);
  if (!userIds.length) return { accounts: [] as AdminAccountRow[], total: 0, page: safePage, perPage: safePerPage };

  const [{ data: profiles, error: profilesError }, { data: sellers, error: sellersError }] = await Promise.all([
    admin.from("kk_profiles")
      .select("id,full_name,username,role,admin_level,role_before_admin,account_status,seller_status,email_verified_at,phone_verified_at,profile_completed_at,city,last_login_at,created_at")
      .in("id", userIds),
    admin.from("kk_sellers").select("id,user_id,slug,name,platform_review_status,platform_review_note").in("user_id", userIds),
  ]);
  if (profilesError) throw new PaymentHttpError(503, "Kullanıcı güvenlik şeması hazır değil. Paket 33 SQL dosyasını çalıştır.", profilesError.code);
  if (sellersError) throw new PaymentHttpError(503, "Satıcı inceleme şeması hazır değil.", sellersError.code);

  const profileRows = (profiles ?? []) as ProfileDbRow[];
  const sellerRows = (sellers ?? []) as SellerDbRow[];
  const sellerIds = sellerRows.map((seller) => seller.id);
  const { data: payouts, error: payoutsError } = sellerIds.length
    ? await admin.from("kk_seller_payout_accounts").select("seller_id,onboarding_status,activated_at").in("seller_id", sellerIds)
    : { data: [], error: null };
  if (payoutsError) throw new PaymentHttpError(503, "Satıcı ödeme durumları okunamadı.", payoutsError.code);

  const profileMap = new Map(profileRows.map((profile) => [profile.id, profile]));
  const sellerMap = new Map(sellerRows.map((seller) => [seller.user_id, seller]));
  const payoutMap = new Map(((payouts ?? []) as PayoutDbRow[]).map((payout) => [payout.seller_id, payout]));
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

  const accounts = authUsers.map((authUser): AdminAccountRow => {
    const profile = profileMap.get(authUser.id);
    const seller = sellerMap.get(authUser.id);
    const payout = seller ? payoutMap.get(seller.id) : null;
    return {
      id: authUser.id,
      email: authUser.email ?? "",
      fullName: String(profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "KapışKapış kullanıcısı"),
      username: profile?.username ?? null,
      role: safeRole(profile?.role),
      adminLevel: safeAdminLevel(profile?.admin_level),
      accountStatus: safeAccountStatus(profile?.account_status),
      sellerStatus: safeSellerStatus(profile?.seller_status),
      emailVerified: Boolean(profile?.email_verified_at || authUser.email_confirmed_at),
      phoneVerified: Boolean(profile?.phone_verified_at || authUser.phone_confirmed_at),
      profileCompleted: Boolean(profile?.profile_completed_at),
      city: profile?.city ?? null,
      createdAt: authUser.created_at,
      lastLoginAt: profile?.last_login_at ?? authUser.last_sign_in_at ?? null,
      seller: seller ? {
        id: seller.id,
        slug: seller.slug,
        name: seller.name,
        reviewStatus: safeReviewStatus(seller.platform_review_status),
        reviewNote: seller.platform_review_note ?? null,
        payoutStatus: String(payout?.onboarding_status ?? "not_started"),
        payoutActivatedAt: payout?.activated_at ?? null,
      } : null,
    };
  }).filter((account) => !normalizedQuery || `${account.fullName} ${account.email} ${account.username ?? ""} ${account.seller?.name ?? ""}`.toLocaleLowerCase("tr-TR").includes(normalizedQuery));

  return {
    accounts,
    total: typeof (authData as { total?: unknown }).total === "number" ? (authData as { total: number }).total : accounts.length,
    page: safePage,
    perPage: safePerPage,
  };
}

async function createNotification(admin: SupabaseClient, userId: string, title: string, body: string, actionUrl: string) {
  const { error } = await admin.from("kk_notifications").insert({
    user_id: userId,
    kind: "account",
    event_type: "admin_account_update",
    event_key: `admin-account-${userId}-${Date.now()}`,
    title,
    description: body,
    href: actionUrl,
    action_label: "Görüntüle",
    important: true,
  });
  if (error && error.code !== "42P01") console.error("[KapışKapış] Yönetici bildirimi oluşturulamadı:", error.message);
}

export async function applyAdminAccountAction(
  admin: SupabaseClient,
  adminUser: User,
  targetUserId: string,
  action: AdminAccountAction,
  reasonInput?: string,
) {
  if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) throw new PaymentHttpError(400, "Geçersiz kullanıcı kimliği.");
  const reason = String(reasonInput ?? "").trim().slice(0, 500);
  const roleAction = action === "grant_admin" || action === "revoke_admin";
  if ((roleAction || action === "reject_seller" || action === "suspend_account") && reason.length < 5) {
    throw new PaymentHttpError(400, "Bu işlem için en az 5 karakterlik açıklama yazmalısın.");
  }
  if (targetUserId === adminUser.id && (action === "suspend_account" || action === "revoke_admin")) {
    throw new PaymentHttpError(400, "Kendi yönetici hesabında bu işlemi yapamazsın.");
  }

  const [{ data: actorProfile, error: actorError }, { data: profile, error: profileError }] = await Promise.all([
    admin.from("kk_profiles").select("role,admin_level,account_status").eq("id", adminUser.id).maybeSingle(),
    admin.from("kk_profiles").select("id,role,admin_level,role_before_admin,account_status,seller_status,email_verified_at,phone_verified_at,profile_completed_at").eq("id", targetUserId).maybeSingle(),
  ]);
  if (actorError || !actorProfile || actorProfile.role !== "admin" || actorProfile.account_status !== "active") throw new PaymentHttpError(403, "Yönetici yetkisi doğrulanamadı.");
  if (profileError || !profile) throw new PaymentHttpError(404, "Kullanıcı profili bulunamadı.", profileError?.code);
  if (roleAction && actorProfile.admin_level !== "owner") throw new PaymentHttpError(403, "Yönetici rolü yalnız sahip yönetici tarafından değiştirilebilir.");
  if (action === "suspend_account" && profile.role === "admin") throw new PaymentHttpError(400, "Yönetici hesapları bu işlemle askıya alınamaz.");

  const { data: seller, error: sellerError } = await admin.from("kk_sellers").select("id,user_id,platform_review_status").eq("user_id", targetUserId).maybeSingle();
  if (sellerError) throw new PaymentHttpError(500, "Satıcı hesabı okunamadı.", sellerError.code);

  let auditAction: "seller_approved" | "seller_rejected" | "account_suspended" | "account_activated" | "admin_granted" | "admin_revoked";

  if (action === "approve_seller" || action === "reject_seller") {
    if (!seller) throw new PaymentHttpError(404, "Bu kullanıcıya ait satıcı başvurusu bulunamadı.");
    const { data: payout, error: payoutError } = await admin.from("kk_seller_payout_accounts").select("onboarding_status,submerchant_key").eq("seller_id", seller.id).maybeSingle();
    if (payoutError) throw new PaymentHttpError(500, "Satıcı ödeme hesabı okunamadı.", payoutError.code);

    if (action === "approve_seller") {
      if (!profile.email_verified_at || !profile.phone_verified_at) throw new PaymentHttpError(422, "Satıcının e-posta ve telefon doğrulamalarının tamamlanması gerekiyor.");
      if (payout?.onboarding_status !== "active" || !payout.submerchant_key) throw new PaymentHttpError(422, "iyzico alt üye hesabı aktif olmayan satıcı onaylanamaz.");
      await admin.from("kk_sellers").update({ platform_review_status: "approved", platform_review_note: reason || null, platform_reviewed_at: new Date().toISOString(), platform_reviewed_by: adminUser.id, is_active: true, verified: true }).eq("id", seller.id);
      await admin.from("kk_profiles").update({ role: profile.role === "admin" ? "admin" : "seller", seller_status: "active" }).eq("id", targetUserId);
      await createNotification(admin, targetUserId, "Satıcı hesabın onaylandı", "Mağazan aktif. Artık ilan yayınlayabilir ve satış yapabilirsin.", "/ilanlarim");
      auditAction = "seller_approved";
    } else {
      await admin.from("kk_sellers").update({ platform_review_status: "rejected", platform_review_note: reason, platform_reviewed_at: new Date().toISOString(), platform_reviewed_by: adminUser.id, is_active: false, verified: false }).eq("id", seller.id);
      await admin.from("kk_profiles").update({ role: profile.role === "admin" ? "admin" : "seller", seller_status: "rejected" }).eq("id", targetUserId);
      await createNotification(admin, targetUserId, "Satıcı başvurunda düzeltme gerekiyor", reason, "/satici-dogrulama");
      auditAction = "seller_rejected";
    }
  } else if (action === "suspend_account") {
    await admin.from("kk_profiles").update({ account_status: "suspended", seller_status: seller ? "suspended" : profile.role === "seller" ? "suspended" : "not_started" }).eq("id", targetUserId);
    if (seller) await admin.from("kk_sellers").update({ platform_review_status: "suspended", platform_review_note: reason, is_active: false }).eq("id", seller.id);
    await createNotification(admin, targetUserId, "Hesabın geçici olarak kısıtlandı", reason, "/hesap-durumu?status=suspended");
    auditAction = "account_suspended";
  } else if (action === "activate_account") {
    const nextSellerStatus = seller ? "pending" : profile.role === "seller" ? "pending" : "not_started";
    await admin.from("kk_profiles").update({ account_status: "active", seller_status: nextSellerStatus }).eq("id", targetUserId);
    if (seller && seller.platform_review_status === "suspended") await admin.from("kk_sellers").update({ platform_review_status: "pending", platform_review_note: "Hesap yeniden etkinleştirildi; mağaza tekrar inceleme kuyruğuna alındı.", is_active: false, verified: false }).eq("id", seller.id);
    await createNotification(admin, targetUserId, "Hesabın yeniden etkinleştirildi", seller ? "Hesabını kullanabilirsin. Mağazan güven ekibi tarafından yeniden incelenecek." : "KapışKapış hesabını tekrar kullanabilirsin.", seller ? "/satici-dogrulama" : "/profil");
    auditAction = "account_activated";
  } else if (action === "grant_admin") {
    if (profile.role === "admin") throw new PaymentHttpError(400, "Bu hesap zaten yönetici.");
    const previousRole = profile.role === "seller" ? "seller" : "buyer";
    await admin.from("kk_profiles").update({ role: "admin", admin_level: "operator", role_before_admin: previousRole, account_status: "active", updated_at: new Date().toISOString() }).eq("id", targetUserId);
    await createNotification(admin, targetUserId, "Yönetici yetkisi verildi", "KapışKapış operasyon yönetimi hesabına açıldı. Hassas işlemler için iki adımlı doğrulamayı etkinleştir.", "/yonetim");
    await logAdminRoleSecurityEvent(admin, targetUserId, adminUser.id, "admin_granted", reason);
    auditAction = "admin_granted";
  } else if (action === "revoke_admin") {
    if (profile.role !== "admin") throw new PaymentHttpError(400, "Bu hesap yönetici değil.");
    if (profile.admin_level === "owner") throw new PaymentHttpError(400, "Sahip yönetici yetkisi bu ekrandan kaldırılamaz.");
    const restoredRole = profile.role_before_admin === "seller" || (seller && profile.seller_status !== "not_started") ? "seller" : "buyer";
    await admin.from("kk_profiles").update({ role: restoredRole, admin_level: "none", role_before_admin: null, updated_at: new Date().toISOString() }).eq("id", targetUserId);
    await createNotification(admin, targetUserId, "Yönetici yetkisi kaldırıldı", `Hesabın ${restoredRole === "seller" ? "satıcı" : "alıcı"} rolüne döndürüldü.`, "/profil");
    await logAdminRoleSecurityEvent(admin, targetUserId, adminUser.id, "admin_revoked", reason);
    auditAction = "admin_revoked";
  } else {
    throw new PaymentHttpError(400, "Geçersiz yönetici işlemi.");
  }

  const { error: auditError } = await admin.from("kk_admin_account_events").insert({ admin_user_id: adminUser.id, target_user_id: targetUserId, seller_id: seller?.id ?? null, action: auditAction, reason: reason || null });
  if (auditError) throw new PaymentHttpError(500, "Yönetici işlem kaydı oluşturulamadı. Paket 33 SQL dosyasını çalıştır.", auditError.code);
  return { ok: true };
}
