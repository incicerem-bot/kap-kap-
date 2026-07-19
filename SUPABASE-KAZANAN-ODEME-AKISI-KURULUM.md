# KapışKapış — Kazanan Ödeme Süresi ve İkinci Şans

## 1. Migration

Supabase SQL Editor içinde çalıştır:

`supabase/migrations/20260719_010_auction_winner_settlement.sql`

Varsayılan ayarlar:

- Kazanan ödeme süresi: 15 dakika
- Başlatılmış iyzico işlemi için ek tamamlama süresi: 20 dakika
- En fazla teklif turu: 3 kişi
- İlk ödeme ihlali: 24 saat teklif askısı
- İkinci ihlal: 7 gün
- Tekrarlayan ihlal: 30 gün

Ayarları Supabase Table Editor içindeki `kk_auction_settlement_settings` tablosundan değiştirebilirsin. Bu tablo tarayıcı kullanıcılarına kapalıdır.

## 2. Zamanlanmış görev

Vercel Environment Variables alanına uzun ve rastgele bir `CRON_SECRET` ekle.

Görev adresi:

`GET https://DOMAININ.com/api/auctions/settle`

Header:

`Authorization: Bearer CRON_SECRET_DEGERIN`

Bu adresi kullandığın zamanlayıcıdan 1–5 dakikada bir çağır. Uygulama ekranları açıldığında da aynı Supabase fonksiyonu fırsatçı olarak çalıştırılır; zamanlanmış görev ise kullanıcı siteyi açmasa bile süreci devam ettirir.

## 3. Güvenlik ve iş kuralı

- Süresi dolmuş sipariş ödeme alamaz.
- Ödeme süresi dolmadan başlatılmış gerçek iyzico oturumuna kısa ek süre verilir.
- Ödeme yapmayan kazananın siparişi kapatılır.
- Kullanıcının güven puanı düşürülür ve teklif hesabı geçici askıya alınır.
- Sistem sıradaki uygun teklif sahibini hesaplar.
- Yeni kullanıcı, kendi rekabet seviyesine göre hesaplanan adil ikinci-şans fiyatını görür.
- Gizli otomatik teklif üst limitleri kullanıcı arayüzüne veya Realtime kanalına açılmaz.
- Akıllı Teklif Güvencesi otomatik olarak para cezasına çevrilmez. Finansal kesinti uygulanacaksa hukuk danışmanı ve ödeme kuruluşu onayıyla ayrıca tasarlanmalıdır.

## 4. Kontrol

Migration sonucunda şu iki alan `true` olmalı:

- `offer_history_ready`
- `reliability_ready`
