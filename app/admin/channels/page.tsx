import {
  deleteRoomMapping,
  runConnectionSync,
  saveRoomMapping,
  syncChannexInventoryAction,
  testChannexAction,
  updateChannelConnection,
  updateIntegrationProvider
} from "@/app/admin/actions";
import { isChannexConfigured } from "@/lib/channex";
import { getIntegrationWorkspace } from "@/lib/integrations";

const providerDescriptions: Record<string, string> = {
  CHANNEX: "Global OTA aggregator ve API katmanı",
  HOTELRUNNER: "Türkiye odaklı kanal yöneticisi ve PMS ekosistemi",
  SITEMINDER: "Global zincirler ve geniş OTA dağıtımı",
  DIRECT_OTA: "Her OTA ile ayrı sertifikasyon ve doğrudan API",
  MANUAL_CSV: "API erişimi olmayan kanallar için manuel geçiş"
};

const syncStateLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  SUCCESS: "Başarılı",
  FAILED: "Hatalı"
};

export default async function ChannelsPage({
  searchParams
}: {
  searchParams: Promise<{
    channex?: string;
    property?: string;
    rooms?: string;
    values?: string;
    workspace?: string;
  }>;
}) {
  const [workspace, params] = await Promise.all([getIntegrationWorkspace(), searchParams]);
  const channexConfigured = isChannexConfigured();

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Dağıtım merkezi</p>
          <h2>Sağlayıcılar, kanallar ve oda eşleştirmeleri</h2>
        </div>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">
          Yeni entegrasyon tabloları henüz Supabase'e kurulmadı. `supabase/integrations-migration.sql` ve ardından
          `supabase/integrations-seed.sql` çalıştırılmalı.
        </p>
      ) : null}
      {params.workspace === "provider-updated" ? <p className="notice success">Sağlayıcı güncellendi.</p> : null}
      {params.workspace === "connection-updated" ? <p className="notice success">Kanal bağlantısı güncellendi.</p> : null}
      {params.workspace === "mapping-saved" ? <p className="notice success">Oda eşleştirmesi kaydedildi.</p> : null}
      {params.workspace === "mapping-deleted" ? <p className="notice success">Oda eşleştirmesi kaldırıldı.</p> : null}
      {params.workspace === "sync-success" ? <p className="notice success">Senkronizasyon kontrolü başarılı.</p> : null}
      {params.workspace?.endsWith("error") ? <p className="notice danger">İşlem tamamlanamadı. Alanları ve eşleştirmeleri kontrol edin.</p> : null}
      {params.channex === "connected" ? <p className="notice success">Channex bağlantısı doğrulandı: {params.property}</p> : null}
      {params.channex === "synced" ? (
        <p className="notice success">Channex: {params.rooms} oda tipi için {params.values} stok değeri gönderildi.</p>
      ) : null}

      <section className="integration-control-bar">
        <div>
          <span className={`integration-dot ${channexConfigured ? "online" : ""}`} />
          <div>
            <strong>Channex teknik adapter</strong>
            <p>{channexConfigured ? "API ayarları mevcut" : "Staging erişimi alındığında etkinleşecek"}</p>
          </div>
        </div>
        <div className="integration-control-actions">
          <form action={testChannexAction}>
            <button type="submit" disabled={!channexConfigured}>Bağlantıyı test et</button>
          </form>
          <form action={syncChannexInventoryAction}>
            <button type="submit" disabled={!channexConfigured}>30 günü gönder</button>
          </form>
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">1. Sağlayıcılar</p>
            <h3>Entegrasyon sağlayıcısı katmanı</h3>
          </div>
          <span>{workspace.providers.length} seçenek</span>
        </div>
        <div className="provider-grid">
          {workspace.providers.map((provider) => (
            <article className="admin-card provider-card" key={provider.id}>
              <div className="room-card-heading">
                <span className={`status-pill ${provider.status === "CONNECTED" ? "success" : provider.status === "DEGRADED" ? "warning" : "info"}`}>
                  {provider.statusLabel}
                </span>
                <span className="muted">{provider.type}</span>
              </div>
              <h3>{provider.name}</h3>
              <p>{providerDescriptions[provider.type] ?? "Entegrasyon sağlayıcısı"}</p>
              <form className="room-edit-form" action={updateIntegrationProvider}>
                <input name="id" type="hidden" value={provider.id} />
                <label>
                  Durum
                  <select name="status" defaultValue={provider.status} disabled={!workspace.schemaReady}>
                    <option value="NOT_CONFIGURED">Yapılandırılmadı</option>
                    <option value="CONNECTED">Bağlı</option>
                    <option value="DEGRADED">Kısıtlı</option>
                    <option value="DISCONNECTED">Bağlantı yok</option>
                  </select>
                </label>
                <label>
                  Harici hesap / property ID
                  <input name="externalAccountId" defaultValue={provider.externalAccountId ?? ""} disabled={!workspace.schemaReady} />
                </label>
                <label>
                  Not
                  <input name="notes" defaultValue={provider.notes ?? ""} disabled={!workspace.schemaReady} />
                </label>
                <button type="submit" disabled={!workspace.schemaReady}>Sağlayıcıyı kaydet</button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">2. Kanal kataloğu</p>
            <h3>Türkiye ve uluslararası satış kanalları</h3>
          </div>
          <span>{workspace.catalog.length} kanal</span>
        </div>
        <div className="connection-list">
          {workspace.catalog.map((channel) => {
            const connection = workspace.connections.find((item) => item.catalogId === channel.id);
            return (
              <form className="connection-row" action={updateChannelConnection} key={channel.id}>
                <div>
                  <strong>{channel.name}</strong>
                  <span>{channel.market} · {channel.category} · {channel.currency ?? "Çoklu para"}</span>
                </div>
                {connection ? (
                  <>
                    <input name="id" type="hidden" value={connection.id} />
                    <select name="providerId" defaultValue={connection.providerId} disabled={!workspace.schemaReady}>
                      {workspace.providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                      ))}
                    </select>
                    <input
                      name="externalChannelId"
                      defaultValue={connection.externalChannelId ?? ""}
                      placeholder="Harici kanal ID"
                      disabled={!workspace.schemaReady}
                    />
                    <label className="connection-toggle">
                      <input name="enabled" type="checkbox" defaultChecked={connection.enabled} disabled={!workspace.schemaReady} />
                      <span>Etkin</span>
                    </label>
                    <span className={`status-pill ${connection.status === "CONNECTED" ? "success" : connection.status === "DEGRADED" ? "warning" : "info"}`}>
                      {connection.statusLabel}
                    </span>
                    <button type="submit" disabled={!workspace.schemaReady}>Kaydet</button>
                    <button formAction={runConnectionSync} type="submit" disabled={!workspace.schemaReady}>Kontrol et</button>
                  </>
                ) : (
                  <span className="muted">Seed çalıştırıldıktan sonra bağlantı kaydı oluşur.</span>
                )}
              </form>
            );
          })}
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">3. Oda eşleştirme</p>
            <h3>StayOS oda tiplerini sağlayıcı kayıtlarıyla eşleştir</h3>
          </div>
        </div>

        <form className="mapping-form" action={saveRoomMapping}>
          <label>
            Sağlayıcı
            <select name="providerId" required disabled={!workspace.schemaReady}>
              {workspace.providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </label>
          <label>
            StayOS oda tipi
            <select name="roomTypeId" required disabled={!workspace.schemaReady}>
              {workspace.rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </label>
          <label>
            Harici oda tipi ID
            <input name="externalRoomTypeId" placeholder="room-type-id" required disabled={!workspace.schemaReady} />
          </label>
          <label>
            Harici fiyat planı ID
            <input name="externalRatePlanId" placeholder="rate-plan-id" disabled={!workspace.schemaReady} />
          </label>
          <button type="submit" disabled={!workspace.schemaReady}>Eşleştir</button>
        </form>

        <div className="mapping-list">
          {workspace.mappings.map((mapping) => (
            <div className="mapping-row" key={mapping.id}>
              <div>
                <strong>{mapping.roomName}</strong>
                <span>{mapping.providerName}</span>
              </div>
              <code>{mapping.externalRoomTypeId}</code>
              <code>{mapping.externalRatePlanId ?? "Fiyat planı yok"}</code>
              <form action={deleteRoomMapping}>
                <input name="id" type="hidden" value={mapping.id} />
                <button type="submit">Kaldır</button>
              </form>
            </div>
          ))}
          {!workspace.mappings.length ? <p className="empty-state">Henüz oda eşleştirmesi yok.</p> : null}
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">4. Senkronizasyon günlüğü</p>
            <h3>Gönderilen ve alınan verilerin denetim kaydı</h3>
          </div>
        </div>
        <div className="sync-log-list">
          {workspace.logs.map((log) => (
            <div className="sync-log-row" key={log.id}>
              <span className={`status-pill ${log.state === "SUCCESS" ? "success" : log.state === "FAILED" ? "danger" : "warning"}`}>
                {syncStateLabels[log.state] ?? log.state}
              </span>
              <div>
                <strong>{log.providerName} · {log.channelName}</strong>
                <p>{log.resource} · {log.direction} · {log.recordsCount} kayıt</p>
              </div>
              <span>{log.message}</span>
              <time>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(log.createdAt)}</time>
            </div>
          ))}
          {!workspace.logs.length ? <p className="empty-state">Henüz senkronizasyon kaydı yok.</p> : null}
        </div>
      </section>
    </>
  );
}
