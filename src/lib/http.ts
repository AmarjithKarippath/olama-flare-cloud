import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { isValidVideoId } from "./ids";
import { getVideo } from "./videos";
import { posterFilePath, videoFilePath } from "./storage";
import type { Video } from "./schema";

export function requireVideo(id: string): Video | null {
  if (!isValidVideoId(id)) {
    return null;
  }
  return getVideo(id) ?? null;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

function webStream(filePath: string, start?: number, end?: number): ReadableStream {
  const stream =
    start === undefined
      ? createReadStream(filePath)
      : createReadStream(filePath, { start, end });
  return Readable.toWeb(stream) as ReadableStream;
}

export async function serveRangeFile(
  request: NextRequest,
  filePath: string,
  contentType: string,
): Promise<Response> {
  const stat = await fs.stat(filePath);
  const size = stat.size;
  const range = request.headers.get("range");

  const headers: Record<string, string> = {
    "Accept-Ranges": "bytes",
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  if (!range) {
    return new Response(webStream(filePath), {
      status: 200,
      headers: {
        ...headers,
        "Content-Length": String(size),
      },
    });
  }

  const match = range.match(/bytes=(\d*)-(\d*)/);
  if (!match) {
    return new Response("Invalid range", { status: 416 });
  }

  const start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : size - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
    return new Response("Invalid range", {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }
  end = Math.min(end, size - 1);

  const chunkSize = end - start + 1;
  return new Response(webStream(filePath, start, end), {
    status: 206,
    headers: {
      ...headers,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(chunkSize),
    },
  });
}

export function videoMediaPath(video: Video): string {
  return videoFilePath(video);
}

export function videoPosterPath(id: string): string {
  return posterFilePath(id);
}
