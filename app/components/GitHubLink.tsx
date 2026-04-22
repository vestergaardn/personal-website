"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { GitHubHoverCard } from "./GitHubHoverCard";
import type { ContributionDay, GitHubProfile } from "../lib/github";

export function GitHubLink({
  username,
  profile,
  contributions,
}: {
  username: string;
  profile: GitHubProfile | null;
  contributions: ContributionDay[] | null;
}) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canShowCard = profile !== null && contributions !== null;

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
    >
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
      <AnimatePresence>
        {open && canShowCard && (
          <GitHubHoverCard
            profile={profile}
            contributions={contributions}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
