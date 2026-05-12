import Image from "next/image";
import { Suspense, type CSSProperties } from "react";
import { CopenhagenTime } from "./components/CopenhagenTime";
import { GitHubLink } from "./components/GitHubLink";
import {
  StravaRaceLink,
  StravaRaceLinkFallback,
} from "./components/StravaRaceLink";
import { TimelineTabs } from "./components/TimelineTabs";
import { getGitHubContributions, getGitHubProfile } from "./lib/github";

export const revalidate = 3600;

const GITHUB_USERNAME = "vestergaardn";

type TimelineEntry = {
  project: string;
  type: string;
  href?: string;
};

type ToolEntry = {
  name: string;
  description: string;
  href?: string;
};

const timeline: TimelineEntry[] = [
  {
    project: "nine three quarters",
    type: "Free lab for builders",
    href: "https://www.ninethreequarters.com/",
  },
  {
    project: "Tweaky",
    type: "Weekend hack",
    href: "https://tweaky.vercel.app/",
  },
  { project: "Postbuddy", type: "Startup (acquired)", href: "/carrying-alone" },
];

const tools: ToolEntry[] = [
  {
    name: "Codex",
    description: "Agentic coding assistant",
    href: "https://openai.com/codex/",
  },
  {
    name: "Field Notes",
    description: "Pocket notebook",
    href: "https://fieldnotesbrand.com/",
  },
  {
    name: "Figma",
    description: "Where most pixels start their life",
    href: "https://www.figma.com/",
  },
  {
    name: "Aeon Ballpoint Pen",
    description: "Daily-carry pen",
    href: "https://stilform.com/collections/ballpoint-pen/products/ballpoint-titanium-aeon",
  },
  {
    name: "Conductor",
    description: "Organized coding agents",
    href: "https://conductor.build/",
  },
  {
    name: "Xteink X3",
    description: "OS alternative to Kindle",
    href: "https://www.xteink.com/",
  },
  {
    name: "Mobbin",
    description: "MCP server for design research",
    href: "https://mobbin.com/",
  },
  {
    name: "Vercel",
    description: "Where this site lives",
    href: "https://vercel.com/",
  },
  {
    name: "ImprovMX",
    description: "Free email forwarding service",
    href: "https://improvmx.com/",
  },
];

export default async function Home() {
  const [profile, contributions] = await Promise.all([
    getGitHubProfile(GITHUB_USERNAME),
    getGitHubContributions(GITHUB_USERNAME, new Date().getFullYear()),
  ]);

  return (
    <div className="site-shell orchestration">
      <header className="site-header" style={{ "--stagger": 0 } as CSSProperties}>
        <div className="profile-lockup">
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
            <h1 className="site-name">Christian Vestergaard</h1>
            <div className="text-[#ffffff]">
              <CopenhagenTime />
            </div>
          </div>
        </div>
      </header>

      <section className="site-section bio-section" style={{ "--stagger": 1 } as CSSProperties}>
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

      <section className="site-section timeline-section" style={{ "--stagger": 2 } as CSSProperties}>
        <TimelineTabs work={timeline} tools={tools} />
      </section>
    </div>
  );
}
