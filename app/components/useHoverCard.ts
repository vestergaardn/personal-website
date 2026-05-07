"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";

export type HoverCardPlacement = "above" | "right";

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function isCoarsePointer(pointerType: string | null) {
  if (pointerType === "touch" || pointerType === "pen") return true;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export function useHoverCardTrigger({ enabled = true } = {}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerType = useRef<string | null>(null);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const handleEnter = useCallback(() => {
    if (!enabled) return;
    clearLeaveTimer();
    setOpen(true);
  }, [clearLeaveTimer, enabled]);

  const handleLeave = useCallback(() => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setOpen(false), 60);
  }, [clearLeaveTimer]);

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return;
      }

      handleLeave();
    },
    [handleLeave]
  );

  const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    lastPointerType.current = event.pointerType;
  }, []);

  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const handleTriggerClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!enabled || !isCoarsePointer(lastPointerType.current)) return;

      event.preventDefault();
      handleEnter();
    },
    [enabled, handleEnter]
  );

  useEffect(() => {
    if (!open) return;

    const handleDocumentPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (cardRef.current?.contains(target)) return;

      setOpen(false);
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [open]);

  useEffect(() => {
    return clearLeaveTimer;
  }, [clearLeaveTimer]);

  return {
    open,
    setOpen,
    triggerRef,
    setTriggerRef,
    cardRef,
    handleEnter,
    handleLeave,
    handleBlur,
    handlePointerDown,
    handleTriggerClick,
  };
}

export function useFloatingHoverCard({
  open,
  triggerRef,
  cardRef,
  width,
  height,
  placement,
  gap = 10,
  margin = 16,
}: {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  cardRef: RefObject<HTMLDivElement | null>;
  width: number;
  height?: number;
  placement: HoverCardPlacement;
  gap?: number;
  margin?: number;
}) {
  const [style, setStyle] = useState<CSSProperties>(() => ({
    position: "fixed",
    left: 0,
    top: 0,
    width,
    visibility: "hidden",
  }));

  const updatePosition = useCallback(() => {
    if (!open || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = Math.min(width, viewportWidth - margin * 2);
    const cardHeight = cardRect?.height || height || 0;
    const canUseRight =
      placement === "right" &&
      triggerRect.right + gap + cardWidth + margin <= viewportWidth;

    let left: number;
    let top: number;

    if (canUseRight) {
      left = triggerRect.right + gap;
      top = clamp(
        triggerRect.top,
        margin,
        viewportHeight - cardHeight - margin
      );
    } else {
      left = clamp(
        triggerRect.left + triggerRect.width / 2 - cardWidth / 2,
        margin,
        viewportWidth - cardWidth - margin
      );

      const aboveTop = triggerRect.top - cardHeight - gap;
      const belowTop = triggerRect.bottom + gap;
      top =
        aboveTop >= margin
          ? aboveTop
          : clamp(belowTop, margin, viewportHeight - cardHeight - margin);
    }

    setStyle({
      position: "fixed",
      left,
      top,
      width: cardWidth,
      visibility: "visible",
    });
  }, [cardRef, gap, height, margin, open, placement, triggerRef, width]);

  useLayoutEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  return style;
}
