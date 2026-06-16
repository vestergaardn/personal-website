"use client";

import { type CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AquaRadioGroup } from "./AquaRadio";

export type WorkCategory = "Startup" | "Hobby";

export type WorkEntry = {
  project: string;
  type: string;
  category: WorkCategory;
  href?: string;
};

export type ToolCategory = "App" | "Physical" | "Web" | "Skill" | "Framework";

export type ToolEntry = {
  name: string;
  description: string;
  category: ToolCategory;
  href?: string;
};

export type BookmarkCategory = "Person" | "Video" | "Reading" | "Other";

export type BookmarkEntry = {
  name: string;
  description: string;
  category: BookmarkCategory;
  href?: string;
};

type Tab = "work" | "tools" | "bookmarks";

const TABS: { value: Tab; label: string }[] = [
  { value: "work", label: "Work" },
  { value: "tools", label: "Tools" },
  { value: "bookmarks", label: "Bookmarks" },
];

export function TimelineTabs({
  work,
  tools,
  bookmarks,
}: {
  work: WorkEntry[];
  tools: ToolEntry[];
  bookmarks: BookmarkEntry[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const tab: Tab =
    rawTab === "tools" || rawTab === "bookmarks" ? rawTab : "work";

  const setTab = (next: Tab) => {
    const url = next === "work" ? pathname : `${pathname}?tab=${next}`;
    router.replace(url, { scroll: false });
  };

  const cards: { name: string; description: string; category: string; href?: string }[] =
    tab === "tools" ? tools : tab === "bookmarks" ? bookmarks : [];

  return (
    <div className="relative">
      <div className="timeline-tabs">
        <AquaRadioGroup<Tab>
          value={tab}
          onChange={setTab}
          options={TABS}
          size={15}
        />
      </div>

      <div key={tab} className="orchestration">
        {tab === "work"
          ? work.map((entry, index) => {
              const style = { "--stagger": index } as CSSProperties;
              const isExternal = entry.href?.startsWith("http");
              return (
                <a
                  key={entry.project}
                  href={entry.href ?? "#"}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="timeline-row"
                  style={style}
                >
                  <span className="timeline-project">
                    {entry.project}
                    <span className="timeline-chip">{entry.category}</span>
                  </span>
                  <span className="timeline-type">{entry.type}</span>
                </a>
              );
            })
          : cards.map((entry, index) => {
              const style = { "--stagger": index } as CSSProperties;
              const isExternal = entry.href?.startsWith("http");
              const Row = (
                <>
                  <span className="timeline-project">
                    {entry.name}
                    <span className="timeline-chip">{entry.category}</span>
                  </span>
                  <span className="timeline-type">{entry.description}</span>
                </>
              );
              return entry.href ? (
                <a
                  key={entry.name}
                  href={entry.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="timeline-row"
                  style={style}
                >
                  {Row}
                </a>
              ) : (
                <div
                  key={entry.name}
                  className="timeline-row"
                  style={style}
                >
                  {Row}
                </div>
              );
            })}
      </div>
    </div>
  );
}
