import { getSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase";
import { approveDeliveredOrder } from "@/lib/payments";

export type ReviewableOrder = {
  id: string;
  orderNo: string;
  productId?: string;
  productTitle: string;
  productImage: string;
  amount: number;
  currency: string;
  status: string;
  deliveredAt: string;
  sellerId: string;
  sellerSlug: string;
  sellerName: string;
  alreadyReviewed: boolean;
};

export type PublicSellerReview = {
  id: string;
  buyer: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  product: string;
  productId?: string;
  verifiedPurchase: true;
  tags: string[];
  sellerReply?: string;
  photos: string[];
};

export type SellerDatabaseProfile = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  location: string;
  about: string;
  categories: string[];
  badges: string[];
  verified: boolean;
  followersCount: number;
  successfulSalesCount: number;
  responseRate: number;
  responseTimeMinutes: number;
  shipOnTimeRate: number;
  cancellationRate: number;
};

export type SellerReviewSummary = {
  reviewCount: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type SellerReviewBundle = {
  seller: SellerDatabaseProfile;
  summary: SellerReviewSummary;
  reviews: PublicSellerReview[];
};

export type BuyerOrder = {
  id: string;
  orderNo: string;
  title: string;
  productId?: string;
  seller: string;
  sellerSlug: string;
  amount: number;
  state: "payment" | "preparing" | "shipped" | "delivered" | "expired";
  rawStatus: string;
  paymentStatus: string;
  paymentDueAt?: string;
  paymentExpiredAt?: string;
  winnerRank: number;
  offerType: "winner" | "second_chance" | "standard";
  date: string;
  image: string;
  tracking: string;
  carrier: string;
  eta: string;
  deliveredAt?: string;
};

type LoadResult<T> =
  | { status: "ready"; data: T }
  | { status: "not-configured" }
  | { status: "signed-out" }
  | { status: "not-found" }
  | { status: "error"; message: string };

function dateText(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function moneyValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapOrderState(status: string, paymentStatus: string): BuyerOrder["state"] {
  if (paymentStatus === "expired" || status === "cancelled") return "expired";
  if (status === "payment_pending") return "payment";
  if (status === "preparing") return "preparing";
  if (status === "shipped") return "shipped";
  return "delivered";
}

export async function loadReviewableOrder(orderNo: string): Promise<LoadResult<ReviewableOrder>> {
  if (!supabaseConfigured) return { status: "not-configured" };
  const client = getSupabaseBrowserClient();
  if (!client) return { status: "not-configured" };

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { status: "signed-out" };

  const { data, error } = await client.rpc("kk_get_reviewable_order", { p_order_no: orderNo });
  if (error) return { status: "error", message: error.message };
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { status: "not-found" };

  return {
    status: "ready",
    data: {
      id: String(row.id),
      orderNo: String(row.order_no),
      productId: row.product_id ? String(row.product_id) : undefined,
      productTitle: String(row.product_title),
      productImage: String(row.product_image || "/kapiskapis-hero.jpg"),
      amount: moneyValue(row.amount),
      currency: String(row.currency || "TRY"),
      status: String(row.status),
      deliveredAt: String(row.delivered_at || ""),
      sellerId: String(row.seller_id),
      sellerSlug: String(row.seller_slug),
      sellerName: String(row.seller_name),
      alreadyReviewed: Boolean(row.already_reviewed),
    },
  };
}

export async function createVerifiedReview(input: {
  orderNo: string;
  rating: number;
  accuracyRating: number;
  shippingRating: number;
  communicationRating: number;
  title: string;
  comment: string;
  tags: string[];
  anonymous: boolean;
  photos: File[];
}): Promise<{ reviewId: string; photoWarning?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error("Değerlendirme göndermek için giriş yapmalısın.");

  const { data, error } = await client.rpc("kk_submit_review", {
    p_order_no: input.orderNo,
    p_rating: input.rating,
    p_accuracy_rating: input.accuracyRating,
    p_shipping_rating: input.shippingRating,
    p_communication_rating: input.communicationRating,
    p_title: input.title,
    p_comment: input.comment,
    p_tags: input.tags.slice(0, 4),
    p_is_anonymous: input.anonymous,
  });

  if (error) throw new Error(error.message);
  const reviewId = String(data);
  if (!reviewId || reviewId === "null") throw new Error("Değerlendirme kimliği oluşturulamadı.");

  const photos = input.photos.slice(0, 4);
  if (!photos.length) return { reviewId };

  const uploadedPaths: string[] = [];
  const photoRows: Array<{ review_id: string; buyer_id: string; storage_path: string; sort_order: number }> = [];

  try {
    for (const [index, file] of photos.entries()) {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) throw new Error("Fotoğraflar JPG, PNG veya WEBP olmalıdır.");
      if (file.size > 8 * 1024 * 1024) throw new Error("Her fotoğraf en fazla 8 MB olabilir.");

      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${reviewId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage.from("review-photos").upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      photoRows.push({ review_id: reviewId, buyer_id: userData.user.id, storage_path: path, sort_order: index });
    }

    const { error: photoInsertError } = await client.from("kk_review_photos").insert(photoRows);
    if (photoInsertError) throw photoInsertError;
    return { reviewId };
  } catch (error) {
    if (uploadedPaths.length) await client.storage.from("review-photos").remove(uploadedPaths);
    return {
      reviewId,
      photoWarning: error instanceof Error ? `Yorum kaydedildi fakat fotoğraflar yüklenemedi: ${error.message}` : "Yorum kaydedildi fakat fotoğraflar yüklenemedi.",
    };
  }
}

export async function loadSellerReviewBundle(slug: string): Promise<SellerReviewBundle | null> {
  if (!supabaseConfigured) return null;
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data: sellerRow, error: sellerError } = await client
    .from("kk_public_sellers")
    .select("id,slug,name,initials,tagline,location,about,categories,badges,verified,followers_count,successful_sales_count,response_rate,response_time_minutes,ship_on_time_rate,cancellation_rate")
    .eq("slug", slug)
    .maybeSingle();

  if (sellerError || !sellerRow) return null;

  const [{ data: summaryRow }, { data: reviewRows, error: reviewsError }] = await Promise.all([
    client.from("kk_seller_review_summary").select("review_count,average_rating,five_star_count,four_star_count,three_star_count,two_star_count,one_star_count").eq("slug", slug).maybeSingle(),
    client.rpc("kk_get_public_seller_reviews", { p_slug: slug }),
  ]);

  if (reviewsError) return null;

  const reviews: PublicSellerReview[] = (Array.isArray(reviewRows) ? reviewRows : []).map((row) => {
    const photos = Array.isArray(row.photo_paths)
      ? row.photo_paths.map((path: unknown) => client.storage.from("review-photos").getPublicUrl(String(path)).data.publicUrl)
      : [];

    return {
      id: String(row.id),
      buyer: String(row.buyer_display_name || "KapışKapış kullanıcısı"),
      rating: Number(row.rating),
      date: dateText(String(row.created_at)),
      title: String(row.title || "Alışveriş deneyimi"),
      comment: String(row.comment),
      product: String(row.product_title),
      productId: row.product_id ? String(row.product_id) : undefined,
      verifiedPurchase: true,
      tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
      sellerReply: row.seller_reply ? String(row.seller_reply) : undefined,
      photos,
    };
  });

  const reviewCount = Number(summaryRow?.review_count ?? reviews.length);
  const averageRating = Number(summaryRow?.average_rating ?? (reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0));

  return {
    seller: {
      id: String(sellerRow.id),
      slug: String(sellerRow.slug),
      name: String(sellerRow.name),
      initials: String(sellerRow.initials || "KK"),
      tagline: String(sellerRow.tagline || "KapışKapış satıcısı"),
      location: String(sellerRow.location || "Türkiye"),
      about: String(sellerRow.about || ""),
      categories: Array.isArray(sellerRow.categories) ? sellerRow.categories.map(String) : [],
      badges: Array.isArray(sellerRow.badges) ? sellerRow.badges.map(String) : [],
      verified: Boolean(sellerRow.verified),
      followersCount: Number(sellerRow.followers_count ?? 0),
      successfulSalesCount: Number(sellerRow.successful_sales_count ?? 0),
      responseRate: Number(sellerRow.response_rate ?? 0),
      responseTimeMinutes: Number(sellerRow.response_time_minutes ?? 0),
      shipOnTimeRate: Number(sellerRow.ship_on_time_rate ?? 0),
      cancellationRate: Number(sellerRow.cancellation_rate ?? 0),
    },
    summary: {
      reviewCount,
      averageRating,
      distribution: {
        5: Number(summaryRow?.five_star_count ?? 0),
        4: Number(summaryRow?.four_star_count ?? 0),
        3: Number(summaryRow?.three_star_count ?? 0),
        2: Number(summaryRow?.two_star_count ?? 0),
        1: Number(summaryRow?.one_star_count ?? 0),
      },
    },
    reviews,
  };
}

export async function loadBuyerOrders(): Promise<LoadResult<BuyerOrder[]>> {
  if (!supabaseConfigured) return { status: "not-configured" };
  const client = getSupabaseBrowserClient();
  if (!client) return { status: "not-configured" };

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { status: "signed-out" };

  await client.rpc("kk_finalize_expired_auctions");
  await client.rpc("kk_process_unpaid_auction_orders", { p_limit: 50 });

  const { data: rows, error } = await client
    .from("kk_orders")
    .select("id,order_no,seller_id,product_id,product_title,product_image,amount,status,payment_status,payment_due_at,payment_expired_at,winner_rank,auction_offer_status,carrier,tracking_no,ordered_at,delivered_at,metadata")
    .eq("buyer_id", userData.user.id)
    .order("ordered_at", { ascending: false });

  if (error) return { status: "error", message: error.message };
  if (!rows?.length) return { status: "ready", data: [] };

  const sellerIds = [...new Set(rows.map((row) => String(row.seller_id)))];
  const { data: sellerRows } = await client.from("kk_public_sellers").select("id,name,slug").in("id", sellerIds);
  const sellerMap = new Map((sellerRows ?? []).map((seller) => [String(seller.id), { name: String(seller.name), slug: String(seller.slug) }]));

  return {
    status: "ready",
    data: rows.map((row) => {
      const seller = sellerMap.get(String(row.seller_id));
      const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata as Record<string, unknown> : {};
      return {
        id: String(row.id),
        orderNo: String(row.order_no),
        title: String(row.product_title),
        productId: row.product_id ? String(row.product_id) : undefined,
        seller: seller?.name ?? "KapışKapış satıcısı",
        sellerSlug: seller?.slug ?? "",
        amount: moneyValue(row.amount),
        state: mapOrderState(String(row.status), String(row.payment_status || "unpaid")),
        rawStatus: String(row.status),
        paymentStatus: String(row.payment_status || "unpaid"),
        paymentDueAt: row.payment_due_at ? String(row.payment_due_at) : undefined,
        paymentExpiredAt: row.payment_expired_at ? String(row.payment_expired_at) : undefined,
        winnerRank: Number(row.winner_rank || 1),
        offerType: row.auction_offer_status === "payment_pending" || row.auction_offer_status === "paid"
          ? (Number(row.winner_rank || 1) > 1 ? "second_chance" : "winner")
          : "standard",
        date: dateText(String(row.ordered_at)),
        image: String(row.product_image || "/kapiskapis-hero.jpg"),
        tracking: String(row.tracking_no || ""),
        carrier: String(row.carrier || "KapışKapış Kargo"),
        eta: String(metadata.estimated_delivery || (row.status === "delivered" ? dateText(String(row.delivered_at)) : "Kargo bilgisi bekleniyor")),
        deliveredAt: row.delivered_at ? String(row.delivered_at) : undefined,
      };
    }),
  };
}

export async function confirmBuyerDelivery(orderNo: string) {
  await approveDeliveredOrder(orderNo);
}
