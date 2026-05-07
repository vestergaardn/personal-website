"use client";

import { AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import type { CSSProperties, MouseEvent, ReactNode, Ref } from "react";
import {
  useFloatingHoverCard,
  useHoverCardTrigger,
  type HoverCardPlacement,
} from "./useHoverCard";

type HoverPreviewCardProps = {
  cardRef: Ref<HTMLDivElement>;
  style: CSSProperties;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

type HoverPreviewTriggerProps = {
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function HoverPreview({
  enabled = true,
  width,
  height,
  placement,
  gap,
  margin,
  className,
  wrapper = "span",
  trigger,
  card,
}: {
  enabled?: boolean;
  width: number;
  height?: number;
  placement: HoverCardPlacement;
  gap?: number;
  margin?: number;
  className?: string;
  wrapper?: "span" | "div";
  trigger: (props: HoverPreviewTriggerProps) => ReactNode;
  card: (props: HoverPreviewCardProps) => ReactNode;
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
  } = useHoverCardTrigger({ enabled });
  const floatingStyle = useFloatingHoverCard({
    open: open && enabled,
    triggerRef,
    cardRef,
    width,
    height,
    placement,
    gap,
    margin,
  });
  const Wrapper = wrapper;
  const preview = (
    <AnimatePresence>
      {open &&
        enabled &&
        card({
          cardRef,
          style: floatingStyle,
          onMouseEnter: handleEnter,
          onMouseLeave: handleLeave,
        })}
    </AnimatePresence>
  );

  return (
    <Wrapper
      ref={setTriggerRef}
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleBlur}
      onPointerDown={handlePointerDown}
    >
      {trigger({ onClick: handleTriggerClick })}
      {typeof document === "undefined"
        ? null
        : createPortal(preview, document.body)}
    </Wrapper>
  );
}
