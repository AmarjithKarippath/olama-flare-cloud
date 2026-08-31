import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { waitlist, type WaitlistEntry } from "./schema";

export function insertWaitlist(entry: WaitlistEntry): void {
  db().insert(waitlist).values(entry).run();
}

export function listWaitlist(): WaitlistEntry[] {
  return db().select().from(waitlist).orderBy(desc(waitlist.createdAt)).all();
}

export function getWaitlist(id: string): WaitlistEntry | undefined {
  return db().select().from(waitlist).where(eq(waitlist.id, id)).get();
}

export function findWaitlistByEmailPlatform(email: string, platform: string): WaitlistEntry | undefined {
  return db()
    .select()
    .from(waitlist)
    .where(and(eq(waitlist.email, email), eq(waitlist.platform, platform)))
    .get();
}

export function updateWaitlist(id: string, values: Partial<WaitlistEntry>): void {
  db().update(waitlist).set(values).where(eq(waitlist.id, id)).run();
}
