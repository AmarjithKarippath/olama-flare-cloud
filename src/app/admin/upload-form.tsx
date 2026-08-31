"use client";

import { FormEvent, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";

export function UploadForm({ maxUploadMb }: { maxUploadMb: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  function onDrop(event: DragEvent) {
    event.preventDefault();
    const next = event.dataTransfer.files[0];
    if (next) {
      setFile(next);
    }
  }

  function upload() {
    if (!file) {
      return;
    }
    setPending(true);
    setError("");
    setShareUrl("");
    setProgress(0);

    const body = new FormData();
    body.set("file", file);
    if (title.trim()) {
      body.set("title", title.trim());
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      setPending(false);
      try {
        const payload = JSON.parse(xhr.responseText) as { url?: string; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && payload.url) {
          setShareUrl(payload.url);
          setFile(null);
          setTitle("");
          setProgress(100);
          router.refresh();
          return;
        }
        setError(payload.error || "Upload failed");
      } catch {
        setError("Upload failed");
      }
    };
    xhr.onerror = () => {
      setPending(false);
      setError("Network error");
    };
    xhr.send(body);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    upload();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-5 py-10 text-center shadow-sm transition hover:border-zinc-400 sm:px-6 sm:py-12 dark:hover:border-zinc-500"
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <p className="font-medium">
          <span className="lg:hidden">Choose an MP4, MOV, or WebM</span>
          <span className="hidden lg:inline">Drop an MP4, MOV, or WebM</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {file ? file.name : `Up to ${maxUploadMb} MB`}
        </p>
      </div>
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none ring-zinc-400/50 focus:ring-2 dark:ring-zinc-500/50"
      />
      {pending ? (
        <div className="h-2 overflow-hidden rounded-full bg-surface">
          <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {shareUrl ? (
        <p className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-border">
          Live at{" "}
          <a href={shareUrl} className="break-all text-foreground underline" target="_blank" rel="noreferrer">
            {shareUrl}
          </a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!file || pending}
        className="min-h-12 rounded-xl bg-foreground px-4 py-3 font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {pending ? `Uploading ${progress}%` : "Upload and get link"}
      </button>
    </form>
  );
}
