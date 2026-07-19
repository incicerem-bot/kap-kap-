"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

function safeMessage(error: Error & { digest?: string }) {
  const message = error?.message?.trim();
  if (!message) return "Uygulama başlatılırken bilinmeyen bir hata oluştu.";

  if (/supabaseurl|supabasekey|invalid.*url|failed to construct.*url/i.test(message)) {
    return "Supabase bağlantı bilgileri geçersiz veya eksik. Vercel ortam değişkenlerini kontrol et.";
  }

  return message.length > 180 ? `${message.slice(0, 177)}...` : message;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch {
      // Error tracking must never crash the fallback screen.
    }
  }, [error]);

  return (
    <html lang="tr">
      <body>
        <main className="globalErrorPage">
          <div className="globalErrorCard">
            <span className="globalErrorCode">KAPIŞKAPIŞ</span>
            <h1>Beklenmeyen bir hata oluştu</h1>
            <p>{safeMessage(error)}</p>
            {error.digest && <small>Hata kodu: {error.digest}</small>}
            <button type="button" onClick={reset}>
              Yeniden dene
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
