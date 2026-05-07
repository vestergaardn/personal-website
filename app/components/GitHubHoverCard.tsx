"use client";

import { motion } from "motion/react";
import type { CSSProperties, Ref } from "react";
import { ContributionGraph } from "./ContributionGraph";
import {
  getVisibleContributions,
  type ContributionDay,
  type GitHubProfile,
} from "../lib/github";

export function GitHubHoverCard({
  profile,
  contributions,
  cardRef,
  style,
  onMouseEnter,
  onMouseLeave,
}: {
  profile: GitHubProfile;
  contributions: ContributionDay[];
  cardRef?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const daysMissed = getVisibleContributions(contributions).filter(
    (d) => d.level === 0
  ).length;
  const statusLine = `${daysMissed} ${
    daysMissed === 1 ? "day" : "days"
  } missed building.`;
  return (
    <motion.div
      ref={cardRef}
      data-hover-card="github"
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="z-50 rounded-[14px] bg-white p-4 text-left text-[#24292f] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.05)] pointer-events-auto"
      style={{ width: 267, transformOrigin: "bottom center", ...style }}
    >
      <ContributionGraph contributions={contributions} />
      <div className="mt-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-[#24292f]">
            <a
              href="https://github.com/vestergaardn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline hover:text-inherit hover:no-underline"
            >
              {profile.login}
            </a>
          </p>
          <p className="hover-card-body mt-0.5">
            {statusLine}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
