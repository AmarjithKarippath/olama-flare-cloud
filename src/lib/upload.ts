import Busboy from "busboy";
import fs from "node:fs";
import { Writable } from "node:stream";
import { Readable } from "node:stream";

export type UploadedFile = {
  title: string;
  originalName: string;
  mimeType: string;
  tmpPath: string;
  sizeBytes: number;
};

const ALLOWED_EXT = new Map<string, string>([
  [".mp4", "video/mp4"],
  [".mov", "video/quicktime"],
  [".webm", "video/webm"],
  [".m4v", "video/mp4"],
]);

const ALLOWED_MIME = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"]);

export function extensionFromName(name: string): string {
  const match = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] ?? "";
}

export function mimeFromUpload(filename: string, mimeType: string): string | null {
  const ext = extensionFromName(filename);
  const fromExt = ALLOWED_EXT.get(ext);
  if (fromExt) {
    return fromExt;
  }
  if (ALLOWED_MIME.has(mimeType)) {
    return mimeType === "video/x-m4v" ? "video/mp4" : mimeType;
  }
  return null;
}

export function parseMultipartVideo(
  request: Request,
  tmpPath: string,
  maxBytes: number,
): Promise<UploadedFile> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return Promise.reject(new Error("Expected multipart form data"));
  }
  if (!request.body) {
    return Promise.reject(new Error("Missing request body"));
  }

  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: { "content-type": contentType },
      limits: { files: 1, fileSize: maxBytes, fields: 10 },
    });

    let title = "";
    let originalName = "";
    let mimeType = "";
    let sizeBytes = 0;
    let truncated = false;
    let sawFile = false;
    let settled = false;

    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      fs.rm(tmpPath, { force: true }, () => {
        reject(error);
      });
    };

    busboy.on("field", (name, value) => {
      if (name === "title") {
        title = value.trim();
      }
    });

    busboy.on("file", (_name, file, info) => {
      sawFile = true;
      originalName = info.filename || "upload";
      mimeType = info.mimeType || "";
      const out = fs.createWriteStream(tmpPath);
      file.on("data", (chunk: Buffer) => {
        sizeBytes += chunk.length;
      });
      file.on("limit", () => {
        truncated = true;
      });
      file.pipe(out);
      out.on("error", fail);
    });

    busboy.on("error", (error: Error) => fail(error));
    busboy.on("finish", () => {
      if (settled) {
        return;
      }
      if (!sawFile) {
        fail(new Error("No video file in upload"));
        return;
      }
      if (truncated) {
        fail(new Error("File too large"));
        return;
      }
      settled = true;
      resolve({
        title,
        originalName,
        mimeType,
        tmpPath,
        sizeBytes,
      });
    });

    const nodeReadable = Readable.fromWeb(request.body as import("node:stream/web").ReadableStream);
    nodeReadable.on("error", fail);
    nodeReadable.pipe(busboy as unknown as Writable);
  });
}
