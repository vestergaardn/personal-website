"use client";

import { HoverPreview } from "./HoverPreview";
import { PostbuddyHoverCard } from "./PostbuddyHoverCard";

export function PostbuddyTimelineRow({
  project,
  type,
  category,
  href,
}: {
  project: string;
  type: string;
  category: string;
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
          <span className="timeline-project">
            {project}
            <span className="timeline-chip">{category}</span>
          </span>
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
