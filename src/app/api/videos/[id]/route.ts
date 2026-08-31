import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { isAuthorizedRequest } from "@/lib/auth";
import { isValidVideoId } from "@/lib/ids";
import { posterFilePath, videoFilePath } from "@/lib/storage";
import { deleteVideoRow, getVideo } from "@/lib/videos";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorizedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidVideoId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const video = getVideo(id);
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await fs.rm(videoFilePath(video), { force: true });
  await fs.rm(posterFilePath(id), { force: true });
  deleteVideoRow(id);
  return NextResponse.json({ ok: true });
}
