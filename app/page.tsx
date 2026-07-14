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
import type { Auction, AuctionCategory, Bid, ProfileSummary, AppNotification, ConversationMessage } from "@/components/types";

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
      current_price: Number(startPrice),
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
        loading={profileLoading}
        onClose={() => setShowProfile(false)}
        onOpenAuction={(auction) => {
          setShowProfile(false);
          void openDetail(auction);
        }}
        onOpenSell={() => {
          setShowProfile(false);
          handleOpenSell();
        }}
        onSignOut={() => {
          setShowProfile(false);
          void handleSignOut();
        }}
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
        onOpenMessages={() => {
          if (!user || !selectedAuction) {
            setShowAuth(true);
            return;
          }
          void loadMessages(selectedAuction);
        }}
        pricePulse={Boolean(selectedAuction && pricePulseId === selectedAuction.id)}
      />

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
