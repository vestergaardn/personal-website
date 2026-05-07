"use client";

import { GitHubHoverCard } from "./GitHubHoverCard";
import { HoverPreview } from "./HoverPreview";
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

  return (
    <HoverPreview
      enabled={canShowCard}
      width={267}
      placement="above"
      className="relative"
      trigger={({ onClick }) => (
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ffffff] hover:text-[#ffffff]"
          onClick={onClick}
        >
          my work on GitHub
        </a>
      )}
      card={({ cardRef, style, onMouseEnter, onMouseLeave }) =>
        profile &&
        contributions && (
          <GitHubHoverCard
            profile={profile}
            contributions={contributions}
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
