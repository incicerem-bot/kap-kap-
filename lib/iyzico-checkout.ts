import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type JsonObject = Record<string, unknown>;

export type IyzicoResponse = JsonObject & {
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  conversationId?: string;
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  signature?: string;
  paymentStatus?: string;
  paymentId?: string;
  paidPrice?: number | string;
  price?: number | string;
  currency?: string;
  basketId?: string;
  fraudStatus?: number;
  installment?: number;
  itemTransactions?: Array<{ paymentTransactionId?: string }>;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

function baseUrl(): string {
  return (process.env.IYZICO_BASE_URL?.trim() || "https://sandbox-api.iyzipay.com").replace(/\/$/, "");
}

function authorization(path: string, body: string): { authorization: string; randomKey: string } {
  const apiKey = required("IYZICO_API_KEY");
  const secretKey = required("IYZICO_SECRET_KEY");
  const randomKey = `${Date.now()}${randomBytes(8).toString("hex")}`;
  const signature = createHmac("sha256", secretKey)
    .update(`${randomKey}${path}${body}`, "utf8")
    .digest("hex");
  const encoded = Buffer.from(`apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`, "utf8").toString("base64");
  return { authorization: `IYZWSv2 ${encoded}`, randomKey };
}

async function post(path: string, payload: JsonObject): Promise<IyzicoResponse> {
  const body = JSON.stringify(payload);
  const auth = authorization(path, body);
  const response = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      Authorization: auth.authorization,
      "x-iyzi-rnd": auth.randomKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  let result: IyzicoResponse;
  try {
    result = JSON.parse(text) as IyzicoResponse;
  } catch {
    throw new Error(`iyzico geçersiz yanıt döndürdü (${response.status}).`);
  }

  if (!response.ok || result.status === "failure") {
    throw new Error(result.errorMessage || result.errorCode || `iyzico isteği başarısız (${response.status}).`);
  }
  return result;
}

export function initializeCheckoutForm(payload: JsonObject): Promise<IyzicoResponse> {
  return post("/payment/iyzipos/checkoutform/initialize/auth/ecom", payload);
}

export function retrieveCheckoutForm(token: string, conversationId: string): Promise<IyzicoResponse> {
  return post("/payment/iyzipos/checkoutform/auth/ecom/detail", {
    locale: "tr",
    conversationId,
    token,
  });
}

function safeEqualHex(left: string, right: string): boolean {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right) || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function verifyCheckoutResponseSignature(response: IyzicoResponse): boolean {
  if (!response.signature) return true;
  const secretKey = required("IYZICO_SECRET_KEY");
  const values = [
    response.paymentStatus,
    response.paymentId,
    response.currency,
    response.basketId,
    response.conversationId,
    response.paidPrice,
    response.price,
    response.token,
  ].map((value) => String(value ?? ""));
  const expected = createHmac("sha256", secretKey).update(values.join(":"), "utf8").digest("hex");
  return safeEqualHex(expected, response.signature);
}
