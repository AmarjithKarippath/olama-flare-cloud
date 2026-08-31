export const PLATFORMS = ["mac", "windows", "linux", "chrome"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  mac: "Download for Mac",
  windows: "Download for Windows",
  linux: "Download for Linux",
  chrome: "Add to Chrome extension",
};

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}
