import {
  buildStravaSummary,
  classifyStravaSport,
  type StravaActivity,
  type StravaAthleteSnapshot,
  type StravaSummary,
} from "./stravaSummary";

export type {
  StravaActivity,
  StravaAthleteSnapshot,
  StravaDay,
  StravaDayActivity,
  StravaSport,
  StravaSummary,
} from "./stravaSummary";

const TOKEN_URL = "https://www.strava.com/oauth/token";
const ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities";

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
): Promise<StravaAthleteSnapshot> {
  try {
    const res = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { avatarUrl: null, isPremium: false };
    const data = (await res.json()) as {
      id?: number;
      profile?: string;
      profile_medium?: string;
      premium?: boolean;
      summit?: boolean;
    };
    return {
      avatarUrl: data.profile_medium ?? data.profile ?? null,
      isPremium: Boolean(data.premium ?? data.summit),
    };
  } catch {
    return { avatarUrl: null, isPremium: false };
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
        sport: classifyStravaSport(a.sport_type ?? a.type ?? ""),
      });
    }
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
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

    return buildStravaSummary({
      activities,
      athlete,
      totalActivities,
      today,
    });
  } catch {
    return null;
  }
}
