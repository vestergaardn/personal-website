"use client";

import { AnimatePresence } from "motion/react";
import { GitHubHoverCard } from "./GitHubHoverCard";
import {
  useFloatingHoverCard,
  useHoverCardTrigger,
} from "./useHoverCard";
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
  const canShowCard = profile !== null && contributions !== null;
  const {
    open,
    triggerRef,
    setTriggerRef,
    cardRef,
    handleEnter,
    handleLeave,
    handleBlur,
    handlePointerDown,
    handleTriggerClick,
  } = useHoverCardTrigger({ enabled: canShowCard });
  const floatingStyle = useFloatingHoverCard({
    open: open && canShowCard,
    triggerRef,
    cardRef,
    width: 267,
    placement: "above",
  });

  return (
    <span
      ref={setTriggerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleBlur}
      onPointerDown={handlePointerDown}
    >
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#ffffff] hover:text-[#ffffff]"
        onClick={handleTriggerClick}
      >
        my work on GitHub
      </a>
      <AnimatePresence>
        {open && canShowCard && (
          <GitHubHoverCard
            profile={profile}
            contributions={contributions}
            cardRef={cardRef}
            style={floatingStyle}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
