# StayOS Hotel Platform

StayOS; otel web sitesi, rezervasyon motoru, operasyon paneli, otomasyon akışları ve tatil platformu entegrasyonlarını tek üründe birleştirmek için hazırlanmış ilk prototiptir.

## Mevcut sürüm

- Misafir tarafı için tanıtım ve rezervasyon arama ekranı
- `/admin` altında yönetim paneli, rezervasyon, oda, görev ve kanal ekranları
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
7. Deploy butonuna basılır.

Vercel CLI kullanmak isterseniz:

```bash
npm.cmd install -g vercel
vercel
vercel --prod
```
