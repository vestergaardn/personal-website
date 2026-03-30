"use client";

import { useEffect } from "react";
import { usePageFlip } from "../hooks/usePageFlip";
import { BookPage } from "./BookPage";
import { PageIndicator } from "./PageIndicator";
import { bookContent } from "../data/book-content";

export function Book() {
  const { containerRef, flipNext, flipPrev, currentPage, totalPages } =
    usePageFlip({
      pageCount: bookContent.length,
    });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flipNext();
      if (e.key === "ArrowLeft") flipPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipNext, flipPrev]);

  // Compute page numbers for indicator
  const leftPageNum = bookContent[currentPage]?.pageNumber ?? 1;
  const rightPageNum =
    currentPage + 1 < totalPages
      ? bookContent[currentPage + 1]?.pageNumber ?? leftPageNum + 1
      : leftPageNum + 1;

  return (
    <div className="book-scene">
      <div className="book-container">
        {/* Page edge effect - left */}
        <div className="book-edge book-edge-left" />

        {/* The book */}
        <div ref={containerRef} className="book-wrapper">
          {bookContent.map((page, i) => (
            <BookPage
              key={page.pageNumber}
              page={page}
              side={i % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>

        {/* Page edge effect - right */}
        <div className="book-edge book-edge-right" />
      </div>

      <PageIndicator leftPage={leftPageNum} rightPage={rightPageNum} />
    </div>
  );
}
