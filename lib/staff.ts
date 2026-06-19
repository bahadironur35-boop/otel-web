import "server-only";

import { hasDatabase, prisma } from "@/lib/prisma";

const roleLabels = {
  ADMIN: "Sistem yöneticisi",
  MANAGER: "Otel yöneticisi",
  RECEPTION: "Resepsiyon",
  HOUSEKEEPING: "Housekeeping",
  ACCOUNTING: "Muhasebe"
} as const;

export async function getStaffWorkspace() {
  if (!hasDatabase) return { schemaReady: false, users: [] };

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        staffUsers: {
          orderBy: [{ active: "desc" }, { fullName: "asc" }]
        }
      }
    });

    if (!hotel) return { schemaReady: true, users: [] };

    return {
      schemaReady: true,
      users: hotel.staffUsers.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        roleLabel: roleLabels[user.role],
        active: user.active,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }))
    };
  } catch (error) {
    console.error("Staff workspace read failed.", error);
    return { schemaReady: false, users: [] };
  }
}
