"use client";

import { HoverPreview } from "./HoverPreview";
import { PostbuddyHoverCard } from "./PostbuddyHoverCard";

export function PostbuddyTimelineRow({
  year,
  project,
  type,
  href,
}: {
  year: string;
  project: string;
  type: string;
  href: string;
}) {
  return (
    <HoverPreview
      wrapper="div"
      width={200}
      height={224}
      placement="right"
      gap={24}
      trigger={({ onClick }) => (
        <a href={href} className="timeline-row" onClick={onClick}>
          <span className="timeline-year">{year}</span>
          <span className="timeline-slash" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.4995 5.66968L7.49951 14.3299"
                stroke="var(--slash-muted)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="timeline-project">{project}</span>
          <span className="timeline-type">{type}</span>
        </a>
      )}
      card={({ cardRef, style, onMouseEnter, onMouseLeave }) => (
        <PostbuddyHoverCard
          href={href}
          cardRef={cardRef}
          style={style}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )}
    />
  );
}
