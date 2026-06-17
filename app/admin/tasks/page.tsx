import { tasks } from "@/lib/data";

export default function TasksPage() {
  return (
    <>
      <div className="admin-topline">
        <div>
          <p className="section-kicker">Operasyon görevleri</p>
          <h2>Housekeeping, bakım ve ön büro işleri</h2>
        </div>
        <button className="admin-action" type="button">Görev oluştur</button>
      </div>
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
