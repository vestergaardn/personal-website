import Link from "next/link";
import { GitHubLink } from "./components/GitHubLink";
import { getGitHubContributions, getGitHubProfile } from "./lib/github";

const GITHUB_USERNAME = "vestergaardn";

export default async function Home() {
  const [profile, contributions] = await Promise.all([
    getGitHubProfile(GITHUB_USERNAME),
    getGitHubContributions(GITHUB_USERNAME, new Date().getFullYear()),
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="font-bold">Christian Vestergaard</p>
        <p className="mt-1 text-sm text-gray-500">Designer and Engineer</p>
        <nav className="mt-4 flex gap-4 justify-center">
          <Link href="/links" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Links
          </Link>
          <Link href="/stack" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Stack
          </Link>
          <Link href="/people" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            People
          </Link>
          <GitHubLink
            username={GITHUB_USERNAME}
            profile={profile}
            contributions={contributions}
          />
        </nav>
      </div>
    </div>
  );
}
