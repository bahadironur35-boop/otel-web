import { cancelReservation, confirmReservation, createReservation } from "@/app/admin/actions";
import { getHotelData, getRoomOptions } from "@/lib/data";

const statusTone = {
  NEW: "info",
  CONFIRMED: "success",
  PAYMENT_PENDING: "warning",
  CANCELLED: "danger"
} as const;

export default async function ReservationsPage({
  searchParams
}: {
  searchParams: Promise<{
    cancelled?: string;
    confirmed?: string;
    created?: string;
    demo?: string;
    error?: string;
  }>;
}) {
  const [{ reservations }, roomOptions, params] = await Promise.all([getHotelData(), getRoomOptions(), searchParams]);

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Rezervasyonlar</p>
          <h2>Satış ve konaklama akışı</h2>
        </div>
        <button className="admin-action" type="button">Yeni kayıt</button>
      </div>
      {params.demo ? <p className="notice">Demo modda kayıt yazılmaz. DATABASE_URL bağlandığında bu form gerçek veri oluşturur.</p> : null}
      {params.created ? <p className="notice success">Rezervasyon oluşturuldu.</p> : null}
      {params.confirmed ? <p className="notice success">Rezervasyon onaylandı.</p> : null}
      {params.cancelled ? <p className="notice success">Rezervasyon iptal edildi.</p> : null}
      {params.error === "unavailable" ? (
        <p className="notice danger">Seçilen oda tipi bu tarihlerde dolu.</p>
      ) : null}
      {params.error === "invalid-dates" ? (
        <p className="notice danger">Çıkış tarihi giriş tarihinden sonra olmalı.</p>
      ) : null}
      {params.error === "missing-fields" ? (
        <p className="notice danger">Zorunlu alanları kontrol et.</p>
      ) : null}

      <form className="admin-form" action={createReservation}>
        <label>
          Misafir adı
          <input name="guestName" placeholder="Misafir adı" required />
        </label>
        <label>
          E-posta
          <input name="guestEmail" type="email" placeholder="misafir@example.com" />
        </label>
        <label>
          Oda tipi
          <select name="roomTypeId" required>
            {roomOptions.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
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
          <input name="guests" type="number" min="1" defaultValue="2" required />
        </label>
        <label>
          Kanal
          <input name="channel" defaultValue="Web sitesi" required />
        </label>
        <label>
          Tutar
          <input name="totalAmount" type="number" min="1" placeholder="27600" required />
        </label>
        <button type="submit">Rezervasyon oluştur</button>
      </form>

      <section className="admin-card">
        <div className="table">
          <div className="table-head reservations-head">
            <span>Misafir</span>
            <span>Oda</span>
            <span>Tarih</span>
            <span>Kanal</span>
            <span>Durum</span>
            <span>Tutar</span>
            <span>Aksiyon</span>
          </div>
          {reservations.map((reservation) => (
            <div className="table-row reservations-row" key={reservation.id}>
              <span>{reservation.guest}</span>
              <span>{reservation.room}</span>
              <span>{reservation.dates}</span>
              <span>{reservation.channel}</span>
              <span className={`status-pill ${statusTone[reservation.statusKey as keyof typeof statusTone] ?? "info"}`}>
                {reservation.status}
              </span>
              <strong>{reservation.amount}</strong>
              <div className="table-actions">
                {reservation.statusKey !== "CONFIRMED" && reservation.statusKey !== "CANCELLED" ? (
                  <form action={confirmReservation}>
                    <input name="id" type="hidden" value={reservation.id} />
                    <button type="submit">Onayla</button>
                  </form>
                ) : null}
                {reservation.statusKey !== "CANCELLED" ? (
                  <form action={cancelReservation}>
                    <input name="id" type="hidden" value={reservation.id} />
                    <button className="danger-button" type="submit">İptal</button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
