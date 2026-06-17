import { createRoom } from "@/app/admin/actions";
import { getHotelData } from "@/lib/data";

export default async function RoomsPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string; demo?: string; error?: string }>;
}) {
  const [{ rooms }, params] = await Promise.all([getHotelData(), searchParams]);

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Odalar</p>
          <h2>Stok, fiyat ve oda hazırlığı</h2>
        </div>
        <button className="admin-action" type="button">Oda tipi ekle</button>
      </div>
      {params.demo ? <p className="notice">Demo modda kayıt yazılmaz. DATABASE_URL bağlandığında bu form gerçek veri oluşturur.</p> : null}
      {params.created ? <p className="notice success">Oda tipi oluşturuldu.</p> : null}
      {params.error ? <p className="notice danger">Zorunlu alanları kontrol et.</p> : null}
      <form className="admin-form compact" action={createRoom}>
        <label>
          Oda adı
          <input name="name" placeholder="Premium Suite" required />
        </label>
        <label>
          Kapasite
          <input name="capacity" placeholder="2 yetişkin" required />
        </label>
        <label>
          Gecelik fiyat
          <input name="nightlyRate" type="number" min="1" placeholder="6900" required />
        </label>
        <label>
          Stok
          <input name="inventory" type="number" min="1" defaultValue="1" required />
        </label>
        <button type="submit">Oda ekle</button>
      </form>
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
