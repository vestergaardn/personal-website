"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { ContributionDay } from "../lib/github";

const SQUARE = 11;
const GAP = 3;
const ROWS = 7;
const COLUMNS = 17;

const LEVEL_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "#ebedf0",
  1: "#9be9a8",
  2: "#40c463",
  3: "#30a14e",
  4: "#216e39",
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinal(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

function formatTooltip(count: number, isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const month = MONTH_NAMES_FULL[date.getUTCMonth()];
  const day = ordinal(date.getUTCDate());
  const noun = count === 1 ? "contribution" : "contributions";
  const prefix = count === 0 ? "No contributions" : `${count} ${noun}`;
  return `${prefix} on ${month} ${day}.`;
}

type GridCell =
  | { kind: "data"; date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
  | { kind: "past-missing" }
  | { kind: "future" };

function buildGrid(days: ContributionDay[]): {
  columns: GridCell[][];
  monthLabels: string[];
} {
  if (days.length === 0) return { columns: [], monthLabels: [] };

  const firstDate = new Date(`${days[0].date}T00:00:00Z`);
  const startDayOffset = firstDate.getUTCDay();

  const dataCells: GridCell[] = days.map((d) => ({
    kind: "data",
    date: d.date,
    count: d.count,
    level: d.level,
  }));
  let cells: GridCell[] = [
    ...Array<GridCell>(startDayOffset).fill({ kind: "past-missing" }),
    ...dataCells,
  ];
  const targetCells = COLUMNS * ROWS;
  if (cells.length > targetCells) {
    const weeksToDrop = Math.ceil((cells.length - targetCells) / ROWS);
    cells = cells.slice(weeksToDrop * ROWS);
  }
  while (cells.length < targetCells) cells.push({ kind: "future" });
  cells = cells.slice(0, targetCells);

  const columns: GridCell[][] = [];
  for (let col = 0; col < COLUMNS; col++) {
    const column: GridCell[] = [];
    for (let row = 0; row < ROWS; row++) {
      column.push(cells[col * ROWS + row]);
    }
    columns.push(column);
  }

  const monthLabels: string[] = [];
  const seenMonths = new Set<number>();
  for (const cell of cells) {
    if (cell.kind !== "data") continue;
    const month = new Date(`${cell.date}T00:00:00Z`).getUTCMonth();
    if (!seenMonths.has(month)) {
      seenMonths.add(month);
      monthLabels.push(MONTH_NAMES[month]);
    }
  }

  return { columns, monthLabels };
}

export function ContributionGraph({
  contributions,
}: {
  contributions: ContributionDay[];
}) {
  const { columns, monthLabels } = buildGrid(contributions);
  const gridWidth = columns.length * SQUARE + (columns.length - 1) * GAP;
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="relative">
      <div
        className="hover-card-calendar-label mb-[6px] flex justify-between"
        style={{ width: gridWidth }}
      >
        {monthLabels.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, ${SQUARE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${SQUARE}px)`,
          gridAutoFlow: "column",
          gap: `${GAP}px`,
          width: gridWidth,
        }}
      >
        {columns.flatMap((column, colIdx) =>
          column.map((cell, rowIdx) => {
            if (cell.kind === "future") {
              return <div key={`${colIdx}-${rowIdx}`} />;
            }
            const level = cell.kind === "data" ? cell.level : 0;
            const isData = cell.kind === "data";
            return (
              <motion.div
                key={`${colIdx}-${rowIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: colIdx * 0.035,
                }}
                onMouseEnter={
                  isData
                    ? (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parentRect =
                          e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                        if (!parentRect) return;
                        setTooltip({
                          text: formatTooltip(cell.count, cell.date),
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top,
                        });
                      }
                    : undefined
                }
                onMouseLeave={isData ? () => setTooltip(null) : undefined}
                className="rounded-[2px]"
                style={{ backgroundColor: LEVEL_COLORS[level] }}
              />
            );
          })
        )}
      </div>
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-[#2c2e33] px-2 py-1 text-[12px] font-medium text-white shadow-md"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, calc(-100% - 6px))",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
