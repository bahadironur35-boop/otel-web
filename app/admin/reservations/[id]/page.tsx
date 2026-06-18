import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelReservation, confirmReservation } from "@/app/admin/actions";
import { getReservationById } from "@/lib/reservations";

export default async function ReservationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await getReservationById(id);

  if (!reservation) {
    notFound();
  }

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Rezervasyon detayı</p>
          <h2>{reservation.guestName}</h2>
        </div>
        <Link className="admin-action secondary-action" href="/admin/reservations">Listeye dön</Link>
      </div>

      <div className="reservation-detail-grid">
        <section className="admin-card detail-card">
          <h3>Konaklama</h3>
          <dl>
            <div><dt>Otel</dt><dd>{reservation.hotelName}</dd></div>
            <div><dt>Oda</dt><dd>{reservation.roomName}</dd></div>
            <div><dt>Tarih</dt><dd>{reservation.dates}</dd></div>
            <div><dt>Misafir</dt><dd>{reservation.guests} kişi</dd></div>
            <div><dt>Kanal</dt><dd>{reservation.channel}</dd></div>
            <div><dt>Tutar</dt><dd>{reservation.amount}</dd></div>
          </dl>
        </section>

        <section className="admin-card detail-card">
          <h3>İletişim</h3>
          <dl>
            <div><dt>E-posta</dt><dd>{reservation.guestEmail ?? "Belirtilmedi"}</dd></div>
            <div><dt>Telefon</dt><dd>{reservation.phone ?? "Belirtilmedi"}</dd></div>
            <div><dt>Not</dt><dd>{reservation.notes ?? "Not bulunmuyor"}</dd></div>
          </dl>
        </section>

        <section className="admin-card detail-card">
          <h3>Durum</h3>
          <span className="status-pill info">{reservation.status}</span>
          <p className="muted">
            Oluşturulma: {new Intl.DateTimeFormat("tr-TR", {
              dateStyle: "medium",
              timeStyle: "short"
            }).format(reservation.createdAt)}
          </p>
          <div className="detail-actions">
            {reservation.statusKey !== "CONFIRMED" && reservation.statusKey !== "CANCELLED" ? (
              <form action={confirmReservation}>
                <input name="id" type="hidden" value={reservation.id} />
                <button type="submit">Onayla</button>
              </form>
            ) : null}
            {reservation.statusKey !== "CANCELLED" ? (
              <form action={cancelReservation}>
                <input name="id" type="hidden" value={reservation.id} />
                <button className="danger-button" type="submit">İptal et</button>
              </form>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
