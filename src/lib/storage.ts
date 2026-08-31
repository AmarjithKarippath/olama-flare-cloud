import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Video } from "./schema";

export function getPaths() {
  const dataDir = path.join(process.cwd(), "data");
  return {
    dataDir,
    db: path.join(process.cwd(), "data", "olama.db"),
    videos: path.join(process.cwd(), "data", "videos"),
    thumbs: path.join(process.cwd(), "data", "thumbs"),
    tmp: path.join(process.cwd(), "data", "tmp"),
  };
}

export function ensureDataDirs(): void {
  const paths = getPaths();
  mkdirSync(paths.videos, { recursive: true });
  mkdirSync(paths.thumbs, { recursive: true });
  mkdirSync(paths.tmp, { recursive: true });
}

export function extensionForMime(mimeType: string): string {
  if (mimeType === "video/webm") {
    return "webm";
  }
  if (mimeType === "video/quicktime") {
    return "mov";
  }
  return "mp4";
}

export function videoFilePath(video: Pick<Video, "id" | "mimeType">): string {
  return path.join(process.cwd(), "data", "videos", `${video.id}.${extensionForMime(video.mimeType)}`);
}

export function posterFilePath(id: string): string {
  return path.join(process.cwd(), "data", "thumbs", `${id}.jpg`);
}

export function tmpFilePath(id: string, ext: string): string {
  return path.join(process.cwd(), "data", "tmp", `${id}.${ext}`);
}
