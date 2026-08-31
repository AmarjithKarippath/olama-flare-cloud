import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) {
    redirect("/login");
  }
  return children;
}
