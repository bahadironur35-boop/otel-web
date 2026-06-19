"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  DoorOpen,
  Gauge,
  Hotel,
  LogOut,
  Menu,
  Network,
  ReceiptText,
  Settings2,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/login/actions";

const navItems = [
  { label: "Operasyon Özeti", href: "/admin", icon: Gauge },
  { label: "Rezervasyonlar", href: "/admin/reservations", icon: CalendarDays },
  { label: "Misafirler", href: "/admin/guests", icon: UsersRound },
  { label: "Oda Hesapları", href: "/admin/folios", icon: ReceiptText },
  { label: "Çıkışlar", href: "/admin/checkouts", icon: DoorOpen },
  { label: "Tahsilatlar", href: "/admin/payments", icon: CircleDollarSign },
  { label: "Odalar", href: "/admin/rooms", icon: BedDouble },
  { label: "Görevler", href: "/admin/tasks", icon: CheckSquare },
  { label: "Kanallar", href: "/admin/channels", icon: Network },
  { label: "Uyumluluk", href: "/admin/compliance", icon: ShieldCheck }
];

const moduleContexts = [
  { path: "/admin/reservations", title: "Rezervasyon Yönetimi", subtitle: "Satış ve konaklama planlaması" },
  { path: "/admin/guests", title: "Misafir Yönetimi", subtitle: "Profil, check-in ve konaklama geçmişi" },
  { path: "/admin/folios", title: "Oda Hesapları", subtitle: "Folyo ve misafir harcamaları" },
  { path: "/admin/checkouts", title: "Çıkış İşlemleri", subtitle: "Bakiye, tahsilat ve oda teslimi" },
  { path: "/admin/payment-settings", title: "Ödeme Ayarları", subtitle: "Tahsilat sağlayıcıları ve bağlantılar" },
  { path: "/admin/payments", title: "Tahsilat Merkezi", subtitle: "Ödeme talepleri ve işlem durumları" },
  { path: "/admin/rooms", title: "Oda Operasyonları", subtitle: "Stok, hazırlık ve fiziksel oda durumu" },
  { path: "/admin/tasks", title: "Operasyon Görevleri", subtitle: "Housekeeping, bakım ve ön büro" },
  { path: "/admin/channels", title: "Kanal Yönetimi", subtitle: "OTA bağlantıları ve senkronizasyon" },
  { path: "/admin/compliance", title: "Uyumluluk Merkezi", subtitle: "Yasal ve operasyonel kontrol listesi" },
  { path: "/admin", title: "Operasyon Özeti", subtitle: "StayOS otel yönetim merkezi" }
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [now, setNow] = useState(() => new Date());
  const moduleContext =
    moduleContexts.find((item) =>
      item.path === "/admin" ? pathname === "/admin" : pathname.startsWith(item.path)
    ) ?? moduleContexts[moduleContexts.length - 1];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Yönetim menüsü">
        <div className="admin-brand">
          <span className="admin-brand-icon"><Hotel size={28} strokeWidth={1.8} /></span>
          <div>
            <strong>StayOS</strong>
            <span>Hotel Operations</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

            return (
              <Link className={active ? "active" : ""} key={item.href} href={item.href}>
                <Icon size={19} strokeWidth={1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link href="/admin/payment-settings">
            <Settings2 size={19} />
            <span>Sistem Ayarları</span>
          </Link>
          <div className="shift-status">
            <span className="shift-dot" />
            <div>
              <strong>Aktif vardiya</strong>
              <span>Resepsiyon · 14:00</span>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit">
              <LogOut size={18} />
              <span>Çıkış yap</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-header">
          <div className="admin-header-title">
            <Menu className="admin-mobile-menu" size={21} />
            <span>
              <strong>{moduleContext.title}</strong>
              <small>{moduleContext.subtitle}</small>
            </span>
          </div>
          <div className="admin-header-meta">
            <div>
              <CalendarDays size={21} />
              <span>
                <strong>{formatDate(now)}</strong>
                <small>{formatDay(now)}</small>
              </span>
            </div>
            <div>
              <Clock3 size={22} />
              <strong>{formatTime(now)}</strong>
            </div>
            <div className="admin-user">
              <span className="admin-avatar">R</span>
              <span>
                <strong>Resepsiyon</strong>
                <small>Aktif kullanıcı</small>
              </span>
              <ChevronDown size={17} />
            </div>
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </div>
    </main>
  );
}
