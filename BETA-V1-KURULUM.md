# KapışKapış Beta v1.0

Bu sürüm güncel GitHub projesi temel alınarak hazırlanmıştır.

## Kurulum

GitHub deposundaki dosyaları bu klasörün içeriğiyle değiştirin. Vercel ortam değişkenleri aynı kalır:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Yeni SQL veya secret key gerekmez.

## Kurucu Paneli

1. Siteye normal hesabınızla giriş yapın.
2. Sağ üstte Profil simgesine basın.
3. Profilin altındaki **Kurucu Panelini Aç** düğmesine basın.
4. **100 ilanı oluştur** düğmesini kullanın.

İlanlar normal oturum ve mevcut RLS kurallarıyla, giriş yaptığınız hesabın ilanları olarak eklenir. İlanlar 10'ar kayıtlık gruplar hâlinde oluşturulur.

## Temizlik

Kurucu Paneli içindeki **Test ilanlarını sil** düğmesi yalnızca:

- giriş yaptığınız hesaba ait,
- açıklamasında `[KAPISKAPIS_BETA_V1]` bulunan

ilanları temizler. Normal ilanlara dokunmaz.
