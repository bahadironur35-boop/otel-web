import Link from "next/link";
import {
  BedDouble,
  CalendarPlus,
  CheckSquare,
  CircleDollarSign,
  CreditCard,
  DoorOpen,
  Network,
  ReceiptText,
  UserRoundCheck,
  UsersRound
} from "lucide-react";
import { getHotelData } from "@/lib/data";
import { getDashboardMetrics } from "@/lib/dashboard";

export default async function AdminHomePage() {
  const [{ channels, reservations, rooms, tasks }, metrics] = await Promise.all([
    getHotelData(),
    getDashboardMetrics()
  ]);
  const openTasks = tasks.filter((task) => !task.done);

  return (
    <>
      <div className="admin-topline compact-topline">
        <div>
          <p className="section-kicker">Operasyon merkezi</p>
          <h2>Bugünün otel özeti</h2>
        </div>
        <Link className="admin-action" href="/admin/reservations">
          <CalendarPlus size={18} />
          Rezervasyon ekle
        </Link>
      </div>

      <div className="admin-metrics operations-metrics">
        <article>
          <span>Bugünkü doluluk</span>
          <strong>%{metrics.occupancyRate}</strong>
          <small>{metrics.occupiedRooms} / {metrics.totalInventory} oda</small>
        </article>
        <article>
          <span>Aktif gelir</span>
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

      <div className="operations-layout">
        <section className="operations-panel today-flow">
          <div className="operations-panel-heading">
            <div>
              <span>BUGÜNÜN AKIŞI</span>
              <h3>Giriş ve rezervasyonlar</h3>
            </div>
            <Link href="/admin/reservations">Tümünü gör</Link>
          </div>
          <div className="operations-table">
            <div className="operations-table-head">
              <span>Misafir</span>
              <span>Oda</span>
              <span>Kanal</span>
              <span>Durum</span>
              <span>Tutar</span>
            </div>
            {reservations.slice(0, 7).map((reservation) => (
              <Link className="operations-table-row" href={`/admin/reservations/${reservation.id}`} key={reservation.id}>
                <strong>{reservation.guest}</strong>
                <span>{reservation.room}</span>
                <span>{reservation.channel}</span>
                <span className="operation-status">{reservation.status}</span>
                <strong>{reservation.amount}</strong>
              </Link>
            ))}
          </div>
        </section>

        <aside className="quick-actions-panel">
          <div className="operations-panel-heading">
            <div>
              <span>HIZLI İŞLEMLER</span>
              <h3>Dokun ve devam et</h3>
            </div>
          </div>
          <div className="quick-action-grid">
            <Link href="/admin/reservations">
              <CalendarPlus />
              <strong>Rezervasyon</strong>
              <span>Yeni kayıt oluştur</span>
            </Link>
            <Link href="/admin/guests">
              <UsersRound />
              <strong>Check-in</strong>
              <span>Misafir ve oda ata</span>
            </Link>
            <Link href="/admin/payments">
              <CircleDollarSign />
              <strong>Tahsilat</strong>
              <span>Ödeme işlemi aç</span>
            </Link>
            <Link href="/admin/folios">
              <ReceiptText />
              <strong>Oda hesabı</strong>
              <span>Folyo ve harcamalar</span>
            </Link>
            <Link href="/admin/rooms">
              <BedDouble />
              <strong>Oda durumu</strong>
              <span>Stok ve hazırlık</span>
            </Link>
            <Link href="/admin/tasks">
              <CheckSquare />
              <strong>Görev oluştur</strong>
              <span>Ekibe iş ata</span>
            </Link>
            <Link href="/admin/channels">
              <Network />
              <strong>Kanallar</strong>
              <span>Senkronizasyon</span>
            </Link>
            <Link href="/admin/payment-settings">
              <CreditCard />
              <strong>Ödeme ayarı</strong>
              <span>Sağlayıcıları yönet</span>
            </Link>
          </div>
        </aside>
      </div>

      <div className="operations-bottom-grid">
        <section className="operations-panel">
          <div className="operations-panel-heading">
            <div>
              <span>ODA DURUMU</span>
              <h3>Hazırlık ve stok</h3>
            </div>
            <Link href="/admin/rooms">Yönet</Link>
          </div>
          <div className="compact-operation-list">
            {rooms.slice(0, 6).map((room) => (
              <div key={room.id}>
                <DoorOpen size={18} />
                <span><strong>{room.name}</strong><small>{room.inventory} oda</small></span>
                <b>{room.status}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="operations-panel">
          <div className="operations-panel-heading">
            <div>
              <span>GÖREVLER</span>
              <h3>Operasyon takibi</h3>
            </div>
            <Link href="/admin/tasks">Yönet</Link>
          </div>
          <div className="compact-operation-list">
            {openTasks.slice(0, 6).map((task) => (
              <div key={task.id}>
                <UserRoundCheck size={18} />
                <span><strong>{task.title}</strong><small>{task.owner}</small></span>
                <b>{task.priority}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="operations-panel">
          <div className="operations-panel-heading">
            <div>
              <span>KANAL SAĞLIĞI</span>
              <h3>Dağıtım durumu</h3>
            </div>
            <Link href="/admin/channels">Detay</Link>
          </div>
          <div className="compact-operation-list">
            {channels.map((channel) => (
              <div key={channel.name}>
                <Network size={18} />
                <span><strong>{channel.name}</strong><small>{channel.inventory}</small></span>
                <b>{channel.status}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
