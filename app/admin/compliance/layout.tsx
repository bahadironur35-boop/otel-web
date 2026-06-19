import { StaffRole } from "@prisma/client";
import { requireRoles } from "@/lib/auth";

export default async function ComplianceLayout({ children }: { children: React.ReactNode }) {
  await requireRoles([StaffRole.ADMIN, StaffRole.MANAGER]);
  return children;
}
