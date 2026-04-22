"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { StravaHoverCard } from "./StravaHoverCard";
import type { StravaSummary } from "../lib/strava";

export function StravaLink({
  href,
  summary,
  children,
}: {
  href: string;
  summary: StravaSummary | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearLeaveTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setOpen(false), 60);
  };

  return (
    <span
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#0000EE] hover:text-[#0000EE]"
      >
        {children}
      </a>
      <AnimatePresence>
        {open && summary && (
          <StravaHoverCard
            summary={summary}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
