import { createRoom, deactivateRoom, updateRoom } from "@/app/admin/actions";
import { getHotelData } from "@/lib/data";

export default async function RoomsPage({
  searchParams
}: {
  searchParams: Promise<{
    created?: string;
    deactivated?: string;
    demo?: string;
    error?: string;
    updated?: string;
  }>;
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
      {params.updated ? <p className="notice success">Oda tipi güncellendi.</p> : null}
      {params.deactivated ? <p className="notice success">Oda tipi satışa kapatıldı.</p> : null}
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

      <div className="admin-grid three room-management-grid">
        {rooms.map((room) => (
          <article className="admin-card room-card room-editor" key={room.id}>
            <div className="room-card-heading">
              <span className="pill">{room.status}</span>
              <span className="muted">{room.inventory} oda</span>
            </div>
            <form className="room-edit-form" action={updateRoom}>
              <input name="id" type="hidden" value={room.id} />
              <label>
                Oda adı
                <input name="name" defaultValue={room.name} required />
              </label>
              <label>
                Kapasite
                <input name="capacity" defaultValue={room.occupancy} required />
              </label>
              <div className="room-edit-grid">
                <label>
                  Gecelik fiyat
                  <input name="nightlyRate" type="number" min="1" defaultValue={room.nightlyRate} required />
                </label>
                <label>
                  Stok
                  <input name="inventory" type="number" min="0" defaultValue={room.inventory} required />
                </label>
              </div>
              <label>
                Durum
                <select name="status" defaultValue={room.statusKey}>
                  <option value="READY">Hazır</option>
                  <option value="CLEANING">Temizlikte</option>
                  <option value="MAINTENANCE">Bakımda</option>
                  <option value="EXTRA_BED">Ekstra yatak</option>
                </select>
              </label>
              <button type="submit">Değişiklikleri kaydet</button>
            </form>
            <form action={deactivateRoom}>
              <input name="id" type="hidden" value={room.id} />
              <button className="room-deactivate-button" type="submit">Satışa kapat</button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
