import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { getEnv } from "./env";

const FFMPEG_CANDIDATES = [
  "ffmpeg",
  "/opt/homebrew/bin/ffmpeg",
  "/usr/local/bin/ffmpeg",
  "/usr/bin/ffmpeg",
];

const FFPROBE_CANDIDATES = [
  "ffprobe",
  "/opt/homebrew/bin/ffprobe",
  "/usr/local/bin/ffprobe",
  "/usr/bin/ffprobe",
];

let cachedFfmpeg: string | null | undefined;
let cachedFfprobe: string | null | undefined;

async function commandExists(bin: string): Promise<boolean> {
  try {
    await run(bin, ["-version"]);
    return true;
  } catch {
    return false;
  }
}

async function resolveBin(preferred: string | undefined, candidates: string[]): Promise<string | null> {
  const list = preferred ? [preferred, ...candidates] : candidates;
  for (const bin of list) {
    if (await commandExists(bin)) {
      return bin;
    }
  }
  return null;
}

async function ffmpegBin(): Promise<string | null> {
  if (cachedFfmpeg !== undefined) {
    return cachedFfmpeg;
  }
  cachedFfmpeg = await resolveBin(getEnv().ffmpegPath, FFMPEG_CANDIDATES);
  return cachedFfmpeg;
}

async function ffprobeBin(): Promise<string | null> {
  if (cachedFfprobe !== undefined) {
    return cachedFfprobe;
  }
  const ffmpeg = getEnv().ffmpegPath;
  const preferred = ffmpeg ? ffmpeg.replace(/ffmpeg$/, "ffprobe") : undefined;
  cachedFfprobe = await resolveBin(preferred, FFPROBE_CANDIDATES);
  return cachedFfprobe;
}

function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.slice(-4000) || `${command} exited ${code}`));
      }
    });
  });
}

export async function remuxFaststart(inputPath: string, outputPath: string): Promise<boolean> {
  const bin = await ffmpegBin();
  if (!bin) {
    return false;
  }
  try {
    await run(bin, [
      "-y",
      "-i",
      inputPath,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      outputPath,
    ]);
    return true;
  } catch {
    await fs.rm(outputPath, { force: true });
    return false;
  }
}

export async function extractPoster(inputPath: string, outputPath: string): Promise<boolean> {
  const bin = await ffmpegBin();
  if (!bin) {
    return false;
  }
  for (const seek of ["1", "0"]) {
    try {
      await run(bin, [
        "-y",
        "-ss",
        seek,
        "-i",
        inputPath,
        "-frames:v",
        "1",
        "-q:v",
        "3",
        outputPath,
      ]);
      return true;
    } catch {
      await fs.rm(outputPath, { force: true });
    }
  }
  return false;
}

export async function probeDurationSec(inputPath: string): Promise<number | null> {
  const bin = await ffprobeBin();
  if (!bin) {
    return null;
  }
  try {
    const out = await run(bin, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      inputPath,
    ]);
    const value = Number.parseFloat(out);
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }
    return Math.round(value);
  } catch {
    return null;
  }
}
