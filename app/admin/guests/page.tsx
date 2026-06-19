import Link from "next/link";
import { CheckInPanel } from "@/components/check-in-panel";
import { getGuestsWorkspace } from "@/lib/guests";

export default async function GuestsPage({
  searchParams
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const [workspace, params] = await Promise.all([getGuestsWorkspace(), searchParams]);

  return (
    <>
      <div className="admin-topline compact-topline">
        <div>
          <p className="section-kicker">Ön büro</p>
          <h2>Misafirler ve check-in</h2>
        </div>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Misafir/check-in tabloları kurulmadı. Supabase migration ve seed dosyaları çalıştırılmalı.</p>
      ) : null}
      {params.result === "error" ? <p className="notice danger">Check-in işlemi tamamlanamadı.</p> : null}
      {params.result === "unavailable" ? <p className="notice danger">Rezervasyon veya seçilen oda artık uygun değil.</p> : null}

      <section className="operations-panel checkin-panel">
        <div className="operations-panel-heading">
          <div><span>HIZLI GİRİŞ</span><h3>Rezervasyondan check-in</h3></div>
          <b>{workspace.eligibleReservations.length} bekleyen rezervasyon</b>
        </div>
        <CheckInPanel
          reservations={workspace.eligibleReservations}
          rooms={workspace.rooms}
          schemaReady={workspace.schemaReady}
        />
      </section>

      <section className="operations-panel guest-list-panel">
        <div className="operations-panel-heading">
          <div><span>MİSAFİR KAYITLARI</span><h3>Profil ve konaklama geçmişi</h3></div>
          <b>{workspace.guests.length} misafir</b>
        </div>
        <div className="guest-list">
          {workspace.guests.map((guest) => (
            <Link href={`/admin/guests/${guest.id}`} className="guest-row" key={guest.id}>
              <span className="guest-avatar">{guest.fullName.slice(0, 1).toUpperCase()}</span>
              <div><strong>{guest.fullName}</strong><small>{guest.email ?? guest.phone ?? "İletişim yok"}</small></div>
              <span>{guest.statusLabel}</span>
              <span>{guest.roomNumber ? `Oda ${guest.roomNumber}` : guest.stayStatus}</span>
              <b>{guest.reservationCount} rezervasyon</b>
            </Link>
          ))}
          {!workspace.guests.length ? <p className="empty-state">Henüz misafir profili bulunmuyor.</p> : null}
        </div>
      </section>
    </>
  );
}
