import Link from "next/link";
import { getHotelData } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboard";

export default async function AdminHomePage() {
  const [{ channels, reservations, rooms, tasks }, metrics] = await Promise.all([
    getHotelData(),
    getDashboardMetrics()
  ]);

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

      <div className="admin-metrics dashboard-metrics">
        <article>
          <span>Bugünkü doluluk</span>
          <strong>%{metrics.occupancyRate}</strong>
          <small>{metrics.occupiedRooms} / {metrics.totalInventory} oda</small>
        </article>
        <article>
          <span>Aktif gelir tahmini</span>
          <strong>{metrics.projectedRevenue}</strong>
          <small>Onaylı ve ödeme bekleyen</small>
        </article>
        <article>
          <span>Yeni rezervasyon</span>
          <strong>{metrics.newReservations}</strong>
          <small>{metrics.paymentPending} ödeme bekliyor</small>
        </article>
        <article>
          <span>Açık görev</span>
          <strong>{metrics.openTasks}</strong>
          <small>Operasyon ekibinde</small>
        </article>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="card-heading-row">
            <h3>Son rezervasyonlar</h3>
            <Link href="/admin/reservations">Tümünü gör</Link>
          </div>
          {reservations.slice(0, 5).map((reservation) => (
            <div className="admin-row" key={reservation.id}>
              <span>{reservation.guest}</span>
              <strong>{reservation.status}</strong>
            </div>
          ))}
        </section>

        <section className="admin-card">
          <div className="card-heading-row">
            <h3>Oda durumu</h3>
            <Link href="/admin/rooms">Yönet</Link>
          </div>
          {rooms.slice(0, 5).map((room) => (
            <div className="admin-row" key={room.id}>
              <span>{room.name}</span>
              <strong>{room.inventory} oda · {room.status}</strong>
            </div>
          ))}
        </section>

        <section className="admin-card">
          <div className="card-heading-row">
            <h3>Açık görevler</h3>
            <Link href="/admin/tasks">Yönet</Link>
          </div>
          {tasks.filter((task) => !task.done).slice(0, 5).map((task) => (
            <div className="admin-row" key={task.id}>
              <span>{task.title}</span>
              <strong>{task.priority}</strong>
            </div>
          ))}
        </section>

        <section className="admin-card">
          <div className="card-heading-row">
            <h3>Kanal sağlığı</h3>
            <Link href="/admin/channels">Detay</Link>
          </div>
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
