# StayOS Ödeme Mimarisi

## Sağlayıcıdan Bağımsız Model

Her rezervasyon birden fazla ödeme denemesine sahip olabilir. Her ödeme kaydı şunları saklar:

- Sağlayıcı: Manuel, iyzico, PayTR veya banka sanal POS
- Durum
- Tutar ve para birimi
- Ödeme bağlantısı
- Harici işlem kimliği
- Hata nedeni
- Son kullanım zamanı
- Ödeme zamanı

## Durum Akışı

```text
Oluşturuldu
  -> Bağlantı gönderildi
  -> Ödeme bekliyor
  -> Ödendi
```

Alternatif son durumlar:

```text
Başarısız
Süresi doldu
İptal edildi
İade edildi
```

Ödeme `PAID` olduğunda rezervasyon `CONFIRMED` durumuna geçer. Ödeme beklerken rezervasyon `PAYMENT_PENDING` olarak tutulur.

## MVP Akışı

1. Yönetici rezervasyonu seçer.
2. Manuel veya sağlayıcı ödeme bağlantısı oluşturur.
3. Bağlantı misafire gönderilir.
4. Sağlayıcı webhook gönderir veya yönetici durumu manuel günceller.
5. Ödeme ve rezervasyon durumu birlikte güncellenir.

## Sağlayıcı Entegrasyonu

- **iyzico:** Sandbox API anahtarları ve callback/webhook doğrulaması gerekir.
- **PayTR:** Merchant ID, merchant key, merchant salt ve bildirim URL'si gerekir.
- **Banka POS:** Bankaya göre 3D Secure ve callback sözleşmesi değişir.
- **Manuel:** Harici ödeme linki veya havale takibi için kullanılır.

## Güvenlik

- Kart bilgisi StayOS veritabanında saklanmaz.
- Ödeme sayfası sağlayıcı tarafından barındırılır.
- Webhook imzası veya sağlayıcı hash değeri doğrulanmalıdır.
- Aynı webhook tekrar geldiğinde işlem kimliği üzerinden idempotency uygulanmalıdır.
- Başarılı ödeme tutarı ve para birimi rezervasyonla karşılaştırılmalıdır.
