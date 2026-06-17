import { createTask } from "@/app/admin/actions";
import { getHotelData } from "@/lib/data";

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string; demo?: string; error?: string }>;
}) {
  const [{ tasks }, params] = await Promise.all([getHotelData(), searchParams]);

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
        {tasks.map((task) => (
          <div className="task-row" key={task.title}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.owner} · {task.due}</p>
            </div>
            <span className="pill">{task.priority}</span>
          </div>
        ))}
      </section>
    </>
  );
}
