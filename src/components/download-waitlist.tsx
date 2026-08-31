"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlatformIcon } from "@/components/platform-icon";
import { PLATFORM_LABELS, type Platform } from "@/lib/platforms";
import { SURVEY, surveyQuestion } from "@/lib/survey";

const BUTTONS: { id: Platform; label: string }[] = [
  { id: "mac", label: "for Mac" },
  { id: "windows", label: "for Windows" },
  { id: "linux", label: "for Linux" },
  { id: "chrome", label: "Add to Chrome" },
];

const inputClass =
  "rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none ring-zinc-400/50 focus:ring-2 dark:ring-zinc-500/50";

export function DownloadWaitlist() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | "done">(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [choice, setChoice] = useState("");
  const [other, setOther] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const question = typeof step === "number" && step > 0 ? surveyQuestion(step) : undefined;

  useEffect(() => {
    if (!platform) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [platform]);

  function resetSurvey() {
    setWaitlistId(null);
    setStep(0);
    setName("");
    setEmail("");
    setChoice("");
    setOther("");
    setError("");
    setPending(false);
  }

  function close() {
    setPlatform(null);
    resetSurvey();
  }

  function openPlatform(next: Platform) {
    resetSurvey();
    setPlatform(next);
  }

  async function saveContact(event: FormEvent) {
    event.preventDefault();
    if (!platform) {
      return;
    }
    setPending(true);
    setError("");
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, platform }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { id?: string; surveyStep?: number; complete?: boolean; error?: string }
      | null;
    setPending(false);
    if (!response.ok || !payload?.id) {
      setError(payload?.error || "Could not save");
      return;
    }
    setWaitlistId(payload.id);
    if (payload.complete) {
      setStep("done");
      return;
    }
    const nextStep = Math.min(5, (payload.surveyStep ?? 0) + 1) as 1 | 2 | 3 | 4 | 5;
    setChoice("");
    setOther("");
    setStep(nextStep);
  }

  async function saveAnswer(event: FormEvent) {
    event.preventDefault();
    if (!waitlistId || !question) {
      return;
    }
    setPending(true);
    setError("");
    const response = await fetch(`/api/waitlist/${waitlistId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: question.step, value: choice, other }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { complete?: boolean; error?: string }
      | null;
    setPending(false);
    if (!response.ok) {
      setError(payload?.error || "Could not save");
      return;
    }
    if (payload?.complete || question.step === 5) {
      setStep("done");
      return;
    }
    setChoice("");
    setOther("");
    setStep((question.step + 1) as 1 | 2 | 3 | 4 | 5);
  }

  const selected = question?.options.find((option) => option.id === choice);

  return (
    <>
      <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
        {BUTTONS.map((button) => (
          <button
            key={button.id}
            type="button"
            onClick={() => openPlatform(button.id)}
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-center text-sm font-medium shadow-sm transition hover:border-zinc-400 hover:bg-surface hover:shadow-md sm:min-h-12 sm:px-4 sm:py-3.5 dark:hover:border-zinc-500"
          >
            <PlatformIcon platform={button.id} className="size-6 shrink-0 sm:size-5" />
            <span className="min-w-0">{button.label}</span>
          </button>
        ))}
      </div>

      {platform ? (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-overlay sm:items-center sm:p-4"
          onClick={close}
        >
          <div
            className="max-h-[min(92dvh,100%)] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-2xl sm:rounded-3xl sm:p-6"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            onClick={(event) => event.stopPropagation()}
          >
            {step === "done" ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">You're on the waitlist</h2>
                <p className="text-sm text-muted">
                  Thanks. We'll email you when the {PLATFORM_LABELS[platform]} download is ready.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="min-h-12 rounded-xl bg-foreground px-4 py-3 font-medium text-background hover:opacity-90"
                >
                  Close
                </button>
              </div>
            ) : step === 0 ? (
              <form onSubmit={saveContact} className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Join the waitlist</h2>
                <p className="text-sm text-muted">
                  {PLATFORM_LABELS[platform]} isn't available yet. Leave your name and email.
                </p>
                <label className="flex flex-col gap-2 text-sm text-muted">
                  Name
                  <input
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-muted">
                  Email
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                  />
                </label>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="min-h-12 flex-1 rounded-xl border border-border px-4 py-3 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="min-h-12 flex-1 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                  >
                    {pending ? "Saving…" : "Continue"}
                  </button>
                </div>
              </form>
            ) : question ? (
              <form onSubmit={saveAnswer} className="flex flex-col gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {question.step} of {SURVEY.length}
                </p>
                <h2 className="text-xl font-semibold">{question.title}</h2>
                <div className="flex flex-col gap-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm ${
                        choice === option.id
                          ? "border-zinc-400 bg-surface dark:border-zinc-500"
                          : "border-border hover:border-zinc-400 dark:hover:border-zinc-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="survey"
                        value={option.id}
                        checked={choice === option.id}
                        onChange={() => {
                          setChoice(option.id);
                          if (!option.hasOther) {
                            setOther("");
                          }
                        }}
                        className="mt-0.5"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {selected?.hasOther ? (
                  <input
                    required
                    value={other}
                    onChange={(event) => setOther(event.target.value)}
                    placeholder="Please specify"
                    className={inputClass}
                  />
                ) : null}
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <button
                  type="submit"
                  disabled={pending || !choice}
                  className="min-h-12 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                >
                  {pending ? "Saving…" : question.step === 5 ? "Finish" : "Continue"}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
