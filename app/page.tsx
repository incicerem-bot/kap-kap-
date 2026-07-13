"use client";

import { supabaseConfigured } from "@/lib/supabase";

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-mark">KK</div>
        <div>
          <h1>KapışKapış</h1>
          <p>Beğendiysen bekleme, KapışKapış kap!</p>
        </div>
      </header>

      <section className="hero">
        <span className={supabaseConfigured ? "status live" : "status preview"}>
          {supabaseConfigured ? "SUPABASE BAĞLI" : "KURULUM HAZIR"}
        </span>
        <h2>Temiz proje başarıyla çalışıyor.</h2>
        <p>
          Bu temel sürüm yalnızca sağlam altyapıyı doğrular. Sonraki adımda gerçek kayıt ve giriş
          ekranını ekleyeceğiz.
        </p>
      </section>

      <section className="steps">
        <article>
          <strong>1</strong>
          <h3>Temiz GitHub</h3>
          <p>Kopya veya yanlış konumlanmış dosya yok.</p>
        </article>
        <article>
          <strong>2</strong>
          <h3>Vercel uyumlu</h3>
          <p>Standart Next.js klasör yapısı kullanılıyor.</p>
        </article>
        <article>
          <strong>3</strong>
          <h3>Supabase hazır</h3>
          <p>Ortam değişkenleri eklenince canlı bağlantı açılır.</p>
        </article>
      </section>
    </main>
  );
}
