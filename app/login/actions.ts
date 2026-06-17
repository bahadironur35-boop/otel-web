"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, validateCredentials } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!(await validateCredentials(email, password))) {
    redirect("/login?error=invalid");
  }

  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login?logout=1");
}
