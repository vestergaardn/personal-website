"use client";

import { motion } from "motion/react";
import { StravaCalendar } from "./StravaCalendar";
import type { StravaSummary } from "../lib/strava";

export function StravaHoverCard({
  summary,
  onMouseEnter,
  onMouseLeave,
}: {
  summary: StravaSummary;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute bottom-full left-1/2 z-50 mb-[10px] -translate-x-1/2 rounded-[14px] bg-white p-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.05)] pointer-events-auto text-left"
      style={{ width: 280 }}
    >
      <StravaCalendar summary={summary} />
    </motion.div>
  );
}
