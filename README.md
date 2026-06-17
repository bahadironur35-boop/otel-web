# StayOS Hotel Platform

StayOS; otel web sitesi, rezervasyon motoru, operasyon paneli, otomasyon akışları ve tatil platformu entegrasyonlarını tek üründe birleştirmek için hazırlanmış ilk prototiptir.

## Mevcut sürüm

- Misafir tarafı için tanıtım ve rezervasyon arama ekranı
- `/admin` altında yönetim paneli, rezervasyon, oda, görev ve kanal ekranları
- Prisma ile PostgreSQL veri modeli
- Rezervasyon, oda tipi ve görev oluşturma formları
- Admin panel için e-posta/şifre girişi ve oturum koruması
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
7. Deploy butonuna basılır.

Vercel CLI kullanmak isterseniz:

```bash
npm.cmd install -g vercel
vercel
vercel --prod
```
