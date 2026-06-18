import { updateComplianceItem } from "@/app/admin/actions";
import { getIntegrationWorkspace } from "@/lib/integrations";

const statusTone: Record<string, string> = {
  NOT_STARTED: "info",
  IN_PROGRESS: "warning",
  READY: "success",
  NOT_APPLICABLE: "info"
};

export default async function CompliancePage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [workspace, params] = await Promise.all([getIntegrationWorkspace(), searchParams]);
  const groupedItems = Object.groupBy(workspace.compliance, (item) => item.category);

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Türkiye operasyonu</p>
          <h2>Yasal ve operasyonel uyumluluk yol haritası</h2>
        </div>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Uyumluluk tabloları için entegrasyon migration ve seed dosyalarını çalıştırın.</p>
      ) : null}
      {params.status === "updated" ? <p className="notice success">Uyumluluk maddesi güncellendi.</p> : null}
      {params.status === "error" ? <p className="notice danger">Uyumluluk maddesi güncellenemedi.</p> : null}

      <div className="compliance-summary">
        <article>
          <strong>{workspace.compliance.filter((item) => item.status === "READY").length}</strong>
          <span>Hazır</span>
        </article>
        <article>
          <strong>{workspace.compliance.filter((item) => item.status === "IN_PROGRESS").length}</strong>
          <span>Devam ediyor</span>
        </article>
        <article>
          <strong>{workspace.compliance.filter((item) => item.status === "NOT_STARTED").length}</strong>
          <span>Başlanmadı</span>
        </article>
      </div>

      {Object.entries(groupedItems).map(([category, items]) => (
        <section className="workspace-section" key={category}>
          <div className="workspace-heading">
            <div>
              <p className="section-kicker">{category}</p>
              <h3>{category} kontrol listesi</h3>
            </div>
            <span>{items?.length ?? 0} madde</span>
          </div>

          <div className="compliance-list">
            {items?.map((item) => (
              <form className="compliance-row" action={updateComplianceItem} key={item.id}>
                <input name="id" type="hidden" value={item.id} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.code}</span>
                </div>
                <span className={`status-pill ${statusTone[item.status] ?? "info"}`}>{item.statusLabel}</span>
                <select name="status" defaultValue={item.status} disabled={!workspace.schemaReady}>
                  <option value="NOT_STARTED">Başlanmadı</option>
                  <option value="IN_PROGRESS">Devam ediyor</option>
                  <option value="READY">Hazır</option>
                  <option value="NOT_APPLICABLE">Uygulanmıyor</option>
                </select>
                <input name="notes" defaultValue={item.notes ?? ""} placeholder="Not veya sonraki adım" disabled={!workspace.schemaReady} />
                <button type="submit" disabled={!workspace.schemaReady}>Kaydet</button>
              </form>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
