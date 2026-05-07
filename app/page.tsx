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
    <div className="site-shell">
      <header className="site-header">
        <div className="profile-lockup">
          <Image
            src="/cv-favicon.png"
            alt=""
            width={40}
            height={40}
            priority
            className="shrink-0"
          />
          <div>
            <h1 className="site-name">Christian Vestergaard</h1>
            <div className="text-[#ffffff]">
              <CopenhagenTime />
            </div>
          </div>
        </div>
      </header>

      <section className="site-section bio-section">
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

      <section className="site-section timeline-section">
        <div className="relative">
          <div className="timeline-heading">
            <span className="timeline-heading-year">Year</span>
            <span className="timeline-slash" aria-hidden />
            <span className="timeline-project">Project</span>
            <span className="timeline-type">Type</span>
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
                className="timeline-row"
              >
                <span className="timeline-year">
                  {entry.year}
                </span>
                <span className="timeline-slash" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12.4995 5.66968L7.49951 14.3299"
                      stroke="var(--slash-muted)"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="timeline-project">{entry.project}</span>
                <span className="timeline-type">
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
