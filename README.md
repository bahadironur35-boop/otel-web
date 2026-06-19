# StayOS Hotel Platform

StayOS; otel web sitesi, rezervasyon motoru, operasyon paneli, otomasyon akışları ve tatil platformu entegrasyonlarını tek üründe birleştirmek için hazırlanmış ilk prototiptir.

## Mevcut sürüm

- Misafir tarafı için tanıtım ve rezervasyon arama ekranı
- `/admin` altında yönetim paneli, rezervasyon, oda, görev ve kanal ekranları
- Prisma ile PostgreSQL veri modeli
- Rezervasyon, oda tipi ve görev oluşturma formları
- Admin panel için e-posta/şifre girişi ve oturum koruması
- Yeni rezervasyonda yönetici ve misafir e-posta bildirimi
- Channex staging bağlantısı, stok senkronizasyonu ve webhook giriş noktası
- Booking, Expedia, Airbnb, Agoda gibi OTA kanalları için entegrasyon yaklaşımı
- Vercel üzerinde Next.js uygulaması olarak yayınlanabilir yapı

## Ürün yol haritası

1. Tanıtım sitesi, oda listeleme ve rezervasyon talep formu
2. Admin panel, otel/oda/fiyat modeli ve rezervasyon yönetimi
3. Ödeme, e-posta/SMS/WhatsApp bildirimleri ve operasyon görevleri
4. Channel manager katmanı ve OTA senkronizasyonları

## Yerelde çalıştırma

Bağımlılıkları kurduktan sonra geliştirme sunucusunu başlatabilirsiniz.

```bash
npm.cmd install
npm.cmd run dev
```

## Veritabanı

Proje PostgreSQL için hazırlandı. Supabase, Neon veya Vercel Postgres kullanılabilir.

1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. Supabase bağlantı değerleriyle `DATABASE_URL` ve `DIRECT_URL` alanlarını doldurun.
3. Şemayı veritabanına gönderin.
4. Demo verileri yükleyin.

```bash
npm.cmd run db:push
npm.cmd run db:seed
```

`DATABASE_URL` yoksa uygulama demo verilerle açılır; formlar gerçek kayıt yazmak yerine demo mod uyarısı gösterir.

## Admin girişi

Admin paneli `/login` sayfasından açılır. Yerelde ve Vercel'de şu environment variable değerleri gerekir:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="güçlü-bir-şifre"
SESSION_SECRET="uzun-rastgele-bir-değer"
```

`SESSION_SECRET` için uzun, tahmin edilmesi zor bir metin kullanın.

## E-posta bildirimleri

Yeni web rezervasyonu geldiğinde yöneticiye ve misafire e-posta göndermek için Resend kullanılabilir:

```env
RESEND_API_KEY="re_xxxxxxxxx"
RESEND_FROM_EMAIL="StayOS <reservations@example.com>"
RESERVATION_NOTIFICATION_EMAIL="hotel-manager@example.com"
```

Gönderen adresindeki alan adının Resend üzerinde doğrulanmış olması gerekir. E-posta ayarları yoksa rezervasyon kaydı çalışmaya devam eder, yalnızca bildirim atlanır.

## Channex bağlantısı

OTA bağlantıları için ilk entegrasyon katmanı Channex staging API ile hazırlanmıştır:

```env
CHANNEX_API_KEY="staging-api-key"
CHANNEX_PROPERTY_ID="property-id"
CHANNEX_BASE_URL="https://staging.channex.io/api/v.1"
CHANNEX_WEBHOOK_SECRET="uzun-rastgele-değer"
CHANNEX_ROOM_MAPPING="{\"stayos-room-id\":\"channex-room-type-id\"}"
```

Webhook adresi:

```text
https://alan-adiniz.com/api/integrations/channex/webhook?secret=CHANNEX_WEBHOOK_SECRET
```

Admin kanal ekranından bağlantı testi yapılabilir ve önümüzdeki 30 günün müsaitlik değerleri Channex'e gönderilebilir.

## Sağlayıcıdan bağımsız entegrasyon modeli

Türkiye kanal kataloğu, sağlayıcı bağlantıları, oda eşleştirmeleri, senkronizasyon günlüğü ve uyumluluk kontrol listesi için Supabase SQL Editor'da sırasıyla şunları çalıştırın:

```text
supabase/integrations-migration.sql
supabase/integrations-seed.sql
```

Sonrasında:

- `/admin/channels`: sağlayıcı, kanal bağlantısı, oda mapping ve sync log yönetimi
- `/admin/compliance`: Türkiye yasal/operasyonel uyumluluk takibi

Ayrıntılı mimari: `docs/turkiye-entegrasyon-mimarisi.md`

## Ödeme altyapısı

Sağlayıcıdan bağımsız ödeme kayıtları için Supabase SQL Editor'da:

```text
supabase/payments-migration.sql
```

çalıştırın. Ardından `/admin/payments` ekranından manuel ödeme bağlantısı ve durum takibi kullanılabilir.

Sandbox API erişimi geldiğinde şu değişkenler kullanılır:

```env
PAYMENT_WEBHOOK_SECRET="uzun-rastgele-değer"
IYZICO_API_KEY=""
IYZICO_SECRET_KEY=""
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"
PAYTR_MERCHANT_ID=""
PAYTR_MERCHANT_KEY=""
PAYTR_MERCHANT_SALT=""
```

Webhook adresleri:

```text
/api/payments/webhook/iyzico
/api/payments/webhook/paytr
/api/payments/webhook/bank-pos
```

Ayrıntılı mimari: `docs/odeme-mimarisi.md`

## Misafir ve check-in modülü

Misafir profilleri, fiziksel oda numaraları, check-in ve check-out işlemleri için Supabase SQL Editor'da sırasıyla:

```text
supabase/guests-checkin-migration.sql
supabase/guests-checkin-seed.sql
```

dosyalarını çalıştırın. Ardından `/admin/guests` ekranından rezervasyon seçip hazır oda atayabilir, misafir kaydı oluşturabilir ve konaklama detayından check-out yapabilirsiniz.

## Misafir folyosu ve oda hesabı

Konaklama bedeline minibar, restoran, spa, çamaşırhane ve benzeri harcamaları eklemek için Supabase SQL Editor'da:

```text
supabase/folios-migration.sql
```

dosyasını çalıştırın. `/admin/folios` ekranı aktif odaların hesaplarını ve kalan bakiyelerini gösterir. Tahsilat talepleri folyo harcamaları dahil toplam tutar üzerinden oluşturulur.

## GitHub'a gönderme

```bash
git init
git add .
git commit -m "Initial StayOS hotel platform prototype"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/otel-web.git
git push -u origin main
```

## Vercel'de yayınlama

1. GitHub'da repoyu oluşturun ve kodu gönderin.
2. Vercel hesabınızda **Add New Project** seçin.
3. GitHub reposunu seçin.
4. Framework preset olarak **Next.js** seçilir.
5. Build command `next build` olarak kalabilir.
6. Output directory boş bırakılır.
7. Gerçek veri için Vercel Environment Variables alanına `DATABASE_URL` ve `DIRECT_URL` eklenir.
8. Admin girişi için `ADMIN_EMAIL`, `ADMIN_PASSWORD` ve `SESSION_SECRET` eklenir.
9. E-posta için `RESEND_API_KEY`, `RESEND_FROM_EMAIL` ve `RESERVATION_NOTIFICATION_EMAIL` eklenir.
10. Channex staging erişimi alındığında `CHANNEX_*` değişkenleri eklenir.
7. Deploy butonuna basılır.

Vercel CLI kullanmak isterseniz:

```bash
npm.cmd install -g vercel
vercel
vercel --prod
```
