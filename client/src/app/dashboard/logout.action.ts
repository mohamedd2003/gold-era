"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("gold_era_token");
  cookieStore.delete("gold_era_role");
  redirect("/login");
}
