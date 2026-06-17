# StayOS Hotel Platform

StayOS; otel web sitesi, rezervasyon motoru, operasyon paneli, otomasyon akışları ve tatil platformu entegrasyonlarını tek üründe birleştirmek için hazırlanmış ilk prototiptir.

## Mevcut sürüm

- Misafir tarafı için tanıtım ve rezervasyon arama ekranı
- Arka panel için rezervasyon, görev, otomasyon ve kanal uyarısı önizlemesi
- Booking, Expedia, Airbnb, Agoda gibi OTA kanalları için entegrasyon yaklaşımı
- Vercel üzerinde statik site olarak yayınlanabilir yapı

## Ürün yol haritası

1. Tanıtım sitesi, oda listeleme ve rezervasyon talep formu
2. Admin panel, otel/oda/fiyat modeli ve rezervasyon yönetimi
3. Ödeme, e-posta/SMS/WhatsApp bildirimleri ve operasyon görevleri
4. Channel manager katmanı ve OTA senkronizasyonları

## Yerelde çalıştırma

Bu prototip statik dosyalardan oluşur. `index.html` dosyasını tarayıcıda açabilir veya basit bir yerel sunucu kullanabilirsiniz.

```bash
npm.cmd start
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
4. Framework preset olarak **Other** seçilebilir.
5. Build command boş bırakılabilir.
6. Output directory olarak `.` kullanılır.
7. Deploy butonuna basılır.

Vercel CLI kullanmak isterseniz:

```bash
npm.cmd install -g vercel
vercel
vercel --prod
```
