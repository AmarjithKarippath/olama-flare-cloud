import { getEnv } from "@/lib/env";
import { PLATFORM_LABELS, isPlatform } from "@/lib/platforms";
import { SURVEY, optionLabel } from "@/lib/survey";
import { listVideos } from "@/lib/videos";
import { listWaitlist } from "@/lib/waitlist";
import { LogoutButton } from "./logout-button";
import { UploadForm } from "./upload-form";
import { VideoList } from "./video-list";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const env = getEnv();
  const videos = listVideos().map((video) => ({
    id: video.id,
    title: video.title,
    createdAt: video.createdAt,
    durationSec: video.durationSec,
    sizeBytes: video.sizeBytes,
    url: `${env.appUrl}/v/${video.id}`,
  }));
  const signups = listWaitlist();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-8 px-4 pt-20 pb-[max(3rem,env(safe-area-inset-bottom))] sm:gap-10 sm:px-6 sm:pt-24">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your videos</h1>
        <LogoutButton />
      </header>
      <section>
        <h2 className="mb-4 text-lg font-medium">Upload</h2>
        <UploadForm maxUploadMb={env.maxUploadMb} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-medium">Library</h2>
        <VideoList videos={videos} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-medium">Waitlist</h2>
        {signups.length === 0 ? (
          <p className="text-sm text-muted">No signups yet.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {signups.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="break-all text-sm text-muted">{entry.email}</p>
                  </div>
                  <p className="text-sm text-muted">
                    {isPlatform(entry.platform) ? PLATFORM_LABELS[entry.platform] : entry.platform}
                    {entry.surveyStep >= 5 ? " · complete" : ` · Q${entry.surveyStep}/5`}
                  </p>
                </div>
                {entry.surveyStep > 0 ? (
                  <ul className="space-y-1 text-xs text-muted">
                    {SURVEY.map((question) => {
                      const value = entry[question.field];
                      if (!value) {
                        return null;
                      }
                      const extra = question.otherField ? entry[question.otherField] : null;
                      return (
                        <li key={question.field}>{optionLabel(question, value, extra ?? null)}</li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
