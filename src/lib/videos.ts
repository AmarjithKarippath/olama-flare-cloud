import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { videos, type Video } from "./schema";

export function getVideo(id: string): Video | undefined {
  return db().select().from(videos).where(eq(videos.id, id)).get();
}

export function listVideos(): Video[] {
  return db().select().from(videos).orderBy(desc(videos.createdAt)).all();
}

export function insertVideo(video: Video): void {
  db().insert(videos).values(video).run();
}

export function deleteVideoRow(id: string): void {
  db().delete(videos).where(eq(videos.id, id)).run();
}
