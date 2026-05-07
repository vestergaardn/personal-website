"use client";

import { motion } from "motion/react";
import type { CSSProperties, Ref } from "react";
import { StravaCalendar } from "./StravaCalendar";
import type { StravaSummary } from "../lib/strava";

export function StravaHoverCard({
  href,
  summary,
  cardRef,
  style,
  onMouseEnter,
  onMouseLeave,
}: {
  href: string;
  summary: StravaSummary;
  cardRef?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <motion.div
      ref={cardRef}
      data-hover-card="strava"
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="z-50 rounded-[14px] bg-white p-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.05)] pointer-events-auto text-left"
      style={{ width: 280, transformOrigin: "bottom center", ...style }}
    >
      <StravaCalendar summary={summary} profileHref={href} />
    </motion.div>
  );
}
