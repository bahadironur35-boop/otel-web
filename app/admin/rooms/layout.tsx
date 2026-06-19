import { StaffRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth";

export default async function RoomsLayout({ children }: { children: React.ReactNode }) {
  await requireRoles([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTION, StaffRole.HOUSEKEEPING]);
  return children;
}
