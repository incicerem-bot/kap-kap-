# KapışKapış Akıllı Teklif Güvencesi Kurulumu

## 1. SQL
Supabase SQL Editor içinde şunu çalıştır:

`supabase/migrations/20260719_007_smart_bid_guarantee.sql`

Başarılı sonuç:

`KapışKapış Akıllı Teklif Güvencesi başarıyla kuruldu.`

## 2. Vercel ortam değişkeni
İsteğe bağlı:

`KAPISKAPIS_CARD_VERIFICATION_AMOUNT=10`

Bu tutar yalnızca 5.000 TL ve altındaki ilk tekliflerde kart doğrulaması amacıyla kullanılır. Kullanıcı daha önce başarılı iyzico güvence işlemi yaptıysa yeniden kart doğrulaması istenmez.

## 3. Güvence kuralları
- 0–5.000 TL: doğrulanmış kart yeterli
- 5.001–20.000 TL: 500 TL güvence
- 20.001–50.000 TL: teklif/otomatik üst sınırın %5'i
- 50.001 TL üzeri: teklif/otomatik üst sınırın %10'u

Birden fazla açık artırmada lider olan kullanıcının gereken güvencesi ilan bazında toplanır. Mevcut güvence yeterliyse ödeme ekranı açılmaz. Eksikse yalnızca fark iyzico Checkout Form üzerinden doğrulanır.

## 4. Kullanıcı akışı
1. Kullanıcı ürün sayfasında teklif veya otomatik teklif üst sınırını girer.
2. `/api/bid-security/quote` gereken güvenceyi sunucu tarafında hesaplar.
3. Ek güvence yoksa teklif doğrudan Supabase RPC ile kaydedilir.
4. Ek güvence varsa `/teklif-guvencesi` ekranı açılır.
5. iyzico callback/webhook sonucu doğrulanınca bekleyen teklif otomatik gönderilir.
6. Aktif liderlik veya ödenmemiş kazanım kalmadığında kullanılmayan güvence iade edilebilir.

## 5. Eski adresler
Eski `/teklif-limiti` ve `/teklif-limiti-sonucu` adresleri yeni güvence sayfalarına yönlendirilir.

## Önemli
Mevcut entegrasyon iyzico Checkout Form ile tahsilat + uygun olduğunda iade modelini kullanır. Gerçek banka provizyonu (PreAuth/PostAuth) kullanmak için iyzico hesabında ilgili özelliğin ayrıca açılması ve farklı API akışının devreye alınması gerekir.
