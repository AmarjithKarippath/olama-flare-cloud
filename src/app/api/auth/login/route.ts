import { NextResponse } from "next/server";
import { createAdminSession, passwordsMatch } from "@/lib/auth";
import { getEnv } from "@/lib/env";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let password = "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } else {
    const form = await request.formData();
    password = String(form.get("password") ?? "");
  }

  const env = getEnv();
  if (!env.adminPassword || !password || !passwordsMatch(password, env.adminPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
