import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthorizedRequest } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { extractPoster, probeDurationSec, remuxFaststart } from "@/lib/ffmpeg";
import { createVideoId } from "@/lib/ids";
import { mimeFromUpload, parseMultipartVideo } from "@/lib/upload";
import { ensureDataDirs, posterFilePath, tmpFilePath, videoFilePath } from "@/lib/storage";
import { insertVideo } from "@/lib/videos";

export const runtime = "nodejs";
export const maxDuration = 3600;

function titleFromFilename(name: string): string {
  const base = path.basename(name);
  return base.replace(/\.[a-z0-9]+$/i, "") || "Untitled";
}

export async function POST(request: Request) {
  if (!(await isAuthorizedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = getEnv();
  ensureDataDirs();
  const id = createVideoId();
  const tmpPath = tmpFilePath(id, "upload");

  try {
    const uploaded = await parseMultipartVideo(request, tmpPath, env.maxUploadMb * 1024 * 1024);
    const mime = mimeFromUpload(uploaded.originalName, uploaded.mimeType);
    if (!mime) {
      await fs.rm(tmpPath, { force: true });
      return NextResponse.json(
        { error: "Unsupported file type. Use MP4, MOV, or WebM." },
        { status: 400 },
      );
    }

    let finalMime = "video/mp4";
    const mp4Path = videoFilePath({ id, mimeType: "video/mp4" });
    const remuxed = await remuxFaststart(tmpPath, mp4Path);
    if (remuxed) {
      await fs.rm(tmpPath, { force: true });
    } else {
      finalMime = mime;
      const dest = videoFilePath({ id, mimeType: mime });
      await fs.rename(tmpPath, dest);
    }

    const storedPath = videoFilePath({ id, mimeType: finalMime });
    const stat = await fs.stat(storedPath);
    await extractPoster(storedPath, posterFilePath(id));
    const durationSec = await probeDurationSec(storedPath);
    const title = uploaded.title || titleFromFilename(uploaded.originalName);

    insertVideo({
      id,
      title,
      originalName: uploaded.originalName,
      mimeType: finalMime,
      sizeBytes: stat.size,
      durationSec,
      createdAt: Date.now(),
    });

    return NextResponse.json({ id, url: `${env.appUrl}/v/${id}`, title });
  } catch (error) {
    await fs.rm(tmpPath, { force: true });
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message === "File too large" ? 413 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
