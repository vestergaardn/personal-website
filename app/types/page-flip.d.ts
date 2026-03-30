declare module "page-flip" {
  interface PageFlipOptions {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    useMouseEvents?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    drawShadow?: boolean;
    startPage?: number;
  }

  class PageFlip {
    constructor(element: HTMLElement, options: PageFlipOptions);
    loadFromHTML(pages: NodeListOf<HTMLElement>): void;
    flipNext(): void;
    flipPrev(): void;
    on(event: string, callback: (e: { data: unknown }) => void): void;
    destroy(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
  }
}
