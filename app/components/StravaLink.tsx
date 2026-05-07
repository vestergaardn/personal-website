"use client";

import { AnimatePresence } from "motion/react";
import { StravaHoverCard } from "./StravaHoverCard";
import {
  useFloatingHoverCard,
  useHoverCardTrigger,
} from "./useHoverCard";
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
  const canShowCard = summary !== null;
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
    width: 280,
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
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#ffffff] hover:text-[#ffffff]"
        onClick={handleTriggerClick}
      >
        {children}
      </a>
      <AnimatePresence>
        {open && canShowCard && (
          <StravaHoverCard
            href={href}
            summary={summary}
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
