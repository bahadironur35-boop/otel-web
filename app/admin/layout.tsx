import Link from "next/link";

const navItems = [
  ["Özet", "/admin"],
  ["Rezervasyonlar", "/admin/reservations"],
  ["Odalar", "/admin/rooms"],
  ["Görevler", "/admin/tasks"],
  ["Kanallar", "/admin/channels"]
];

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
        <Link className="back-link" href="/">
          Siteye dön
        </Link>
      </aside>
      <section className="admin-content">{children}</section>
    </main>
  );
}
