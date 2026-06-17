import { rooms } from "@/lib/data";

export default function RoomsPage() {
  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Odalar</p>
          <h2>Stok, fiyat ve oda hazırlığı</h2>
        </div>
        <button className="admin-action" type="button">Oda tipi ekle</button>
      </div>
      <div className="admin-grid three">
        {rooms.map((room) => (
          <article className="admin-card room-card" key={room.name}>
            <span className="pill">{room.status}</span>
            <h3>{room.name}</h3>
            <p>{room.occupancy}</p>
            <strong>{room.price}</strong>
            <span className="muted">Son kaynak: {room.source}</span>
          </article>
        ))}
      </div>
    </>
  );
}
