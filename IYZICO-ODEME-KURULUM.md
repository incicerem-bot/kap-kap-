# KapışKapış iyzico ödeme kurulumu

## 1. SQL migration
Supabase SQL Editor içinde çalıştır:

`supabase/migrations/20260719_004_iyzico_payments.sql`

## 2. Satıcının alt üye anahtarı
`supabase/TEST-IYZICO-SATICI-ANAHTARI.sql` dosyasındaki mağaza slug ve sandbox `subMerchantKey` değerini değiştirip çalıştır.

Gerçek sistemde alt üye anahtarı iyzico Marketplace Onboarding API sonucundan sunucu tarafında kaydedilmelidir.

## 3. Vercel Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `IYZIPAY_ENV=sandbox`
- `IYZIPAY_URI=https://sandbox-api.iyzipay.com`
- `IYZIPAY_API_KEY`
- `IYZIPAY_SECRET_KEY`
- `IYZIPAY_ENABLED_INSTALLMENTS=1`
- `IYZIPAY_STRICT_WEBHOOK=false`
- `IYZIPAY_REQUIRE_RESPONSE_SIGNATURE=false`
- `KAPISKAPIS_BUYER_FEE_RATE=0.025`
- `NEXT_PUBLIC_KAPISKAPIS_BUYER_FEE_RATE=0.025`
- `KAPISKAPIS_SELLER_COMMISSION_RATE=0.08`

`SUPABASE_SERVICE_ROLE_KEY` ve `IYZIPAY_SECRET_KEY` değişkenlerine kesinlikle `NEXT_PUBLIC_` öneki ekleme.

## 4. iyzico callback ve webhook
Callback otomatik olarak şu adrese verilir:

`https://alanadiniz.com/api/payments/iyzico/callback`

Webhook adresi:

`https://alanadiniz.com/api/payments/iyzico/webhook`

Webhook imza özelliği iyzico hesabında aktif edildikten sonra production ortamında:

- `IYZIPAY_STRICT_WEBHOOK=true`
- `IYZIPAY_REQUIRE_RESPONSE_SIGNATURE=true`

olarak ayarla ve yeniden deploy et.

## 5. Test

1. Gerçek Supabase test kullanıcısıyla giriş yap.
2. Kullanıcının `payment_pending` durumunda bir `kk_orders` kaydı olsun.
3. Siparişin satıcısına sandbox alt üye anahtarı tanımla.
4. `/siparisler` sayfasından `Güvenli ödemeyi tamamla` butonuna bas.
5. `/odeme?order=...` ekranındaki bilgileri doldur.
6. iyzico sandbox ödeme formunda test kartı kullan.

## Güvenlik

- Kart numarası KapışKapış formuna girilmez.
- Ödeme başlatma ve sonuç sorgulama server-side API rotalarındadır.
- Sipariş, kullanıcı JWT'si ile sahiplik kontrolünden geçer.
- iyzico sonucu yeniden sorgulanır; token, conversationId, basketId, fiyat, paidPrice ve imza eşleştirilir.
- Webhook `X-IYZ-SIGNATURE-V3` ile doğrulanır.
- Teslimat onayı, iyzico `paymentTransactionId` ürün onayıyla birlikte çalışır.
