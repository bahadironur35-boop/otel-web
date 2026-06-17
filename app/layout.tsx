import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "StayOS | Otel Rezervasyon ve Operasyon Platformu",
  description:
    "Otel web sitesi, rezervasyon motoru, operasyon paneli, otomasyonlar ve tatil platformu entegrasyonları için modern ürün prototipi."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="StayOS ana sayfa">
            <span className="brand-mark">S</span>
            <span>StayOS</span>
          </Link>
          <nav className="main-nav" aria-label="Ana menü">
            <Link href="/#platform">Platform</Link>
            <Link href="/admin">Panel</Link>
            <Link href="/#entegrasyon">Entegrasyon</Link>
            <Link href="/#yol-haritasi">Yol Haritası</Link>
          </nav>
          <Link className="nav-action" href="/admin">
            Yönetim Paneli
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
