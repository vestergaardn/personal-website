"use client";

import { HoverPreview } from "./HoverPreview";
import { StravaHoverCard } from "./StravaHoverCard";
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

  return (
    <HoverPreview
      enabled={canShowCard}
      width={280}
      placement="above"
      className="relative"
      trigger={({ onClick }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ffffff] hover:text-[#ffffff]"
          onClick={onClick}
        >
          {children}
        </a>
      )}
      card={({ cardRef, style, onMouseEnter, onMouseLeave }) =>
        summary && (
          <StravaHoverCard
            href={href}
            summary={summary}
            cardRef={cardRef}
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        )
      }
    />
  );
}
