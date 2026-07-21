"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { fetchMyAccountProfile, type AccountProfile } from "@/lib/auth";
import { getSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  profile: AccountProfile | null;
  loading: boolean;
  configured: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      return;
    }
    setProfile(await fetchMyAccountProfile(nextUser));
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;
    void client.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      await loadProfile(data.user ?? null);
      if (active) setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void loadProfile(nextUser).finally(() => {
        if (active) setLoading(false);
      });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (client) await client.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.assign("/");
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    configured: supabaseConfigured,
    refreshProfile,
    signOut,
  }), [user, profile, loading, refreshProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  return value;
}
