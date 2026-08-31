import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { fileExists, requireVideo, videoMediaPath } from "@/lib/http";

function fileHeaders(size: number, contentType: string, start?: number, end?: number) {
  const headers: Record<string, string> = {
    "Accept-Ranges": "bytes",
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (start === undefined || end === undefined) {
    headers["Content-Length"] = String(size);
    return headers;
  }
  headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  headers["Content-Length"] = String(end - start + 1);
  return headers;
}

function parseRange(rangeHeader: string | null, size: number): { start: number; end: number } | "full" | "invalid" {
  if (!rangeHeader) {
    return "full";
  }
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if (!match) {
    return "invalid";
  }
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : size - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
    return "invalid";
  }
  return { start, end: Math.min(end, size - 1) };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const video = requireVideo(id);
  if (!video) {
    return new Response("Not found", { status: 404 });
  }
  const filePath = videoMediaPath(video);
  if (!(await fileExists(filePath))) {
    return new Response("Not found", { status: 404 });
  }

  const size = statSync(filePath).size;
  const range = parseRange(request.headers.get("range"), size);
  if (range === "invalid") {
    return new Response("Invalid range", {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  if (range === "full") {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, { status: 200, headers: fileHeaders(size, video.mimeType) });
  }

  const stream = Readable.toWeb(
    createReadStream(filePath, { start: range.start, end: range.end }),
  ) as ReadableStream;
  return new Response(stream, {
    status: 206,
    headers: fileHeaders(size, video.mimeType, range.start, range.end),
  });
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const video = requireVideo(id);
  if (!video) {
    return new Response(null, { status: 404 });
  }
  const filePath = videoMediaPath(video);
  if (!(await fileExists(filePath))) {
    return new Response(null, { status: 404 });
  }
  const size = statSync(filePath).size;
  const range = parseRange(request.headers.get("range"), size);
  if (range === "invalid") {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }
  if (range === "full") {
    return new Response(null, { status: 200, headers: fileHeaders(size, video.mimeType) });
  }
  return new Response(null, {
    status: 206,
    headers: fileHeaders(size, video.mimeType, range.start, range.end),
  });
}
