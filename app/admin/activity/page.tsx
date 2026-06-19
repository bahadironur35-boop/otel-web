import Link from "next/link";
import { Activity, CalendarClock, UserRound } from "lucide-react";
import { getActivityWorkspace } from "@/lib/activity";

export default async function ActivityPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; action?: string; actor?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const workspace = await getActivityWorkspace(params);

  return (
    <>
      <div className="admin-topline compact-topline">
        <div>
          <p className="section-kicker">Güvenlik ve denetim</p>
          <h2>İşlem geçmişi</h2>
        </div>
      </div>

      {!workspace.schemaReady ? (
        <p className="notice danger">Denetim tablosu kurulmadı. Supabase&apos;de `supabase/audit-logs-migration.sql` çalıştırılmalı.</p>
      ) : null}

      <form className="activity-filters" method="get">
        <label>Ara<input name="q" defaultValue={params.q} placeholder="Kullanıcı, işlem veya kayıt" /></label>
        <label>İşlem
          <select name="action" defaultValue={params.action ?? "ALL"}>
            <option value="ALL">Tüm işlemler</option>
            {workspace.actions.map((action) => <option value={action.value} key={action.value}>{action.label}</option>)}
          </select>
        </label>
        <label>Kullanıcı
          <select name="actor" defaultValue={params.actor ?? "ALL"}>
            <option value="ALL">Tüm kullanıcılar</option>
            {workspace.actors.map((actor) => <option value={actor.actorEmail} key={actor.actorEmail}>{actor.actorName}</option>)}
          </select>
        </label>
        <label>Başlangıç<input name="from" type="date" defaultValue={params.from} /></label>
        <label>Bitiş<input name="to" type="date" defaultValue={params.to} /></label>
        <button type="submit">Filtrele</button>
        <Link href="/admin/activity">Temizle</Link>
      </form>

      <section className="operations-panel activity-panel">
        <div className="operations-panel-heading">
          <div><span>DENETİM KAYITLARI</span><h3>Personel hareketleri</h3></div>
          <b>{workspace.logs.length} kayıt</b>
        </div>
        <div className="activity-list">
          {workspace.logs.map((log) => (
            <article className="activity-row" key={log.id}>
              <span className="activity-icon"><Activity size={19} /></span>
              <div className="activity-main">
                <div><strong>{log.actionLabel}</strong><span className="status-pill info">{log.entityType}</span></div>
                <p>{log.description}</p>
                <small>{log.entityId ? `Kayıt: ${log.entityId}` : "Genel işlem"}</small>
              </div>
              <div className="activity-actor">
                <UserRound size={16} />
                <span><strong>{log.actorName}</strong><small>{log.actorRoleLabel} · {log.actorEmail}</small></span>
              </div>
              <time>
                <CalendarClock size={16} />
                <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "medium" }).format(log.createdAt)}</span>
              </time>
            </article>
          ))}
          {!workspace.logs.length ? <p className="empty-state padded">Filtrelere uygun işlem kaydı bulunamadı.</p> : null}
        </div>
      </section>
    </>
  );
}
