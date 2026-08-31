import { NextRequest } from "next/server";
import { fileExists, requireVideo, serveRangeFile, videoPosterPath } from "@/lib/http";

const PLACEHOLDER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect fill="#111113" width="1280" height="720"/>
  <circle cx="640" cy="340" r="48" fill="#f0718a"/>
  <polygon points="628,316 628,364 672,340" fill="#fff"/>
</svg>`;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const video = requireVideo(id);
  if (!video) {
    return new Response("Not found", { status: 404 });
  }
  const posterPath = videoPosterPath(id);
  if (await fileExists(posterPath)) {
    return serveRangeFile(_request, posterPath, "image/jpeg");
  }
  return new Response(PLACEHOLDER_SVG, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
