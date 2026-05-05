"use client";

import { useRef, useState } from "react";
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
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <a
        href={href}
        className="flex items-center gap-0 px-2 py-1.5 no-underline text-[#ffffff] hover:bg-[var(--row-hover)]"
      >
        <span className="w-[37px] shrink-0 font-[var(--font-geist-mono)] text-[#ffffff]">
          {year}
        </span>
        <span
          className="flex w-5 shrink-0 items-center justify-center"
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.4995 5.66968L7.49951 14.3299"
              stroke="var(--slash-muted)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="flex-1">{project}</span>
        <span className="shrink-0 text-[#ffffff]">
          {type}
        </span>
      </a>
      <PostbuddyHoverCard
        href={href}
        open={open}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      />
    </div>
  );
}
