import { NextResponse } from "next/server";
import { isValidVideoId } from "@/lib/ids";
import { surveyQuestion } from "@/lib/survey";
import { getWaitlist, updateWaitlist } from "@/lib/waitlist";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidVideoId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entry = getWaitlist(id);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { step?: number; value?: string; other?: string };
  try {
    body = (await request.json()) as { step?: number; value?: string; other?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const question = surveyQuestion(Number(body.step));
  if (!question) {
    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  }
  if (entry.surveyStep + 1 !== question.step && entry.surveyStep < question.step) {
    return NextResponse.json({ error: "Finish the previous question first" }, { status: 400 });
  }

  const value = body.value?.trim() ?? "";
  const option = question.options.find((item) => item.id === value);
  if (!option) {
    return NextResponse.json({ error: "Choose an option" }, { status: 400 });
  }

  const other = body.other?.trim() ?? "";
  if (option.hasOther && other.length < 1) {
    return NextResponse.json({ error: "Tell us a bit more" }, { status: 400 });
  }

  const nextStep = Math.max(entry.surveyStep, question.step);
  const patch: Record<string, string | number | null> = {
    surveyStep: nextStep,
    [question.field]: value,
  };
  if (question.otherField) {
    patch[question.otherField] = option.hasOther ? other : null;
  }

  updateWaitlist(id, patch);
  return NextResponse.json({ id, surveyStep: nextStep, complete: nextStep >= 5 });
}
