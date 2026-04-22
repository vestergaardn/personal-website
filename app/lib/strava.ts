export type StravaSport =
  | "ride"
  | "run"
  | "walk"
  | "swim"
  | "other";

export type StravaActivity = {
  id: number;
  date: string; // YYYY-MM-DD in athlete's local time
  sport: StravaSport;
};

export type StravaDayActivity = {
  id: number;
  sport: StravaSport;
};

export type StravaSummary = {
  weeks: Array<Array<StravaDay>>; // Mon-Sun rows; rows are calendar weeks ending with current week
  streakWeeks: number;
  totalActivities: number; // Lifetime activity count across ride/run/swim
  avatarUrl: string | null;
  isPremium: boolean;
};

export type StravaDay =
  | { kind: "blank" } // padding for prev/next month
  | {
      kind: "day";
      day: number;
      isToday: boolean;
      isFuture: boolean;
      activities: StravaDayActivity[]; // empty = no activity
    };

const TOKEN_URL = "https://www.strava.com/oauth/token";
const ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities";

function classifySport(type: string): StravaSport {
  const t = type.toLowerCase();
  if (t.includes("ride") || t.includes("bike")) return "ride";
  if (t.includes("run")) return "run";
  if (t.includes("walk") || t.includes("hike")) return "walk";
  if (t.includes("swim")) return "swim";
  return "other";
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

async function fetchAthlete(
  accessToken: string
): Promise<{ id: number | null; avatarUrl: string | null; isPremium: boolean }> {
  try {
    const res = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { id: null, avatarUrl: null, isPremium: false };
    const data = (await res.json()) as {
      id?: number;
      profile?: string;
      profile_medium?: string;
      premium?: boolean;
      summit?: boolean;
    };
    return {
      id: data.id ?? null,
      avatarUrl: data.profile_medium ?? data.profile ?? null,
      isPremium: Boolean(data.premium ?? data.summit),
    };
  } catch {
    return { id: null, avatarUrl: null, isPremium: false };
  }
}

async function fetchTotalActivityCount(
  accessToken: string
): Promise<number> {
  try {
    let total = 0;
    let page = 1;
    while (page <= 30) {
      const res = await fetch(
        `${ACTIVITIES_URL}?per_page=200&page=${page}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 86400 },
        }
      );
      if (!res.ok) break;
      const batch = (await res.json()) as unknown[];
      total += batch.length;
      if (batch.length < 200) break;
      page += 1;
    }
    return total;
  } catch {
    return 0;
  }
}

async function fetchActivities(
  accessToken: string,
  afterUnix: number
): Promise<StravaActivity[]> {
  const all: StravaActivity[] = [];
  let page = 1;
  while (page <= 6) {
    const url = `${ACTIVITIES_URL}?after=${afterUnix}&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 1800 },
    });
    if (!res.ok) break;
    const batch = (await res.json()) as Array<{
      id: number;
      start_date_local: string;
      sport_type?: string;
      type?: string;
    }>;
    if (batch.length === 0) break;
    for (const a of batch) {
      const date = a.start_date_local?.slice(0, 10);
      if (!date || typeof a.id !== "number") continue;
      all.push({
        id: a.id,
        date,
        sport: classifySport(a.sport_type ?? a.type ?? ""),
      });
    }
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(d: Date): Date {
  const out = new Date(d);
  const dow = out.getDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

function computeStreak(activeDays: Set<string>, today: Date) {
  // Walk back week-by-week (Mon-Sun) starting from current week.
  // The current week counts even if incomplete (matches Strava app).
  const weekStart = startOfWeekMonday(today);
  let weeks = 0;
  let activitiesInStreak = 0;
  while (true) {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (d > today) break;
      if (activeDays.has(isoLocal(d))) count += 1;
    }
    if (count === 0) break;
    weeks += 1;
    activitiesInStreak += count;
    weekStart.setDate(weekStart.getDate() - 7);
    if (weeks > 520) break; // 10y safety cap
  }
  return { weeks, activitiesInStreak };
}

function buildRollingWeeks(
  weeksToShow: number,
  activities: StravaActivity[],
  today: Date
): Array<Array<StravaDay>> {
  const byDate = new Map<string, StravaDayActivity[]>();
  for (const a of activities) {
    const list = byDate.get(a.date) ?? [];
    list.push({ id: a.id, sport: a.sport });
    byDate.set(a.date, list);
  }

  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);
  const todayIso = isoLocal(todayMidnight);

  // Start grid at Monday of the week (weeksToShow - 1) before the current week.
  const dow = todayMidnight.getDay(); // 0=Sun..6=Sat
  const daysSinceMonday = (dow + 6) % 7;
  const start = new Date(todayMidnight);
  start.setDate(todayMidnight.getDate() - daysSinceMonday - (weeksToShow - 1) * 7);

  const totalDays = weeksToShow * 7;
  const cells: StravaDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = isoLocal(d);
    cells.push({
      kind: "day",
      day: d.getDate(),
      isToday: iso === todayIso,
      isFuture: d > todayMidnight,
      activities: byDate.get(iso) ?? [],
    });
  }

  const weeks: Array<Array<StravaDay>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export async function getStravaSummary(): Promise<StravaSummary | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const today = new Date();
    // Fetch ~14 months back: enough for current month grid + reasonable streak.
    const after = new Date(today);
    after.setMonth(after.getMonth() - 14);
    const afterUnix = Math.floor(after.getTime() / 1000);

    const [activities, athlete, totalActivities] = await Promise.all([
      fetchActivities(token, afterUnix),
      fetchAthlete(token),
      fetchTotalActivityCount(token),
    ]);
    const activeDays = new Set(activities.map((a) => a.date));

    const weeks = buildRollingWeeks(4, activities, today);
    const { weeks: streakWeeks } = computeStreak(activeDays, today);

    return {
      weeks,
      streakWeeks,
      totalActivities,
      avatarUrl: athlete.avatarUrl,
      isPremium: athlete.isPremium,
    };
  } catch {
    return null;
  }
}
