"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase";
import { identifyAnalyticsUser, resetAnalyticsUser } from "@/lib/analytics";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AuctionCard from "@/components/AuctionCard";
import AuthModal from "@/components/AuthModal";
import SellModal from "@/components/SellModal";
import ProductDetailModal from "@/components/ProductDetailModal";
import Footer from "@/components/Footer";
import ProfileModal from "@/components/ProfileModal";
import NotificationPanel from "@/components/NotificationPanel";
import MessagePanel from "@/components/MessagePanel";
import OrderCenterModal from "@/components/OrderCenterModal";
import DashboardSections from "@/components/DashboardSections";
import WalletModal from "@/components/WalletModal";
import SalesCenterModal from "@/components/SalesCenterModal";
import BottomNav from "@/components/BottomNav";
import CompareModal from "@/components/CompareModal";
import LiveAuctionRoom from "@/components/LiveAuctionRoom";
import FounderPanel from "@/components/FounderPanel";
import BuyerFilters from "@/components/BuyerFilters";
import SavedSearchesPanel from "@/components/SavedSearchesPanel";
import SellerReviewsModal from "@/components/SellerReviewsModal";
import ReviewFormModal from "@/components/ReviewFormModal";
import ReportListingModal from "@/components/ReportListingModal";
import ModerationPanel from "@/components/ModerationPanel";
import AddressBookModal from "@/components/AddressBookModal";
import DisputeFormModal from "@/components/DisputeFormModal";
import DisputeCenterModal from "@/components/DisputeCenterModal";
import SellerStoreModal from "@/components/SellerStoreModal";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";
import type { Auction, AuctionCategory, Bid, ProfileSummary, AppNotification, AuctionOrder, ConversationMessage, OrderStatus, ProductSpecifications, ProductType, SavedSearch, SellerReview, SellerTrustSummary, AuctionReport, AuctionReportStatus, UserAddress, DisputeStatus, DisputeType, OrderDispute, SellerStoreSummary, LiveReminder, EditableUserProfile, SellerProfile } from "@/components/types";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AuctionCategory>("all");
  const [buyerProductType, setBuyerProductType] =
    useState<ProductType | "">("");
  const [buyerBrand, setBuyerBrand] = useState("");
  const [buyerModel, setBuyerModel] = useState("");
  const [buyerSpecifications, setBuyerSpecifications] =
    useState<ProductSpecifications>({});
  const [buyerMinPrice, setBuyerMinPrice] = useState("");
  const [buyerMaxPrice, setBuyerMaxPrice] = useState("");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedSearchesLoading, setSavedSearchesLoading] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [sellerTrust, setSellerTrust] =
    useState<SellerTrustSummary | null>(null);
  const [sellerTrustLoading, setSellerTrustLoading] = useState(false);
  const [sellerStore, setSellerStore] =
    useState<SellerStoreSummary | null>(null);
  const [sellerStoreLoading, setSellerStoreLoading] = useState(false);
  const [showSellerStore, setShowSellerStore] = useState(false);
  const [followedSellerIds, setFollowedSellerIds] = useState<string[]>([]);
  const [sellerFollowLoading, setSellerFollowLoading] = useState(false);
  const [showSellerReviews, setShowSellerReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<string[]>([]);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showSell, setShowSell] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageOtherUserName, setMessageOtherUserName] = useState("Satıcı");
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [editableProfile, setEditableProfile] =
    useState<EditableUserProfile | null>(null);
  const [mySellerProfile, setMySellerProfile] =
    useState<SellerProfile | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileSettingsLoading, setProfileSettingsLoading] = useState(false);
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [myBidAuctions, setMyBidAuctions] = useState<Auction[]>([]);
  const [myFavoriteAuctions, setMyFavoriteAuctions] = useState<Auction[]>([]);
  const [myWonAuctions, setMyWonAuctions] = useState<Auction[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [orders, setOrders] = useState<AuctionOrder[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [addressSelectionMode, setAddressSelectionMode] = useState(false);
  const [orderDisputes, setOrderDisputes] = useState<OrderDispute[]>([]);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showDisputeCenter, setShowDisputeCenter] = useState(false);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AuctionOrder | null>(null);
  const [showOrderCenter, setShowOrderCenter] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showSalesCenter, setShowSalesCenter] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showLiveRoom, setShowLiveRoom] = useState(false);
  const [showFounderPanel, setShowFounderPanel] = useState(false);
  const [showReportListing, setShowReportListing] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [auctionReports, setAuctionReports] = useState<AuctionReport[]>([]);
  const [founderLoading, setFounderLoading] = useState(false);
  const [founderProgress, setFounderProgress] = useState(0);
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionDescription, setAuctionDescription] = useState("");
  const [auctionCategory, setAuctionCategory] = useState<AuctionCategory>("phone");
  const [auctionProductType, setAuctionProductType] =
    useState<ProductType | "">("smartphone");
  const [auctionBrand, setAuctionBrand] = useState("");
  const [auctionModel, setAuctionModel] = useState("");
  const [auctionSpecifications, setAuctionSpecifications] =
    useState<ProductSpecifications>({});
  const [startPrice, setStartPrice] = useState("1000");
  const [minIncrement, setMinIncrement] = useState("100");
  const [durationHours, setDurationHours] = useState("24");
  const [auctionLiveEnabled, setAuctionLiveEnabled] = useState(false);
  const [auctionLiveStartOpen, setAuctionLiveStartOpen] = useState(false);
  const [auctionLiveScheduledAt, setAuctionLiveScheduledAt] = useState("");
  const [liveControlLoading, setLiveControlLoading] = useState(false);
  const [liveReminderIds, setLiveReminderIds] = useState<string[]>([]);
  const [liveReminderLoading, setLiveReminderLoading] = useState(false);
  const [auctionImage, setAuctionImage] = useState<File | null>(null);
  const [auctionImagePreview, setAuctionImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [liveEvent, setLiveEvent] = useState("");
  const [pricePulseId, setPricePulseId] = useState<string | null>(null);


  function toggleCompare(auctionId: string) {
    setCompareIds((current) => {
      if (current.includes(auctionId)) return current.filter((id) => id !== auctionId);
      if (current.length >= 4) { setMessage("En fazla 4 ilan karşılaştırabilirsin."); return current; }
      return [...current, auctionId];
    });
  }

  const BETA_MARKER = "[KAPISKAPIS_BETA_V1]";

  const founderStats = useMemo(() => {
    const testAuctions = auctions.filter((auction) =>
      auction.description.includes(BETA_MARKER)
    );
    const categoryCount = new Set(
      auctions.filter((auction) => auction.category !== "all").map((auction) => auction.category)
    ).size;

    return {
      active: auctions.length,
      test: testAuctions.length,
      categories: categoryCount,
    };
  }, [auctions]);


  function buildBetaAuctions(sellerId: string) {
    const catalog: Record<Exclude<AuctionCategory, "all">, Array<[string, number]>> = {
      phone: [
        ["iPhone 15 Pro 256 GB Titanyum", 43000], ["Samsung Galaxy S24 Ultra", 39000],
        ["iPhone 14 Pro Max 256 GB", 34000], ["Xiaomi 14 Ultra", 29000],
      ],
      computer: [
        ["MacBook Pro M3 Pro 14 inç", 52000], ["ASUS ROG Strix G16 RTX 4070", 45000],
        ["MacBook Air M3 15 inç", 37000], ["Lenovo Legion 5 Pro", 39000],
      ],
      gaming: [
        ["PlayStation 5 Slim Diskli", 19000], ["Xbox Series X 1 TB", 17000],
        ["Nintendo Switch OLED", 11000], ["Steam Deck OLED 1 TB", 24000],
      ],
      watch: [
        ["Rolex Datejust 41", 280000], ["Omega Seamaster Diver 300M", 155000],
        ["Apple Watch Ultra 2", 26000], ["Garmin Fenix 7X Pro", 23000],
      ],
      vehicle: [
        ["2022 Tesla Model 3 Long Range", 1450000], ["2021 BMW 320i M Sport", 1850000],
        ["2023 Toyota Corolla Hybrid", 1320000], ["2022 Hyundai Tucson Elite Plus", 1580000],
      ],
      home: [
        ["Masif Meşe Yemek Masası", 18000], ["L Köşe Koltuk Takımı", 24000],
        ["Dyson V15 Detect Absolute", 19000], ["LG OLED 65 inç C3", 42000],
      ],
      camera: [
        ["Sony A7 IV Body", 62000], ["Canon EOS R6 Mark II", 68000],
        ["Fujifilm X-T5 Kit", 57000], ["DJI Mavic 3 Classic", 53000],
      ],
      collection: [
        ["İmzalı Michael Jordan Forma", 85000], ["1999 Pokemon Charizard Kartı", 65000],
        ["Beatles Abbey Road Orijinal Plak", 12000], ["Vintage Leica M3", 74000],
      ],
    };

    const imageUrls: Record<Exclude<AuctionCategory, "all">, string> = {
      phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
      computer: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
      gaming: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
      watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      vehicle: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      home: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      collection: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=1200&q=80",
    };

    const categories = Object.keys(catalog) as Array<Exclude<AuctionCategory, "all">>;
    const createdAt = Date.now();

    return Array.from({ length: 100 }, (_, index) => {
      const category = categories[index % categories.length];
      const products = catalog[category];
      const [baseTitle, marketPrice] = products[Math.floor(index / categories.length) % products.length];
      const cycle = Math.floor(index / 32) + 1;
      const startPrice = Math.max(500, Math.round((marketPrice * (0.48 + (index % 7) * 0.035)) / 100) * 100);
      const minimumIncrement = Math.max(100, Math.round((startPrice * 0.018) / 100) * 100);
      const hours = 3 + ((index * 7) % 237);

      return {
        seller_id: sellerId,
        title: `${baseTitle}${cycle > 1 ? ` · Beta Seri ${cycle}` : ""}`,
        description: `${BETA_MARKER} Platform performans ve tasarım testi için hazırlanmış örnek ilandır. Ürün temiz kullanılmış, çalışır durumda ve güvenli gönderime uygundur.`,
        category,
        start_price: startPrice,
        starting_bid: startPrice,
        current_bid: startPrice,
        current_price: startPrice,
        reserve_price: startPrice,
        city: "İstanbul",
        min_increment: minimumIncrement,
        ends_at: new Date(createdAt + hours * 60 * 60 * 1000).toISOString(),
        status: "active" as const,
        image_url: imageUrls[category],
      };
    });
  }

  async function createBetaAuctions() {
    if (!isAdmin) {
      setMessage("Kurucu araçları yalnızca yönetici hesabına açıktır.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    if (founderStats.test > 0) {
      setMessage("Önce mevcut beta ilanlarını temizle veya var olan test verileriyle devam et.");
      return;
    }

    const rows = buildBetaAuctions(user.id);
    setFounderLoading(true);
    setFounderProgress(0);

    for (let index = 0; index < rows.length; index += 10) {
      const batch = rows.slice(index, index + 10);
      const { error } = await supabase.from("auctions").insert(batch);

      if (error) {
        setFounderLoading(false);
        setMessage(`Test ilanları oluşturulamadı: ${error.message}`);
        return;
      }

      setFounderProgress(Math.round(((index + batch.length) / rows.length) * 100));
    }

    await loadAuctions();
    setFounderLoading(false);
    setFounderProgress(100);
    setMessage("100 beta test ilanı başarıyla oluşturuldu.");
  }

  async function deleteBetaAuctions() {
    if (!isAdmin) {
      setMessage("Kurucu araçları yalnızca yönetici hesabına açıktır.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    const approved = window.confirm(
      "Bu panelin oluşturduğu sana ait tüm beta ilanları silinsin mi?"
    );
    if (!approved) return;

    setFounderLoading(true);
    setFounderProgress(25);

    const { error } = await supabase
      .from("auctions")
      .delete()
      .eq("seller_id", user.id)
      .like("description", `%${BETA_MARKER}%`);

    if (error) {
      setFounderLoading(false);
      setMessage(`Test ilanları silinemedi: ${error.message}`);
      return;
    }

    setFounderProgress(100);
    await loadAuctions();
    setFounderLoading(false);
    setMessage("Beta test ilanları temizlendi.");
  }

  async function loadAuctions() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase.rpc("finalize_expired_auctions");

    const { data, error } = await supabase
      .from("auctions")
      .select("id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`İlanlar yüklenemedi: ${error.message}`);
      return;
    }

    setAuctions((data ?? []) as Auction[]);
  }

  async function loadFavorites(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("favorites")
      .select("auction_id")
      .eq("user_id", userId);

    setFavoriteIds((data ?? []).map((item) => item.auction_id));
  }

  async function loadNotifications(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setNotificationsLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("id, user_id, auction_id, type, title, body, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotificationsLoading(false);

    if (error) {
      setMessage(`Bildirimler yüklenemedi: ${error.message}`);
      return;
    }

    setNotifications((data ?? []) as AppNotification[]);
  }

  async function markNotificationRead(notificationId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      setMessage(`Bildirim güncellenemedi: ${error.message}`);
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item
      )
    );
  }

  async function markAllNotificationsRead() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      setMessage(`Bildirimler güncellenemedi: ${error.message}`);
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({ ...item, is_read: true }))
    );
  }

  async function openNotification(notification: AppNotification) {
    await markNotificationRead(notification.id);

    if (!notification.auction_id) {
      setShowNotifications(false);
      return;
    }

    const auction =
      auctions.find((item) => item.id === notification.auction_id) ?? null;

    if (auction) {
      setShowNotifications(false);
      await openDetail(auction);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("auctions")
      .select("id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at")
      .eq("id", notification.auction_id)
      .maybeSingle();

    if (error || !data) {
      setMessage("İlgili ilan artık görüntülenemiyor.");
      setShowNotifications(false);
      return;
    }

    setShowNotifications(false);
    await openDetail(data as Auction);
  }

  async function loadMessages(auction: Auction) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    const otherUserId =
      auction.seller_id === user.id
        ? (
            await supabase
              .from("bids")
              .select("bidder_id")
              .eq("auction_id", auction.id)
              .order("amount", { ascending: false })
              .limit(1)
              .maybeSingle()
          ).data?.bidder_id ?? null
        : auction.seller_id;

    if (!otherUserId) {
      setMessage("Bu ilan için henüz mesajlaşılacak kullanıcı yok.");
      return;
    }

    const [{ data: profile }, { data, error }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherUserId)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id, auction_id, sender_id, receiver_id, body, is_read, created_at")
        .eq("auction_id", auction.id)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true }),
    ]);

    if (error) {
      setMessage(`Mesajlar yüklenemedi: ${error.message}`);
      return;
    }

    setMessageOtherUserName(profile?.full_name?.trim() || "KapışKapış Kullanıcısı");
    setMessages((data ?? []) as ConversationMessage[]);
    setShowMessages(true);

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("auction_id", auction.id)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !selectedAuction || !messageText.trim()) return;

    const otherUserId =
      selectedAuction.seller_id === user.id
        ? (
            await supabase
              .from("bids")
              .select("bidder_id")
              .eq("auction_id", selectedAuction.id)
              .order("amount", { ascending: false })
              .limit(1)
              .maybeSingle()
          ).data?.bidder_id ?? null
        : selectedAuction.seller_id;

    if (!otherUserId) {
      setMessage("Mesaj gönderilecek kullanıcı bulunamadı.");
      return;
    }

    setMessageLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        auction_id: selectedAuction.id,
        sender_id: user.id,
        receiver_id: otherUserId,
        body: messageText.trim(),
      })
      .select("id, auction_id, sender_id, receiver_id, body, is_read, created_at")
      .single();

    setMessageLoading(false);

    if (error) {
      setMessage(`Mesaj gönderilemedi: ${error.message}`);
      return;
    }

    setMessages((current) => [...current, data as ConversationMessage]);
    setMessageText("");
  }

  async function uploadProfileMedia(
    file: File,
    folder: "avatars" | "logos" | "covers"
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return null;

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Görsel en fazla 5 MB olabilir.");
    }

    const extension =
      file.name.split(".").pop()?.toLocaleLowerCase("tr") || "jpg";
    const path = `${user.id}/${folder}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("profile-media")
      .upload(path, file, { upsert: false });

    if (error) throw error;

    return supabase.storage.from("profile-media").getPublicUrl(path).data
      .publicUrl;
  }

  async function loadProfileSettings(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const [{ data: profile, error }, { data: sellerProfile }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, username, city, bio, phone, avatar_url, account_type"
          )
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("seller_profiles")
          .select(
            "user_id, store_name, store_slug, description, logo_url, cover_url, city, verified, vacation_mode, created_at, updated_at"
          )
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    if (error) {
      setMessage(`Profil bilgileri yüklenemedi: ${error.message}`);
      return;
    }

    setEditableProfile({
      id: userId,
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      city: profile?.city || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      avatar_url: profile?.avatar_url || null,
      account_type: profile?.account_type || "user",
    });
    setMySellerProfile((sellerProfile as SellerProfile | null) ?? null);
  }

  async function saveUserProfile(
    values: Omit<EditableUserProfile, "id" | "avatar_url">,
    avatar: File | null
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    setProfileSettingsLoading(true);

    try {
      const avatarUrl = avatar
        ? await uploadProfileMedia(avatar, "avatars")
        : editableProfile?.avatar_url || null;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          username: values.username,
          city: values.city || null,
          bio: values.bio || null,
          phone: values.phone || null,
          avatar_url: avatarUrl,
          account_type: values.account_type,
        })
        .eq("id", user.id);

      if (error) throw error;

      setEditableProfile({
        id: user.id,
        ...values,
        avatar_url: avatarUrl,
      });
      setProfileName(values.full_name);
      setMessage("Kullanıcı profilin güncellendi.");
    } catch (error) {
      setMessage(
        `Profil kaydedilemedi: ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`
      );
    } finally {
      setProfileSettingsLoading(false);
    }
  }

  async function saveSellerProfile(
    values: {
      store_name: string;
      store_slug: string;
      description: string;
      city: string;
      vacation_mode: boolean;
    },
    logo: File | null,
    cover: File | null
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    setProfileSettingsLoading(true);

    try {
      const [logoUrl, coverUrl] = await Promise.all([
        logo
          ? uploadProfileMedia(logo, "logos")
          : Promise.resolve(mySellerProfile?.logo_url || null),
        cover
          ? uploadProfileMedia(cover, "covers")
          : Promise.resolve(mySellerProfile?.cover_url || null),
      ]);

      const { data, error } = await supabase
        .from("seller_profiles")
        .upsert(
          {
            user_id: user.id,
            store_name: values.store_name,
            store_slug: values.store_slug,
            description: values.description,
            city: values.city || null,
            logo_url: logoUrl,
            cover_url: coverUrl,
            vacation_mode: values.vacation_mode,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select(
          "user_id, store_name, store_slug, description, logo_url, cover_url, city, verified, vacation_mode, created_at, updated_at"
        )
        .single();

      if (error) throw error;

      await supabase
        .from("profiles")
        .update({ account_type: "seller" })
        .eq("id", user.id);

      setMySellerProfile(data as SellerProfile);
      setEditableProfile((current) =>
        current ? { ...current, account_type: "seller" } : current
      );
      setMessage("Satıcı mağazan kaydedildi.");
    } catch (error) {
      setMessage(
        `Satıcı profili kaydedilemedi: ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`
      );
    } finally {
      setProfileSettingsLoading(false);
    }
  }

  async function loadCurrentUserRole(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setIsAdmin(false);
      return false;
    }

    const admin = data?.role === "admin";
    setIsAdmin(admin);
    return admin;
  }

  async function loadBidHistory(auctionId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("bids")
      .select("id, auction_id, bidder_id, amount, created_at")
      .eq("auction_id", auctionId)
      .order("amount", { ascending: false })
      .limit(10);

    setBidHistory((data ?? []) as Bid[]);
  }

  useEffect(() => {
    if (user) {
      identifyAnalyticsUser(user.id, {
        email_domain: user.email?.split("@")[1] ?? null,
        profile_name_set: Boolean(profileName),
        is_admin: isAdmin,
      });
      return;
    }

    resetAnalyticsUser();
  }, [user, profileName, isAdmin]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabaseConfigured || !supabase) {
      setMessage("Supabase bağlantısı bulunamadı.");
      return;
    }

    void loadAuctions();

    const auctionFinalizer = window.setInterval(() => {
      void loadAuctions();
    }, 60_000);

    void supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      setProfileName(currentUser?.user_metadata?.full_name ?? "");
      if (currentUser) {
        await Promise.all([
          loadFavorites(currentUser.id),
          loadNotifications(currentUser.id),
          loadReviewedOrders(currentUser.id),
          loadCurrentUserRole(currentUser.id),
          loadAddresses(currentUser.id),
          loadOrderDisputes(),
          loadFollowedSellers(currentUser.id),
          loadLiveReminders(currentUser.id),
          loadProfileSettings(currentUser.id),
        ]);
      }
    });

    const realtimeChannel = supabase
      .channel("kapiskapis-live")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions" },
        (payload) => {
          const updated = payload.new as Auction;

          setAuctions((current) =>
            current.map((auction) =>
              auction.id === updated.id ? { ...auction, ...updated } : auction
            )
          );

          setSelectedAuction((current) =>
            current?.id === updated.id ? { ...current, ...updated } : current
          );

          setPricePulseId(updated.id);
          setLiveEvent(`${updated.title} için yeni teklif: ${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 0,
          }).format(Number(updated.current_price))}`);

          window.setTimeout(() => setPricePulseId(null), 900);
          window.setTimeout(() => setLiveEvent(""), 4200);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids" },
        (payload) => {
          const newBid = payload.new as Bid;

          setBidHistory((current) => {
            if (selectedAuction?.id !== newBid.auction_id) return current;
            return [newBid, ...current].slice(0, 10);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const notification = payload.new as AppNotification;

          if (user?.id !== notification.user_id) return;

          setNotifications((current) => [notification, ...current].slice(0, 50));
          setLiveEvent(notification.title);
          window.setTimeout(() => setLiveEvent(""), 4200);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const incoming = payload.new as ConversationMessage;

          if (
            user?.id !== incoming.receiver_id &&
            user?.id !== incoming.sender_id
          ) {
            return;
          }

          if (selectedAuction?.id === incoming.auction_id) {
            setMessages((current) => {
              if (current.some((item) => item.id === incoming.id)) return current;
              return [...current, incoming];
            });
          }

          if (user?.id === incoming.receiver_id) {
            setLiveEvent("Yeni mesajın var");
            window.setTimeout(() => setLiveEvent(""), 4200);
          }
        }
      )
      .subscribe();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setProfileName(session?.user?.user_metadata?.full_name ?? "");

      if (session?.user) {
        void loadFavorites(session.user.id);
        void loadNotifications(session.user.id);
        void loadReviewedOrders(session.user.id);
        void loadCurrentUserRole(session.user.id);
        void loadAddresses(session.user.id);
        void loadOrderDisputes();
        void loadFollowedSellers(session.user.id);
        void loadLiveReminders(session.user.id);
        void loadProfileSettings(session.user.id);
      } else {
        setFavoriteIds([]);
        setNotifications([]);
        setShowFavoritesOnly(false);
        setShowNotifications(false);
        setIsAdmin(false);
        setShowFounderPanel(false);
        setShowModeration(false);
        setAddresses([]);
        setShowAddressBook(false);
        setOrderDisputes([]);
        setShowDisputeForm(false);
        setShowDisputeCenter(false);
        setFollowedSellerIds([]);
        setShowSellerStore(false);
        setLiveReminderIds([]);
        setEditableProfile(null);
        setMySellerProfile(null);
        setShowProfileSettings(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.clearInterval(auctionFinalizer);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [selectedAuction?.id]);

  useEffect(() => {
    if (
      showLiveRoom &&
      selectedAuction?.live_enabled &&
      !selectedAuction.live_is_open
    ) {
      setShowLiveRoom(false);
      setMessage("İlan sahibi canlı açık artırma odasını kapattı.");
    }
  }, [
    showLiveRoom,
    selectedAuction?.id,
    selectedAuction?.live_enabled,
    selectedAuction?.live_is_open,
  ]);

  useEffect(() => {
    if (!auctionImage) {
      setAuctionImagePreview("");
      return;
    }

    const url = URL.createObjectURL(auctionImage);
    setAuctionImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [auctionImage]);

  async function loadSavedSearches() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    setSavedSearchesLoading(true);

    const { data, error } = await supabase
      .from("saved_searches")
      .select(
        "id, user_id, name, category, product_type, brand, model, min_price, max_price, specifications, alerts_enabled, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setSavedSearchesLoading(false);

    if (error) {
      setMessage(`Kayıtlı aramalar yüklenemedi: ${error.message}`);
      return;
    }

    setSavedSearches((data ?? []) as SavedSearch[]);
  }

  async function saveCurrentSearch() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    const defaultName = [
      buyerBrand,
      buyerModel,
      buyerProductType || activeCategory,
    ]
      .filter(Boolean)
      .join(" · ");

    const name =
      window.prompt(
        "Bu arama için bir isim yaz:",
        defaultName || "Yeni ürün alarmı"
      )?.trim() || "";

    if (!name) return;

    const { data, error } = await supabase
      .from("saved_searches")
      .insert({
        user_id: user.id,
        name,
        category: activeCategory,
        product_type: buyerProductType || null,
        brand: buyerBrand || null,
        model: buyerModel || null,
        min_price: buyerMinPrice ? Number(buyerMinPrice) : null,
        max_price: buyerMaxPrice ? Number(buyerMaxPrice) : null,
        specifications: buyerSpecifications,
        alerts_enabled: true,
      })
      .select(
        "id, user_id, name, category, product_type, brand, model, min_price, max_price, specifications, alerts_enabled, created_at"
      )
      .single();

    if (error) {
      setMessage(`Arama kaydedilemedi: ${error.message}`);
      return;
    }

    setSavedSearches((current) => [data as SavedSearch, ...current]);
    setMessage("Arama kaydedildi ve yeni ilan alarmı açıldı.");
  }

  function applySavedSearch(search: SavedSearch) {
    setActiveCategory(search.category);
    setBuyerProductType(search.product_type ?? "");
    setBuyerBrand(search.brand ?? "");
    setBuyerModel(search.model ?? "");
    setBuyerMinPrice(
      search.min_price === null ? "" : String(search.min_price)
    );
    setBuyerMaxPrice(
      search.max_price === null ? "" : String(search.max_price)
    );
    setBuyerSpecifications(search.specifications ?? {});
    setShowSavedSearches(false);

    window.setTimeout(() => {
      document
        .getElementById("live-auctions")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function deleteSavedSearch(searchId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", searchId)
      .eq("user_id", user.id);

    if (error) {
      setMessage(`Arama silinemedi: ${error.message}`);
      return;
    }

    setSavedSearches((current) =>
      current.filter((search) => search.id !== searchId)
    );
  }

  async function toggleSavedSearchAlert(search: SavedSearch) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    const nextValue = !search.alerts_enabled;

    const { error } = await supabase
      .from("saved_searches")
      .update({ alerts_enabled: nextValue })
      .eq("id", search.id)
      .eq("user_id", user.id);

    if (error) {
      setMessage(`Alarm güncellenemedi: ${error.message}`);
      return;
    }

    setSavedSearches((current) =>
      current.map((item) =>
        item.id === search.id
          ? { ...item, alerts_enabled: nextValue }
          : item
      )
    );
  }

  function clearBuyerFilters() {
    setQuery("");
    setActiveCategory("all");
    setBuyerProductType("");
    setBuyerBrand("");
    setBuyerModel("");
    setBuyerSpecifications({});
    setBuyerMinPrice("");
    setBuyerMaxPrice("");
    setShowFavoritesOnly(false);
  }

  const filteredAuctions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr");
    const minPriceValue =
      buyerMinPrice.trim() === "" ? null : Number(buyerMinPrice);
    const maxPriceValue =
      buyerMaxPrice.trim() === "" ? null : Number(buyerMaxPrice);

    return auctions.filter((auction) => {
      const specificationText = Object.entries(
        auction.specifications ?? {}
      )
        .map(([key, value]) => `${key} ${String(value)}`)
        .join(" ");

      const searchableText = [
        auction.title,
        auction.description,
        auction.brand ?? "",
        auction.model ?? "",
        auction.product_type ?? "",
        specificationText,
      ]
        .join(" ")
        .toLocaleLowerCase("tr");

      if (normalized && !searchableText.includes(normalized)) {
        return false;
      }

      if (activeCategory !== "all" && auction.category !== activeCategory) {
        return false;
      }

      if (
        buyerProductType &&
        auction.product_type !== buyerProductType
      ) {
        return false;
      }

      if (
        buyerBrand &&
        (auction.brand ?? "").toLocaleLowerCase("tr") !==
          buyerBrand.toLocaleLowerCase("tr")
      ) {
        return false;
      }

      if (
        buyerModel &&
        (auction.model ?? "").toLocaleLowerCase("tr") !==
          buyerModel.toLocaleLowerCase("tr")
      ) {
        return false;
      }

      const currentPrice = Number(auction.current_price);

      if (
        minPriceValue !== null &&
        Number.isFinite(minPriceValue) &&
        currentPrice < minPriceValue
      ) {
        return false;
      }

      if (
        maxPriceValue !== null &&
        Number.isFinite(maxPriceValue) &&
        currentPrice > maxPriceValue
      ) {
        return false;
      }

      const auctionSpecifications = auction.specifications ?? {};

      for (const [key, expectedValue] of Object.entries(
        buyerSpecifications
      )) {
        if (
          expectedValue === "" ||
          expectedValue === null ||
          expectedValue === undefined
        ) {
          continue;
        }

        const actualValue = auctionSpecifications[key];

        if (actualValue === null || actualValue === undefined) {
          return false;
        }

        if (typeof expectedValue === "number") {
          if (Number(actualValue) !== expectedValue) {
            return false;
          }
        } else if (
          String(actualValue).toLocaleLowerCase("tr") !==
          String(expectedValue).toLocaleLowerCase("tr")
        ) {
          return false;
        }
      }

      if (showFavoritesOnly && !favoriteIds.includes(auction.id)) {
        return false;
      }

      return true;
    });
  }, [
    auctions,
    query,
    activeCategory,
    buyerProductType,
    buyerBrand,
    buyerModel,
    buyerSpecifications,
    buyerMinPrice,
    buyerMaxPrice,
    showFavoritesOnly,
    favoriteIds,
  ]);

  async function loadOrderDisputes() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    setDisputeLoading(true);

    let query = supabase
      .from("order_disputes")
      .select(
        "id, order_id, auction_id, buyer_id, seller_id, type, reason, details, seller_response, status, created_at, updated_at, resolved_at, resolved_by"
      )
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    }

    const { data, error } = await query;
    setDisputeLoading(false);

    if (error) {
      setMessage(`Talepler yüklenemedi: ${error.message}`);
      return;
    }

    setOrderDisputes((data ?? []) as OrderDispute[]);
  }

  async function createOrderDispute(
    type: DisputeType,
    reason: string,
    details: string
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !selectedOrder) return;

    setDisputeLoading(true);

    const { error } = await supabase.from("order_disputes").insert({
      order_id: selectedOrder.id,
      auction_id: selectedOrder.auction_id,
      buyer_id: selectedOrder.buyer_id,
      seller_id: selectedOrder.seller_id,
      type,
      reason,
      details,
    });

    setDisputeLoading(false);

    if (error) {
      setMessage(`Talep oluşturulamadı: ${error.message}`);
      return;
    }

    setShowDisputeForm(false);
    await loadOrderDisputes();
    setMessage("Talebin Güven Merkezi'ne gönderildi.");
  }

  async function respondToDispute(
    dispute: OrderDispute,
    response: string
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    setDisputeLoading(true);

    const { error } = await supabase.rpc("respond_order_dispute", {
      p_dispute_id: dispute.id,
      p_response: response,
    });

    setDisputeLoading(false);

    if (error) {
      setMessage(`Yanıt gönderilemedi: ${error.message}`);
      return;
    }

    await loadOrderDisputes();
    setMessage("Satıcı yanıtı kaydedildi.");
  }

  async function resolveDispute(
    dispute: OrderDispute,
    status: Extract<DisputeStatus, "approved" | "rejected" | "resolved">
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !isAdmin) return;

    setDisputeLoading(true);

    const { error } = await supabase.rpc("resolve_order_dispute", {
      p_dispute_id: dispute.id,
      p_status: status,
    });

    setDisputeLoading(false);

    if (error) {
      setMessage(`Talep sonuçlandırılamadı: ${error.message}`);
      return;
    }

    await Promise.all([loadOrderDisputes(), loadOrders(user.id)]);
    setMessage("Uyuşmazlık durumu güncellendi.");
  }

  async function loadAddresses(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setAddressesLoading(true);

    const { data, error } = await supabase
      .from("user_addresses")
      .select(
        "id, user_id, title, full_name, phone, city, district, neighborhood, address_line, postal_code, is_default, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    setAddressesLoading(false);

    if (error) {
      setMessage(`Adresler yüklenemedi: ${error.message}`);
      return;
    }

    setAddresses((data ?? []) as UserAddress[]);
  }

  async function saveAddress(
    draft: {
      title: string;
      full_name: string;
      phone: string;
      city: string;
      district: string;
      neighborhood: string;
      address_line: string;
      postal_code: string;
      is_default: boolean;
    },
    addressId?: string
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    setAddressesLoading(true);

    if (draft.is_default) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const payload = {
      user_id: user.id,
      title: draft.title.trim(),
      full_name: draft.full_name.trim(),
      phone: draft.phone.trim(),
      city: draft.city.trim(),
      district: draft.district.trim(),
      neighborhood: draft.neighborhood.trim(),
      address_line: draft.address_line.trim(),
      postal_code: draft.postal_code.trim() || null,
      is_default: draft.is_default || addresses.length === 0,
      updated_at: new Date().toISOString(),
    };

    const query = addressId
      ? supabase
          .from("user_addresses")
          .update(payload)
          .eq("id", addressId)
          .eq("user_id", user.id)
      : supabase.from("user_addresses").insert(payload);

    const { error } = await query;

    setAddressesLoading(false);

    if (error) {
      setMessage(`Adres kaydedilemedi: ${error.message}`);
      return;
    }

    await loadAddresses(user.id);
    setMessage("Adres kaydedildi.");
  }

  async function deleteAddress(addressId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    const inUse = orders.some(
      (order) => order.shipping_address_id === addressId
    );

    if (inUse) {
      setMessage("Bu adres aktif bir siparişte kullanıldığı için silinemez.");
      return;
    }

    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (error) {
      setMessage(`Adres silinemedi: ${error.message}`);
      return;
    }

    await loadAddresses(user.id);
  }

  async function setDefaultAddress(addressId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (error) {
      setMessage(`Varsayılan adres değiştirilemedi: ${error.message}`);
      return;
    }

    await loadAddresses(user.id);
  }

  async function assignOrderAddress(address: UserAddress) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !selectedOrder) return;

    const { data, error } = await supabase.rpc("set_order_shipping_address", {
      p_order_id: selectedOrder.id,
      p_address_id: address.id,
    });

    if (error) {
      setMessage(`Teslimat adresi seçilemedi: ${error.message}`);
      return;
    }

    const updatedOrder = {
      ...selectedOrder,
      ...(data as AuctionOrder),
      shipping_address_id: address.id,
      shipping_address: address,
    };

    setSelectedOrder(updatedOrder);
    setOrders((current) =>
      current.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setShowAddressBook(false);
    setAddressSelectionMode(false);
    setMessage("Teslimat adresi siparişe bağlandı.");
  }

  async function loadOrders(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase.rpc("create_orders_from_results");

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, auction_id, seller_id, buyer_id, amount, status, tracking_code, shipping_address_id, created_at, updated_at"
      )
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Siparişler yüklenemedi: ${error.message}`);
      return;
    }

    const rows = (data ?? []) as AuctionOrder[];
    const auctionIds = Array.from(new Set(rows.map((item) => item.auction_id)));

    if (auctionIds.length === 0) {
      setOrders([]);
      return;
    }

    const { data: auctionRows, error: auctionError } = await supabase
      .from("auctions")
      .select(
        "id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
      )
      .in("id", auctionIds);

    if (auctionError) {
      setMessage(`Sipariş ürünleri yüklenemedi: ${auctionError.message}`);
    }

    const auctionMap = new Map(
      ((auctionRows ?? []) as Auction[]).map((auction) => [auction.id, auction])
    );

    setOrders(
      rows.map((order) => ({
        ...order,
        auction: auctionMap.get(order.auction_id) ?? null,
      }))
    );
  }

  async function updateOrderStatus(
    status: OrderStatus,
    trackingCode?: string
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !selectedOrder) return;

    setOrderLoading(true);

    const { data, error } = await supabase.rpc("update_order_status", {
      p_order_id: selectedOrder.id,
      p_status: status,
      p_tracking_code: trackingCode || null,
    });

    setOrderLoading(false);

    if (error) {
      setMessage(`Sipariş güncellenemedi: ${error.message}`);
      return;
    }

    const updated = data as AuctionOrder;

    setSelectedOrder((current) =>
      current ? { ...current, ...updated } : current
    );

    setOrders((current) =>
      current.map((order) =>
        order.id === updated.id ? { ...order, ...updated } : order
      )
    );

    setMessage("Sipariş durumu güncellendi.");
  }

  async function loadProfileCenter() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    setProfileLoading(true);

    const [
      { data: profile, error: profileError },
      { data: listings, error: listingsError },
      { data: bidRows, error: bidsError },
      { data: favoriteRows, error: favoritesError },
      { data: wonRows, error: wonError },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("auctions")
        .select(
          "id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
        )
        .eq("seller_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("bids")
        .select("auction_id, created_at")
        .eq("bidder_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("favorites")
        .select("auction_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("auction_results")
        .select("auction_id, finalized_at")
        .eq("winner_id", user.id)
        .order("finalized_at", { ascending: false }),
    ]);

    if (profileError) {
      setProfileLoading(false);
      setMessage(`Profil yüklenemedi: ${profileError.message}`);
      return;
    }

    if (listingsError) setMessage(`İlanların yüklenemedi: ${listingsError.message}`);
    if (bidsError) setMessage(`Tekliflerin yüklenemedi: ${bidsError.message}`);
    if (favoritesError) setMessage(`Favorilerin yüklenemedi: ${favoritesError.message}`);
    if (wonError) setMessage(`Kazandıkların yüklenemedi: ${wonError.message}`);

    const bidAuctionIds = Array.from(
      new Set((bidRows ?? []).map((item) => item.auction_id))
    );

    const favoriteAuctionIds = Array.from(
      new Set((favoriteRows ?? []).map((item) => item.auction_id))
    );

    const wonAuctionIds = Array.from(
      new Set((wonRows ?? []).map((item) => item.auction_id))
    );

    const [
      { data: bidAuctions },
      { data: favoriteAuctions },
      { data: wonAuctions },
    ] =
      await Promise.all([
        bidAuctionIds.length > 0
          ? supabase
              .from("auctions")
              .select(
                "id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
              )
              .in("id", bidAuctionIds)
          : Promise.resolve({ data: [] }),
        favoriteAuctionIds.length > 0
          ? supabase
              .from("auctions")
              .select(
                "id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
              )
              .in("id", favoriteAuctionIds)
          : Promise.resolve({ data: [] }),
        wonAuctionIds.length > 0
          ? supabase
              .from("auctions")
              .select(
                "id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
              )
              .in("id", wonAuctionIds)
          : Promise.resolve({ data: [] }),
      ]);

    const bidOrder = new Map(
      bidAuctionIds.map((auctionId, index) => [auctionId, index])
    );
    const favoriteOrder = new Map(
      favoriteAuctionIds.map((auctionId, index) => [auctionId, index])
    );
    const wonOrder = new Map(
      wonAuctionIds.map((auctionId, index) => [auctionId, index])
    );

    const orderedBidAuctions = ((bidAuctions ?? []) as Auction[]).sort(
      (a, b) =>
        (bidOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (bidOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );

    const orderedFavoriteAuctions = ((favoriteAuctions ?? []) as Auction[]).sort(
      (a, b) =>
        (favoriteOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (favoriteOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );

    const orderedWonAuctions = ((wonAuctions ?? []) as Auction[]).sort(
      (a, b) =>
        (wonOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (wonOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );

    setProfileSummary({
      id: user.id,
      full_name:
        profile?.full_name?.trim() ||
        user.user_metadata?.full_name ||
        "KapışKapış Kullanıcısı",
      email: profile?.email || user.email || "",
      created_at: profile?.created_at ?? user.created_at ?? null,
      active_listings: listings?.length ?? 0,
      favorite_count: favoriteAuctionIds.length,
      bid_count: bidRows?.length ?? 0,
    });

    setMyAuctions((listings ?? []) as Auction[]);
    setMyBidAuctions(orderedBidAuctions);
    setMyFavoriteAuctions(orderedFavoriteAuctions);
    setMyWonAuctions(orderedWonAuctions);
    await Promise.all([
      loadOrders(user.id),
      loadAddresses(user.id),
    ]);
    setProfileLoading(false);
  }

  async function openProfileCenter() {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShowProfile(true);
    await loadProfileCenter();
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setLoading(true);

    if (authMode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (!error && data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
        });
      }

      setMessage(error ? error.message : "Hesap oluşturuldu.");
      if (!error) setShowAuth(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      setMessage(error ? error.message : "Giriş yapıldı.");
      if (!error) setShowAuth(false);
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin }
    );

    setMessage(error ? error.message : "Şifre sıfırlama bağlantısı gönderildi.");
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("Çıkış yapıldı.");
  }

  async function toggleFavorite(auctionId: string) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    const isFavorite = favoriteIds.includes(auctionId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("auction_id", auctionId);

      if (error) {
        setMessage(error.message);
        return;
      }

      setFavoriteIds((current) => current.filter((id) => id !== auctionId));
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      auction_id: auctionId,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setFavoriteIds((current) => [...current, auctionId]);
  }

  async function submitAuctionReport(reason: string, details: string) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user || !selectedAuction) {
      setShowAuth(true);
      return;
    }

    if (selectedAuction.seller_id === user.id) {
      setMessage("Kendi ilanını bildiremezsin.");
      return;
    }

    setReportLoading(true);

    const { error } = await supabase.from("auction_reports").insert({
      auction_id: selectedAuction.id,
      reporter_id: user.id,
      reason,
      details,
    });

    setReportLoading(false);

    if (error) {
      setMessage(`Bildirim gönderilemedi: ${error.message}`);
      return;
    }

    setShowReportListing(false);
    setMessage("İlan bildirimi Güven Merkezi'ne gönderildi.");
  }

  async function loadAuctionReports() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !isAdmin) {
      setMessage("Bu bölüme yalnızca yönetici erişebilir.");
      return;
    }

    setModerationLoading(true);

    const { data, error } = await supabase
      .from("auction_reports")
      .select(
        "id, auction_id, reporter_id, reason, details, status, created_at, reviewed_at, reviewed_by"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      setModerationLoading(false);
      setMessage(`Bildirimler yüklenemedi: ${error.message}`);
      return;
    }

    const rows = (data ?? []) as AuctionReport[];
    const auctionIds = Array.from(new Set(rows.map((item) => item.auction_id)));

    let auctionMap = new Map<string, Auction>();

    if (auctionIds.length > 0) {
      const { data: auctionRows } = await supabase
        .from("auctions")
        .select(
          "id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
        )
        .in("id", auctionIds);

      auctionMap = new Map(
        ((auctionRows ?? []) as Auction[]).map((auction) => [
          auction.id,
          auction,
        ])
      );
    }

    setAuctionReports(
      rows.map((report) => ({
        ...report,
        auction: auctionMap.get(report.auction_id) ?? null,
      }))
    );

    setModerationLoading(false);
  }

  async function resolveAuctionReport(
    report: AuctionReport,
    action: Exclude<AuctionReportStatus, "pending">
  ) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !isAdmin) {
      setMessage("Bu işlem için yönetici yetkisi gerekli.");
      return;
    }

    setModerationLoading(true);

    if (action === "action_taken" && report.auction) {
      const { error: auctionError } = await supabase
        .from("auctions")
        .update({ status: "cancelled" })
        .eq("id", report.auction_id);

      if (auctionError) {
        setModerationLoading(false);
        setMessage(`İlan kaldırılamadı: ${auctionError.message}`);
        return;
      }

      setAuctions((current) =>
        current.filter((auction) => auction.id !== report.auction_id)
      );
    }

    const { error } = await supabase
      .from("auction_reports")
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", report.id);

    setModerationLoading(false);

    if (error) {
      setMessage(`Bildirim güncellenemedi: ${error.message}`);
      return;
    }

    setAuctionReports((current) =>
      current.map((item) =>
        item.id === report.id
          ? {
              ...item,
              status: action,
              reviewed_at: new Date().toISOString(),
              reviewed_by: user.id,
              auction:
                action === "action_taken" ? null : item.auction,
            }
          : item
      )
    );

    setMessage(
      action === "action_taken"
        ? "İlan yayından kaldırıldı."
        : "Bildirim durumu güncellendi."
    );
  }

  async function loadFollowedSellers(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("seller_follows")
      .select("seller_id")
      .eq("follower_id", userId);

    setFollowedSellerIds((data ?? []).map((item) => item.seller_id));
  }

  async function loadSellerStore(sellerId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSellerStoreLoading(true);

    const [
      { data: profile },
      { data: reviews },
      { count: completedSales },
      { count: followerCount },
      { data: listings, error: listingsError },
      { data: publicSellerProfile },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, username, city, bio, avatar_url, created_at")
        .eq("id", sellerId)
        .maybeSingle(),
      supabase
        .from("seller_reviews")
        .select("rating")
        .eq("seller_id", sellerId),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("status", "delivered"),
      supabase
        .from("seller_follows")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId),
      supabase
        .from("auctions")
        .select(
          "id, seller_id, title, description, category, product_type, brand, model, specifications, live_enabled, live_is_open, live_opened_at, live_scheduled_at, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
        )
        .eq("seller_id", sellerId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("seller_profiles")
        .select(
          "user_id, store_name, store_slug, description, logo_url, cover_url, city, verified, vacation_mode, created_at, updated_at"
        )
        .eq("user_id", sellerId)
        .maybeSingle(),
    ]);

    setSellerStoreLoading(false);

    if (listingsError) {
      setMessage(`Satıcı mağazası yüklenemedi: ${listingsError.message}`);
      return;
    }

    const ratings = (reviews ?? []).map((item) => Number(item.rating));
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((total, rating) => total + rating, 0) /
          ratings.length
        : 0;

    setSellerStore({
      seller_id: sellerId,
      seller_name: profile?.full_name?.trim() || "KapışKapış Satıcısı",
      average_rating: averageRating,
      review_count: ratings.length,
      completed_sales: completedSales ?? 0,
      follower_count: followerCount ?? 0,
      active_listings: (listings ?? []) as Auction[],
      member_since: profile?.created_at ?? null,
      seller_profile:
        (publicSellerProfile as SellerProfile | null) ?? null,
      username: profile?.username ?? null,
      city: profile?.city ?? null,
      bio: profile?.bio ?? null,
      avatar_url: profile?.avatar_url ?? null,
    });
  }

  async function toggleSellerFollow(sellerId: string) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    if (sellerId === user.id) {
      setMessage("Kendi hesabını takip edemezsin.");
      return;
    }

    setSellerFollowLoading(true);

    const isFollowing = followedSellerIds.includes(sellerId);

    const { error } = isFollowing
      ? await supabase
          .from("seller_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("seller_id", sellerId)
      : await supabase.from("seller_follows").insert({
          follower_id: user.id,
          seller_id: sellerId,
        });

    setSellerFollowLoading(false);

    if (error) {
      setMessage(`Satıcı takibi güncellenemedi: ${error.message}`);
      return;
    }

    setFollowedSellerIds((current) =>
      isFollowing
        ? current.filter((id) => id !== sellerId)
        : [...current, sellerId]
    );

    setSellerStore((current) =>
      current?.seller_id === sellerId
        ? {
            ...current,
            follower_count: Math.max(
              0,
              current.follower_count + (isFollowing ? -1 : 1)
            ),
          }
        : current
    );

    setMessage(
      isFollowing
        ? "Satıcı takibi bırakıldı."
        : "Satıcı takip edildi. Yeni ilanlarında bildirim alacaksın."
    );
  }

  async function loadSellerTrust(sellerId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSellerTrustLoading(true);

    const [
      { data: profile },
      { data: reviews, error: reviewsError },
      { count: completedSales },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, created_at")
        .eq("id", sellerId)
        .maybeSingle(),
      supabase
        .from("seller_reviews")
        .select(
          "id, order_id, auction_id, seller_id, reviewer_id, rating, comment, created_at"
        )
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("status", "delivered"),
    ]);

    if (reviewsError) {
      setSellerTrustLoading(false);
      setMessage(`Satıcı puanı yüklenemedi: ${reviewsError.message}`);
      return;
    }

    const reviewRows = (reviews ?? []) as SellerReview[];
    const reviewerIds = Array.from(
      new Set(reviewRows.map((review) => review.reviewer_id))
    );

    let reviewerMap = new Map<string, string>();

    if (reviewerIds.length > 0) {
      const { data: reviewerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", reviewerIds);

      reviewerMap = new Map(
        (reviewerProfiles ?? []).map((item) => [
          item.id,
          item.full_name || "Doğrulanmış alıcı",
        ])
      );
    }

    const enrichedReviews = reviewRows.map((review) => ({
      ...review,
      reviewer_name:
        reviewerMap.get(review.reviewer_id) || "Doğrulanmış alıcı",
    }));

    const averageRating =
      enrichedReviews.length > 0
        ? enrichedReviews.reduce(
            (total, review) => total + Number(review.rating),
            0
          ) / enrichedReviews.length
        : 0;

    setSellerTrust({
      seller_id: sellerId,
      seller_name: profile?.full_name?.trim() || "KapışKapış Satıcısı",
      average_rating: averageRating,
      review_count: enrichedReviews.length,
      completed_sales: completedSales ?? 0,
      member_since: profile?.created_at ?? null,
      reviews: enrichedReviews,
    });

    setSellerTrustLoading(false);
  }

  async function loadReviewedOrders(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("seller_reviews")
      .select("order_id")
      .eq("reviewer_id", userId);

    setReviewedOrderIds((data ?? []).map((item) => item.order_id));
  }

  async function submitSellerReview(rating: number, comment: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !selectedOrder) return;

    setReviewLoading(true);

    const { error } = await supabase.from("seller_reviews").insert({
      order_id: selectedOrder.id,
      auction_id: selectedOrder.auction_id,
      seller_id: selectedOrder.seller_id,
      reviewer_id: user.id,
      rating,
      comment,
    });

    setReviewLoading(false);

    if (error) {
      setMessage(`Değerlendirme yayınlanamadı: ${error.message}`);
      return;
    }

    setReviewedOrderIds((current) => [...current, selectedOrder.id]);
    setShowReviewForm(false);
    setMessage("Satıcı değerlendirmen yayınlandı.");

    if (selectedAuction?.seller_id === selectedOrder.seller_id) {
      await loadSellerTrust(selectedOrder.seller_id);
    }
  }

  async function openDetail(auction: Auction) {
    setSelectedAuction(auction);
    setSellerTrust(null);
    const nextMinimum = Number(auction.current_price) + Number(auction.min_increment);
    setBidAmount(String(nextMinimum));
    setAutoBidMax(String(Math.max(nextMinimum, Number(autoBidMax) || nextMinimum)));

    await Promise.all([
      loadBidHistory(auction.id),
      loadSellerTrust(auction.seller_id),
    ]);
  }

  async function handleBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user || !selectedAuction) {
      setShowAuth(true);
      return;
    }

    setLoading(true);

    const bidValue = Number(bidAmount);
    const maximumValue = autoBidEnabled ? Number(autoBidMax) : bidValue;

    if (!Number.isFinite(bidValue) || !Number.isFinite(maximumValue)) {
      setLoading(false);
      setMessage("Geçerli bir teklif tutarı gir.");
      return;
    }

    if (autoBidEnabled && maximumValue < bidValue) {
      setLoading(false);
      setMessage("Otomatik teklif limiti, teklif tutarından düşük olamaz.");
      return;
    }

    const { data, error } = await supabase.rpc("place_smart_bid", {
      p_auction_id: selectedAuction.id,
      p_amount: bidValue,
      p_max_amount: maximumValue,
    });

    setLoading(false);

    if (error) {
      setMessage(`Teklif hatası: ${error.message}`);
      return;
    }

    const result = data as {
      current_price?: number;
      ends_at?: string;
      leader_id?: string;
      is_leader?: boolean;
    } | null;
    const updatedPrice = Number(result?.current_price ?? data);
    const updatedEndsAt = result?.ends_at ?? selectedAuction.ends_at;

    setSelectedAuction((current) =>
      current
        ? {
            ...current,
            current_price: updatedPrice,
            ends_at: updatedEndsAt,
          }
        : current
    );

    setAuctions((current) =>
      current.map((auction) =>
        auction.id === selectedAuction.id
          ? {
              ...auction,
              current_price: updatedPrice,
              ends_at: updatedEndsAt,
            }
          : auction
      )
    );

    setBidAmount(String(updatedPrice + Number(selectedAuction.min_increment)));
    await loadBidHistory(selectedAuction.id);
    setMessage(
      result?.is_leader
        ? autoBidEnabled
          ? "Otomatik teklifin aktif. Şu anda lider sensin."
          : "Teklifin verildi. Şu anda lider sensin."
        : "Teklif kaydedildi; rakibin otomatik limiti daha yüksek."
    );
  }

  async function handleCreateAuction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    let imageUrl: string | null = null;

    if (auctionImage) {
      if (auctionImage.size > 5 * 1024 * 1024) {
        setMessage("Fotoğraf en fazla 5 MB olabilir.");
        setLoading(false);
        return;
      }

      const extension = auctionImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("auction-images")
        .upload(path, auctionImage);

      if (uploadError) {
        setMessage(uploadError.message);
        setLoading(false);
        return;
      }

      imageUrl = supabase.storage.from("auction-images").getPublicUrl(path).data.publicUrl;
    }


    const { error } = await supabase.from("auctions").insert({
      seller_id: user.id,
      title: auctionTitle.trim(),
      description: auctionDescription.trim(),
      category: auctionCategory,
      product_type: auctionProductType,
      brand: auctionBrand.trim(),
      model: auctionModel.trim(),
      specifications: auctionSpecifications,
      live_enabled: auctionLiveEnabled,
      live_is_open: auctionLiveEnabled && auctionLiveStartOpen,
      live_opened_at:
        auctionLiveEnabled && auctionLiveStartOpen
          ? new Date().toISOString()
          : null,
      live_scheduled_at:
        auctionLiveEnabled && auctionLiveScheduledAt
          ? new Date(auctionLiveScheduledAt).toISOString()
          : null,
      start_price: Number(startPrice),
      starting_bid: Number(startPrice),
      current_bid: Number(startPrice),
      current_price: Number(startPrice),
      reserve_price: Number(startPrice),
      city: "İstanbul",
      min_increment: Number(minIncrement),
      ends_at: new Date(Date.now() + Number(durationHours) * 60 * 60 * 1000).toISOString(),
      status: "active",
      image_url: imageUrl,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setAuctionTitle("");
    setAuctionDescription("");
    setAuctionCategory("phone");
    setAuctionProductType("smartphone");
    setAuctionBrand("");
    setAuctionModel("");
    setAuctionSpecifications({});
    setStartPrice("1000");
    setMinIncrement("100");
    setDurationHours("24");
    setAuctionLiveEnabled(false);
    setAuctionLiveStartOpen(false);
    setAuctionLiveScheduledAt("");
    setAuctionImage(null);
    setShowSell(false);
    await loadAuctions();
    setMessage("İlan yayınlandı.");
  }

  async function loadLiveReminders(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("live_auction_reminders")
      .select("auction_id")
      .eq("user_id", userId);

    setLiveReminderIds((data ?? []).map((item) => item.auction_id));
  }

  async function toggleLiveReminder(auctionId: string) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setShowAuth(true);
      return;
    }

    setLiveReminderLoading(true);
    const active = liveReminderIds.includes(auctionId);

    const { error } = active
      ? await supabase
          .from("live_auction_reminders")
          .delete()
          .eq("auction_id", auctionId)
          .eq("user_id", user.id)
      : await supabase.from("live_auction_reminders").insert({
          auction_id: auctionId,
          user_id: user.id,
        });

    setLiveReminderLoading(false);

    if (error) {
      setMessage(`Hatırlatıcı güncellenemedi: ${error.message}`);
      return;
    }

    setLiveReminderIds((current) =>
      active
        ? current.filter((id) => id !== auctionId)
        : [...current, auctionId]
    );

    setMessage(
      active
        ? "Canlı yayın hatırlatıcısı kaldırıldı."
        : "Canlı yayın hatırlatıcısı oluşturuldu."
    );
  }

  async function toggleAuctionLiveStatus() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user || !selectedAuction) return;

    if (selectedAuction.seller_id !== user.id) {
      setMessage("Canlı odayı yalnızca ilan sahibi yönetebilir.");
      return;
    }

    if (!selectedAuction.live_enabled) {
      setMessage("Bu ilan canlı açık artırma özelliğiyle oluşturulmamış.");
      return;
    }

    setLiveControlLoading(true);

    const nextOpen = !Boolean(selectedAuction.live_is_open);

    const { data, error } = await supabase.rpc(
      "set_auction_live_status",
      {
        p_auction_id: selectedAuction.id,
        p_is_open: nextOpen,
      }
    );

    setLiveControlLoading(false);

    if (error) {
      setMessage(`Canlı oda güncellenemedi: ${error.message}`);
      return;
    }

    const updated = {
      ...selectedAuction,
      ...(data as Auction),
      live_is_open: nextOpen,
      live_opened_at: nextOpen
        ? new Date().toISOString()
        : selectedAuction.live_opened_at ?? null,
    };

    setSelectedAuction(updated);
    setAuctions((current) =>
      current.map((auction) =>
        auction.id === updated.id ? { ...auction, ...updated } : auction
      )
    );

    if (!nextOpen) {
      setShowLiveRoom(false);
    }

    setMessage(
      nextOpen
        ? "Canlı açık artırma odası açıldı."
        : "Canlı açık artırma odası kapatıldı."
    );
  }

  function handleOpenSell() {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setShowSell(true);
  }

  return (
    <main>
      <Navbar
        query={query}
        onQueryChange={setQuery}
        favoriteCount={favoriteIds.length}
        notificationCount={notifications.filter((item) => !item.is_read).length}
        showFavoritesOnly={showFavoritesOnly}
        userLabel={profileName || user?.email || "K"}
        loggedIn={Boolean(user)}
        onOpenAuth={() => setShowAuth(true)}
        onOpenSell={handleOpenSell}
        onToggleFavorites={() => {
          if (!user) {
            setShowAuth(true);
            return;
          }
          setShowFavoritesOnly((current) => !current);
        }}
        onOpenNotifications={() => {
          if (!user) {
            setShowAuth(true);
            return;
          }
          setShowNotifications(true);
          void loadNotifications(user.id);
        }}
        onOpenProfile={() => void openProfileCenter()}
      />

      <div className="pageContainer">
        <Hero onOpenSell={handleOpenSell} />

        <section className="categoryBar">
          {[
            ["all", "Tümü"],
            ["phone", "Telefon"],
            ["computer", "Bilgisayar"],
            ["gaming", "Oyun"],
            ["watch", "Saat"],
            ["vehicle", "Araç"],
            ["home", "Ev & Yaşam"],
            ["camera", "Kamera"],
            ["collection", "Koleksiyon"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={activeCategory === value ? "activeCategory" : ""}
              onClick={() => {
                setActiveCategory(value as AuctionCategory);
                setBuyerProductType("");
                setBuyerBrand("");
                setBuyerModel("");
                setBuyerSpecifications({});
              }}
            >
              {label}
            </button>
          ))}
        </section>

        <BuyerFilters
          category={activeCategory}
          productType={buyerProductType}
          brand={buyerBrand}
          model={buyerModel}
          specifications={buyerSpecifications}
          minPrice={buyerMinPrice}
          maxPrice={buyerMaxPrice}
          resultCount={filteredAuctions.length}
          onCategoryChange={(category) => {
            setActiveCategory(category);
            setBuyerProductType("");
            setBuyerBrand("");
            setBuyerModel("");
            setBuyerSpecifications({});
          }}
          onProductTypeChange={(productType) => {
            setBuyerProductType(productType);
            setBuyerBrand("");
            setBuyerModel("");
            setBuyerSpecifications({});
          }}
          onBrandChange={(brand) => {
            setBuyerBrand(brand);
            setBuyerModel("");
          }}
          onModelChange={setBuyerModel}
          onSpecificationChange={(key, value) =>
            setBuyerSpecifications((current) => ({
              ...current,
              [key]: value,
            }))
          }
          onMinPriceChange={setBuyerMinPrice}
          onMaxPriceChange={setBuyerMaxPrice}
          onClear={clearBuyerFilters}
          onSaveSearch={() => void saveCurrentSearch()}
          onOpenSavedSearches={() => {
            if (!user) {
              setShowAuth(true);
              return;
            }
            setShowSavedSearches(true);
            void loadSavedSearches();
          }}
        />

        <DashboardSections auctions={auctions} orders={orders} onOpenAuction={(a)=>void openDetail(a)} />
        <section className="v20Quick"><button onClick={()=>{if(!user){setShowAuth(true);return;}setShowSalesCenter(true);void loadOrders(user.id)}}><span>01</span><strong>Satış Merkezi</strong><small>İlanlar ve siparişler</small></button><button onClick={()=>{if(!user){setShowAuth(true);return;}setShowWallet(true);void loadOrders(user.id)}}><span>02</span><strong>Cüzdanım</strong><small>Bakiye ve hareketler</small></button><button onClick={()=>void openProfileCenter()}><span>03</span><strong>Siparişlerim</strong><small>Ödeme ve kargo takibi</small></button></section>
        <section className="auctionSection" id="live-auctions">
          <div className="sectionHeader">
            <div>
              <span>GERÇEK ZAMANLI</span>
              <h2>Canlı açık artırmalar</h2>
            </div>
            <strong>{filteredAuctions.length} ilan</strong>
          </div>

          {auctions.length === 0 ? (
            <div className="emptyState">
              <div>KK</div>
              <h3>Henüz aktif açık artırma yok.</h3>
              <p>İlk gerçek ilanı oluşturarak KapışKapış’ı başlat.</p>
              <button type="button" onClick={handleOpenSell}>İlk ilanı oluştur</button>
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="emptyState">
              <h3>Bu filtreye uygun ilan bulunamadı.</h3>
              <button
                type="button"
                onClick={clearBuyerFilters}
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            <div className="auctionGrid">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  isFavorite={favoriteIds.includes(auction.id)}
                  onToggleFavorite={(id) => void toggleFavorite(id)}
                  onOpenDetail={(item) => void openDetail(item)}
                  isCompared={compareIds.includes(auction.id)}
                  onToggleCompare={toggleCompare}
                  pricePulse={pricePulseId === auction.id}
                />
              ))}
            </div>
          )}
        </section>

        <Footer />
      </div>

      <AuthModal
        open={showAuth}
        mode={authMode}
        fullName={fullName}
        email={email}
        password={password}
        loading={loading}
        onClose={() => setShowAuth(false)}
        onModeChange={setAuthMode}
        onFullNameChange={setFullName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleAuthSubmit}
        onForgotPassword={handleForgotPassword}
      />

      <SellModal
        open={showSell}
        loading={loading}
        title={auctionTitle}
        description={auctionDescription}
        category={auctionCategory}
        productType={auctionProductType}
        brand={auctionBrand}
        model={auctionModel}
        specifications={auctionSpecifications}
        startPrice={startPrice}
        minIncrement={minIncrement}
        durationHours={durationHours}
        liveEnabled={auctionLiveEnabled}
        liveStartOpen={auctionLiveStartOpen}
        liveScheduledAt={auctionLiveScheduledAt}
        imagePreview={auctionImagePreview}
        onClose={() => setShowSell(false)}
        onTitleChange={setAuctionTitle}
        onDescriptionChange={setAuctionDescription}
        onCategoryChange={(category) => {
          setAuctionCategory(category);
          setAuctionProductType("");
          setAuctionBrand("");
          setAuctionModel("");
          setAuctionSpecifications({});
        }}
        onProductTypeChange={(productType) => {
          setAuctionProductType(productType);
          setAuctionBrand("");
          setAuctionModel("");
          setAuctionSpecifications({});
        }}
        onBrandChange={(brand) => {
          setAuctionBrand(brand);
          setAuctionModel("");
        }}
        onModelChange={(model) => {
          setAuctionModel(model);
          if (!auctionTitle.trim() && auctionBrand && model) {
            setAuctionTitle(`${auctionBrand} ${model}`);
          }
        }}
        onSpecificationChange={(key, value) =>
          setAuctionSpecifications((current) => ({
            ...current,
            [key]: value,
          }))
        }
        onStartPriceChange={setStartPrice}
        onMinIncrementChange={setMinIncrement}
        onDurationChange={setDurationHours}
        onLiveEnabledChange={(enabled) => {
          setAuctionLiveEnabled(enabled);
          if (!enabled) setAuctionLiveStartOpen(false);
        }}
        onLiveStartOpenChange={setAuctionLiveStartOpen}
        onLiveScheduledAtChange={setAuctionLiveScheduledAt}
        onImageChange={setAuctionImage}
        onSubmit={handleCreateAuction}
      />

      <CompareModal open={showCompare} auctions={auctions.filter((a)=>compareIds.includes(a.id))} onClose={()=>setShowCompare(false)} onRemove={toggleCompare} onOpen={(a)=>{setShowCompare(false);void openDetail(a)}} />

      <ReportListingModal
        open={showReportListing}
        auction={selectedAuction}
        loading={reportLoading}
        onClose={() => setShowReportListing(false)}
        onSubmit={(reason, details) =>
          submitAuctionReport(reason, details)
        }
      />

      {isAdmin && <ModerationPanel
        open={showModeration}
        reports={auctionReports}
        loading={moderationLoading}
        onClose={() => setShowModeration(false)}
        onOpenAuction={(report) => {
          if (!report.auction) return;
          setShowModeration(false);
          void openDetail(report.auction);
        }}
        onResolve={(report, action) =>
          void resolveAuctionReport(report, action)
        }
      />}

      <ProfileSettingsModal
        open={showProfileSettings}
        userProfile={editableProfile}
        sellerProfile={mySellerProfile}
        loading={profileSettingsLoading}
        onClose={() => setShowProfileSettings(false)}
        onSaveUser={(values, avatar) =>
          saveUserProfile(values, avatar)
        }
        onSaveSeller={(values, logo, cover) =>
          saveSellerProfile(values, logo, cover)
        }
      />

      <SellerStoreModal
        open={showSellerStore}
        summary={sellerStore}
        loading={sellerStoreLoading}
        isFollowing={Boolean(
          sellerStore &&
            followedSellerIds.includes(sellerStore.seller_id)
        )}
        followLoading={sellerFollowLoading}
        currentUserId={user?.id || ""}
        onClose={() => setShowSellerStore(false)}
        onToggleFollow={() => {
          if (!sellerStore) return;
          void toggleSellerFollow(sellerStore.seller_id);
        }}
        onOpenAuction={(auction) => {
          setShowSellerStore(false);
          void openDetail(auction);
        }}
      />

      <SellerReviewsModal
        open={showSellerReviews}
        summary={sellerTrust}
        loading={sellerTrustLoading}
        onClose={() => setShowSellerReviews(false)}
      />

      <ReviewFormModal
        open={showReviewForm}
        order={selectedOrder}
        loading={reviewLoading}
        onClose={() => setShowReviewForm(false)}
        onSubmit={(rating, comment) =>
          submitSellerReview(rating, comment)
        }
      />

      <SavedSearchesPanel
        open={showSavedSearches}
        searches={savedSearches}
        loading={savedSearchesLoading}
        onClose={() => setShowSavedSearches(false)}
        onApply={applySavedSearch}
        onDelete={(searchId) => void deleteSavedSearch(searchId)}
        onToggleAlert={(search) => void toggleSavedSearchAlert(search)}
      />

      <DisputeFormModal
        open={showDisputeForm}
        order={selectedOrder}
        loading={disputeLoading}
        onClose={() => setShowDisputeForm(false)}
        onSubmit={(type, reason, details) =>
          createOrderDispute(type, reason, details)
        }
      />

      <DisputeCenterModal
        open={showDisputeCenter}
        disputes={orderDisputes}
        currentUserId={user?.id || ""}
        isAdmin={isAdmin}
        loading={disputeLoading}
        onClose={() => setShowDisputeCenter(false)}
        onSellerResponse={(dispute, response) =>
          void respondToDispute(dispute, response)
        }
        onResolve={(dispute, status) =>
          void resolveDispute(dispute, status)
        }
      />

      <AddressBookModal
        open={showAddressBook}
        addresses={addresses}
        loading={addressesLoading}
        selectedAddressId={selectedOrder?.shipping_address_id ?? null}
        selectionMode={addressSelectionMode}
        onClose={() => {
          setShowAddressBook(false);
          setAddressSelectionMode(false);
        }}
        onSave={(draft, addressId) =>
          saveAddress(draft, addressId)
        }
        onDelete={(addressId) => deleteAddress(addressId)}
        onSetDefault={(addressId) => setDefaultAddress(addressId)}
        onSelect={(address) => void assignOrderAddress(address)}
      />

      <WalletModal open={showWallet} userId={user?.id||""} orders={orders} onClose={()=>setShowWallet(false)} />
      <SalesCenterModal open={showSalesCenter} userId={user?.id||""} auctions={auctions} orders={orders} onClose={()=>setShowSalesCenter(false)} onOpenAuction={(a)=>{setShowSalesCenter(false);void openDetail(a)}} onOpenOrder={(o)=>{setSelectedOrder(o);setShowSalesCenter(false);setShowOrderCenter(true)}} onOpenSell={()=>{setShowSalesCenter(false);handleOpenSell()}} />
      <OrderCenterModal
        open={showOrderCenter}
        order={selectedOrder}
        currentUserId={user?.id || ""}
        loading={orderLoading}
        onClose={() => setShowOrderCenter(false)}
        onUpdateStatus={(status, trackingCode) =>
          updateOrderStatus(status, trackingCode)
        }
        reviewSubmitted={Boolean(
          selectedOrder && reviewedOrderIds.includes(selectedOrder.id)
        )}
        onOpenReview={() => setShowReviewForm(true)}
        shippingAddress={
          selectedOrder?.shipping_address ??
          addresses.find(
            (address) =>
              address.id === selectedOrder?.shipping_address_id
          ) ??
          null
        }
        onChooseAddress={() => {
          if (!user) {
            setShowAuth(true);
            return;
          }
          setAddressSelectionMode(true);
          setShowAddressBook(true);
          void loadAddresses(user.id);
        }}
        hasOpenDispute={Boolean(
          selectedOrder &&
            orderDisputes.some(
              (item) =>
                item.order_id === selectedOrder.id &&
                ["open", "seller_responded"].includes(item.status)
            )
        )}
        onOpenDispute={() => setShowDisputeForm(true)}
        onOpenDisputeCenter={() => {
          setShowDisputeCenter(true);
          void loadOrderDisputes();
        }}
      />

      <MessagePanel
        open={showMessages}
        auction={selectedAuction}
        currentUserId={user?.id || ""}
        otherUserName={messageOtherUserName}
        messages={messages}
        messageText={messageText}
        loading={messageLoading}
        onClose={() => setShowMessages(false)}
        onMessageChange={setMessageText}
        onSubmit={handleSendMessage}
      />

      <NotificationPanel
        open={showNotifications}
        notifications={notifications}
        loading={notificationsLoading}
        onClose={() => setShowNotifications(false)}
        onOpenNotification={(notification) => void openNotification(notification)}
        onMarkAllRead={() => void markAllNotificationsRead()}
      />

      <ProfileModal
        open={showProfile}
        profile={profileSummary}
        myAuctions={myAuctions}
        bidAuctions={myBidAuctions}
        favoriteAuctions={myFavoriteAuctions}
        wonAuctions={myWonAuctions}
        orders={orders}
        loading={profileLoading}
        isAdmin={isAdmin}
        onClose={() => setShowProfile(false)}
        onOpenAuction={(auction) => {
          setShowProfile(false);
          void openDetail(auction);
        }}
        onOpenOrder={(order) => {
          setSelectedOrder(order);
          setShowProfile(false);
          setShowOrderCenter(true);
        }}
        onOpenSell={() => {
          setShowProfile(false);
          handleOpenSell();
        }}
        onOpenProfileSettings={() => {
          if (!user) {
            setShowAuth(true);
            return;
          }
          setShowProfile(false);
          setShowProfileSettings(true);
          void loadProfileSettings(user.id);
        }}
        onOpenAddresses={() => {
          if (!user) {
            setShowAuth(true);
            return;
          }
          setShowProfile(false);
          setAddressSelectionMode(false);
          setShowAddressBook(true);
          void loadAddresses(user.id);
        }}
        onOpenFounderPanel={() => {
          if (!isAdmin) {
            setMessage("Kurucu Paneli yalnızca yönetici hesabına açıktır.");
            return;
          }
          setShowProfile(false);
          setShowFounderPanel(true);
          void loadAuctionReports();
        }}
        onSignOut={() => {
          setShowProfile(false);
          void handleSignOut();
        }}
      />

      {isAdmin && <FounderPanel
        open={showFounderPanel}
        loading={founderLoading}
        progress={founderProgress}
        stats={founderStats}
        onClose={() => setShowFounderPanel(false)}
        onCreateTestAuctions={() => void createBetaAuctions()}
        onDeleteTestAuctions={() => void deleteBetaAuctions()}
        onRefresh={() => void loadAuctions()}
        pendingReports={
          auctionReports.filter((report) => report.status === "pending").length
        }
        onOpenModeration={() => {
          setShowFounderPanel(false);
          setShowModeration(true);
          void loadAuctionReports();
        }}
        pendingDisputes={
          orderDisputes.filter((item) =>
            ["open", "seller_responded"].includes(item.status)
          ).length
        }
        onOpenDisputes={() => {
          setShowFounderPanel(false);
          setShowDisputeCenter(true);
          void loadOrderDisputes();
        }}
      />}

      <LiveAuctionRoom
        open={showLiveRoom}
        auction={selectedAuction}
        bids={bidHistory}
        currentUserId={user?.id || ""}
        currentUserName={profileName || user?.email || "KapışKapış Kullanıcısı"}
        bidAmount={bidAmount}
        autoBidEnabled={autoBidEnabled}
        autoBidMax={autoBidMax}
        loading={loading}
        onClose={() => setShowLiveRoom(false)}
        onBidAmountChange={setBidAmount}
        onAutoBidEnabledChange={setAutoBidEnabled}
        onAutoBidMaxChange={setAutoBidMax}
        onSubmitBid={handleBid}
      />

      <ProductDetailModal
        auction={selectedAuction}
        bids={bidHistory}
        bidAmount={bidAmount}
        autoBidEnabled={autoBidEnabled}
        autoBidMax={autoBidMax}
        loading={loading}
        isFavorite={Boolean(selectedAuction && favoriteIds.includes(selectedAuction.id))}
        onClose={() => setSelectedAuction(null)}
        onBidAmountChange={setBidAmount}
        onAutoBidEnabledChange={setAutoBidEnabled}
        onAutoBidMaxChange={setAutoBidMax}
        onSubmitBid={handleBid}
        onToggleFavorite={(id) => void toggleFavorite(id)}
        onOpenLiveRoom={() => {
          if (!selectedAuction) return;
          if (!selectedAuction.live_enabled) {
            setMessage("Bu ilanda canlı açık artırma özelliği bulunmuyor.");
            return;
          }
          if (!selectedAuction.live_is_open) {
            setMessage("Canlı açık artırma odası şu anda kapalı.");
            return;
          }
          setShowLiveRoom(true);
        }}
        currentUserId={user?.id || ""}
        liveControlLoading={liveControlLoading}
        onToggleLiveStatus={() => void toggleAuctionLiveStatus()}
        hasLiveReminder={Boolean(
          selectedAuction &&
            liveReminderIds.includes(selectedAuction.id)
        )}
        reminderLoading={liveReminderLoading}
        onToggleLiveReminder={() => {
          if (!selectedAuction) return;
          void toggleLiveReminder(selectedAuction.id);
        }}
        sellerTrust={sellerTrust}
        sellerTrustLoading={sellerTrustLoading}
        onOpenSellerReviews={() => setShowSellerReviews(true)}
        onOpenSellerStore={() => {
          if (!selectedAuction) return;
          setShowSellerStore(true);
          void loadSellerStore(selectedAuction.seller_id);
        }}
        onOpenPublicUserProfile={() => {
          if (!selectedAuction) return;
          setShowSellerStore(true);
          void loadSellerStore(selectedAuction.seller_id);
        }}
        isFollowingSeller={Boolean(
          selectedAuction &&
            followedSellerIds.includes(selectedAuction.seller_id)
        )}
        followLoading={sellerFollowLoading}
        onToggleSellerFollow={() => {
          if (!selectedAuction) return;
          void toggleSellerFollow(selectedAuction.seller_id);
        }}
        onReportListing={() => {
          if (!user) {
            setShowAuth(true);
            return;
          }
          setShowReportListing(true);
        }}
        onOpenMessages={() => {
          if (!user || !selectedAuction) {
            setShowAuth(true);
            return;
          }
          void loadMessages(selectedAuction);
        }}
        pricePulse={Boolean(selectedAuction && pricePulseId === selectedAuction.id)}
      />

      {compareIds.length > 0 && <div className="compareFloating"><div><strong>{compareIds.length} ürün seçildi</strong><span>En fazla 4 ürün</span></div><button onClick={()=>setShowCompare(true)}>Karşılaştır</button><button className="compareClear" onClick={()=>setCompareIds([])}>Temizle</button></div>}

      <BottomNav onHome={()=>window.scrollTo({top:0,behavior:"smooth"})} onSearch={()=>document.querySelector<HTMLInputElement>(".navSearch input")?.focus()} onSell={handleOpenSell} onNotifications={()=>{if(!user){setShowAuth(true);return;}setShowNotifications(true);void loadNotifications(user.id)}} onProfile={()=>void openProfileCenter()} />
      {liveEvent && (
        <div className="liveEventToast">
          <span>CANLI</span>
          <strong>{liveEvent}</strong>
        </div>
      )}

      {message && <div className="toast">{message}</div>}
    </main>
  );
}
