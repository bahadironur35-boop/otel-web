import { reservations } from "@/lib/data";

export default function ReservationsPage() {
  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Rezervasyonlar</p>
          <h2>Satış ve konaklama akışı</h2>
        </div>
        <button className="admin-action" type="button">Yeni kayıt</button>
      </div>
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
