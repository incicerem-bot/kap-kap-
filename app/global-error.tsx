"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body>
        <main className="globalErrorPage">
          <div className="globalErrorCard">
            <span className="globalErrorCode">KAPIŞKAPIŞ</span>
            <h1>Beklenmeyen bir hata oluştu</h1>
            <p>İşlemin kaydedildi. Sayfayı yeniden deneyebilirsin.</p>
            <button type="button" onClick={reset}>
              Yeniden dene
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
