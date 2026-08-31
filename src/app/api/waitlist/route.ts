import { NextResponse } from "next/server";
import { createVideoId } from "@/lib/ids";
import { isPlatform } from "@/lib/platforms";
import { findWaitlistByEmailPlatform, insertWaitlist, updateWaitlist } from "@/lib/waitlist";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { name?: string; email?: string; platform?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; platform?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const platform = body.platform?.trim() ?? "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (!isPlatform(platform)) {
    return NextResponse.json({ error: "Choose a download" }, { status: 400 });
  }

  const existing = findWaitlistByEmailPlatform(email, platform);
  if (existing) {
    updateWaitlist(existing.id, { name });
    return NextResponse.json({
      id: existing.id,
      surveyStep: existing.surveyStep,
      complete: existing.surveyStep >= 5,
    });
  }

  const id = createVideoId();
  insertWaitlist({
    id,
    name,
    email,
    platform,
    surveyStep: 0,
    useCase: null,
    useCaseOther: null,
    currentTool: null,
    currentToolOther: null,
    frustration: null,
    frustrationOther: null,
    shareWith: null,
    price: null,
    createdAt: Date.now(),
  });

  return NextResponse.json({ id, surveyStep: 0, complete: false });
}
