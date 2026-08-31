import type { Platform } from "@/lib/platforms";

export function PlatformIcon({
  platform,
  className = "size-5",
}: {
  platform: Platform;
  className?: string;
}) {
  switch (platform) {
    case "mac":
      return <AppleIcon className={className} />;
    case "windows":
      return <WindowsIcon className={className} />;
    case "linux":
      return <LinuxIcon className={className} />;
    case "chrome":
      return <ChromeIcon className={className} />;
  }
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.37 12.86c.03 3.23 2.83 4.31 2.86 4.32-.02.08-.45 1.54-1.47 3.05-.89 1.3-1.81 2.6-3.26 2.62-1.43.03-1.89-.85-3.52-.85s-2.14.82-3.5.88c-1.4.05-2.47-1.41-3.36-2.71C2.2 17.32.8 12.46 2.68 9.19c.93-1.63 2.6-2.66 4.4-2.69 1.37-.03 2.67.93 3.52.93.84 0 2.42-1.14 4.08-.98.69.03 2.64.28 3.89 2.11-.1.06-2.32 1.36-2.2 4.3ZM14.4 5.07c.78-.95 1.31-2.27 1.16-3.59-1.12.05-2.48.75-3.28 1.69-.72.84-1.35 2.19-1.18 3.48 1.25.1 2.53-.64 3.3-1.58Z" />
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 5.4 10.8 4.3v7.2H3V5.4Zm8.2-.1L21 3.8v7.7h-9.8V5.3ZM3 13.1h7.8v7.2L3 19.2v-6.1Zm8.2 0H21v7.7l-9.8-1.4v-6.3Z" />
    </svg>
  );
}

function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 3.2c1.2 0 2.2 1.1 2.2 2.6S13.2 8.4 12 8.4 9.8 7.3 9.8 5.8 10.8 3.2 12 3.2Zm0 6.2c2.6 0 4.8 1.8 5.3 4.3.2 1.1-.1 2.2-.7 3.1l1.5 3.1c.2.4 0 .8-.4 1-.8.3-1.8.5-2.8.5-1 0-1.7-.3-2.2-.8-.5.5-1.2.8-2.2.8-1 0-2-.2-2.8-.5-.4-.2-.6-.6-.4-1l1.5-3.1c-.6-.9-.9-2-.7-3.1.5-2.5 2.7-4.3 5.3-4.3Zm-1.5-3.4c.3.3.3.7 0 1s-.8.3-1.1 0-.3-.8 0-1.1.8-.2 1.1.1Zm3.1 0c.3.3.3.8 0 1.1s-.8.3-1.1 0-.3-.7 0-1 .8-.3 1.1-.1Z" />
    </svg>
  );
}

function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#4285F4" />
      <path d="M12 12 4.4 6.4A10 10 0 0 1 12 2c4.1 0 7.6 2.5 9.1 6H12Z" fill="#EA4335" />
      <path d="M12 12v10a10 10 0 0 0 8.6-5 10 10 0 0 0 .5-5H12Z" fill="#34A853" />
      <path d="M12 12 4.4 6.4A10 10 0 0 0 12 22V12Z" fill="#FBBC05" />
      <circle cx="12" cy="12" r="4.2" fill="#fff" />
      <circle cx="12" cy="12" r="3.2" fill="#4285F4" />
    </svg>
  );
}
