import { StaffRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth";

export default async function CheckoutsLayout({ children }: { children: React.ReactNode }) {
  await requireRoles([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTION]);
  return children;
}
