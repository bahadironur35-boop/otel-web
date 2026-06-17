import Link from "next/link";
import { getHotelData } from "@/lib/data";

export default async function AdminHomePage() {
  const { channels, reservations, rooms, tasks } = await getHotelData();

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Operasyon merkezi</p>
          <h2>Bugünün otel özeti</h2>
        </div>
        <Link className="admin-action" href="/admin/reservations">
          Rezervasyon ekle
        </Link>
      </div>
      <div className="admin-metrics">
        <article>
          <span>Doluluk</span>
          <strong>%82</strong>
        </article>
        <article>
          <span>Gelir tahmini</span>
          <strong>₺58.350</strong>
        </article>
        <article>
          <span>Yeni rezervasyon</span>
          <strong>{reservations.length}</strong>
        </article>
        <article>
          <span>Açık görev</span>
          <strong>{tasks.length}</strong>
        </article>
      </div>
      <div className="admin-grid">
        <section className="admin-card">
          <h3>Son rezervasyonlar</h3>
          {reservations.map((reservation) => (
            <div className="admin-row" key={reservation.guest}>
              <span>{reservation.guest}</span>
              <strong>{reservation.channel}</strong>
            </div>
          ))}
        </section>
        <section className="admin-card">
          <h3>Oda durumu</h3>
          {rooms.map((room) => (
            <div className="admin-row" key={room.name}>
              <span>{room.name}</span>
              <strong>{room.status}</strong>
            </div>
          ))}
        </section>
        <section className="admin-card">
          <h3>Kanal sağlığı</h3>
          {channels.map((channel) => (
            <div className="admin-row" key={channel.name}>
              <span>{channel.name}</span>
              <strong>{channel.status}</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
