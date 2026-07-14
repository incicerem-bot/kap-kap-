"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase";
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
import type { Auction, AuctionCategory, Bid, ProfileSummary, AppNotification, AuctionOrder, ConversationMessage, OrderStatus } from "@/components/types";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState("");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AuctionCategory>("all");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");

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
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [myBidAuctions, setMyBidAuctions] = useState<Auction[]>([]);
  const [myFavoriteAuctions, setMyFavoriteAuctions] = useState<Auction[]>([]);
  const [myWonAuctions, setMyWonAuctions] = useState<Auction[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [orders, setOrders] = useState<AuctionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AuctionOrder | null>(null);
  const [showOrderCenter, setShowOrderCenter] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showSalesCenter, setShowSalesCenter] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showLiveRoom, setShowLiveRoom] = useState(false);
  const [showFounderPanel, setShowFounderPanel] = useState(false);
  const [founderLoading, setFounderLoading] = useState(false);
  const [founderProgress, setFounderProgress] = useState(0);
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionDescription, setAuctionDescription] = useState("");
  const [auctionCategory, setAuctionCategory] = useState<AuctionCategory>("phone");
  const [startPrice, setStartPrice] = useState("1000");
  const [minIncrement, setMinIncrement] = useState("100");
  const [durationHours, setDurationHours] = useState("24");
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
        min_increment: minimumIncrement,
        ends_at: new Date(createdAt + hours * 60 * 60 * 1000).toISOString(),
        status: "active" as const,
        image_url: imageUrls[category],
      };
    });
  }

  async function createBetaAuctions() {
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
      .select("id, seller_id, title, description, category, start_price, current_price, min_increment, ends_at, status, image_url, created_at")
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
      .select("id, seller_id, title, description, category, start_price, current_price, min_increment, ends_at, status, image_url, created_at")
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
      } else {
        setFavoriteIds([]);
        setNotifications([]);
        setShowFavoritesOnly(false);
        setShowNotifications(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.clearInterval(auctionFinalizer);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [selectedAuction?.id]);

  useEffect(() => {
    if (!auctionImage) {
      setAuctionImagePreview("");
      return;
    }

    const url = URL.createObjectURL(auctionImage);
    setAuctionImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [auctionImage]);

  const filteredAuctions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr");

    return auctions.filter((auction) => {
      if (
        normalized &&
        !`${auction.title} ${auction.description}`
          .toLocaleLowerCase("tr")
          .includes(normalized)
      ) {
        return false;
      }

      if (activeCategory !== "all" && auction.category !== activeCategory) {
        return false;
      }

      if (showFavoritesOnly && !favoriteIds.includes(auction.id)) {
        return false;
      }

      return true;
    });
  }, [auctions, query, activeCategory, showFavoritesOnly, favoriteIds]);

  async function loadOrders(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase.rpc("create_orders_from_results");

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, auction_id, seller_id, buyer_id, amount, status, tracking_code, created_at, updated_at"
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
        "id, seller_id, title, description, category, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
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
          "id, seller_id, title, description, category, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
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
                "id, seller_id, title, description, category, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
              )
              .in("id", bidAuctionIds)
          : Promise.resolve({ data: [] }),
        favoriteAuctionIds.length > 0
          ? supabase
              .from("auctions")
              .select(
                "id, seller_id, title, description, category, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
              )
              .in("id", favoriteAuctionIds)
          : Promise.resolve({ data: [] }),
        wonAuctionIds.length > 0
          ? supabase
              .from("auctions")
              .select(
                "id, seller_id, title, description, category, start_price, current_price, min_increment, ends_at, status, image_url, created_at"
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
    await loadOrders(user.id);
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

  async function openDetail(auction: Auction) {
    setSelectedAuction(auction);
    setBidAmount(String(Number(auction.current_price) + Number(auction.min_increment)));
    await loadBidHistory(auction.id);
  }

  async function handleBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user || !selectedAuction) {
      setShowAuth(true);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.rpc("place_bid", {
      p_auction_id: selectedAuction.id,
      p_amount: Number(bidAmount),
    });

    setLoading(false);

    if (error) {
      setMessage(`Teklif hatası: ${error.message}`);
      return;
    }

    const updatedPrice = Number(data);

    setSelectedAuction((current) =>
      current ? { ...current, current_price: updatedPrice } : current
    );

    setAuctions((current) =>
      current.map((auction) =>
        auction.id === selectedAuction.id
          ? { ...auction, current_price: updatedPrice }
          : auction
      )
    );

    setBidAmount(String(updatedPrice + Number(selectedAuction.min_increment)));
    await loadBidHistory(selectedAuction.id);
    setMessage("Teklifin verildi.");
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
      start_price: Number(startPrice),
      starting_bid: Number(startPrice),
      current_bid: Number(startPrice),
      current_price: Number(startPrice),
      reserve_price: Number(startPrice),
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
    setStartPrice("1000");
    setMinIncrement("100");
    setDurationHours("24");
    setAuctionImage(null);
    setShowSell(false);
    await loadAuctions();
    setMessage("İlan yayınlandı.");
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
              onClick={() => setActiveCategory(value as AuctionCategory)}
            >
              {label}
            </button>
          ))}
        </section>

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
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                  setShowFavoritesOnly(false);
                }}
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
        startPrice={startPrice}
        minIncrement={minIncrement}
        durationHours={durationHours}
        imagePreview={auctionImagePreview}
        onClose={() => setShowSell(false)}
        onTitleChange={setAuctionTitle}
        onDescriptionChange={setAuctionDescription}
        onCategoryChange={setAuctionCategory}
        onStartPriceChange={setStartPrice}
        onMinIncrementChange={setMinIncrement}
        onDurationChange={setDurationHours}
        onImageChange={setAuctionImage}
        onSubmit={handleCreateAuction}
      />

      <CompareModal open={showCompare} auctions={auctions.filter((a)=>compareIds.includes(a.id))} onClose={()=>setShowCompare(false)} onRemove={toggleCompare} onOpen={(a)=>{setShowCompare(false);void openDetail(a)}} />

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
        onOpenFounderPanel={() => {
          setShowProfile(false);
          setShowFounderPanel(true);
        }}
        onSignOut={() => {
          setShowProfile(false);
          void handleSignOut();
        }}
      />

      <FounderPanel
        open={showFounderPanel}
        loading={founderLoading}
        progress={founderProgress}
        stats={founderStats}
        onClose={() => setShowFounderPanel(false)}
        onCreateTestAuctions={() => void createBetaAuctions()}
        onDeleteTestAuctions={() => void deleteBetaAuctions()}
        onRefresh={() => void loadAuctions()}
      />

      <LiveAuctionRoom
        open={showLiveRoom}
        auction={selectedAuction}
        bids={bidHistory}
        currentUserId={user?.id || ""}
        currentUserName={profileName || user?.email || "KapışKapış Kullanıcısı"}
        bidAmount={bidAmount}
        loading={loading}
        onClose={() => setShowLiveRoom(false)}
        onBidAmountChange={setBidAmount}
        onSubmitBid={handleBid}
      />

      <ProductDetailModal
        auction={selectedAuction}
        bids={bidHistory}
        bidAmount={bidAmount}
        loading={loading}
        isFavorite={Boolean(selectedAuction && favoriteIds.includes(selectedAuction.id))}
        onClose={() => setSelectedAuction(null)}
        onBidAmountChange={setBidAmount}
        onSubmitBid={handleBid}
        onToggleFavorite={(id) => void toggleFavorite(id)}
        onOpenLiveRoom={() => {
          if (!selectedAuction) return;
          setShowLiveRoom(true);
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
