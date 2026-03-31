interface PageIndicatorProps {
  leftPage: number;
  rightPage: number;
}

export function PageIndicator({ leftPage, rightPage }: PageIndicatorProps) {
  return (
    <div className="book-page-indicator">
      {leftPage} &mdash; {rightPage}
    </div>
  );
}
