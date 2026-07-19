"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const MARKETPLACE_COLLECTIONS_EVENT = "kapiskapis:collections-changed";
export const FAVORITES_STORAGE_KEY = "kapiskapis:favorites";
export const COMPARE_STORAGE_KEY = "kapiskapis:compare";
export const READ_NOTIFICATIONS_STORAGE_KEY = "kapiskapis:read-notifications";

export const defaultFavoriteIds = ["iphone-15-pro", "ps5-slim", "macbook-pro"];
export const defaultCompareIds = ["iphone-15-pro", "ps5-slim"];
export const defaultReadNotificationIds = ["new-message", "payment-protected", "account-verified", "saved-search"];

function readIds(key: string, fallback: string[]) {
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : fallback;
  } catch {
    return fallback;
  }
}

function saveIds(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(MARKETPLACE_COLLECTIONS_EVENT, { detail: { key, value } }));
}

export function useStoredIds(key: string, fallback: string[] = []) {
  const fallbackRef = useRef(fallback);
  const [ids, setIdsState] = useState<string[]>(fallbackRef.current);

  useEffect(() => {
    setIdsState(readIds(key, fallbackRef.current));
    const sync = () => setIdsState(readIds(key, fallbackRef.current));
    window.addEventListener("storage", sync);
    window.addEventListener(MARKETPLACE_COLLECTIONS_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(MARKETPLACE_COLLECTIONS_EVENT, sync);
    };
  }, [key]);

  const setIds = useCallback((next: string[] | ((current: string[]) => string[])) => {
    const value = typeof next === "function" ? next(ids) : next;
    const unique = [...new Set(value)];
    setIdsState(unique);
    saveIds(key, unique);
  }, [ids, key]);

  const toggle = useCallback((id: string, limit?: number) => {
    if (ids.includes(id)) {
      const value = ids.filter((item) => item !== id);
      setIdsState(value);
      saveIds(key, value);
      return "removed" as const;
    }
    if (limit && ids.length >= limit) return "limit" as const;
    const value = [...ids, id];
    setIdsState(value);
    saveIds(key, value);
    return "added" as const;
  }, [ids, key]);

  const remove = useCallback((id: string) => {
    const value = ids.filter((item) => item !== id);
    setIdsState(value);
    saveIds(key, value);
  }, [ids, key]);

  const clear = useCallback(() => {
    setIdsState([]);
    saveIds(key, []);
  }, [key]);

  return { ids, setIds, toggle, remove, clear };
}
