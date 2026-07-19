"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export type CheckoutBuyer = {
  name: string;
  surname: string;
  identityNumber: string;
  gsmNumber: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
};

async function accessToken() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
  const { data, error } = await client.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Ödeme işlemi için yeniden giriş yapmalısın.");
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

export async function initializeIyzicoPayment(orderNo: string, buyer: CheckoutBuyer) {
  return authenticatedRequest<{
    ok: true;
    paymentPageUrl?: string;
    redirectUrl?: string;
    alreadyPaid?: boolean;
    reused?: boolean;
    fees?: {
      itemPrice: number;
      buyerFee: number;
      paidPrice: number;
      sellerCommission: number;
      sellerPayoutAmount: number;
    };
  }>("/api/payments/iyzico/initialize", {
    method: "POST",
    body: JSON.stringify({ orderNo, buyer }),
  });
}

export async function fetchIyzicoPaymentStatus(orderNo: string) {
  return authenticatedRequest<{
    ok: true;
    order: { orderNo: string; status: string; paymentStatus: string; amount: number; currency: string };
    attempt: { status: string; failure_message?: string | null; created_at?: string; completed_at?: string | null } | null;
  }>(`/api/payments/iyzico/status?order=${encodeURIComponent(orderNo)}`, { method: "GET" });
}

export async function approveDeliveredOrder(orderNo: string) {
  return authenticatedRequest<{ ok: true; alreadyApproved?: boolean }>("/api/payments/iyzico/approve", {
    method: "POST",
    body: JSON.stringify({ orderNo }),
  });
}
