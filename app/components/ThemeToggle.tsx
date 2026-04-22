"use client";

import { useState, useSyncExternalStore } from "react";
import { defineSound, ensureReady } from "@web-kits/audio";

const playPop = defineSound({
  source: { type: "sine", frequency: { start: 400, end: 150 } },
  envelope: { decay: 0.05 },
  gain: 0.35,
});

type Theme = "light" | "dark";

function resolveInitialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let themeSnapshot: Theme | null = null;
const themeListeners = new Set<() => void>();

function notify() {
  themeListeners.forEach((l) => l());
}

function subscribeTheme(callback: () => void) {
  if (themeSnapshot === null) {
    themeSnapshot = resolveInitialTheme();
    document.documentElement.dataset.theme = themeSnapshot;
  }
  themeListeners.add(callback);
  queueMicrotask(callback);
  return () => {
    themeListeners.delete(callback);
  };
}

const getThemeSnapshot = () => themeSnapshot;
const getThemeServerSnapshot = (): Theme | null => null;

function setTheme(next: Theme) {
  themeSnapshot = next;
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  notify();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const [hovered, setHovered] = useState(false);

  const mounted = theme !== null;
  const dark = theme === "dark";

  const toggle = () => {
    setTheme(dark ? "light" : "dark");
    void ensureReady().then(() => playPop());
  };

  const hoverWidth = dark ? 23 : 26;
  const thumbWidth = hovered ? hoverWidth : 20;
  const thumbLeft = mounted && dark ? 52 - thumbWidth - 4 : 4;

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-6 w-[52px] shrink-0 items-center justify-between rounded-full bg-[rgba(17,17,17,0.06)] px-1 transition-colors dark:bg-[#262626]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-0.5 h-5 rounded-full bg-white shadow-sm dark:bg-[#464646]"
        style={{
          left: `${thumbLeft}px`,
          width: `${thumbWidth}px`,
          transition:
            "left 500ms cubic-bezier(0.34, 1.3, 0.64, 1), width 500ms cubic-bezier(0.34, 1.3, 0.64, 1)",
        }}
      />
      <span className="relative z-10 flex h-5 w-5 items-center justify-center">
        <SunIcon active={!dark} />
      </span>
      <span className="relative z-10 flex h-5 w-5 items-center justify-center">
        <MoonIcon active={dark} />
      </span>
    </button>
  );
}

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="currentColor"
      viewBox="0 0 16 16"
      className={active ? "text-[#111]" : "text-[rgba(17,17,17,0.45)] dark:text-[rgba(255,255,255,0.5)]"}
    >
      <path d="M10.65 8a2.65 2.65 0 1 0-5.3 0 2.65 2.65 0 0 0 5.3 0Zm1.5 0a4.15 4.15 0 1 1-8.3 0 4.15 4.15 0 0 1 8.3 0Zm-4.9-6.495a.75.75 0 0 1 1.5 0v1.5h-1.5v-1.5Zm0 12.995a.75.75 0 0 0 1.5 0V13h-1.5v1.5Zm7.253-7.253a.75.75 0 0 1 0 1.5h-1.5v-1.5h1.5Zm-12.996 0a.75.75 0 1 0 0 1.5h1.5v-1.5h-1.5Zm11.626 4.816a.75.75 0 1 1-1.06 1.06l-1.061-1.06 1.06-1.06 1.061 1.06ZM3.944 2.874a.75.75 0 0 0-1.06 1.06l1.06 1.061 1.061-1.06-1.06-1.06Zm-1.06 9.189a.75.75 0 1 0 1.06 1.06l1.061-1.06-1.06-1.06-1.061 1.06Zm9.189-9.189a.75.75 0 0 1 1.06 1.06l-1.06 1.061-1.061-1.06 1.06-1.06Z" />
    </svg>
  );
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="currentColor"
      viewBox="0 0 16 16"
      className={active ? "text-white" : "text-[rgba(17,17,17,0.45)] dark:text-[rgba(255,255,255,0.5)]"}
    >
      <path d="M6.93 2.622a.75.75 0 0 1 .862.96c-.32 1.025-.537 2.662.714 3.913 1.25 1.25 2.886 1.033 3.912.712a.75.75 0 0 1 .959.862A5.484 5.484 0 0 1 8 13.484 5.484 5.484 0 0 1 6.93 2.622Zm-.855 1.893a3.981 3.981 0 1 0 5.408 5.408c-1.212.12-2.748-.079-4.038-1.368-1.29-1.29-1.49-2.827-1.37-4.04Z" />
    </svg>
  );
}
