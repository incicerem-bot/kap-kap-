# KapışKapış — iyzico Satıcı Doğrulama Kurulumu

1. Önce `supabase/migrations/20260719_004_iyzico_payments.sql` çalışmış olmalıdır.
2. Supabase SQL Editor içinde `supabase/migrations/20260719_005_seller_onboarding.sql` dosyasının tamamını çalıştır.
3. Vercel ortam değişkenlerinde `SUPABASE_SERVICE_ROLE_KEY`, `IYZIPAY_API_KEY`, `IYZIPAY_SECRET_KEY`, `IYZIPAY_URI` ve `IYZIPAY_ENV` bulunduğunu doğrula.
4. Yeniden deploy yap.
5. Giriş yapan kullanıcıyla `/satici-dogrulama` adresini aç ve gerçek sandbox bilgileriyle başvuru yap.

## Güvenlik

- `submerchant_key` yalnız sunucu/service_role tarafından okunur.
- T.C. kimlik ve vergi numarası düz metin olarak Supabase'e kaydedilmez.
- IBAN yalnız maskeli biçimde saklanır.
- İlan taslağı ödeme hesabı olmadan kaydedilebilir; yayınlama için aktif alt üye hesabı zorunludur.
- iyzico'ya gerçek ve doğru satıcı bilgileri gönderilmelidir.
