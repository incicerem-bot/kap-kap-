"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { CheckoutBuyer } from "@/lib/payments";

export type BidSecurityDeposit = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  purpose: "legacy_deposit" | "smart_guarantee" | "card_verification";
  listingSlug: string | null;
  listingTitle: string | null;
  requestedBidAmount: number | null;
  requestedMaxAmount: number | null;
  requiredSecurity: number;
  bidPlacedAt: string | null;
  bidFailureMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  refundedAt: string | null;
  failureMessage: string | null;
};

export type BidSecurityAccess = {
  paymentVerified: boolean;
  identityVerified: boolean;
  cardVerified: boolean;
  heldSecurity: number;
  securityRequired: number;
  refundableSecurity: number;
};

export type BidSecuritySummary = {
  access: BidSecurityAccess;
  deposits: BidSecurityDeposit[];
};

export type BidSecurityQuote = {
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  riskAmount: number;
  securityForBid: number;
  committedSecurity: number;
  totalSecurityRequired: number;
  heldSecurity: number;
  additionalSecurityRequired: number;
  cardVerified: boolean;
  cardVerificationRequired: boolean;
  verificationAmount: number;
  chargeAmount: number;
  requiresPayment: boolean;
};

async function accessToken() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
  const { data, error } = await client.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("İşlem için yeniden giriş yapmalısın.");
  return data.session.access_token;
}

async function authenticatedRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await accessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) throw new Error(String(body?.message ?? "İşlem tamamlanamadı."));
  return body as T;
}

export function estimateSmartBidSecurity(amount: number) {
  if (!Number.isFinite(amount) || amount <= 5000) return 0;
  if (amount <= 20000) return 500;
  if (amount <= 50000) return Math.round(amount * 0.05 * 100) / 100;
  return Math.round(amount * 0.10 * 100) / 100;
}

export async function fetchBidSecuritySummary() {
  return authenticatedRequest<{ ok: true } & BidSecuritySummary>("/api/bid-security/status", { method: "GET" });
}

export async function quoteBidSecurity(listingSlug: string, bidAmount: number, maxAmount?: number | null) {
  return authenticatedRequest<{ ok: true; quote: BidSecurityQuote }>("/api/bid-security/quote", {
    method: "POST",
    body: JSON.stringify({ listingSlug, bidAmount, maxAmount: maxAmount ?? null }),
  });
}

export async function initializeSmartBidGuarantee(input: {
  listingSlug: string;
  bidAmount: number;
  maxAmount?: number | null;
  buyer: CheckoutBuyer;
}) {
  return authenticatedRequest<{ ok: true; paymentPageUrl: string; amount: number; quote: BidSecurityQuote; reused?: boolean }>("/api/bid-security/initialize", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function refundBidSecurityDeposit(depositId: string) {
  return authenticatedRequest<{ ok: true; refunded: boolean; refundedAt: string }>("/api/bid-security/refund", {
    method: "POST",
    body: JSON.stringify({ depositId }),
  });
}
