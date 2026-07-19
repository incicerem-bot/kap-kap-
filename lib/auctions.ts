"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { formatPrice, secondsToTime, type Product, type ProductSpec } from "@/components/productData";
import { getSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase";

export type PublicListingRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  condition: string;
  brand: string | null;
  model: string | null;
  variant: string | null;
  description: string;
  start_price: number | string;
  buy_now_price: number | string | null;
  bid_increment: number | string;
  current_price: number | string;
  bid_count: number;
  watcher_count: number;
  view_count: number;
  auction_type: "timed" | "live";
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  shipping_method: string;
  shipping_payer: string;
  dispatch_days: number;
  location: string;
  specs: ProductSpec[] | null;
  created_at: string;
  seller_id: string;
  seller_slug: string;
  seller_name: string;
  seller_initials: string;
  seller_verified: boolean;
  seller_sales: number;
  seller_rating: number | string;
  image_urls: string[] | null;
};

export type AuctionBidHistory = {
  id: string;
  bidder: string;
  amount: number;
  source: "manual" | "auto";
  createdAt: string;
  mine: boolean;
};

export type ListingDraftPayload = {
  title: string;
  category: string;
  condition: string;
  brand: string;
  model: string;
  variant: string;
  description: string;
  start_price: number;
  reserve_price: number | null;
  buy_now_price: number | null;
  bid_increment: number;
  duration_days: number;
  auction_type: "timed" | "live";
  shipping_method: string;
  shipping_payer: string;
  dispatch_days: number;
  location?: string;
  specs: ProductSpec[];
};

export type SavedListing = { id: string; slug: string };

export type MyListing = {
  uuid: string;
  slug: string;
  title: string;
  status: "draft" | "active" | "paused" | "ended" | "sold" | "cancelled" | string;
  currentPrice: number;
  bidCount: number;
  watcherCount: number;
  viewCount: number;
  endsAt: string | null;
  createdAt: string;
  imageUrl: string;
};

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function secondsUntil(iso: string | null | undefined) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

export function listingRowToProduct(row: PublicListingRow): Product {
  const gallery = Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean) : [];
  const image = gallery[0] || "/kapiskapis-promo.jpg";
  const currentPrice = numberValue(row.current_price || row.start_price);
  const increment = numberValue(row.bid_increment);
  const remaining = secondsUntil(row.ends_at);

  return {
    id: row.slug,
    listingUuid: row.id,
    source: "supabase",
    endsAt: row.ends_at,
    status: row.status,
    sellerSlug: row.seller_slug,
    title: row.title,
    category: row.category,
    price: formatPrice(currentPrice),
    next: formatPrice(currentPrice + increment),
    bids: Number(row.bid_count ?? 0),
    time: secondsToTime(remaining),
    image,
    gallery: gallery.length ? gallery : [image],
    live: row.auction_type === "live",
    verified: Boolean(row.seller_verified),
    condition: row.condition,
    increment,
    seller: row.seller_name,
    sellerInitials: row.seller_initials || row.seller_name.slice(0, 2).toLocaleUpperCase("tr-TR"),
    sellerRating: numberValue(row.seller_rating),
    sellerSales: Number(row.seller_sales ?? 0),
    location: row.location || "Türkiye",
    watchers: Number(row.watcher_count ?? 0),
    views: Number(row.view_count ?? 0),
    description: row.description,
    shipping: row.shipping_method,
    specs: Array.isArray(row.specs) ? row.specs : [],
  };
}

export async function finalizeExpiredAuctions() {
  const client = getSupabaseBrowserClient();
  if (!client) return 0;
  const { data, error } = await client.rpc("kk_finalize_expired_auctions");
  if (error) throw error;
  return Number(data ?? 0);
}

export async function fetchPublicListings(): Promise<Product[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  await client.rpc("kk_finalize_expired_auctions");
  const { data, error } = await client
    .from("kk_public_listings")
    .select("*")
    .eq("status", "active")
    .order("ends_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as PublicListingRow[]).map(listingRowToProduct);
}

export async function fetchPublicListing(slug: string): Promise<Product | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  await client.rpc("kk_finalize_expired_auctions");
  const { data, error } = await client
    .from("kk_public_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? listingRowToProduct(data as PublicListingRow) : null;
}

export async function fetchPublicBidHistory(slug: string): Promise<AuctionBidHistory[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client.rpc("kk_get_public_bid_history", { p_listing_slug: slug });
  if (error) throw error;

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    bidder: String(row.bidder_label ?? "KapışKapış kullanıcısı"),
    amount: numberValue(row.amount as number | string),
    source: row.source === "auto" ? "auto" : "manual",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    mine: Boolean(row.is_mine),
  }));
}

export type BidAccess = {
  paymentVerified: boolean;
  identityVerified: boolean;
  cardVerified: boolean;
  heldSecurity: number;
  securityRequired: number;
  refundableSecurity: number;
};

export async function fetchMyBidAccess(): Promise<BidAccess> {
  const client = getSupabaseBrowserClient();
  if (!client) return { paymentVerified: false, identityVerified: false, cardVerified: false, heldSecurity: 0, securityRequired: 0, refundableSecurity: 0 };
  const { data, error } = await client.rpc("kk_get_my_bid_access");
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  return {
    paymentVerified: Boolean(row?.payment_verified),
    identityVerified: Boolean(row?.identity_verified),
    cardVerified: Boolean(row?.card_verified),
    heldSecurity: numberValue(row?.deposit_balance as number | string),
    securityRequired: numberValue(row?.security_required as number | string),
    refundableSecurity: numberValue(row?.refundable_security as number | string),
  };
}

export async function placeAuctionBid(slug: string, amount: number, maxAmount?: number | null) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");

  const { data, error } = await client.rpc("kk_place_bid", {
    p_listing_slug: slug,
    p_amount: amount,
    p_max_amount: maxAmount ?? null,
  });
  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  if (!row) throw new Error("Teklif sonucu alınamadı.");

  return {
    currentPrice: numberValue(row.current_price as number | string),
    bidCount: Number(row.bid_count ?? 0),
    endsAt: String(row.ends_at ?? ""),
    isLeading: Boolean(row.is_leading),
  };
}

export async function saveListingDraft(payload: ListingDraftPayload, listingId?: string | null): Promise<SavedListing> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");

  const { data, error } = await client.rpc("kk_save_listing", {
    p_payload: payload,
    p_listing_id: listingId ?? null,
  });
  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  if (!row?.id || !row?.slug) throw new Error("Taslak kaydı oluşturulamadı.");
  return { id: String(row.id), slug: String(row.slug) };
}

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLocaleLowerCase("tr-TR") || "jpg";
  const base = name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "urun";
  return `${base}.${extension}`;
}

export async function replaceListingImages(listingId: string, files: File[], coverIndex = 0) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");

  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData.user) throw new Error("Fotoğraf yüklemek için giriş yapmalısın.");
  if (files.length < 3 || files.length > 10) throw new Error("3 ile 10 arasında ürün fotoğrafı yüklemelisin.");

  const { data: previousRows } = await client
    .from("kk_listing_images")
    .select("storage_path")
    .eq("listing_id", listingId);
  const oldPaths = (previousRows ?? []).map((row) => row.storage_path).filter((value): value is string => Boolean(value));

  const ordered = files.map((file) => ({ file }));
  if (coverIndex > 0 && ordered[coverIndex]) {
    const [cover] = ordered.splice(coverIndex, 1);
    ordered.unshift(cover);
  }

  const uploaded: Array<{ image_url: string; storage_path: string; sort_order: number }> = [];
  try {
    for (let index = 0; index < ordered.length; index += 1) {
      const item = ordered[index];
      const path = `${authData.user.id}/${listingId}/${Date.now()}-${index}-${safeFileName(item.file.name)}`;
      const { error: uploadError } = await client.storage.from("listing-images").upload(path, item.file, {
        cacheControl: "3600",
        upsert: false,
        contentType: item.file.type || undefined,
      });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = client.storage.from("listing-images").getPublicUrl(path);
      uploaded.push({ image_url: publicUrlData.publicUrl, storage_path: path, sort_order: index });
    }

    const { data, error } = await client.rpc("kk_replace_listing_images", {
      p_listing_id: listingId,
      p_images: uploaded,
    });
    if (error) throw error;

    const replacedPaths = (Array.isArray(data) ? data : oldPaths).filter((value): value is string => typeof value === "string" && Boolean(value));
    if (replacedPaths.length) await client.storage.from("listing-images").remove(replacedPaths);
  } catch (error) {
    if (uploaded.length) await client.storage.from("listing-images").remove(uploaded.map((item) => item.storage_path));
    throw error;
  }
}

export async function publishListing(listingId: string) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
  const { data, error } = await client.rpc("kk_publish_listing", { p_listing_id: listingId });
  if (error) throw error;
  return String(data);
}

export async function fetchMyListings(): Promise<MyListing[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];
  const { data, error } = await client.rpc("kk_get_my_listings");
  if (error) throw error;

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    uuid: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    status: String(row.status),
    currentPrice: numberValue(row.current_price as number | string),
    bidCount: Number(row.bid_count ?? 0),
    watcherCount: Number(row.watcher_count ?? 0),
    viewCount: Number(row.view_count ?? 0),
    endsAt: row.ends_at ? String(row.ends_at) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    imageUrl: String(row.image_url ?? "/kapiskapis-promo.jpg"),
  }));
}

export async function setListingStatus(listingId: string, status: "active" | "paused" | "cancelled") {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
  const { error } = await client.rpc("kk_set_listing_status", { p_listing_id: listingId, p_status: status });
  if (error) throw error;
}

let realtimeChannelCounter = 0;

function createRealtimeChannelName(prefix: string) {
  realtimeChannelCounter += 1;
  return `${prefix}-${Date.now()}-${realtimeChannelCounter}`;
}

export function subscribeToListingLive(slug: string, onChange: (payload: { currentPrice: number; bidCount: number; endsAt: string | null; status: string }) => void): RealtimeChannel | null {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  // Supabase reuses channels with the same topic. React Strict Mode may mount,
  // clean up and mount the effect again before removeChannel() completes. A
  // unique topic prevents adding callbacks to a channel that already subscribed.
  const channel = client.channel(createRealtimeChannelName(`listing-live-${slug}`));

  channel.on("postgres_changes", {
    event: "UPDATE",
    schema: "public",
    table: "kk_listing_live",
    filter: `slug=eq.${slug}`,
  }, (payload) => {
    const row = payload.new as Record<string, unknown>;
    onChange({
      currentPrice: numberValue(row.current_price as number | string),
      bidCount: Number(row.bid_count ?? 0),
      endsAt: row.ends_at ? String(row.ends_at) : null,
      status: String(row.status ?? "active"),
    });
  });

  channel.subscribe();
  return channel;
}

export function subscribeToMarketplace(onChange: () => void): RealtimeChannel | null {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const channel = client.channel(createRealtimeChannelName("marketplace-live-listings"));
  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "kk_listing_live" },
    onChange,
  );
  channel.subscribe();
  return channel;
}

export { supabaseConfigured };
