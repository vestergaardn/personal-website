"use client";

import { motion } from "motion/react";
import type { ContributionDay } from "../lib/github";

const SQUARE = 11;
const GAP = 3;
const ROWS = 7;

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

type GridCell =
  | { kind: "data"; date: string; level: 0 | 1 | 2 | 3 | 4 }
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
    level: d.level,
  }));
  const cells: GridCell[] = [
    ...Array<GridCell>(startDayOffset).fill({ kind: "past-missing" }),
    ...dataCells,
  ];
  const totalCols = Math.ceil(cells.length / ROWS);
  const totalCells = totalCols * ROWS;
  while (cells.length < totalCells) cells.push({ kind: "future" });

  const columns: GridCell[][] = [];
  for (let col = 0; col < totalCols; col++) {
    const column: GridCell[] = [];
    for (let row = 0; row < ROWS; row++) {
      column.push(cells[col * ROWS + row]);
    }
    columns.push(column);
  }

  const monthLabels: string[] = [];
  const seenMonths = new Set<number>();
  for (const day of days) {
    const month = new Date(`${day.date}T00:00:00Z`).getUTCMonth();
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

  return (
    <div>
      <div
        className="mb-[6px] flex justify-between text-[11px] leading-none text-gray-400"
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
                className="rounded-[2px]"
                style={{ backgroundColor: LEVEL_COLORS[level] }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
