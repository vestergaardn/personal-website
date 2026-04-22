"use client";

import { motion } from "motion/react";
import { ContributionGraph } from "./ContributionGraph";
import type { ContributionDay, GitHubProfile } from "../lib/github";

export function GitHubHoverCard({
  profile,
  contributions,
  onMouseEnter,
  onMouseLeave,
}: {
  profile: GitHubProfile;
  contributions: ContributionDay[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const daysMissed = contributions.filter((d) => d.level === 0).length;
  const statusLine = `${daysMissed} ${
    daysMissed === 1 ? "day" : "days"
  } missed building`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute bottom-full left-1/2 z-50 mb-[10px] -translate-x-1/2 rounded-[14px] bg-white p-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.05)] pointer-events-auto text-left"
      style={{ width: 267 }}
    >
      <ContributionGraph contributions={contributions} />
      <div className="mt-4 flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatarUrl}
          alt={profile.login}
          width={40}
          height={40}
          className="h-10 w-10 flex-shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-gray-900">
            <a
              href="https://github.com/vestergaardn"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:no-underline"
            >
              {profile.login}
            </a>
          </p>
          <p className="mt-0.5 text-sm leading-snug text-gray-600">
            {statusLine}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
