import Link from "next/link";
import { createPublicReservation } from "@/app/actions";
import { getHotelData, getPublicRoomOptions } from "@/lib/data";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const [{ channels, rooms, tasks }, roomOptions, params] = await Promise.all([
    getHotelData(),
    getPublicRoomOptions(),
    searchParams
  ]);

  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <img src="/assets/hotel-platform-hero.png" alt="Modern otel lobisi ve rezervasyon platformu atmosferi" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Otel web sitesi + işletim paneli + kanal yöneticisi</p>
          <h1 id="hero-title">StayOS</h1>
          <p className="hero-copy">
            Otellerin kendi web sitesinden doğrudan rezervasyon almasını, günlük operasyonu yönetmesini ve Booking,
            Expedia, Airbnb gibi kanallarla senkron çalışmasını hedefleyen bütünleşik platform.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/#demo">
              Rezervasyon Akışını Gör
            </Link>
            <Link className="button secondary" href="/admin">
              Paneli Aç
            </Link>
          </div>
        </div>
      </section>

      <section id="platform" className="section intro-grid">
        <div>
          <p className="section-kicker">Ürün fikri</p>
          <h2>Misafir tarafı şık, işletme tarafı güçlü.</h2>
          <p>
            Bu projenin hedefi sadece otel tanıtım sitesi yapmak değil. Oda stoğunu, fiyatları, rezervasyonları,
            personel görevlerini ve dış kanal satışlarını tek merkezde toplayan bir konaklama platformu kurmak.
          </p>
        </div>
        <div className="metric-strip" aria-label="Platform metrikleri">
          <div>
            <strong>4</strong>
            <span>çekirdek modül</span>
          </div>
          <div>
            <strong>12+</strong>
            <span>otomasyon senaryosu</span>
          </div>
          <div>
            <strong>OTA</strong>
            <span>kanal entegrasyonu</span>
          </div>
        </div>
      </section>

      <section className="section feature-band" aria-labelledby="feature-title">
        <div className="section-heading">
          <p className="section-kicker">Modüller</p>
          <h2 id="feature-title">MVP için kurduğumuz ana parçalar</h2>
        </div>
        <div className="feature-grid">
          {[
            ["01", "Otel web sitesi", "Odalar, paketler, kampanyalar, galeri ve doğrudan rezervasyon talebi."],
            ["02", "Rezervasyon yönetimi", "Müsaitlik, fiyat planları, ödeme durumu ve misafir kayıtları."],
            ["03", "Operasyon paneli", "Housekeeping, check-in, bakım talepleri ve günlük görev akışı."],
            ["04", "Kanal entegrasyonları", "Booking benzeri OTA kanalları için stok ve fiyat senkronizasyonu."]
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span className="icon">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="demo" className="section booking-demo" aria-labelledby="demo-title">
        <div className="booking-copy">
          <p className="section-kicker">Misafir deneyimi</p>
          <h2 id="demo-title">Rezervasyon talebi oluştur</h2>
          <p>
            Tarihlerini ve oda tipini seç. Talebin otel yönetim paneline yeni rezervasyon olarak düşsün; ekip
            müsaitliği kontrol edip onaylasın.
          </p>
          {params.booking === "success" ? (
            <p className="notice success">Talebin alındı. Otel ekibi rezervasyonunu kontrol edip sana dönüş yapacak.</p>
          ) : null}
          {params.booking === "demo" ? (
            <p className="notice">Rezervasyon kaydı için veritabanı bağlantısı gerekiyor.</p>
          ) : null}
          {params.booking === "missing" ? (
            <p className="notice danger">Lütfen zorunlu alanları doldur.</p>
          ) : null}
          {params.booking === "invalid-dates" ? (
            <p className="notice danger">Çıkış tarihi giriş tarihinden sonra olmalı.</p>
          ) : null}
          {params.booking === "room-not-found" ? (
            <p className="notice danger">Seçilen oda tipi artık müsait değil. Lütfen başka bir oda seç.</p>
          ) : null}
        </div>
        <form className="search-panel public-booking-form" action={createPublicReservation}>
          <label>
            Ad soyad
            <input name="guestName" placeholder="Adınız ve soyadınız" required />
          </label>
          <label>
            E-posta
            <input name="guestEmail" type="email" placeholder="ornek@email.com" required />
          </label>
          <label>
            Telefon
            <input name="guestPhone" type="tel" placeholder="+90 5xx xxx xx xx" />
          </label>
          <label>
            Oda tipi
            <select name="roomTypeId" required>
              {roomOptions.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} · {room.price}
                </option>
              ))}
            </select>
          </label>
          <label>
            Giriş
            <input name="checkIn" type="date" required />
          </label>
          <label>
            Çıkış
            <input name="checkOut" type="date" required />
          </label>
          <label>
            Misafir sayısı
            <input name="guests" type="number" min="1" max="8" defaultValue="2" required />
          </label>
          <button type="submit">Rezervasyon talebi gönder</button>
        </form>
      </section>

      <section id="panel" className="section dashboard-section" aria-labelledby="panel-title">
        <div className="section-heading">
          <p className="section-kicker">Arka panel</p>
          <h2 id="panel-title">İşletim sistemi gibi çalışan otel paneli</h2>
        </div>
        <div className="dashboard-shell">
          <aside className="panel-nav" aria-label="Panel menüsü">
            <strong>StayOS Panel</strong>
            <span className="active">Rezervasyonlar</span>
            <span>Odalar</span>
            <span>Görevler</span>
            <span>Otomasyon</span>
            <span>Kanallar</span>
          </aside>
          <div className="panel-main">
            <div className="panel-toolbar">
              <div>
                <span className="muted">Bugün</span>
                <strong>36 dolu oda / 8 giriş</strong>
              </div>
              <Link href="/admin/reservations">Yeni Rezervasyon</Link>
            </div>
            <div className="status-grid">
              <article>
                <span>Doluluk</span>
                <strong>%82</strong>
              </article>
              <article>
                <span>Ortalama fiyat</span>
                <strong>₺4.850</strong>
              </article>
              <article>
                <span>Bekleyen görev</span>
                <strong>{tasks.length}</strong>
              </article>
            </div>
            <div className="ops-board">
              <div>
                <h3>Girişler</h3>
                {rooms.slice(0, 2).map((room) => (
                  <p key={room.name}>{room.name}, {room.status.toLowerCase()}</p>
                ))}
              </div>
              <div>
                <h3>Otomasyonlar</h3>
                <p>Rezervasyon onayı gönderildi</p>
                <p>Çıkıştan 1 gün önce ödeme hatırlatması</p>
              </div>
              <div>
                <h3>Uyarılar</h3>
                <p>{channels[0]?.name ?? "Booking"} stok farkı kontrol edilmeli</p>
                <p>{tasks[0]?.title ?? "Bakım talebi"} açık</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="entegrasyon" className="section integration-section" aria-labelledby="integration-title">
        <div>
          <p className="section-kicker">Tatil platformları</p>
          <h2 id="integration-title">Booking benzeri kanallarla çalışacak yapı</h2>
          <p>
            Kanal yöneticisi katmanı Booking, Expedia, Airbnb ve yerel sağlayıcıların aynı stok ve fiyat kurallarını
            kullanmasını hedefliyor.
          </p>
        </div>
        <div className="integration-list">
          {channels.map((channel) => (
            <article key={channel.name}>
              <strong>{channel.name}</strong>
              <span>{channel.status} durumunda, {channel.inventory} yayında. {channel.alert}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="yol-haritasi" className="section roadmap" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <p className="section-kicker">Yol haritası</p>
          <h2 id="roadmap-title">Projeyi doğru sırayla büyütelim</h2>
        </div>
        <ol>
          <li><strong>Faz 1:</strong> Tanıtım sitesi, rezervasyon talebi ve admin panel.</li>
          <li><strong>Faz 2:</strong> Oda/fiyat yönetimi, kullanıcı rolleri ve operasyon görevleri.</li>
          <li><strong>Faz 3:</strong> Ödeme, e-posta/SMS/WhatsApp bildirimleri ve otomasyonlar.</li>
          <li><strong>Faz 4:</strong> Channel manager entegrasyonu ve çoklu otel desteği.</li>
        </ol>
      </section>
    </main>
  );
}
