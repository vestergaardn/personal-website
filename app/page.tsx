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

type WorkCategory = "Startup" | "Hobby";

type TimelineEntry = {
  project: string;
  type: string;
  category: WorkCategory;
  href?: string;
};

type ToolCategory = "App" | "Physical" | "Web" | "Skill";

type ToolEntry = {
  name: string;
  description: string;
  category: ToolCategory;
  href?: string;
};

type BookmarkCategory = "Person" | "Video" | "Reading" | "Other";

type BookmarkEntry = {
  name: string;
  description: string;
  category: BookmarkCategory;
  href?: string;
};

const timeline: TimelineEntry[] = [
  {
    project: "nine three quarters",
    type: "Free lab for builders backed by unicorn founders",
    category: "Startup",
    href: "https://www.ninethreequarters.com/",
  },
  {
    project: "Tweaky",
    type: "Open Sourced feature development",
    category: "Hobby",
    href: "https://tweaky.vercel.app/",
  },
  {
    project: "Postbuddy",
    type: "My first company. Now acquired",
    category: "Startup",
    href: "https://postbuddy.tech",
  },
];

const tools: ToolEntry[] = [
  {
    name: "Codex",
    description: "Agentic coding assistant",
    category: "App",
    href: "https://openai.com/codex/",
  },
  {
    name: "Field Notes",
    description: "Pocket notebook",
    category: "Physical",
    href: "https://fieldnotesbrand.com/",
  },
  {
    name: "Figma",
    description: "Where most pixels start their life",
    category: "App",
    href: "https://www.figma.com/",
  },
  {
    name: "Aeon pen",
    description: "Beautiful ballpoint pen",
    category: "Physical",
    href: "https://stilform.com/collections/ballpoint-pen/products/ballpoint-titanium-aeon",
  },
  {
    name: "Conductor",
    description: "Organized coding agents",
    category: "App",
    href: "https://conductor.build/",
  },
  {
    name: "Xteink X3",
    description: "OS alternative to Kindle",
    category: "Physical",
    href: "https://www.xteink.com/",
  },
  {
    name: "Mobbin",
    description: "MCP server for design research",
    category: "Web",
    href: "https://mobbin.com/",
  },
  {
    name: "Vercel",
    description: "Where this site lives",
    category: "Web",
    href: "https://vercel.com/",
  },
  {
    name: "ImprovMX",
    description: "Free email forwarding service",
    category: "Web",
    href: "https://improvmx.com/",
  },
  {
    name: "Matt Pocock",
    description: "Agentic skill to avoid sloppy code",
    category: "Skill",
    href: "https://github.com/mattpocock/skills#skills-for-real-engineers",
  },
];

const bookmarks: BookmarkEntry[] = [
  {
    name: "Peter Thiel’s religion",
    description: "My first stitch with mimetic theory. Life changing",
    category: "Reading",
    href: "https://perell.com/essay/peter-thiel/",
  },
  {
    name: "Historical tech tree",
    description: "A true rabbit hole for history and tech nerds",
    category: "Other",
    href: "https://www.historicaltechtree.com/",
  },
  {
    name: "Family.co values",
    description: "Design is so much more than how things look",
    category: "Reading",
    href: "https://benji.org/family-values",
  },
  {
    name: "Oliver Hamrin",
    description: "Artwork as a sales motion? Go follow Oliver",
    category: "Person",
    href: "https://x.com/oliverhamrin",
  },
  {
    name: "DHH",
    description: "I wanna be like David when I grow up",
    category: "Person",
    href: "https://dhh.dk",
  },
  {
    name: "Typography in sci-fi",
    description: "Venn diagram for designers and Star Wars fans?",
    category: "Reading",
    href: "https://typesetinthefuture.com/",
  },
  {
    name: "History of software",
    description: "Inspired me to restore old interfaces",
    category: "Reading",
    href: "https://historyofsoftware.org/",
  },
  {
    name: "You and your research",
    description: "Richard Hamming on what great look like",
    category: "Reading",
    href: "https://www.cs.virginia.edu/~robins/YouAndYourResearch.html",
  },
  {
    name: "The tyranny of apps",
    description: "Great reflections on the impact of coding agents",
    category: "Video",
    href: "https://andymatuschak.org/tat/",
  },
  {
    name: "Barrels and ammunition",
    description: "My favorite heuristic for hiring",
    category: "Reading",
    href: "https://www.conordewey.com/blog/barrels-and-ammunition",
  },
  {
    name: "Paul Graham",
    description: "The essays I re-read the most",
    category: "Person",
    href: "https://paulgraham.com/articles.html",
  },
  {
    name: "The family we earn",
    description: "Ravi Gupta is a great. Here on friendship",
    category: "Reading",
    href: "https://www.rkg.blog/friendship.php",
  },
  {
    name: "First follower",
    description: "A classic from Derek Sivers",
    category: "Video",
    href: "https://www.youtube.com/watch?v=fW8amMCVAJQ",
  },
  {
    name: "The courage to be disliked",
    description: "Intro to Adlerian psychology",
    category: "Reading",
    href: "https://www.goodreads.com/book/show/35239798-the-courage-to-be-disliked",
  },
  {
    name: "Interface Craft",
    description: "Paid collection of design principles",
    category: "Reading",
    href: "https://www.interfacecraft.dev/library",
  },
  {
    name: "Hand drawing data viz",
    description: "The value of inefficient paths",
    category: "Reading",
    href: "https://www.dougmacdowell.com/50-hours-to-draw-some-lines.html",
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
          Feel free to reach out on{" "}
          <a
            href="mailto:chris.vestergaardn@gmail.com"
            className="font-bold text-[#ffffff] hover:text-[#ffffff]"
          >
            e-mail
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
        <Suspense fallback={null}>
          <TimelineTabs work={timeline} tools={tools} bookmarks={bookmarks} />
        </Suspense>
      </section>
    </div>
  );
}
