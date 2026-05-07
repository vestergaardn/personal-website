"use client";

import { PostbuddyHoverCard } from "./PostbuddyHoverCard";
import {
  useFloatingHoverCard,
  useHoverCardTrigger,
} from "./useHoverCard";

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
  } = useHoverCardTrigger();
  const floatingStyle = useFloatingHoverCard({
    open,
    triggerRef,
    cardRef,
    width: 200,
    height: 224,
    placement: "right",
    gap: 24,
  });

  return (
    <div
      ref={setTriggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleBlur}
      onPointerDown={handlePointerDown}
    >
      <a
        href={href}
        className="timeline-row"
        onClick={handleTriggerClick}
      >
        <span className="timeline-year">
          {year}
        </span>
        <span
          className="timeline-slash"
          aria-hidden
        >
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
        <span className="timeline-type">
          {type}
        </span>
      </a>
      <PostbuddyHoverCard
        href={href}
        open={open}
        cardRef={cardRef}
        style={floatingStyle}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      />
    </div>
  );
}
