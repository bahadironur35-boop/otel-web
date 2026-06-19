import Link from "next/link";
import { notFound } from "next/navigation";
import { checkOutGuest } from "@/app/admin/actions";
import { getGuestById } from "@/lib/guests";
import { formatCurrency, formatDateRange } from "@/lib/format";

export default async function GuestDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const guest = await getGuestById(id);
  if (!guest) notFound();
  const activeStay = guest.stays.find((stay) => stay.status === "CHECKED_IN");

  return (
    <>
      <div className="admin-topline">
        <div><p className="section-kicker">Misafir profili</p><h2>{guest.fullName}</h2></div>
        <Link className="admin-action secondary-action" href="/admin/guests">Misafirlere dön</Link>
      </div>
      {query.result === "checked-in" ? <p className="notice success">Check-in tamamlandı.</p> : null}
      {query.result === "checked-out" ? <p className="notice success">Check-out tamamlandı; oda temizliğe alındı.</p> : null}

      <div className="guest-detail-grid">
        <section className="operations-panel guest-profile-card">
          <div className="guest-profile-header"><span className="guest-avatar large">{guest.fullName[0]}</span><div><strong>{guest.fullName}</strong><span>{guest.status}</span></div></div>
          <dl>
            <div><dt>E-posta</dt><dd>{guest.email ?? "Belirtilmedi"}</dd></div>
            <div><dt>Telefon</dt><dd>{guest.phone ?? "Belirtilmedi"}</dd></div>
            <div><dt>Uyruk</dt><dd>{guest.nationality ?? "Belirtilmedi"}</dd></div>
            <div><dt>TC Kimlik</dt><dd>{guest.identityNumber ?? "Belirtilmedi"}</dd></div>
            <div><dt>Pasaport</dt><dd>{guest.passportNumber ?? "Belirtilmedi"}</dd></div>
            <div><dt>Not</dt><dd>{guest.notes ?? "Not yok"}</dd></div>
          </dl>
        </section>

        <section className="operations-panel">
          <div className="operations-panel-heading"><div><span>AKTİF KONAKLAMA</span><h3>Oda ve çıkış işlemi</h3></div></div>
          {activeStay ? (
            <div className="active-stay-card">
              <strong>Oda {activeStay.physicalRoom.number}</strong>
              <span>{formatDateRange(activeStay.expectedCheckIn, activeStay.expectedCheckOut)}</span>
              <form action={checkOutGuest}>
                <input name="stayId" type="hidden" value={activeStay.id} />
                <button type="submit">Check-out yap</button>
              </form>
            </div>
          ) : <p className="empty-state padded">Aktif konaklama yok.</p>}
        </section>
      </div>

      <section className="operations-panel guest-history">
        <div className="operations-panel-heading"><div><span>GEÇMİŞ</span><h3>Rezervasyonlar</h3></div></div>
        <div className="operations-table">
          <div className="operations-table-head guest-history-head"><span>Oda</span><span>Tarih</span><span>Kanal</span><span>Durum</span><span>Tutar</span></div>
          {guest.reservations.map((reservation) => (
            <div className="operations-table-row guest-history-head" key={reservation.id}>
              <strong>{reservation.roomType.name}</strong>
              <span>{formatDateRange(reservation.checkIn, reservation.checkOut)}</span>
              <span>{reservation.channel}</span>
              <span>{reservation.status}</span>
              <strong>{formatCurrency(reservation.totalAmount, reservation.currency)}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
