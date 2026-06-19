"use server";

import { StaffRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, requireRoles } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const managerRoles = [StaffRole.ADMIN, StaffRole.MANAGER];

async function getHotelId() {
  const hotel = await prisma.hotel.findUnique({ where: { slug: "stayos-demo" }, select: { id: true } });
  if (!hotel) redirect("/admin/users?result=error");
  return hotel.id;
}

export async function createStaffUser(formData: FormData) {
  const currentUser = await requireRoles(managerRoles);
  const hotelId = await getHotelId();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? StaffRole.RECEPTION) as StaffRole;

  if (!fullName || !email || password.length < 8 || !Object.values(StaffRole).includes(role)) {
    redirect("/admin/users?result=invalid");
  }
  if (currentUser.role === StaffRole.MANAGER && role === StaffRole.ADMIN) {
    redirect("/admin/users?result=forbidden");
  }

  try {
    await prisma.staffUser.create({
      data: {
        hotelId,
        fullName,
        email,
        passwordHash: await hashPassword(password),
        role
      }
    });
  } catch {
    redirect("/admin/users?result=duplicate");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?result=created");
}

export async function updateStaffUser(formData: FormData) {
  const currentUser = await requireRoles(managerRoles);
  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = String(formData.get("role") ?? StaffRole.RECEPTION) as StaffRole;
  const password = String(formData.get("password") ?? "");

  if (!id || !fullName || !Object.values(StaffRole).includes(role)) {
    redirect("/admin/users?result=invalid");
  }

  const targetUser = await prisma.staffUser.findUnique({ where: { id } });
  if (
    !targetUser ||
    (currentUser.role === StaffRole.MANAGER &&
      (targetUser.role === StaffRole.ADMIN || role === StaffRole.ADMIN))
  ) {
    redirect("/admin/users?result=forbidden");
  }

  const data: {
    fullName: string;
    role: StaffRole;
    passwordHash?: string;
  } = { fullName, role };

  if (password) {
    if (password.length < 8) redirect("/admin/users?result=invalid");
    data.passwordHash = await hashPassword(password);
  }

  if (id === currentUser.id && role !== currentUser.role) {
    redirect("/admin/users?result=self-role");
  }

  await prisma.staffUser.update({ where: { id }, data });
  revalidatePath("/admin/users");
  redirect("/admin/users?result=updated");
}

export async function toggleStaffUser(formData: FormData) {
  const currentUser = await requireRoles(managerRoles);
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  if (!id || id === currentUser.id) {
    redirect("/admin/users?result=self-status");
  }

  const targetUser = await prisma.staffUser.findUnique({ where: { id } });
  if (!targetUser || (currentUser.role === StaffRole.MANAGER && targetUser.role === StaffRole.ADMIN)) {
    redirect("/admin/users?result=forbidden");
  }

  await prisma.staffUser.update({ where: { id }, data: { active } });
  revalidatePath("/admin/users");
  redirect(`/admin/users?result=${active ? "activated" : "deactivated"}`);
}
