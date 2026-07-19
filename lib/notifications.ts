import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { MarketplaceNotification, NotificationKind } from "@/components/notificationData";

export type NotificationPreferences = {
  bid: boolean;
  ending: boolean;
  order: boolean;
  message: boolean;
  campaign: boolean;
  email: boolean;
  push: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  bid: true,
  ending: true,
  order: true,
  message: true,
  campaign: false,
  email: true,
  push: true,
};

type NotificationRow = {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  action_label: string;
  important: boolean;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

type PreferenceRow = {
  bid_enabled: boolean;
  ending_enabled: boolean;
  order_enabled: boolean;
  message_enabled: boolean;
  campaign_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
};

export function formatNotificationTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (!Number.isFinite(diffSeconds) || diffSeconds < 30) return "Şimdi";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} dk önce`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} sa önce`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} gün önce`;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}

export function notificationRowToModel(row: NotificationRow): MarketplaceNotification {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    time: formatNotificationTime(row.created_at),
    href: row.href,
    action: row.action_label,
    important: row.important,
    readAt: row.read_at,
    createdAt: row.created_at,
    metadata: row.metadata ?? {},
  };
}

export async function getAuthenticatedNotificationClient(): Promise<{
  client: SupabaseClient;
  userId: string;
} | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;

  return { client, userId: data.user.id };
}

export async function fetchNotifications(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("kk_notifications")
    .select("id,user_id,kind,title,description,href,action_label,important,read_at,dismissed_at,created_at,metadata")
    .eq("user_id", userId)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map(notificationRowToModel);
}

export async function fetchNotificationPreferences(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("kk_notification_preferences")
    .select("bid_enabled,ending_enabled,order_enabled,message_enabled,campaign_enabled,email_enabled,push_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return defaultNotificationPreferences;

  const row = data as PreferenceRow;
  return {
    bid: row.bid_enabled,
    ending: row.ending_enabled,
    order: row.order_enabled,
    message: row.message_enabled,
    campaign: row.campaign_enabled,
    email: row.email_enabled,
    push: row.push_enabled,
  } satisfies NotificationPreferences;
}

export async function saveNotificationPreferences(
  client: SupabaseClient,
  userId: string,
  preferences: NotificationPreferences,
) {
  const { error } = await client.from("kk_notification_preferences").upsert({
    user_id: userId,
    bid_enabled: preferences.bid,
    ending_enabled: preferences.ending,
    order_enabled: preferences.order,
    message_enabled: preferences.message,
    campaign_enabled: preferences.campaign,
    email_enabled: preferences.email,
    push_enabled: preferences.push,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function markNotificationRead(client: SupabaseClient, notificationId: string) {
  const { error } = await client.rpc("kk_mark_notification_read", { p_notification_id: notificationId });
  if (error) throw error;
}

export async function markAllNotificationsRead(client: SupabaseClient) {
  const { error } = await client.rpc("kk_mark_all_notifications_read");
  if (error) throw error;
}

export async function dismissNotification(client: SupabaseClient, notificationId: string) {
  const { error } = await client.rpc("kk_dismiss_notification", { p_notification_id: notificationId });
  if (error) throw error;
}

let channelCounter = 0;

export function subscribeToNotifications(
  client: SupabaseClient,
  userId: string,
  onChange: () => void,
): RealtimeChannel {
  channelCounter += 1;
  const channelName = `kk-notifications-${userId.slice(0, 8)}-${Date.now()}-${channelCounter}`;

  return client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "kk_notifications",
        filter: `user_id=eq.${userId}`,
      },
      onChange,
    )
    .subscribe();
}
