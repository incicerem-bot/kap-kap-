"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { marketplaceNotifications, type MarketplaceNotification } from "@/components/notificationData";
import {
  defaultNotificationPreferences,
  dismissNotification,
  fetchNotificationPreferences,
  fetchNotifications,
  getAuthenticatedNotificationClient,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
  subscribeToNotifications,
  type NotificationPreferences,
} from "@/lib/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationSource = "supabase" | "demo" | "signed-out";

export function useNotifications() {
  const [items, setItems] = useState<MarketplaceNotification[]>(marketplaceNotifications);
  const [preferences, setPreferencesState] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [source, setSource] = useState<NotificationSource>("demo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async (activeClient: SupabaseClient, activeUserId: string) => {
    const [notificationRows, preferenceRow] = await Promise.all([
      fetchNotifications(activeClient, activeUserId),
      fetchNotificationPreferences(activeClient, activeUserId),
    ]);
    setItems(notificationRows);
    setPreferencesState(preferenceRow);
    setSource("supabase");
    setError(null);
  }, []);

  useEffect(() => {
    let disposed = false;
    let activeChannel: ReturnType<typeof subscribeToNotifications> | null = null;
    let activeClient: SupabaseClient | null = null;

    async function start() {
      setLoading(true);
      const auth = await getAuthenticatedNotificationClient();
      if (disposed) return;

      if (!auth) {
        const hasSupabaseConfiguration = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        setItems(hasSupabaseConfiguration ? [] : marketplaceNotifications);
        setSource(hasSupabaseConfiguration ? "signed-out" : "demo");
        setLoading(false);
        return;
      }

      activeClient = auth.client;
      setClient(auth.client);
      setUserId(auth.userId);

      try {
        await load(auth.client, auth.userId);
        if (disposed) return;

        activeChannel = subscribeToNotifications(auth.client, auth.userId, () => {
          void load(auth.client, auth.userId).catch((realtimeError) => {
            console.error("[KapışKapış] Bildirim yenileme hatası", realtimeError);
          });
        });
      } catch (loadError) {
        console.error("[KapışKapış] Bildirim altyapısı kullanılamadı", loadError);
        if (!disposed) {
          setItems(marketplaceNotifications);
          setSource("demo");
          setError("Gerçek bildirim tablosu henüz hazır değil. Demo bildirimler gösteriliyor.");
        }
      } finally {
        if (!disposed) setLoading(false);
      }
    }

    void start();

    return () => {
      disposed = true;
      if (activeClient && activeChannel) {
        void activeClient.removeChannel(activeChannel);
      }
    };
  }, [load]);

  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  const markRead = useCallback(async (notificationId: string) => {
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => item.id === notificationId ? { ...item, readAt } : item));
    if (!client || source !== "supabase") return;

    try {
      await markNotificationRead(client, notificationId);
    } catch (actionError) {
      console.error("[KapışKapış] Bildirim okundu olarak işaretlenemedi", actionError);
      if (userId) void load(client, userId);
    }
  }, [client, load, source, userId]);

  const markAllRead = useCallback(async () => {
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
    if (!client || source !== "supabase") return;

    try {
      await markAllNotificationsRead(client);
    } catch (actionError) {
      console.error("[KapışKapış] Bildirimler okundu olarak işaretlenemedi", actionError);
      if (userId) void load(client, userId);
    }
  }, [client, load, source, userId]);

  const dismiss = useCallback(async (notificationId: string) => {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== notificationId));
    if (!client || source !== "supabase") return;

    try {
      await dismissNotification(client, notificationId);
    } catch (actionError) {
      console.error("[KapışKapış] Bildirim kaldırılamadı", actionError);
      setItems(previous);
    }
  }, [client, items, source]);

  const updatePreferences = useCallback(async (next: NotificationPreferences) => {
    const previous = preferences;
    setPreferencesState(next);
    if (!client || !userId || source !== "supabase") return;

    try {
      await saveNotificationPreferences(client, userId, next);
    } catch (preferenceError) {
      console.error("[KapışKapış] Bildirim tercihleri kaydedilemedi", preferenceError);
      setPreferencesState(previous);
      throw preferenceError;
    }
  }, [client, preferences, source, userId]);

  return {
    items,
    unreadCount,
    preferences,
    source,
    loading,
    error,
    markRead,
    markAllRead,
    dismiss,
    updatePreferences,
  };
}
