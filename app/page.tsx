import { CopenhagenTime } from "./components/CopenhagenTime";
import { GitHubLink } from "./components/GitHubLink";
import { ThemeToggle } from "./components/ThemeToggle";
import { getGitHubContributions, getGitHubProfile } from "./lib/github";

const GITHUB_USERNAME = "vestergaardn";

const timeline = [
  { year: "2026", project: "Lorem Ipsum", type: "Dolor sit amet" },
  { year: "2025", project: "Consectetur", type: "Adipiscing elit" },
  { year: "2024", project: "Sed Eiusmod", type: "Tempor incididunt" },
  { year: "2023", project: "Ut Labore", type: "Magna aliqua" },
  { year: "2022", project: "Enim Minim", type: "Veniam quis" },
  { year: "2021", project: "Nostrud Exercitation", type: "Ullamco laboris" },
];

export default async function Home() {
  const [profile, contributions] = await Promise.all([
    getGitHubProfile(GITHUB_USERNAME),
    getGitHubContributions(GITHUB_USERNAME, new Date().getFullYear()),
  ]);

  return (
    <div className="mx-auto max-w-[600px] px-4 pt-20 pb-10 font-[var(--font-inter)] text-[14px] leading-5 text-[#111] dark:text-[#ededed]">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="font-medium">Christian Vestergaard</h1>
          <div className="text-[rgba(17,17,17,0.4)] dark:text-[rgba(255,255,255,0.4)]">
            <CopenhagenTime />
          </div>
        </div>
        <ThemeToggle />
      </header>

      <section className="border-b border-[rgba(17,17,17,0.08)] pb-7 dark:border-[rgba(255,255,255,0.08)]">
        <p className="mb-0">
          Reach me at{" "}
          <a
            href="https://x.com/CVestergaard_"
            className="text-[#575757]"
          >
            @CVestergaard_
          </a>
          ,{" "}
          <a
            href="mailto:hello@vestergaardn.com"
            className="text-[#575757]"
          >
            hello@vestergaardn.com
          </a>
          , or on{" "}
          <GitHubLink
            username={GITHUB_USERNAME}
            profile={profile}
            contributions={contributions}
          />
          .
        </p>
      </section>

      <section className="border-b border-[rgba(17,17,17,0.08)] py-7 dark:border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-0 px-2 py-1.5 text-[rgba(17,17,17,0.4)] dark:text-[rgba(255,255,255,0.4)]">
          <span className="w-[37px] shrink-0">Year</span>
          <span className="w-5 shrink-0" aria-hidden />
          <span className="flex-1">Project</span>
          <span className="shrink-0">Type</span>
        </div>
        {timeline.map((entry) => (
          <a
            key={`${entry.year}-${entry.project}`}
            href="#"
            className="flex items-center gap-0 px-2 py-1.5 hover:bg-[rgba(17,17,17,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]"
          >
            <span className="w-[37px] shrink-0 text-[rgba(17,17,17,0.4)] dark:text-[rgba(255,255,255,0.4)]">
              {entry.year}
            </span>
            <span className="flex w-5 shrink-0 items-center justify-center" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.4995 5.66968L7.49951 14.3299"
                  stroke="rgba(17,17,17,0.3)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  className="dark:stroke-[rgba(255,255,255,0.3)]"
                />
              </svg>
            </span>
            <span className="flex-1">{entry.project}</span>
            <span className="shrink-0 text-[rgba(17,17,17,0.4)] dark:text-[rgba(255,255,255,0.4)]">
              {entry.type}
            </span>
          </a>
        ))}
      </section>
    </div>
  );
}
