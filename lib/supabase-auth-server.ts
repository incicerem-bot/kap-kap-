import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function requiredPublicEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

export async function createSupabaseServerAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredPublicEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
    requiredPublicEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component içinde cookie yazılamaz. Middleware oturumu yeniler.
          }
        },
      },
    },
  );
}
