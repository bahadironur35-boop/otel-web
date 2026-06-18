import {
  createChannel,
  deactivateChannel,
  syncChannel,
  syncChannexInventoryAction,
  testChannexAction,
  updateChannel
} from "@/app/admin/actions";
import { isChannexConfigured } from "@/lib/channex";
import { getHotelData } from "@/lib/data";

export default async function ChannelsPage({
  searchParams
}: {
  searchParams: Promise<{
    created?: string;
    channex?: string;
    deactivated?: string;
    demo?: string;
    error?: string;
    synced?: string;
    updated?: string;
    property?: string;
    rooms?: string;
    values?: string;
  }>;
}) {
  const [{ channels }, params] = await Promise.all([getHotelData(), searchParams]);
  const channexConfigured = isChannexConfigured();

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Kanal yöneticisi</p>
          <h2>OTA ve yerel satış kanalları</h2>
        </div>
      </div>

      {params.demo ? <p className="notice">Demo modda kanal verisi güncellenmez.</p> : null}
      {params.created ? <p className="notice success">Kanal eklendi.</p> : null}
      {params.updated ? <p className="notice success">Kanal ayarları güncellendi.</p> : null}
      {params.synced ? <p className="notice success">Kanal senkronize edildi.</p> : null}
      {params.deactivated ? <p className="notice success">Kanal satışa kapatıldı.</p> : null}
      {params.error ? <p className="notice danger">Kanal bilgilerini kontrol edin.</p> : null}
      {params.channex === "connected" ? (
        <p className="notice success">Channex bağlantısı doğrulandı: {params.property}</p>
      ) : null}
      {params.channex === "synced" ? (
        <p className="notice success">
          Channex senkronizasyonu tamamlandı: {params.rooms} oda tipi, {params.values} stok değeri.
        </p>
      ) : null}
      {params.channex === "failed" ? (
        <p className="notice danger">Channex bağlantısı kurulamadı. API anahtarı ve property ID değerlerini kontrol edin.</p>
      ) : null}
      {params.channex === "sync-failed" ? (
        <p className="notice danger">Channex stok senkronizasyonu başarısız. Oda eşleştirmelerini kontrol edin.</p>
      ) : null}

      <section className="integration-control-bar">
        <div>
          <span className={`integration-dot ${channexConfigured ? "online" : ""}`} />
          <div>
            <strong>Channex bağlantısı</strong>
            <p>{channexConfigured ? "API ayarları mevcut" : "Henüz yapılandırılmadı"}</p>
          </div>
        </div>
        <div className="integration-control-actions">
          <form action={testChannexAction}>
            <button type="submit" disabled={!channexConfigured}>Bağlantıyı test et</button>
          </form>
          <form action={syncChannexInventoryAction}>
            <button type="submit" disabled={!channexConfigured}>30 günü senkronize et</button>
          </form>
        </div>
      </section>

      <form className="admin-form channel-create-form" action={createChannel}>
        <label>
          Kanal adı
          <input name="name" placeholder="Agoda" required />
        </label>
        <label>
          Yayınlanacak stok
          <input name="inventory" type="number" min="0" defaultValue="0" required />
        </label>
        <button type="submit">Kanal bağla</button>
      </form>

      <div className="admin-grid three channel-grid">
        {channels.map((channel) => (
          <article className="admin-card channel-card" key={channel.id}>
            <div className="room-card-heading">
              <span className={`status-pill ${channel.statusKey === "SYNCED" ? "success" : channel.statusKey === "DELAYED" ? "warning" : "danger"}`}>
                {channel.status}
              </span>
              <span className="muted">Son: {channel.lastSynced}</span>
            </div>

            <h3>{channel.name}</h3>

            <form className="room-edit-form" action={updateChannel}>
              <input name="id" type="hidden" value={channel.id} />
              <label>
                Kanal stoğu
                <input name="inventory" type="number" min="0" defaultValue={channel.inventoryCount} required />
              </label>
              <label>
                Durum
                <select name="status" defaultValue={channel.statusKey}>
                  <option value="SYNCED">Senkron</option>
                  <option value="DELAYED">Gecikmeli</option>
                  <option value="ACTION_REQUIRED">İşlem gerekli</option>
                </select>
              </label>
              <label>
                Uyarı / not
                <input name="alert" defaultValue={channel.alert} required />
              </label>
              <button type="submit">Ayarları kaydet</button>
            </form>

            <div className="channel-actions">
              <form action={syncChannel}>
                <input name="id" type="hidden" value={channel.id} />
                <button type="submit">Senkronize et</button>
              </form>
              <form action={deactivateChannel}>
                <input name="id" type="hidden" value={channel.id} />
                <button className="danger-button" type="submit">Satışa kapat</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
