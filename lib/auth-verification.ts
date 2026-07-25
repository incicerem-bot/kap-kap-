import { getSupabaseBrowserClient } from "@/lib/supabase";

export type PhoneVerificationCheck = {
  allowed: boolean;
  message: string;
};

export function normalizeTurkishPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  if (value.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function maskPhone(value: string | null | undefined) {
  if (!value) return "Telefon eklenmedi";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return value;
  const prefix = value.startsWith("+") ? `+${digits.slice(0, Math.min(4, digits.length - 4))}` : digits.slice(0, 3);
  return `${prefix} *** ** ${digits.slice(-2)}`;
}

export async function syncMyVerification() {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client.rpc("kk_sync_my_auth_verification");
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function canStartPhoneVerification(phone: string): Promise<PhoneVerificationCheck> {
  const client = getSupabaseBrowserClient();
  if (!client) return { allowed: false, message: "Supabase bağlantısı yapılandırılmamış." };
  const { data, error } = await client.rpc("kk_can_start_phone_verification", { p_phone: phone });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as { allowed?: boolean; message?: string } | null;
  return {
    allowed: Boolean(row?.allowed),
    message: String(row?.message || (row?.allowed ? "Telefon doğrulaması başlatılabilir." : "Telefon doğrulanamadı.")),
  };
}
