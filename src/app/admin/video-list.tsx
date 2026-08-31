"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  title: string;
  createdAt: number;
  durationSec: number | null;
  sizeBytes: number;
  url: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) {
    return "";
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function VideoList({ videos }: { videos: Item[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function copy(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1500);
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) {
      return;
    }
    setBusy(id);
    const response = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    setBusy(null);
    if (response.ok) {
      router.refresh();
    }
  }

  if (videos.length === 0) {
    return <p className="text-sm text-muted">No videos yet.</p>;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
      {videos.map((video) => (
        <li key={video.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
          <img
            src={`/v/${video.id}/poster`}
            alt=""
            className="h-40 w-full shrink-0 rounded-2xl object-cover ring-1 ring-border sm:h-16 sm:w-28"
          />
          <div className="min-w-0 flex-1">
            <a
              href={video.url}
              className="block truncate font-medium hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {video.title}
            </a>
            <p className="text-sm text-muted">
              {new Date(video.createdAt).toLocaleString()}
              {video.durationSec != null ? ` · ${formatDuration(video.durationSec)}` : ""}
              {` · ${formatSize(video.sizeBytes)}`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => copy(video.url, video.id)}
              className="min-h-11 rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-surface"
            >
              {copied === video.id ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              disabled={busy === video.id}
              onClick={() => remove(video.id, video.title)}
              className="min-h-11 rounded-xl border border-border px-3 py-2 text-sm text-red-500 transition hover:bg-surface disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
