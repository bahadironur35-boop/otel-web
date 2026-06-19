import { AdminChrome } from "@/components/admin-chrome";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();
  return <AdminChrome user={user}>{children}</AdminChrome>;
}
