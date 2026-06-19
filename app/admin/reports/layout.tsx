import { StaffRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireRoles([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.ACCOUNTING]);
  return children;
}
