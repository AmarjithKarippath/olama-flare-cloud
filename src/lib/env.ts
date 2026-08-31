export function getEnv() {
  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? "2048");
  return {
    adminPassword: process.env.ADMIN_PASSWORD?.trim() || "",
    sessionSecret:
      process.env.SESSION_SECRET?.trim() ||
      process.env.ADMIN_PASSWORD?.trim() ||
      "dev-insecure-secret",
    appUrl: (process.env.APP_URL ?? "http://localhost").replace(/\/$/, ""),
    maxUploadMb: Number.isFinite(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb : 2048,
    ffmpegPath: process.env.FFMPEG_PATH,
  };
}
