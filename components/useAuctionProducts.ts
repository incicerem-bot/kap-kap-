"use client";

import { useEffect, useState } from "react";
import { demoProducts, type Product } from "@/components/productData";
import { fetchPublicListings, subscribeToMarketplace, supabaseConfigured } from "@/lib/auctions";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function useAuctionProducts() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [usingLiveData, setUsingLiveData] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await fetchPublicListings();
        if (!cancelled) {
          setProducts(rows);
          setUsingLiveData(true);
        }
      } catch {
        if (!cancelled) setUsingLiveData(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const channel = subscribeToMarketplace(() => void load());
    const client = getSupabaseBrowserClient();

    return () => {
      cancelled = true;
      if (channel && client) void client.removeChannel(channel);
    };
  }, []);

  return { products, loading, usingLiveData };
}
