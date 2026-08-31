import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  durationSec: integer("duration_sec"),
  createdAt: integer("created_at").notNull(),
});

export const waitlist = sqliteTable("waitlist", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  platform: text("platform").notNull(),
  surveyStep: integer("survey_step").notNull(),
  useCase: text("use_case"),
  useCaseOther: text("use_case_other"),
  currentTool: text("current_tool"),
  currentToolOther: text("current_tool_other"),
  frustration: text("frustration"),
  frustrationOther: text("frustration_other"),
  shareWith: text("share_with"),
  price: text("price"),
  createdAt: integer("created_at").notNull(),
});

export type Video = typeof videos.$inferSelect;
export type WaitlistEntry = typeof waitlist.$inferSelect;
