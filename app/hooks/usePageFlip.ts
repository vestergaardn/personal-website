"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PageFlip } from "page-flip";

interface UsePageFlipOptions {
  pageCount: number;
  width?: number;
  height?: number;
}

export function usePageFlip({ pageCount, width = 550, height = 733 }: UsePageFlipOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    // Destroy previous instance (React 19 strict mode)
    if (pageFlipRef.current) {
      pageFlipRef.current.destroy();
      pageFlipRef.current = null;
    }

    const pf = new PageFlip(containerRef.current, {
      width,
      height,
      size: "stretch",
      maxShadowOpacity: 0.5,
      showCover: false,
      mobileScrollSupport: false,
      useMouseEvents: true,
      flippingTime: 800,
      usePortrait: false,
      startZIndex: 0,
      autoSize: true,
      drawShadow: true,
      startPage: 0,
    });

    const pages = containerRef.current.querySelectorAll(".book-page");
    if (pages.length > 0) {
      pf.loadFromHTML(pages as NodeListOf<HTMLElement>);
    }

    pf.on("flip", (e) => {
      setCurrentPage(e.data as number);
    });

    pageFlipRef.current = pf;

    return () => {
      pf.destroy();
      pageFlipRef.current = null;
    };
  }, [width, height, pageCount]);

  const flipNext = useCallback(() => {
    pageFlipRef.current?.flipNext();
  }, []);

  const flipPrev = useCallback(() => {
    pageFlipRef.current?.flipPrev();
  }, []);

  return { containerRef, flipNext, flipPrev, currentPage, totalPages: pageCount };
}
