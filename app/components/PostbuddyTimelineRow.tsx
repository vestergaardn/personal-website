"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { PostbuddyHoverCard } from "./PostbuddyHoverCard";

export function PostbuddyTimelineRow({
  year,
  project,
  type,
  href,
}: {
  year: string;
  project: string;
  type: string;
  href: string;
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
    <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a
        href={href}
        className="flex items-center gap-0 px-2 py-1.5 no-underline text-[#000000] hover:bg-[rgba(17,17,17,0.03)] dark:text-[#ffffff] dark:hover:bg-[rgba(255,255,255,0.04)]"
      >
        <span className="w-[37px] shrink-0 font-[var(--font-geist-mono)] text-[#9d9d9d] dark:text-[#696969]">
          {year}
        </span>
        <span
          className="flex w-5 shrink-0 items-center justify-center"
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.4995 5.66968L7.49951 14.3299"
              stroke="rgba(17,17,17,0.3)"
              strokeWidth="1.3"
              strokeLinecap="round"
              className="dark:stroke-[rgba(255,255,255,0.3)]"
            />
          </svg>
        </span>
        <span className="flex-1">{project}</span>
        <span className="shrink-0 text-[#9d9d9d] dark:text-[#696969]">
          {type}
        </span>
      </a>
      <AnimatePresence>
        {open && (
          <PostbuddyHoverCard
            href={href}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
