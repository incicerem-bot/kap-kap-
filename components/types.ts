export type AuctionCategory =
  | "all"
  | "phone"
  | "computer"
  | "gaming"
  | "watch"
  | "vehicle"
  | "home"
  | "camera"
  | "collection";

export type ProductType =
  | "smartphone"
  | "laptop"
  | "game_console"
  | "television"
  | "smartwatch"
  | "camera"
  | "car"
  | "furniture";

export type ProductSpecifications = Record<
  string,
  string | number | boolean | null
>;

export type Auction = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: AuctionCategory;
  product_type?: ProductType | null;
  brand?: string | null;
  model?: string | null;
  specifications?: ProductSpecifications | null;
  live_enabled?: boolean;
  live_is_open?: boolean;
  live_opened_at?: string | null;
  live_scheduled_at?: string | null;
  start_price: number;
  current_price: number;
  min_increment: number;
  ends_at: string;
  status: "active" | "ended" | "cancelled";
  image_url?: string | null;
  created_at: string;
};

export type Bid = {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
};

export type ProfileSummary = {
  id: string;
  full_name: string;
  email: string;
  username?: string | null;
  city?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  account_type?: "user" | "seller";
  created_at: string | null;
  active_listings: number;
  favorite_count: number;
  bid_count: number;
};


export type AppNotification = {
  id: string;
  user_id: string;
  auction_id: string | null;
  type: "new_bid" | "outbid" | "auction_won" | "auction_ended" | "system";
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};


export type ConversationMessage = {
  id: string;
  auction_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
};


export type OrderStatus =
  | "payment_pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type AuctionOrder = {
  id: string;
  auction_id: string;
  seller_id: string;
  buyer_id: string;
  amount: number;
  status: OrderStatus;
  tracking_code: string | null;
  shipping_address_id?: string | null;
  shipping_address?: UserAddress | null;
  created_at: string;
  updated_at: string;
  auction?: Auction | null;
};


export type LiveRoomMessage = {
  id: string;
  auction_id: string;
  user_id: string;
  user_name: string;
  body: string;
  created_at: string;
};


export type SavedSearch = {
  id: string;
  user_id: string;
  name: string;
  category: AuctionCategory;
  product_type: ProductType | null;
  brand: string | null;
  model: string | null;
  min_price: number | null;
  max_price: number | null;
  specifications: ProductSpecifications;
  alerts_enabled: boolean;
  created_at: string;
};


export type SellerReview = {
  id: string;
  order_id: string;
  auction_id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string | null;
};

export type SellerTrustSummary = {
  seller_id: string;
  seller_name: string;
  average_rating: number;
  review_count: number;
  completed_sales: number;
  member_since: string | null;
  reviews: SellerReview[];
};


export type AuctionReportStatus = "pending" | "reviewed" | "dismissed" | "action_taken";

export type AuctionReport = {
  id: string;
  auction_id: string;
  reporter_id: string;
  reason: string;
  details: string;
  status: AuctionReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  auction?: Auction | null;
};


export type UserAddress = {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  address_line: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};


export type DisputeType = "cancellation" | "return" | "problem";
export type DisputeStatus =
  | "open"
  | "seller_responded"
  | "approved"
  | "rejected"
  | "resolved";

export type OrderDispute = {
  id: string;
  order_id: string;
  auction_id: string;
  buyer_id: string;
  seller_id: string;
  type: DisputeType;
  reason: string;
  details: string;
  seller_response: string | null;
  status: DisputeStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  order?: AuctionOrder | null;
};


export type SellerStoreSummary = {
  seller_id: string;
  seller_name: string;
  average_rating: number;
  review_count: number;
  completed_sales: number;
  follower_count: number;
  active_listings: Auction[];
  member_since: string | null;
};


export type LiveReminder = {
  id: string;
  auction_id: string;
  user_id: string;
  created_at: string;
  notified_at: string | null;
};


export type SellerProfile = {
  user_id: string;
  store_name: string;
  store_slug: string;
  description: string;
  logo_url: string | null;
  cover_url: string | null;
  city: string | null;
  verified: boolean;
  vacation_mode: boolean;
  created_at: string;
  updated_at: string;
};

export type EditableUserProfile = {
  id: string;
  full_name: string;
  username: string;
  city: string;
  bio: string;
  phone: string;
  avatar_url: string | null;
  account_type: "user" | "seller";
};
