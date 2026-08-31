import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getEnv } from "./env";

const COOKIE_NAME = "olama_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function passwordsMatch(provided: string, expected: string): boolean {
  return safeEqual(sign(provided, "olama-password"), sign(expected, "olama-password"));
}

export async function isAdmin(): Promise<boolean> {
  const env = getEnv();
  if (!env.adminPassword) {
    return false;
  }
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }
  const expected = sign("admin", env.sessionSecret);
  return safeEqual(token, expected);
}

export async function isAuthorizedRequest(request: Request): Promise<boolean> {
  const env = getEnv();
  if (!env.adminPassword) {
    return false;
  }
  if (await isAdmin()) {
    return true;
  }
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return false;
  }
  const token = header.slice("Bearer ".length);
  return passwordsMatch(token, env.adminPassword);
}

export async function createAdminSession(): Promise<void> {
  const env = getEnv();
  const store = await cookies();
  store.set(COOKIE_NAME, sign("admin", env.sessionSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.appUrl.startsWith("https://"),
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
