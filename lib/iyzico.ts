import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import Iyzipay from "iyzipay";

export type IyzicoResponse = Record<string, any>;

let iyzicoClient: any | null = null;

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

export function getIyzicoConfiguration() {
  const mode = process.env.IYZIPAY_ENV?.trim().toLowerCase() === "production" ? "production" : "sandbox";
  const uri = process.env.IYZIPAY_URI?.trim() || (mode === "production" ? "https://api.iyzipay.com" : "https://sandbox-api.iyzipay.com");
  return {
    mode,
    uri,
    apiKey: env("IYZIPAY_API_KEY"),
    secretKey: env("IYZIPAY_SECRET_KEY"),
  };
}

export function getIyzicoClient() {
  if (iyzicoClient) return iyzicoClient;
  const config = getIyzicoConfiguration();
  iyzicoClient = new Iyzipay({ apiKey: config.apiKey, secretKey: config.secretKey, uri: config.uri });
  return iyzicoClient;
}

function callIyzico(resource: any, method: string, payload: Record<string, unknown>): Promise<IyzicoResponse> {
  return new Promise((resolve, reject) => {
    resource[method](payload, (error: unknown, result: IyzicoResponse) => {
      if (error) {
        reject(error instanceof Error ? error : new Error("iyzico isteği tamamlanamadı."));
        return;
      }
      resolve(result ?? {});
    });
  });
}

export function initializeCheckoutForm(payload: Record<string, unknown>) {
  return callIyzico(getIyzicoClient().checkoutFormInitialize, "create", payload);
}

export function retrieveCheckoutForm(payload: Record<string, unknown>) {
  return callIyzico(getIyzicoClient().checkoutForm, "retrieve", payload);
}

export function approveMarketplaceItem(payload: Record<string, unknown>) {
  return callIyzico(getIyzicoClient().approval, "create", payload);
}

export function createSubMerchant(payload: Record<string, unknown>) {
  return callIyzico(getIyzicoClient().subMerchant, "create", payload);
}

export function updateSubMerchant(payload: Record<string, unknown>) {
  return callIyzico(getIyzicoClient().subMerchant, "update", payload);
}

export function retrieveSubMerchant(payload: Record<string, unknown>) {
  return callIyzico(getIyzicoClient().subMerchant, "retrieve", payload);
}

function hexHmac(parts: unknown[]) {
  const { secretKey } = getIyzicoConfiguration();
  const normalized = parts.map((part) => String(part ?? "")).join(":");
  return createHmac("sha256", secretKey).update(normalized).digest("hex");
}

export function verifyIyzicoResponseSignature(parts: unknown[], signature: unknown) {
  if (typeof signature !== "string" || !signature) return false;
  const expected = Buffer.from(hexHmac(parts), "utf8");
  const received = Buffer.from(signature.toLowerCase(), "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function verifyIyzicoWebhookSignature(payload: Record<string, unknown>, signature: string | null) {
  if (!signature) return false;
  const { secretKey } = getIyzicoConfiguration();
  const raw = [
    secretKey,
    payload.iyziEventType,
    payload.iyziPaymentId,
    payload.token,
    payload.paymentConversationId,
    payload.status,
  ].map((part) => String(part ?? "")).join("");
  const expectedHex = createHmac("sha256", secretKey).update(raw).digest("hex");
  const expected = Buffer.from(expectedHex, "utf8");
  const received = Buffer.from(signature.toLowerCase(), "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function iyzicoRequiresResponseSignature() {
  if (process.env.IYZIPAY_REQUIRE_RESPONSE_SIGNATURE === "false") return false;
  return process.env.IYZIPAY_ENV?.toLowerCase() === "production";
}

export function iyzicoRequiresStrictWebhook() {
  return process.env.IYZIPAY_STRICT_WEBHOOK === "true";
}
