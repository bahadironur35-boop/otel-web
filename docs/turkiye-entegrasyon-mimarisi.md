# StayOS Türkiye Entegrasyon Mimarisi

## Temel Kavramlar

- **Sağlayıcı:** StayOS ile satış kanalları arasındaki teknik köprü. Channex, HotelRunner, SiteMinder veya doğrudan OTA API'si olabilir.
- **Kanal:** Booking.com, Etstur, Expedia, Agoda, Airbnb, Tatilsepeti, Otelz veya doğrudan web sitesi.
- **Kanal bağlantısı:** Bir kanalın hangi sağlayıcı üzerinden çalışacağını ve harici kanal kimliğini tanımlar.
- **Oda eşleştirmesi:** StayOS oda tipi ile sağlayıcının oda ve fiyat planı kimliklerini eşleştirir.
- **Senkronizasyon günlüğü:** Stok, fiyat ve rezervasyon işlemlerinin başarılı veya hatalı sonucunu kaydeder.

## Otel Bağlantı Akışı

1. Otel, ilgili OTA veya yerel kanalda tesis hesabı açar.
2. Ticari sözleşme, komisyon, banka ve tesis doğrulama süreçlerini tamamlar.
3. Kanal bir property/hotel ID üretir.
4. Otel bir kanal yöneticisi veya bağlantı sağlayıcısı seçer.
5. StayOS'ta sağlayıcı ve kanal bağlantısı oluşturulur.
6. StayOS oda tipleri sağlayıcının oda ve fiyat planı ID'leriyle eşleştirilir.
7. Stok ve fiyatlar dışarı gönderilir.
8. Test rezervasyonu, değişiklik ve iptal akışları doğrulanır.
9. Senkronizasyon günlüğü izlenir ve bağlantı üretime alınır.

## Türkiye Kanal Öncelikleri

| Kanal | Pazar | İlk bağlantı yaklaşımı |
| --- | --- | --- |
| Booking.com | Uluslararası | Aggregator veya onaylı connectivity partner |
| Etstur | Türkiye | Yerel partnerlik veya kanal yöneticisi |
| Expedia | Uluslararası | Aggregator veya Expedia connectivity partner |
| Agoda | Asya / Orta Doğu | Aggregator |
| Airbnb | Alternatif konaklama | Onaylı PMS/channel manager |
| Tatilsepeti | Türkiye | Yerel ticari/API görüşmesi |
| Otelz | Türkiye | Yerel ticari/API görüşmesi |
| Doğrudan web | Doğrudan | StayOS rezervasyon motoru |

## Sağlayıcı Stratejisi

- **HotelRunner:** Türkiye yerel kanalları için ilk ticari görüşme adayı.
- **Channex:** Global OTA bağlantıları için teknik aggregator adayı.
- **SiteMinder:** Zincir ve global dağıtım gereksinimleri için alternatif.
- **Doğrudan OTA:** Yüksek hacim ve sertifikasyon kapasitesi oluştuğunda.
- **Manuel / CSV:** API erişimi olmayan kanallarda geçici operasyon yöntemi.

## Türkiye Uyumluluk Başlıkları

- KBS / Jandarma-Polis kimlik bildirimi
- KVKK aydınlatma, açık rıza, saklama ve silme politikaları
- GİB uyumlu e-Fatura / e-Arşiv
- iyzico, PayTR veya banka sanal POS değerlendirmesi
- TRY / EUR / USD fiyat planları ve kur politikası
- OTA üyelik ve komisyon sözleşmeleri
- Rol bazlı yetki, denetim günlüğü, yedekleme ve veri güvenliği

## Üretime Geçiş Kontrolü

- Sağlayıcı staging hesabı ve API anahtarı alındı.
- Property/hotel ID doğrulandı.
- Tüm oda tipleri eşleştirildi.
- Fiyat planları eşleştirildi.
- 30 günlük stok ve fiyat gönderimi doğrulandı.
- Yeni rezervasyon, değişiklik ve iptal webhook testleri geçti.
- Tekrarlanan webhook mesajları benzersiz event/revision ID ile ayıklandı.
- Hata tekrar deneme ve uyarı mekanizması doğrulandı.
- Ticari sözleşme ve veri işleme şartları tamamlandı.
