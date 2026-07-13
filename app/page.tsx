"use client";

import { useEffect, useState } from "react";
import {
  getSupabaseBrowserClient,
  supabaseConfigured,
} from "../lib/supabase";

export default function HomePage() {
  const [status, setStatus] = useState("Kontrol ediliyor...");

  useEffect(() => {
    async function checkConnection() {
      if (!supabaseConfigured) {
        setStatus("⚠️ Supabase ayarlanmamış.");
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setStatus("❌ Supabase bağlantısı kurulamadı.");
        return;
      }

      const { error } = await supabase.auth.getSession();

      if (error) {
        setStatus(`❌ Bağlantı hatası: ${error.message}`);
        return;
      }

      setStatus("✅ KapışKapış Beta hazır!");
    }

    void checkConnection();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "56px",
          marginBottom: "10px",
          color: "#ffb703",
        }}
      >
        KapışKapış
      </h1>

      <h2
        style={{
          fontWeight: 400,
          marginBottom: "30px",
        }}
      >
        Açık Artırma Platformu
      </h2>

      <div
        style={{
          background: "#1e293b",
          padding: "20px 30px",
          borderRadius: "12px",
          fontSize: "20px",
          maxWidth: "520px",
          width: "100%",
        }}
      >
        {status}
      </div>
    </main>
  );
}
