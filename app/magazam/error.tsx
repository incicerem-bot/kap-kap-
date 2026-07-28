"use client";

import Link from "next/link";

export default function MagazamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#07090c",
        color: "#f5f7fa",
      }}
    >
      <section
        style={{
          width: "min(620px, 100%)",
          padding: 28,
          border: "1px solid rgba(212, 175, 55, 0.28)",
          borderRadius: 20,
          background: "#10151b",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.36)",
        }}
      >
        <span
          style={{
            color: "#d4af37",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.14em",
          }}
        >
          KAPIŞKAPIŞ MAĞAZA MERKEZİ
        </span>
        <h1 style={{ margin: "12px 0 8px", fontSize: 32 }}>
          Mağaza ekranı açılamadı
        </h1>
        <p style={{ margin: 0, color: "#aeb7c2", lineHeight: 1.7 }}>
          Sayfa tamamen kapanmadı. Bağlantıyı yeniden deneyebilir veya satıcı
          başvurusu ekranına dönebilirsin.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre
            style={{
              marginTop: 18,
              padding: 14,
              overflowX: "auto",
              borderRadius: 12,
              background: "#080b0f",
              color: "#ffb4b4",
              whiteSpace: "pre-wrap",
            }}
          >
            {error.message}
          </pre>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 44,
              padding: "0 18px",
              border: 0,
              borderRadius: 12,
              background: "#d4af37",
              color: "#07090c",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
          <Link
            href="/satici-dogrulama"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              padding: "0 18px",
              border: "1px solid rgba(255,255,255,.14)",
              borderRadius: 12,
              color: "#f5f7fa",
              textDecoration: "none",
            }}
          >
            Satıcı başvurusuna dön
          </Link>
        </div>
      </section>
    </main>
  );
}
