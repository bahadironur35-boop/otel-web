# StayOS Design System

Bu belge StayOS yönetim panelinin görsel dilini ve kullanıcı deneyimi kararlarını tanımlar. Yeni ekranlar bu kurallarla tasarlanmalı; mevcut kurallar değiştirildiğinde belge ve uygulama kodu aynı değişiklik içinde güncellenmelidir.

Kod her zaman gerçek uygulama kaynağıdır. Bu belge ise kararların amacı, kullanım biçimi ve sınırlarını açıklar.

## 1. Ürün karakteri

StayOS; resepsiyon, rezervasyon, oda operasyonu, housekeeping, tahsilat, folyo ve kanal yönetimi gibi tekrar eden iş akışlarında kullanılan B2B SaaS ürünüdür.

Arayüz şu özellikleri taşımalıdır:

- Sessiz, güvenilir ve profesyonel
- Yoğun bilgi içinde kolay taranabilir
- Masaüstü ve dokunmatik ekranlarda hızlı kullanılabilir
- Gösteriş yerine operasyonel netlik odaklı
- Otel çalışanlarının uzun vardiyalarda yorulmadan kullanabileceği kadar sade

Arayüz pazarlama sayfası gibi davranmamalıdır. Yönetim panelinde büyük dekoratif başlıklar, gereksiz illüstrasyonlar, iç içe kartlar ve yoğun animasyon kullanılmaz.

## 2. Kaynak dosyalar

Tasarım sisteminin uygulamadaki temel kaynakları:

- Global stiller: `app/globals.css`
- Yönetim kabuğu: `components/admin-chrome.tsx`
- Ana operasyon ekranı: `app/admin/page.tsx`
- İkon sistemi: `lucide-react`

Global CSS içindeki `StayOS premium B2B SaaS design system` bölümü güncel tema katmanıdır.

## 3. Renk sistemi

### Ana renkler

| Token | Değer | Kullanım |
| --- | --- | --- |
| `--stayos-navy` | `#0A192F` | Sidebar, güçlü kurumsal yüzeyler |
| `--stayos-navy-soft` | `#12243D` | Navy yüzey varyasyonu |
| `--stayos-blue` | `#1A73E8` | Ana aksiyon, aktif navigasyon, bağlantılar |
| `--stayos-blue-hover` | `#155FC0` | Ana aksiyon hover durumu |
| `--stayos-canvas` | `#F4F7FB` | Ana çalışma alanı |
| `--stayos-card` | `#FFFFFF` | Kart, panel ve form yüzeyleri |
| `--stayos-border` | `#E1E7EF` | Yumuşak kart ve satır ayrımları |
| `--stayos-border-strong` | `#D3DCE8` | Form alanları ve belirgin kontroller |
| `--stayos-text` | `#162033` | Ana metin |
| `--stayos-muted` | `#6B778C` | İkincil açıklamalar |

### Durum renkleri

| Durum | Metin | Arka plan |
| --- | --- | --- |
| Bilgi / Yeni | `#175CD3` | `#EDF4FF` |
| Başarılı / Hazır | `#18794E` | `#EAF7F0` |
| Bekliyor / Uyarı | `#946200` | `#FFF6D8` |
| Hata / İptal | `#B42318` | `#FFF0EE` |
| Vurgu varyasyonu | `#6941C6` | `#F2EDFF` |

Durum renkleri yalnızca anlam taşımak için kullanılır. Büyük yüzeyler tamamen uyarı rengine boyanmaz.

## 4. Tipografi

Font ailesi:

```css
Inter, "Segoe UI Variable", "Segoe UI", ui-sans-serif, system-ui, sans-serif
```

Kurallar:

- Normal metin ağırlığı: `400-450`
- Form etiketi ve yardımcı vurgu: `550-600`
- Başlık ve önemli değer: `650-750`
- Negatif harf aralığı kullanılmaz.
- Font boyutu ekran genişliğine doğrusal olarak ölçeklenmez.
- Panel başlıkları yaklaşık `16px`, sayfa başlıkları `25-32px` aralığında kalır.
- Büyük değerler yalnızca metrik, bakiye veya toplam gibi gerçekten önemli verilerde kullanılır.
- Tamamı büyük harf metin sadece kısa bölüm etiketlerinde kullanılabilir.

## 5. Yerleşim

### Sidebar

- Genişlik: `248px`
- Tam yükseklik ve sabit konum
- Arka plan: `#0A192F`
- Navigasyon hedefi minimum `44px`
- Aktif öğe: royal blue arka plan, beyaz ikon ve metin
- Köşe yarıçapı: `9px`
- İkon ve metin aralığı: `12px`

Sidebar navigasyon sırası iş akışını izlemelidir:

1. Operasyon özeti
2. Rezervasyonlar
3. Misafirler
4. Oda hesapları
5. Çıkışlar
6. Tahsilatlar
7. Odalar
8. Görevler
9. Raporlar
10. Kanallar
11. Uyumluluk
12. Personel

### Header

- Yükseklik: yaklaşık `72px`
- Beyaz, sticky yüzey
- Sol bölüm: aktif modül adı ve kısa bağlam
- Sağ bölüm: tarih, saat ve kullanıcı profili
- Bilgi blokları `44px` minimum yükseklikte olmalıdır.
- Header içinde birincil iş akışı butonları kullanılmaz.

### Ana çalışma alanı

- Arka plan: `#F4F7FB`
- Maksimum içerik genişliği: `1800px`
- Masaüstü padding: yatay `28px`, üst `26px`
- Bölümler arası temel boşluk: `14-18px`

## 6. Boşluk ve ölçü sistemi

Tercih edilen boşluk değerleri:

```text
4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32
```

Temel kurallar:

- Kart iç boşluğu: `16-20px`
- Form alanları arası boşluk: `14px`
- Panel ve kartlar arası boşluk: `14px`
- Dokunmatik hedef minimum yüksekliği: `44px`
- Kritik işlem düğmesi: `48-52px`

## 7. Köşe yarıçapları

| Bileşen | Radius |
| --- | --- |
| Ana panel ve kart | `12px` |
| Form alanı ve buton | `8-10px` |
| Küçük ikon yüzeyi | `10px` |
| Durum rozeti | Tam yuvarlak / `999px` |

Kartlar iç içe dekoratif kartlara dönüştürülmemelidir. Bir panelin içindeki satırlar border ve boşluklarla ayrılır.

## 8. Gölge sistemi

Gölgeler hafif olmalıdır:

```css
box-shadow: 0 8px 24px rgba(28, 45, 72, 0.045);
```

Kurallar:

- Kartı zeminden hafifçe ayırmak için kullanılır.
- Kalın, koyu veya renkli gölgeler kullanılmaz.
- Hover sırasında küçük bir derinlik değişimi olabilir.
- Tablo satırı ve form alanında gölge yerine border tercih edilir.

## 9. Bileşen standartları

### Metrik kartları

- Beyaz yüzey, `12px` radius
- Sol tarafta pastel ikon kutusu
- Büyük ve koyu ana değer
- Üstte kısa etiket, altta yardımcı bilgi
- Masaüstünde dört sütun, tablette iki, telefonda bir sütun
- Kartlar aynı yükseklikte görünmelidir.

### Birincil buton

- Arka plan: `#1A73E8`
- Metin: beyaz
- Minimum yükseklik: `44px`
- Radius: `9px`
- Metin kısa ve eylem odaklı olmalıdır: `Kaydet`, `Check-in yap`, `Tahsil et`

### İkincil buton

- Beyaz veya açık gri yüzey
- İnce gri border
- Koyu gri metin
- Birincil butonla aynı yükseklik

### Tehlikeli işlem

- Kırmızı yalnızca silme, iptal veya geri döndürülemez işlemde kullanılır.
- Birincil aksiyonla aynı görsel ağırlıkta olmamalıdır.
- Gerekli durumlarda işlem öncesi onay akışı eklenmelidir.

### Form alanları

- Minimum yükseklik: `44px`
- Radius: `9px`
- İnce gri border
- Placeholder açık gri
- Focus: mavi border ve yumuşak focus halkası
- Etiket alanın üstünde görünür olmalıdır.
- Sayısal değerlerde uygun `min`, `max` ve input tipi kullanılmalıdır.

### Tablolar

- Keskin siyah çizgi kullanılmaz.
- Başlık satırı çok açık gri yüzeyde gösterilir.
- Satır ayrımları `#E9EDF3` tonunda olmalıdır.
- Satır yüksekliği en az `56px` civarında tutulur.
- Durum bilgisi düz metin yerine uygun pastel rozetle gösterilir.
- Mobilde önemli veri gizlenmez; yatay kaydırma veya alternatif kart görünümü kullanılır.

### Durum rozetleri

- Küçük ve tek satır
- Tam yuvarlak
- Renk tek başına anlam taşımaz; mutlaka metin bulunur.
- Durum metni kısa olmalıdır: `Hazır`, `Bekliyor`, `Ödendi`, `İptal`

### Hızlı işlem kartları

- En az `44px` dokunmatik hedef; tercihen `100px` üzeri kart yüksekliği
- İkon, kısa başlık ve tek satırlık açıklama
- Aynı bölümdeki tüm kartlar eşit boyutta
- Hover kartın boyutunu veya grid düzenini değiştirmemelidir.

## 10. İkon kullanımı

- İkon kaynağı: `lucide-react`
- Varsayılan ikon boyutu: `18-21px`
- Hızlı işlem ikonları: `26-28px`
- Stroke genişliği yaklaşık `1.7-1.9`
- Tanınan bir ikon varsa elle SVG çizilmez.
- İkon tek başına belirsizse tooltip veya görünür metin kullanılır.
- Metin yerine ikon kullanılabilecek standart işlemlerde ikon tercih edilir.

## 11. Dokunmatik kullanım

StayOS resepsiyon ve POS benzeri dokunmatik ekranlarda kullanılabilir.

- Dokunmatik hedef minimum `44x44px`
- Kartın yalnızca metni değil, tamamı tıklanabilir olmalıdır.
- Seçili kart border, arka plan ve metinle açıkça belirtilmelidir.
- Hover olmadan da seçili ve disabled durumları anlaşılmalıdır.
- Yan yana küçük işlem düğmeleri arasında en az `5-8px` boşluk bulunmalıdır.
- Kritik işlem ekranlarında ana aksiyon ekranın alt veya sağ bölümünde kolay erişilir olmalıdır.

## 12. Responsive davranış

### Geniş masaüstü

- Sidebar `248px`
- Metrikler dört sütun
- Ana iş akışları iki veya üç bölmeli olabilir.

### Küçük masaüstü / tablet

- `1180px` altında sidebar ikon moduna geçebilir.
- Metrikler iki sütuna düşer.
- Çok bölmeli POS/folyo ekranlarında yan panel alt satıra taşınabilir.

### Mobil

- `760px` altında sidebar yatay navigasyona dönüşür.
- İçerik padding değeri yaklaşık `12px`
- Formlar tek sütuna iner.
- Tablo taşmaları kontrollü yatay kaydırma kullanır.
- Sabit genişlikli metin veya buton kullanılmaz.

## 13. Erişilebilirlik

- Klavye focus durumu görünür olmalıdır.
- Metin ve arka plan kontrastı korunmalıdır.
- Yalnızca renk ile durum anlatılmaz.
- İkon düğmelerinde `aria-label` veya tooltip bulunmalıdır.
- Form alanları görünür label ile ilişkilendirilmelidir.
- Disabled kontroller görsel olarak ayırt edilmeli ve çalışmamalıdır.
- Hareketler kısa ve sade olmalı; iş akışını geciktirmemelidir.

## 14. İçerik dili

- Kullanıcıya doğrudan ve kurumsal Türkçe ile hitap edilir.
- `Talebin` yerine `Talebiniz`, `sana` yerine `size` kullanılır.
- Buton metni fiille biter: `Rezervasyon oluştur`, `Görevi tamamla`.
- Teknik sağlayıcı terimleri yalnızca gerekli ekranlarda gösterilir.
- Yardım metni kısa ve işlemin sonucunu açıklar.
- Başlıklar tek satırda kalacak kadar kısa tutulur.

## 15. Yeni ekran oluşturma kontrol listesi

Yeni bir admin ekranı eklenirken:

1. `AdminChrome` içindeki doğru modül bağlamı tanımlandı mı?
2. Sayfa başlığı `admin-topline` yapısını kullanıyor mu?
3. Ana yüzey için mevcut panel sınıfları kullanıldı mı?
4. Ana aksiyon royal blue, ikincil aksiyon outlined mı?
5. Tüm dokunmatik hedefler en az `44px` mı?
6. Durumlar pastel rozet ve metinle gösteriliyor mu?
7. Mobilde metin veya buton taşması var mı?
8. Boş, loading, hata ve başarı durumları var mı?
9. Klavye focus ve erişilebilir isimler mevcut mu?
10. Üretim derlemesi ve ekran kontrolü tamamlandı mı?

Yeni ekran ayrıca ilgili personel rollerinin navigasyonuna ve sayfa erişim katmanına eklenmelidir. Görsel olarak gizlemek tek başına yetkilendirme sayılmaz.

## 16. Kaçınılacak uygulamalar

- Çok büyük admin sayfa başlıkları
- Mor veya lacivert tonların tüm arayüze tek renk olarak yayılması
- İç içe kartlar
- Dekoratif gradient, orb veya bokeh arka planları
- Her butonda farklı renk ve ölçü
- Küçük dokunmatik hedefler
- Negatif letter-spacing
- Metin taşmasına güvenen sabit yükseklikler
- Durumları yalnızca renkle anlatmak
- Mevcut tasarım tokenı varken yeni rastgele hex renk eklemek

## 17. Değişiklik yönetimi

Tasarım sistemi değişikliği yapılırken:

1. Değişiklik önce bu belgede karar olarak açıklanır.
2. CSS tokenları veya bileşen yapısı aynı commit içinde güncellenir.
3. Etkilenen ana ekranlar masaüstü ve mobilde kontrol edilir.
4. Gereksiz eski stil kuralları uygun zamanda temizlenir.
5. Aşağıdaki değişiklik geçmişine kısa kayıt eklenir.

## 18. Değişiklik geçmişi

### 2026-06-19

- Personel ve rol yönetimi ekranı için kullanıcı satırı, avatar ve hesap durumu kalıpları eklendi.
- Yönetim raporları ekranı için metrik, sıralama, ilerleme ve CSS grafik kalıpları eklendi.
- StayOS admin paneli premium B2B SaaS tasarım diline geçirildi.
- Sidebar ana rengi `#0A192F`, ana aksiyon rengi `#1A73E8` olarak standartlaştırıldı.
- Header beyaz kurumsal yüzeye dönüştürüldü ve modül bağlamı eklendi.
- Kart radius değeri `12px`, form ve buton radius değeri `9px` olarak belirlendi.
- Metrik kartlarına pastel ikon yüzeyleri eklendi.
- Tablo, form, durum rozeti, focus ve responsive kuralları bütünleştirildi.
