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

export type Auction = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: AuctionCategory;
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
