export type GitHubProfile = {
  name: string;
  login: string;
  avatarUrl: string;
  bio: string;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

const FALLBACK_BIO = "Designer and Engineer";

export async function getGitHubProfile(
  username: string
): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name ?? data.login,
      login: data.login,
      avatarUrl: data.avatar_url,
      bio: data.bio?.trim() || FALLBACK_BIO,
    };
  } catch {
    return null;
  }
}

export async function getGitHubContributions(
  username: string,
  year: number
): Promise<ContributionDay[] | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      contributions: ContributionDay[];
    };
    const todayIso = new Date().toISOString().slice(0, 10);
    return data.contributions.filter((d) => d.date <= todayIso);
  } catch {
    return null;
  }
}
