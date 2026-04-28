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

const GRID_COLUMNS = 17;
const GRID_ROWS = 7;

export function getVisibleContributions(
  contributions: ContributionDay[]
): ContributionDay[] {
  if (contributions.length === 0) return [];
  const firstDate = new Date(`${contributions[0].date}T00:00:00Z`);
  const startDayOffset = firstDate.getUTCDay();
  const totalCells = startDayOffset + contributions.length;
  const targetCells = GRID_COLUMNS * GRID_ROWS;
  if (totalCells <= targetCells) return contributions;
  const weeksToDrop = Math.ceil((totalCells - targetCells) / GRID_ROWS);
  const dropped = Math.max(0, weeksToDrop * GRID_ROWS - startDayOffset);
  return contributions.slice(dropped);
}

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
