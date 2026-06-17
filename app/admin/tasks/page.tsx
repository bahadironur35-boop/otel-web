import { completeTask, createTask, deleteTask } from "@/app/admin/actions";
import { getHotelData } from "@/lib/data";

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<{ completed?: string; created?: string; deleted?: string; demo?: string; error?: string }>;
}) {
  const [{ tasks }, params] = await Promise.all([getHotelData(), searchParams]);
  const openTasks = tasks.filter((task) => !task.done);
  const doneTasks = tasks.filter((task) => task.done);

  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Operasyon görevleri</p>
          <h2>Housekeeping, bakım ve ön büro işleri</h2>
        </div>
        <button className="admin-action" type="button">Görev oluştur</button>
      </div>
      {params.demo ? <p className="notice">Demo modda kayıt yazılmaz. DATABASE_URL bağlandığında bu form gerçek veri oluşturur.</p> : null}
      {params.created ? <p className="notice success">Görev oluşturuldu.</p> : null}
      {params.completed ? <p className="notice success">Görev tamamlandı.</p> : null}
      {params.deleted ? <p className="notice success">Görev silindi.</p> : null}
      {params.error ? <p className="notice danger">Zorunlu alanları kontrol et.</p> : null}

      <form className="admin-form compact" action={createTask}>
        <label>
          Görev
          <input name="title" placeholder="Yeni görev" required />
        </label>
        <label>
          Sorumlu
          <input name="owner" placeholder="Housekeeping" required />
        </label>
        <label>
          Zaman
          <input name="dueAt" type="datetime-local" required />
        </label>
        <label>
          Öncelik
          <select name="priority" defaultValue="MEDIUM">
            <option value="LOW">Düşük</option>
            <option value="MEDIUM">Orta</option>
            <option value="HIGH">Yüksek</option>
          </select>
        </label>
        <button type="submit">Görev oluştur</button>
      </form>

      <section className="admin-card">
        <div className="task-section-heading">
          <h3>Açık görevler</h3>
          <span>{openTasks.length} görev</span>
        </div>
        {openTasks.map((task) => (
          <div className="task-row" key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.owner} · {task.due}</p>
            </div>
            <span className="pill">{task.priority}</span>
            <div className="task-actions">
              <form action={completeTask}>
                <input name="id" type="hidden" value={task.id} />
                <button type="submit">Tamamla</button>
              </form>
              <form action={deleteTask}>
                <input name="id" type="hidden" value={task.id} />
                <button className="danger-button" type="submit">Sil</button>
              </form>
            </div>
          </div>
        ))}
        {!openTasks.length ? <p className="empty-state">Açık görev yok.</p> : null}
      </section>

      <section className="admin-card completed-card">
        <div className="task-section-heading">
          <h3>Tamamlananlar</h3>
          <span>{doneTasks.length} görev</span>
        </div>
        {doneTasks.map((task) => (
          <div className="task-row is-done" key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.owner} · {task.due}</p>
            </div>
            <span className="pill">Tamamlandı</span>
            <div className="task-actions">
              <form action={deleteTask}>
                <input name="id" type="hidden" value={task.id} />
                <button className="danger-button" type="submit">Sil</button>
              </form>
            </div>
          </div>
        ))}
        {!doneTasks.length ? <p className="empty-state">Henüz tamamlanan görev yok.</p> : null}
      </section>
    </>
  );
}
