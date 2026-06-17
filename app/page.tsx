import Link from "next/link";
import { channels, reservations, rooms, tasks } from "@/lib/data";

export default function HomePage() {
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
            Bu projenin ilk hedefi sadece otel tanıtım sitesi yapmak değil. Otelin oda stoğunu, fiyatlarını,
            rezervasyonlarını, personel görevlerini ve dış kanal satışlarını tek merkezde toplayan bir SaaS
            platformuna dönüşebilecek bir temel kurmak.
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
          <h2 id="feature-title">MVP için kuracağımız ana parçalar</h2>
        </div>
        <div className="feature-grid">
          {[
            ["01", "Otel web sitesi", "Odalar, paketler, kampanyalar, galeri, konum, yorumlar ve doğrudan rezervasyon motoru."],
            ["02", "Rezervasyon yönetimi", "Müsaitlik takvimi, fiyat planları, ödeme durumu, iptal koşulları ve misafir kayıtları."],
            ["03", "Operasyon paneli", "Housekeeping, check-in görevleri, bakım talepleri, vardiya notları ve günlük iş akışı."],
            ["04", "Kanal entegrasyonları", "Booking benzeri OTA platformları, channel manager bağlantıları ve stok/fiyat senkronizasyonu."]
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
          <h2 id="demo-title">Doğrudan rezervasyon akışı</h2>
          <p>
            İlk versiyonda amaç, misafirin otelin kendi sitesinde güvenle oda seçip talep veya ödeme oluşturması.
            Sonraki aşamada ödeme sağlayıcısı ve e-fatura akışı bağlanabilir.
          </p>
        </div>
        <form className="search-panel" aria-label="Rezervasyon arama formu">
          <label>
            Giriş
            <input type="date" defaultValue="2026-07-12" />
          </label>
          <label>
            Çıkış
            <input type="date" defaultValue="2026-07-16" />
          </label>
          <label>
            Misafir
            <select defaultValue="2 yetişkin">
              <option>2 yetişkin</option>
              <option>2 yetişkin, 1 çocuk</option>
              <option>Tek kişi</option>
            </select>
          </label>
          <Link className="form-button" href="/admin/reservations">
            Uygun Odaları Göster
          </Link>
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
                <strong>{tasks.length + 11}</strong>
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
                <p>{channels[0].name} stok farkı kontrol edilmeli</p>
                <p>{tasks[0].title} açık</p>
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
            Doğrudan Booking API almak her işletme için kolay değildir; bu yüzden MVP'de channel manager mantığıyla
            soyut bir entegrasyon katmanı kurmak daha doğru. Böylece Booking, Expedia, Airbnb, Agoda veya yerel
            sağlayıcılar aynı stok ve fiyat kurallarını kullanabilir.
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
          <p className="section-kicker">Yönlendirme</p>
          <h2 id="roadmap-title">Projeyi doğru sırayla büyütelim</h2>
        </div>
        <ol>
          <li><strong>Faz 1:</strong> Tanıtım sitesi, oda listeleme, rezervasyon talep formu, admin panel prototipi.</li>
          <li><strong>Faz 2:</strong> Gerçek veritabanı, otel/oda/fiyat modeli, kullanıcı rolleri, rezervasyon CRUD.</li>
          <li><strong>Faz 3:</strong> Ödeme, e-posta/SMS/WhatsApp bildirimleri, housekeeping ve bakım iş akışları.</li>
          <li><strong>Faz 4:</strong> Channel manager entegrasyonu, OTA senkronizasyonu, çoklu otel desteği.</li>
        </ol>
      </section>
    </main>
  );
}
