"use client";

import { useState } from "react";
import { AquaRadioGroup } from "./AquaRadio";
import { PostbuddyTimelineRow } from "./PostbuddyTimelineRow";

export type WorkEntry = {
  project: string;
  type: string;
  href?: string;
};

export type ToolEntry = {
  name: string;
  description: string;
  href?: string;
};

type Tab = "work" | "tools";

const TABS: { value: Tab; label: string }[] = [
  { value: "work", label: "Work" },
  { value: "tools", label: "Tools" },
];

export function TimelineTabs({
  work,
  tools,
}: {
  work: WorkEntry[];
  tools: ToolEntry[];
}) {
  const [tab, setTab] = useState<Tab>("work");

  return (
    <div className="relative">
      <div className="timeline-tabs">
        <AquaRadioGroup<Tab>
          value={tab}
          onChange={setTab}
          options={TABS}
          size={12}
        />
      </div>

      {tab === "work" ? (
        <>
          {work.map((entry) => {
            if (entry.project === "Postbuddy") {
              return (
                <PostbuddyTimelineRow
                  key={entry.project}
                  project={entry.project}
                  type={entry.type}
                  href={entry.href ?? "#"}
                />
              );
            }
            const isExternal = entry.href?.startsWith("http");
            return (
              <a
                key={entry.project}
                href={entry.href ?? "#"}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="timeline-row"
              >
                <span className="timeline-project">{entry.project}</span>
                <span className="timeline-type">{entry.type}</span>
              </a>
            );
          })}
        </>
      ) : (
        <>
          {tools.map((entry) => {
            const isExternal = entry.href?.startsWith("http");
            const Row = (
              <>
                <span className="timeline-project">{entry.name}</span>
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
              >
                {Row}
              </a>
            ) : (
              <div key={entry.name} className="timeline-row">
                {Row}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
