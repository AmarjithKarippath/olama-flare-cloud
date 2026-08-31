"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function readTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode */
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next = readTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="pointer-events-auto flex size-10 items-center justify-center rounded-2xl border border-border bg-card/80 text-foreground shadow-sm backdrop-blur-md transition hover:border-zinc-400 hover:bg-surface dark:hover:border-zinc-500"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.64 5.64l1.56 1.56M16.8 16.8l1.56 1.56M5.64 18.36l1.56-1.56M16.8 7.2l1.56-1.56"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        d="M16.5 13.2A6.6 6.6 0 0 1 10.8 7.4 5.9 5.9 0 0 0 9 7a7 7 0 1 0 8.8 8.8 5.9 5.9 0 0 0-.4-1.8 6.5 6.5 0 0 1-.9.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
