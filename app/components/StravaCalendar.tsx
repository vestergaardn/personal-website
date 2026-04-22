"use client";

import { motion } from "motion/react";
import type { StravaDay, StravaSport, StravaSummary } from "../lib/strava";

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

const SHIELD_PATH =
  "M 8 3 L 56 3 Q 61 3 61 8 L 61 48 Q 61 56 56 60 L 36 71 Q 32 73 28 71 L 8 60 Q 3 56 3 48 L 3 8 Q 3 3 8 3 Z";

function StravaShield({ src }: { src: string }) {
  return (
    <svg
      height="38"
      viewBox="0 0 64 76"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <defs>
        <clipPath id="strava-shield-clip">
          <path d={SHIELD_PATH} />
        </clipPath>
        <linearGradient
          id="strava-shield-stroke"
          x1="0"
          y1="0"
          x2="0"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FC5200" />
          <stop offset="55%" stopColor="#B83A02" />
          <stop offset="100%" stopColor="#1F0A04" />
        </linearGradient>
      </defs>
      <image
        href={src}
        x="0"
        y="0"
        width="64"
        height="74"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#strava-shield-clip)"
      />
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="url(#strava-shield-stroke)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SportIcon({ sport }: { sport: StravaSport }) {
  switch (sport) {
    case "ride":
      return (
        <svg
          width="15"
          height="10"
          viewBox="0 0 48 31"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 0H18V3H14.937L16.354 6.007C16.403 6.002 16.451 6 16.5 6H30.283L28.619 2.087C28.422 1.624 28.471 1.092 28.748 0.672C29.026 0.252 29.496 0 30 0H39.5C41.985 0 44 2.015 44 4.5C44 6.985 41.985 9 39.5 9H38V6H39.5C40.328 6 41 5.328 41 4.5C41 3.672 40.328 3 39.5 3H32.267L36.21 12.278C41.019 11.083 45.938 13.784 47.511 18.483C49.083 23.182 46.78 28.3 42.22 30.239C37.661 32.179 32.376 30.288 30.082 25.896C27.787 21.505 29.254 16.087 33.45 13.452L32.01 10.066L23.22 22.372C22.939 22.766 22.484 23 22 23H18.882C18.163 27.534 14.236 31 9.5 31C4.253 31 0 26.747 0 21.5C0 16.253 4.253 12 9.5 12C10.495 12 11.454 12.153 12.355 12.436L14.266 8.613L11.62 3H8V0ZM15.894 12.066L11.927 20H19.634L15.894 12.066ZM22.266 18.546L29.086 9H17.766L22.266 18.547V18.546ZM9.5 15C6.106 15.001 3.284 17.613 3.021 20.997C2.758 24.381 5.143 27.397 8.497 27.922C11.85 28.446 15.043 26.303 15.826 23H9.5C8.98 23 8.498 22.731 8.224 22.289C7.951 21.847 7.926 21.295 8.158 20.83L10.988 15.171C10.5 15.057 10.001 15 9.5 15ZM34.645 16.266C31.99 18.222 31.221 21.857 32.855 24.721C34.49 27.585 38.01 28.771 41.045 27.48C44.08 26.19 45.667 22.831 44.737 19.667C43.807 16.503 40.656 14.536 37.405 15.092L40.467 22.294L37.707 23.467L34.645 16.266Z" />
        </svg>
      );
    case "run":
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 48 46"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.56 0C16.307 0 15.091 0.428 14.114 1.213L7.426 6.59C7.377 6.63 7.32 6.66 7.259 6.679L1.063 8.565C0.432 8.757 0 9.34 0 10C0 13.132 0.428 15.467 1.205 17.328C1.99 19.209 3.091 20.503 4.265 21.598C4.858 22.149 5.443 22.637 6.016 23.115C7.736 24.547 9.35 25.893 10.742 28.622C12.809 33.719 15.462 38.102 19.541 41.195C23.656 44.316 29.055 46 36.368 46C40.641 46 43.478 44.82 45.296 43.086C47.096 41.37 47.71 39.293 47.908 37.852C48.148 36.115 47.21 34.668 46.112 33.799L38.263 27.587C37.87 27.276 37.58 26.855 37.43 26.377L31.163 6.45C30.705 4.992 29.353 4 27.825 4H24.983C24.142 4 23.329 4.303 22.693 4.854L21.02 6.3L19.78 1.7C19.509 0.697 18.6 0.001 17.561 0H17.56ZM15.993 3.552C16.298 3.307 16.656 3.137 17.039 3.055L19.369 11.699L24.656 7.122C24.747 7.043 24.863 7 24.983 7H27.824C28.042 7 28.235 7.142 28.301 7.35L30.707 15H25V18H31.65L32.594 21H27V24H33.538L34.568 27.277C34.899 28.328 35.537 29.255 36.401 29.939L44.076 36.014C43.748 36.099 43.366 36.191 42.936 36.284C41.27 36.64 38.876 37 36 37C31.992 37 29.468 36.093 27.623 34.66C25.733 33.19 24.387 31.045 22.967 28.204C22.523 27.318 22.079 26.374 21.611 25.382C19.271 20.416 16.365 14.25 10.291 8.135L15.993 3.552ZM7.613 9.705C13.664 15.593 16.445 21.478 18.857 26.582C19.339 27.603 19.807 28.593 20.283 29.546C21.738 32.456 23.33 35.123 25.783 37.028C28.282 38.97 31.508 40 36 40C39.124 40 41.73 39.61 43.564 39.217C43.913 39.142 44.234 39.067 44.526 38.995C44.234 39.72 43.791 40.375 43.226 40.915C42.1 41.988 40.078 43 36.368 43C29.529 43 24.82 41.434 21.354 38.805C17.867 36.16 15.471 32.315 13.499 27.438C13.483 27.399 13.466 27.361 13.447 27.323C11.742 23.949 9.512 22.1 7.706 20.603C7.201 20.183 6.729 19.793 6.31 19.403C5.338 18.497 4.545 17.541 3.973 16.172C3.471 14.969 3.109 13.373 3.021 11.105L7.613 9.705Z" />
        </svg>
      );
    default:
      return <span className="block h-1 w-1 rounded-full bg-current" />;
  }
}

function DayCell({ cell }: { cell: StravaDay }) {
  if (cell.kind === "blank") {
    return <div className="aspect-square" />;
  }

  const hasActivity = cell.activities.length > 0;

  if (cell.isFuture && !hasActivity) {
    return <div className="aspect-square" />;
  }

  if (hasActivity) {
    const first = cell.activities[0];
    return (
      <div className="flex aspect-square items-center justify-center">
        <a
          href={`https://www.strava.com/activities/${first.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${first.sport} activity on Strava`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110"
        >
          <SportIcon sport={first.sport} />
        </a>
      </div>
    );
  }

  return (
    <div className="flex aspect-square items-center justify-center">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium ${
          cell.isToday
            ? "bg-gray-100 text-gray-400 ring-1 ring-gray-300"
            : "text-gray-400 ring-1 ring-gray-200"
        }`}
      >
        -
      </div>
    </div>
  );
}

export function StravaCalendar({ summary }: { summary: StravaSummary }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-gray-900">
        {summary.avatarUrl && summary.isPremium && (
          <StravaShield src={summary.avatarUrl} />
        )}
        <div>
          <div className="text-[12px] text-gray-500">Streak</div>
          <div className="text-[14px] font-semibold">
            {summary.streakWeeks} {summary.streakWeeks === 1 ? "week" : "weeks"}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-gray-500">Activities</div>
          <div className="text-[14px] font-semibold">
            {summary.totalActivities} total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1 text-[11px] font-medium text-gray-400">
        {DOW.map((label, i) => (
          <div key={i} className="flex justify-center">
            {label}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="grid grid-cols-7"
      >
        {summary.weeks.flat().map((cell, i) => (
          <DayCell key={i} cell={cell} />
        ))}
      </motion.div>
    </div>
  );
}
