import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AccountRole } from "@/lib/auth";
import { PaymentHttpError } from "@/lib/supabase-server";
import type { AccountDashboard, DashboardActivity, DashboardMetric, DashboardTask, DashboardWorkspaceItem } from "@/types/dashboard";

type ProfileRow = {
  full_name: string | null;
  username: string | null;
  role: string | null;
  admin_level: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  profile_completed_at: string | null;
};

type RoleData = {
  metrics: DashboardMetric[];
  workspace: DashboardWorkspaceItem[];
  sellerPayoutStatus?: string | null;
  storeSlug?: string | null;
  sellerReviewStatus?: AccountDashboard["identity"]["sellerReviewStatus"];
};

function roleOf(value: unknown): AccountRole {
  return value === "seller" || value === "admin" ? value : "buyer";
}

function reviewStatusOf(value: unknown): AccountDashboard["identity"]["sellerReviewStatus"] {
  return value === "pending" || value === "approved" || value === "rejected" || value === "suspended" ? value : "not_submitted";
}

function money(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number.isFinite(amount) ? amount : 0);
}

function toneForStatus(status: string): "neutral" | "positive" | "warning" | "critical" {
  if (["active", "approved", "paid", "delivered", "succeeded"].includes(status)) return "positive";
  if (["pending", "payment_pending", "preparing", "shipped", "held", "initializing", "awaiting_webhook"].includes(status)) return "warning";
  if (["rejected", "suspended", "failed", "disputed", "expired", "cancelled"].includes(status)) return "critical";
  return "neutral";
}

async function loadNotifications(admin: SupabaseClient, userId: string) {
  const listResult = await admin.from("kk_notifications")
    .select("id,title,description,href,important,created_at")
    .eq("user_id", userId)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(6);
  const countResult = await admin.from("kk_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null)
    .is("dismissed_at", null);

  if (listResult.error && listResult.error.code !== "42P01") throw new PaymentHttpError(503, "Bildirim özeti okunamadı.", listResult.error.code);
  if (countResult.error && countResult.error.code !== "42P01") throw new PaymentHttpError(503, "Bildirim sayısı okunamadı.", countResult.error.code);

  const activity: DashboardActivity[] = (listResult.data ?? []).map((item: any) => ({
    id: String(item.id),
    title: String(item.title || "Hesap hareketi"),
    description: String(item.description || ""),
    href: String(item.href || "/bildirimler"),
    createdAt: String(item.created_at || new Date().toISOString()),
    tone: item.important ? "warning" : "neutral",
  }));
  return { activity, unreadCount: countResult.count ?? 0 };
}

async function buildBuyerData(admin: SupabaseClient, user: User, unreadCount: number): Promise<RoleData> {
  const accessResult = await admin.from("kk_bid_access")
    .select("payment_verified,identity_verified,deposit_balance,bid_limit")
    .eq("user_id", user.id)
    .maybeSingle();
  const ordersResult = await admin.from("kk_orders")
    .select("id,order_no,product_title,amount,status,payment_status,ordered_at")
    .eq("buyer_id", user.id)
    .order("ordered_at", { ascending: false })
    .limit(50);
  const ownBidsResult = await admin.from("kk_bids")
    .select("listing_id,amount,created_at")
    .eq("bidder_id", user.id)
    .order("created_at", { ascending: false })
    .limit(250);

  if (accessResult.error && !["PGRST116", "42P01"].includes(accessResult.error.code)) throw new PaymentHttpError(503, "Teklif güvencesi okunamadı.", accessResult.error.code);
  if (ordersResult.error && ordersResult.error.code !== "42P01") throw new PaymentHttpError(503, "Sipariş özeti okunamadı.", ordersResult.error.code);
  if (ownBidsResult.error && ownBidsResult.error.code !== "42P01") throw new PaymentHttpError(503, "Teklif özeti okunamadı.", ownBidsResult.error.code);

  const ownBids = ownBidsResult.data ?? [];
  const listingIds = [...new Set(ownBids.map((row: any) => String(row.listing_id)))];
  let listings: any[] = [];
  let allBids: any[] = [];
  if (listingIds.length) {
    const listingResult = await admin.from("kk_listings").select("id,slug,title,current_price,status,ends_at").in("id", listingIds);
    const allBidResult = await admin.from("kk_bids").select("listing_id,bidder_id,amount,created_at").in("listing_id", listingIds).order("amount", { ascending: false }).limit(1000);
    if (listingResult.error && listingResult.error.code !== "42P01") throw new PaymentHttpError(503, "Katıldığın açık artırmalar okunamadı.", listingResult.error.code);
    if (allBidResult.error && allBidResult.error.code !== "42P01") throw new PaymentHttpError(503, "Lider teklif bilgisi okunamadı.", allBidResult.error.code);
    listings = listingResult.data ?? [];
    allBids = allBidResult.data ?? [];
  }

  const activeListings = listings.filter((item) => item.status === "active");
  const leaderByListing = new Map<string, string>();
  for (const bid of allBids) if (!leaderByListing.has(String(bid.listing_id))) leaderByListing.set(String(bid.listing_id), String(bid.bidder_id));
  const leadingCount = activeListings.filter((item) => leaderByListing.get(String(item.id)) === user.id).length;
  const orders = ordersResult.data ?? [];
  const paymentPending = orders.filter((order: any) => order.payment_status === "unpaid" || order.status === "payment_pending").length;
  const depositBalance = Number((accessResult.data as any)?.deposit_balance ?? 0);

  return {
    metrics: [
      { key: "active-bids", label: "Aktif açık artırma", value: String(activeListings.length), helper: leadingCount ? `${leadingCount} üründe lider sensin` : "Katıldığın aktif ürünler", href: "/tekliflerim", tone: leadingCount ? "positive" : "neutral" },
      { key: "orders", label: "Sipariş", value: String(orders.length), helper: paymentPending ? `${paymentPending} ödeme bekliyor` : "Tüm alışverişlerin", href: "/siparisler", tone: paymentPending ? "warning" : "neutral" },
      { key: "guarantee", label: "Teklif güvencesi", value: money(depositBalance), helper: depositBalance ? "Aktif tekliflerin için kullanılabilir" : "Yüksek teklifler için gerekebilir", href: "/teklif-guvencesi", tone: depositBalance ? "positive" : "neutral" },
      { key: "notifications", label: "Okunmamış bildirim", value: String(unreadCount), helper: unreadCount ? "Hesabında yeni hareket var" : "Tüm bildirimler okundu", href: "/bildirimler", tone: unreadCount ? "warning" : "positive" },
    ],
    workspace: activeListings.slice(0, 4).map((listing) => {
      const leading = leaderByListing.get(String(listing.id)) === user.id;
      return {
        id: String(listing.id),
        title: String(listing.title),
        description: leading ? "Şu anda en yüksek teklif sende" : "Teklifin geçilmiş olabilir",
        meta: `${money(listing.current_price)} · ${listing.ends_at ? new Date(listing.ends_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Süre bilgisi yok"}`,
        href: `/urun/${listing.slug}`,
        status: leading ? "Lider" : "Takip et",
        tone: leading ? "positive" : "warning",
      };
    }),
  };
}

async function buildSellerData(admin: SupabaseClient, user: User, unreadCount: number): Promise<RoleData> {
  const sellerResult = await admin.from("kk_sellers")
    .select("id,slug,name,platform_review_status,is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (sellerResult.error && sellerResult.error.code !== "PGRST116") throw new PaymentHttpError(503, "Satıcı hesabı okunamadı.", sellerResult.error.code);

  const seller = sellerResult.data as any;
  const sellerId = seller?.id ? String(seller.id) : null;
  let payout: any = null;
  let listings: any[] = [];
  let orders: any[] = [];

  if (sellerId) {
    const payoutResult = await admin.from("kk_seller_payout_accounts").select("onboarding_status,activated_at").eq("seller_id", sellerId).maybeSingle();
    const listingsResult = await admin.from("kk_listings").select("id,slug,title,current_price,bid_count,view_count,status,ends_at,created_at").eq("seller_id", sellerId).order("created_at", { ascending: false }).limit(100);
    const ordersResult = await admin.from("kk_orders").select("id,order_no,product_title,amount,status,payment_status,payout_status,ordered_at").eq("seller_id", sellerId).order("ordered_at", { ascending: false }).limit(100);
    if (payoutResult.error && !["PGRST116", "42P01"].includes(payoutResult.error.code)) throw new PaymentHttpError(503, "Satıcı ödeme hesabı okunamadı.", payoutResult.error.code);
    if (listingsResult.error && listingsResult.error.code !== "42P01") throw new PaymentHttpError(503, "İlan özeti okunamadı.", listingsResult.error.code);
    if (ordersResult.error && ordersResult.error.code !== "42P01") throw new PaymentHttpError(503, "Satış siparişleri okunamadı.", ordersResult.error.code);
    payout = payoutResult.data;
    listings = listingsResult.data ?? [];
    orders = ordersResult.data ?? [];
  }

  const activeListings = listings.filter((item) => item.status === "active");
  const shippingCount = orders.filter((item) => item.status === "preparing").length;
  const heldAmount = orders.filter((item) => item.payout_status === "held").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paidRevenue = orders.filter((item) => item.payment_status === "paid" || item.status === "delivered").reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    sellerPayoutStatus: payout?.onboarding_status ?? null,
    storeSlug: seller?.slug ?? null,
    sellerReviewStatus: reviewStatusOf(seller?.platform_review_status),
    metrics: [
      { key: "active-listings", label: "Aktif ilan", value: String(activeListings.length), helper: `${listings.filter((item) => item.status === "draft").length} taslak ilan`, href: "/ilanlarim", tone: activeListings.length ? "positive" : "neutral" },
      { key: "shipping", label: "Kargolanacak satış", value: String(shippingCount), helper: shippingCount ? "Gönderim süresini kaçırma" : "Bekleyen gönderi bulunmuyor", href: "/kargo?mode=shipping", tone: shippingCount ? "warning" : "positive" },
      { key: "held", label: "Korunan satış tutarı", value: money(heldAmount), helper: "Teslimat onayından sonra aktarılır", href: "/cuzdan", tone: heldAmount ? "warning" : "neutral" },
      { key: "revenue", label: "Toplam satış hacmi", value: money(paidRevenue), helper: `${orders.length} satış siparişi`, href: "/ilanlarim?tab=orders", tone: paidRevenue ? "positive" : "neutral" },
    ],
    workspace: listings.slice(0, 4).map((listing) => ({
      id: String(listing.id),
      title: String(listing.title),
      description: `${Number(listing.bid_count || 0)} teklif · ${Number(listing.view_count || 0)} görüntülenme`,
      meta: `${money(listing.current_price)}${listing.ends_at ? ` · ${new Date(listing.ends_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}`,
      href: `/urun/${listing.slug}`,
      status: listing.status === "active" ? "Yayında" : listing.status === "draft" ? "Taslak" : String(listing.status),
      tone: toneForStatus(String(listing.status)),
    })),
  };
}

async function countRows(query: any): Promise<number> {
  const result = await query;
  if (result.error && result.error.code !== "42P01") throw new PaymentHttpError(503, "Yönetim özeti okunamadı.", result.error.code);
  return result.count ?? 0;
}

async function buildAdminData(admin: SupabaseClient): Promise<RoleData> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [pendingSellers, pendingListings, disputedOrders, criticalEvents, activeUsers] = await Promise.all([
    countRows(admin.from("kk_sellers").select("id", { count: "exact", head: true }).eq("platform_review_status", "pending")),
    countRows(admin.from("kk_listings").select("id", { count: "exact", head: true }).eq("status", "pending")),
    countRows(admin.from("kk_orders").select("id", { count: "exact", head: true }).eq("status", "disputed")),
    countRows(admin.from("kk_security_events").select("id", { count: "exact", head: true }).in("severity", ["warning", "critical"]).gte("created_at", since)),
    countRows(admin.from("kk_profiles").select("id", { count: "exact", head: true }).eq("account_status", "active")),
  ]);

  const eventsResult = await admin.from("kk_security_events")
    .select("id,title,description,severity,created_at")
    .order("created_at", { ascending: false })
    .limit(6);
  if (eventsResult.error && eventsResult.error.code !== "42P01") throw new PaymentHttpError(503, "Güvenlik olayları okunamadı.", eventsResult.error.code);

  return {
    metrics: [
      { key: "pending-sellers", label: "Satıcı onayı", value: String(pendingSellers), helper: "İnceleme bekleyen mağazalar", href: "/yonetim/kullanicilar?filter=seller_pending", tone: pendingSellers ? "warning" : "positive" },
      { key: "pending-listings", label: "İlan moderasyonu", value: String(pendingListings), helper: "Yayın öncesi inceleme kuyruğu", href: "/yonetim", tone: pendingListings ? "warning" : "positive" },
      { key: "disputes", label: "Açık uyuşmazlık", value: String(disputedOrders), helper: "Ödeme aktarımı durdurulan işlemler", href: "/yonetim", tone: disputedOrders ? "critical" : "positive" },
      { key: "users", label: "Aktif hesap", value: String(activeUsers), helper: `${criticalEvents} son 24 saat güvenlik sinyali`, href: "/yonetim/kullanicilar", tone: criticalEvents ? "warning" : "neutral" },
    ],
    workspace: (eventsResult.data ?? []).map((event: any) => ({
      id: String(event.id),
      title: String(event.title || "Güvenlik olayı"),
      description: String(event.description || "Güvenlik olayı kaydedildi."),
      meta: new Date(event.created_at).toLocaleString("tr-TR"),
      href: "/yonetim/kullanicilar",
      status: event.severity === "critical" ? "Kritik" : event.severity === "warning" ? "İncele" : "Bilgi",
      tone: event.severity === "critical" ? "critical" : event.severity === "warning" ? "warning" : "neutral",
    })),
  };
}

export async function buildAccountDashboard(admin: SupabaseClient, user: User): Promise<AccountDashboard> {
  const profileResult = await admin.from("kk_profiles")
    .select("full_name,username,role,admin_level,email_verified_at,phone_verified_at,profile_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profileResult.error || !profileResult.data) throw new PaymentHttpError(503, "Hesap profili okunamadı. Paket 30-33 SQL kurulumlarını kontrol et.", profileResult.error?.code);

  const profile = profileResult.data as ProfileRow;
  const role = roleOf(profile.role);
  const notificationState = await loadNotifications(admin, user.id);
  const roleData = role === "admin"
    ? await buildAdminData(admin)
    : role === "seller"
      ? await buildSellerData(admin, user, notificationState.unreadCount)
      : await buildBuyerData(admin, user, notificationState.unreadCount);

  const profileCompleted = Boolean(profile.profile_completed_at);
  const emailVerified = Boolean(profile.email_verified_at || user.email_confirmed_at);
  const phoneVerified = Boolean(profile.phone_verified_at || user.phone_confirmed_at);
  const sellerReviewStatus = roleData.sellerReviewStatus ?? "not_submitted";

  const tasks: DashboardTask[] = [
    { key: "email", title: "E-posta doğrulaması", description: emailVerified ? "E-posta adresin doğrulandı." : "Hesap güvenliği için e-posta adresini doğrula.", href: "/hesap-dogrulama?required=email", complete: emailVerified, important: !emailVerified },
    { key: "phone", title: "Telefon doğrulaması", description: phoneVerified ? "Telefon numaran doğrulandı." : "Teklif ve satış işlemleri için telefonunu doğrula.", href: "/hesap-dogrulama?required=phone", complete: phoneVerified, important: !phoneVerified },
    { key: "profile", title: "Profil bilgileri", description: profileCompleted ? "Temel profil bilgilerin tamamlandı." : "Kullanıcı adı, doğum tarihi ve şehir bilgilerini tamamla.", href: "/profil-tamamlama", complete: profileCompleted, important: !profileCompleted },
  ];

  if (role === "buyer") {
    tasks.push({ key: "seller", title: "Satıcı hesabı", description: "Ürün satmak için satıcı doğrulama sürecini başlatabilirsin.", href: "/satici-dogrulama", complete: false });
  } else if (role === "seller") {
    tasks.push({ key: "payout", title: "iyzico ödeme hesabı", description: roleData.sellerPayoutStatus === "active" ? "Satış gelirlerini almaya hazırsın." : "Satış gelirlerini almak için alt üye hesabını tamamla.", href: "/satici-dogrulama", complete: roleData.sellerPayoutStatus === "active", important: roleData.sellerPayoutStatus !== "active" });
    tasks.push({ key: "review", title: "KapışKapış mağaza onayı", description: sellerReviewStatus === "approved" ? "Mağazan platform tarafından onaylandı." : sellerReviewStatus === "pending" ? "Başvurun yönetici incelemesinde." : "Mağaza inceleme şartlarını tamamla.", href: "/satici-dogrulama", complete: sellerReviewStatus === "approved", important: sellerReviewStatus === "rejected" || sellerReviewStatus === "suspended" });
  } else {
    tasks.push({ key: "mfa", title: "Yönetici MFA güvenliği", description: "Hassas yönetici işlemleri için iki adımlı doğrulama kullan.", href: "/ayarlar?tab=security", complete: false, important: true });
  }

  return {
    role,
    generatedAt: new Date().toISOString(),
    identity: {
      fullName: profile.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "KapışKapış kullanıcısı",
      username: profile.username,
      emailVerified,
      phoneVerified,
      profileCompleted,
      adminLevel: profile.admin_level === "owner" || profile.admin_level === "operator" ? profile.admin_level : "none",
      sellerReviewStatus,
      sellerPayoutStatus: roleData.sellerPayoutStatus ?? null,
      storeSlug: roleData.storeSlug ?? null,
    },
    metrics: roleData.metrics,
    tasks,
    activity: notificationState.activity,
    workspace: roleData.workspace,
  };
}
