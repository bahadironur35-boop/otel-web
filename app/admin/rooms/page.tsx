import Link from "next/link";
import { BedDouble, BrushCleaning, CircleCheck, Hammer, Hotel } from "lucide-react";
import {
  createPhysicalRoom,
  createRoom,
  deactivateRoom,
  updatePhysicalRoomStatus,
  updateRoom
} from "@/app/admin/actions";
import { getHotelData } from "@/lib/data";
import { getRoomOperations } from "@/lib/room-operations";

export default async function RoomsPage({
  searchParams
}: {
  searchParams: Promise<{
    created?: string;
    deactivated?: string;
    demo?: string;
    error?: string;
    physicalCreated?: string;
    physicalUpdated?: string;
    updated?: string;
  }>;
}) {
  const [{ rooms }, operations, params] = await Promise.all([
    getHotelData(),
    getRoomOperations(),
    searchParams
  ]);
  const summary = operations.summary;

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Odalar</p>
          <h2>Oda operasyonları</h2>
        </div>
      </div>
      {params.demo ? <p className="notice">Demo modda kayıt yazılmaz. DATABASE_URL bağlandığında bu form gerçek veri oluşturur.</p> : null}
      {params.created ? <p className="notice success">Oda tipi oluşturuldu.</p> : null}
      {params.updated ? <p className="notice success">Oda tipi güncellendi.</p> : null}
      {params.deactivated ? <p className="notice success">Oda tipi satışa kapatıldı.</p> : null}
      {params.physicalCreated ? <p className="notice success">Oda numarası eklendi.</p> : null}
      {params.physicalUpdated ? <p className="notice success">Oda durumu güncellendi.</p> : null}
      {params.error === "duplicate-room" ? <p className="notice danger">Bu oda numarası zaten kayıtlı.</p> : null}
      {params.error === "occupied-room" ? <p className="notice danger">Dolu odanın durumu check-out yapılmadan değiştirilemez.</p> : null}
      {params.error && !["duplicate-room", "occupied-room"].includes(params.error) ? (
        <p className="notice danger">Zorunlu alanları kontrol et.</p>
      ) : null}

      {summary ? (
        <div className="room-status-summary">
          <article><Hotel /><span>Toplam</span><strong>{summary.total}</strong></article>
          <article><CircleCheck /><span>Hazır</span><strong>{summary.ready}</strong></article>
          <article><BedDouble /><span>Dolu</span><strong>{summary.occupied}</strong></article>
          <article><BrushCleaning /><span>Temizlikte</span><strong>{summary.cleaning}</strong></article>
          <article><Hammer /><span>Bakım</span><strong>{summary.maintenance}</strong></article>
        </div>
      ) : null}

      <section className="operations-panel room-board-panel">
        <div className="operations-panel-heading">
          <div>
            <span>CANLI ODA PANOSU</span>
            <h3>Oda numaraları ve hazırlık durumu</h3>
          </div>
          <b>{operations.physicalRooms.length} oda</b>
        </div>

        {!operations.schemaReady ? (
          <p className="empty-state padded">Misafir/check-in SQL dosyaları çalıştırıldığında fiziksel oda panosu açılır.</p>
        ) : (
          <div className="physical-room-board">
            {operations.physicalRooms.map((room) => (
              <article className={`physical-room-card status-${room.status.toLowerCase()}`} key={room.id}>
                <div className="physical-room-card-top">
                  <span>Oda</span>
                  <b>{room.statusLabel}</b>
                </div>
                <strong>{room.number}</strong>
                <small>{room.roomTypeName}{room.floor ? ` · ${room.floor}. kat` : ""}</small>
                {room.guestId ? (
                  <Link href={`/admin/guests/${room.guestId}`}>
                    {room.guestName}
                    <span>Misafir detayını aç</span>
                  </Link>
                ) : (
                  <div className="physical-room-actions">
                    <form action={updatePhysicalRoomStatus}>
                      <input name="id" type="hidden" value={room.id} />
                      <button name="status" value="READY" type="submit">Hazır</button>
                    </form>
                    <form action={updatePhysicalRoomStatus}>
                      <input name="id" type="hidden" value={room.id} />
                      <button name="status" value="CLEANING" type="submit">Temizlik</button>
                    </form>
                    <form action={updatePhysicalRoomStatus}>
                      <input name="id" type="hidden" value={room.id} />
                      <button name="status" value="MAINTENANCE" type="submit">Bakım</button>
                    </form>
                  </div>
                )}
              </article>
            ))}
            {!operations.physicalRooms.length ? <p className="empty-state">Henüz oda numarası eklenmedi.</p> : null}
          </div>
        )}
      </section>

      <section className="operations-panel physical-room-create-panel">
        <div className="operations-panel-heading">
          <div><span>ODA NUMARASI</span><h3>Fiziksel oda ekle</h3></div>
        </div>
        <form className="physical-room-create-form" action={createPhysicalRoom}>
          <label>Oda tipi
            <select name="roomTypeId" required>
              <option value="">Seçin</option>
              {operations.roomTypes.map((roomType) => (
                <option value={roomType.id} key={roomType.id}>{roomType.name}</option>
              ))}
            </select>
          </label>
          <label>Oda numarası<input name="number" placeholder="203" required /></label>
          <label>Kat<input name="floor" placeholder="2" /></label>
          <button type="submit">Oda ekle</button>
        </form>
      </section>

      <div className="admin-topline room-type-heading">
        <div>
          <p className="section-kicker">Oda tipleri</p>
          <h2>Stok ve fiyat ayarları</h2>
        </div>
      </div>

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
