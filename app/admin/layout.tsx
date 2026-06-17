import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const navItems = [
  ["Özet", "/admin"],
  ["Rezervasyonlar", "/admin/reservations"],
  ["Odalar", "/admin/rooms"],
  ["Görevler", "/admin/tasks"],
  ["Kanallar", "/admin/channels"]
];

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Yönetim menüsü">
        <div>
          <p className="admin-label">StayOS</p>
          <h1>Yönetim</h1>
        </div>
        <nav>
          {navItems.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-actions">
          <Link className="back-link" href="/">
            Siteye dön
          </Link>
          <form action={logoutAction}>
            <button className="back-link logout-button" type="submit">
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>
      <section className="admin-content">{children}</section>
    </main>
  );
}
