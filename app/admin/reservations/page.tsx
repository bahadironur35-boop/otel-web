import { createReservation } from "@/app/admin/actions";
import { getHotelData, getRoomOptions } from "@/lib/data";

export default async function ReservationsPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string; demo?: string; error?: string }>;
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
      {params.error ? <p className="notice danger">Zorunlu alanları kontrol et.</p> : null}
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
          <div className="table-head">
            <span>Misafir</span>
            <span>Oda</span>
            <span>Tarih</span>
            <span>Kanal</span>
            <span>Durum</span>
            <span>Tutar</span>
          </div>
          {reservations.map((reservation) => (
            <div className="table-row" key={reservation.guest}>
              <span>{reservation.guest}</span>
              <span>{reservation.room}</span>
              <span>{reservation.dates}</span>
              <span>{reservation.channel}</span>
              <span>{reservation.status}</span>
              <strong>{reservation.amount}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
