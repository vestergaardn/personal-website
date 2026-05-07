import Image from "next/image";
import { Suspense } from "react";
import { CopenhagenTime } from "./components/CopenhagenTime";
import { GitHubLink } from "./components/GitHubLink";
import { PostbuddyTimelineRow } from "./components/PostbuddyTimelineRow";
import {
  StravaRaceLink,
  StravaRaceLinkFallback,
} from "./components/StravaRaceLink";
import { getGitHubContributions, getGitHubProfile } from "./lib/github";

export const revalidate = 3600;

const GITHUB_USERNAME = "vestergaardn";

type TimelineEntry = {
  year: string;
  project: string;
  type: string;
  href?: string;
};

const timeline: TimelineEntry[] = [
  {
    year: "2026",
    project: "nine three quarters",
    type: "Free lab for builders",
    href: "https://www.ninethreequarters.com/",
  },
  {
    year: "2026",
    project: "Tweaky",
    type: "Weekend hack",
    href: "https://tweaky.vercel.app/",
  },
  { year: "2024", project: "Postbuddy", type: "Startup (acquired)", href: "/carrying-alone" },
];

export default async function Home() {
  const [profile, contributions] = await Promise.all([
    getGitHubProfile(GITHUB_USERNAME),
    getGitHubContributions(GITHUB_USERNAME, new Date().getFullYear()),
  ]);

  return (
    <div className="mx-auto max-w-[720px] px-4 pt-32 pb-10 font-[var(--font-inter)] text-[14px] leading-5 text-[#ffffff]">
      <header className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/cv-favicon-page.png"
            alt=""
            width={384}
            height={384}
            priority
            fetchPriority="high"
            unoptimized
            className="h-10 w-10 shrink-0"
          />
          <div>
            <h1 className="font-bold">Christian Vestergaard</h1>
            <div className="text-[#ffffff]">
              <CopenhagenTime />
            </div>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-5 border-b border-[color:var(--divider)] pb-7 text-[#ffffff]">
        <p className="mb-0">
          I’m a designer and engineer. I’m drawn to the details that most
          people never notice, but always feel.
        </p>
        <p className="mb-0">
          I currently work on a new company with a friend, and co-founder.
          Before that, I founded Postbuddy.
        </p>
        <p className="mb-0">
          Off the clock,{" "}
          <span className="font-bold">
            I{" "}
            <Suspense fallback={<StravaRaceLinkFallback />}>
              <StravaRaceLink />
            </Suspense>
          </span>{" "}
          and take on endurance challenges.
        </p>
        <p className="mb-0">
          Reach me at{" "}
          <a
            href="mailto:hello@vestergaardn.com"
            className="font-bold text-[#ffffff] hover:text-[#ffffff]"
          >
            hello@vestergaardn.com
          </a>{" "}
          or see more of{" "}
          <span className="font-bold">
            <GitHubLink
              username={GITHUB_USERNAME}
              profile={profile}
              contributions={contributions}
            />
          </span>
          .
        </p>
      </section>

      <section className="border-b border-[color:var(--divider)] py-7">
        <div className="relative">
          <div className="flex items-center gap-0 px-2 py-1.5 text-[#ffffff]">
            <span className="w-[37px] shrink-0">Year</span>
            <span className="w-5 shrink-0" aria-hidden />
            <span className="flex-1">Project</span>
            <span className="shrink-0">Type</span>
          </div>
          {timeline.map((entry) => {
            if (entry.project === "Postbuddy") {
              return (
                <PostbuddyTimelineRow
                  key={`${entry.year}-${entry.project}`}
                  year={entry.year}
                  project={entry.project}
                  type={entry.type}
                  href={entry.href ?? "#"}
                />
              );
            }
            const isExternal = entry.href?.startsWith("http");
            return (
              <a
                key={`${entry.year}-${entry.project}`}
                href={entry.href ?? "#"}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="flex items-center gap-0 px-2 py-1.5 no-underline text-[#ffffff] hover:bg-[var(--row-hover)]"
              >
                <span className="w-[37px] shrink-0 font-[var(--font-geist-mono)] text-[#ffffff]">
                  {entry.year}
                </span>
                <span className="flex w-5 shrink-0 items-center justify-center" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12.4995 5.66968L7.49951 14.3299"
                      stroke="var(--slash-muted)"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="flex-1">{entry.project}</span>
                <span className="shrink-0 text-[#ffffff]">
                  {entry.type}
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
