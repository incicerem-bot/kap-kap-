# KapışKapış Kullanıcı, Satıcı ve Yönetici Yetkilendirme Kurulumu

## 1. SQL migration

Supabase Dashboard > SQL Editor bölümünde şu dosyanın tamamını çalıştır:

`supabase/migrations/20260719_013_auth_roles_and_registration.sql`

Başarılı sonuçta şu üç değer `true` görünmelidir:

- `account_rpc_ready`
- `seller_upgrade_ready`
- `roles_ready`

## 2. İlk yönetici hesabı

Normal kayıt ekranından yönetici hesabı oluşturulamaz.

1. Önce KapışKapış kayıt ekranından kendi hesabını oluştur.
2. Supabase Dashboard > Authentication > Users bölümünden kullanıcı UUID değerini kopyala.
3. `supabase/SET-ILK-YONETICI.sql` dosyasındaki iki `USER_UUID` alanını bu UUID ile değiştir.
4. Dosyayı SQL Editor içinde çalıştır.

Bundan sonraki yönetici rol değişiklikleri veritabanındaki `kk_admin_set_user_role(uuid, text)` fonksiyonuyla yalnız mevcut yönetici tarafından yapılabilir.

## 3. Supabase Auth URL ayarları

Supabase Dashboard > Authentication > URL Configuration bölümünde:

- Site URL: gerçek production domaini
- Redirect URL: `https://DOMAININ.com/auth/callback`
- Yerel test için: `http://localhost:3000/auth/callback`

Kayıt kodu seçilen hesap türüne göre callback adresine `next` parametresi gönderir:

- Alıcı: `/profil`
- Satıcı: `/satici-dogrulama`

Varsayılan Supabase doğrulama e-postası kullanılabilir. E-posta doğrulamasını production ortamında açık tut.

## 4. Vercel ortam değişkenleri

Mevcut değerler bulunmalıdır:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` yalnız sunucu API rotalarında kullanılır. Başına `NEXT_PUBLIC_` eklenmemelidir.

## 5. Hesap rolleri

### buyer

- Teklif verebilir.
- Sipariş, favori, mesaj, bildirim ve hesap alanlarını kullanabilir.
- Satış Merkezi ve ilan oluşturma rotalarına erişemez.
- `/satici-dogrulama` üzerinden satıcı başvurusu başlatabilir.

### seller

- Alıcı yetkilerinin tamamına sahiptir.
- İlan oluşturabilir ve Satış Merkezi'ne erişebilir.
- Satışa başlamadan önce iyzico satıcı doğrulamasını tamamlar.
- Ödeme hesabı aktif olduğunda `seller_status = active` olur.

### admin

- Yönetim Merkezi'ne erişebilir.
- Normal kayıt veya kullanıcı metadata değişikliğiyle alınamaz.
- Yalnız güvenli yönetici işlemi veya SQL ile atanır.

## 6. Rota koruması

`middleware.ts` şu kontrolleri yapar:

- Oturum gerektiren sayfalar giriş ekranına yönlenir.
- Alıcı, satıcı sayfalarına girerse satıcı doğrulamaya yönlenir.
- Yönetici olmayan kullanıcı `/yonetim` sayfasından `/yetkisiz` ekranına yönlenir.
- Askıya alınan veya kapatılan hesap `/hesap-durumu` ekranına yönlenir.
- Giriş yapmış kullanıcı tekrar giriş/kayıt ekranına giderse rolüne uygun merkeze yönlenir.

Asıl veri güvenliği yalnız menü gizlemeye dayanmaz; rol kolonları kullanıcı tarafından değiştirilemez ve Supabase RLS/RPC kontrolleri kullanılmaya devam eder.

## 7. Test sırası

### Alıcı hesabı

1. `/kayit` sayfasında Alıcı hesabı seç.
2. E-posta doğrulamasını tamamla.
3. `/profil` sayfasına yönlenmelisin.
4. `/ilanlarim` açıldığında `/satici-dogrulama` sayfasına yönlenmelisin.

### Satıcı hesabı

1. `/kayit` sayfasında Satıcı hesabı seç.
2. E-posta doğrulamasını tamamla.
3. `/satici-dogrulama` sayfasına yönlenmelisin.
4. iyzico alt üye hesabını tamamla.
5. `/ilanlarim` ve `/ilan-olustur` rotaları açılmalıdır.

### Yönetici hesabı

1. İlk yönetici SQL dosyasını kendi UUID değerinle çalıştır.
2. Çıkış yapıp yeniden giriş yap.
3. Hesap menüsünde Yönetim Merkezi görünmelidir.
4. `/yonetim` rotası açılmalıdır.

## 8. Eski kullanıcılar

Migration çalışınca:

- Mağazası olmayan eski hesaplar `buyer` olur.
- Daha önce `kk_sellers` kaydı bulunan hesaplar `seller` olur.
- Aktif iyzico ödeme hesabı bulunan satıcılar `seller_status = active` olur.
- Yönetici rolü otomatik verilmez.
