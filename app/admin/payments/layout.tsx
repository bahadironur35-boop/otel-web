import { StaffRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth";

export default async function PaymentsLayout({ children }: { children: React.ReactNode }) {
  await requireRoles([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTION, StaffRole.ACCOUNTING]);
  return children;
}
