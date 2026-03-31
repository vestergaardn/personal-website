import type { BookPageData } from "../data/book-content";

interface BookPageProps {
  page: BookPageData;
  side: "left" | "right";
}

export function BookPage({ page, side }: BookPageProps) {
  const firstParagraph = page.body[0] || "";
  const dropCapLetter = page.dropCap ? firstParagraph[0] : null;
  const firstParagraphRest = page.dropCap ? firstParagraph.slice(1) : firstParagraph;

  return (
    <div className="book-page" data-side={side}>
      <div className="book-page-inner">
        {page.chapterHeading && (
          <h2 className="book-chapter-heading">{page.chapterHeading}</h2>
        )}

        <div className="book-text">
          {/* First paragraph with optional drop cap */}
          <p>
            {dropCapLetter && (
              <span className="book-drop-cap">{dropCapLetter}</span>
            )}
            {firstParagraphRest}
          </p>

          {/* Remaining paragraphs */}
          {page.body.slice(1).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="book-page-number">{page.pageNumber}</div>
      </div>

      {/* Gutter shadow overlay */}
      <div
        className={`book-gutter-shadow ${
          side === "left" ? "book-gutter-shadow-left" : "book-gutter-shadow-right"
        }`}
      />
    </div>
  );
}
