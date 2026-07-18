# KapışKapış Ölçeklenebilir Altyapı Kurulumu

## Vercel ortam değişkenleri

`env.example` dosyasındaki alanları Vercel > Project Settings > Environment Variables bölümüne ekleyin.

### Zorunlu
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Sentry
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

Sentry değişkenleri boş bırakılırsa uygulama çalışmaya devam eder; hata izleme devre dışı kalır.

### PostHog
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`

PostHog değişkenleri boş bırakılırsa uygulama çalışmaya devam eder; ürün analitiği devre dışı kalır.

## Cloudflare

Alan adını Cloudflare'e bağladıktan sonra:
1. SSL/TLS modunu `Full (strict)` yapın.
2. `Always Use HTTPS` özelliğini açın.
3. Bot Fight Mode ve temel WAF kurallarını açın.
4. HTML sayfalarını agresif cache etmeyin; `_next/static` dosyaları uygulama tarafından uzun süreli cache başlığıyla sunulur.

## İzleme davranışı

- Giriş yapan kullanıcı Sentry ve PostHog tarafında Supabase kullanıcı ID'siyle tanımlanır.
- E-posta adresinin tamamı analitiğe gönderilmez; yalnızca alan adı özelliği gönderilir.
- Çıkışta analitik kimliği sıfırlanır.
- Sentry Session Replay metinleri, girişleri ve medyayı gizleyecek şekilde ayarlanmıştır.
