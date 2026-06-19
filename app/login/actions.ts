"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, validateCredentials } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await validateCredentials(email, password);
  if (!user) {
    redirect("/login?error=invalid");
  }

  await createSession(user);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login?logout=1");
}
