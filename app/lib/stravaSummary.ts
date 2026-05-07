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

export type StravaAthleteSnapshot = {
  avatarUrl: string | null;
  isPremium: boolean;
};

export function classifyStravaSport(type: string): StravaSport {
  const t = type.toLowerCase();
  if (t.includes("ride") || t.includes("bike")) return "ride";
  if (t.includes("run")) return "run";
  if (t.includes("walk") || t.includes("hike")) return "walk";
  if (t.includes("swim")) return "swim";
  return "other";
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

function computeStreakWeeks(activeDays: Set<string>, today: Date) {
  // Current week only counts when it has activities, but an empty current
  // week does not break the streak because the week is still in progress.
  const weekStart = startOfWeekMonday(today);
  let weeks = 0;
  let isCurrentWeek = true;

  while (true) {
    let activeDaysInWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (d > today) break;
      if (activeDays.has(isoLocal(d))) activeDaysInWeek += 1;
    }

    if (activeDaysInWeek === 0 && !isCurrentWeek) break;
    if (activeDaysInWeek > 0) weeks += 1;

    isCurrentWeek = false;
    weekStart.setDate(weekStart.getDate() - 7);
    if (weeks > 520) break; // 10y safety cap
  }

  return weeks;
}

function buildRollingWeeks({
  weeksToShow,
  activities,
  today,
}: {
  weeksToShow: number;
  activities: StravaActivity[];
  today: Date;
}): Array<Array<StravaDay>> {
  const byDate = new Map<string, StravaDayActivity[]>();
  for (const activity of activities) {
    const list = byDate.get(activity.date) ?? [];
    list.push({ id: activity.id, sport: activity.sport });
    byDate.set(activity.date, list);
  }

  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);
  const todayIso = isoLocal(todayMidnight);

  const dow = todayMidnight.getDay(); // 0=Sun..6=Sat
  const daysSinceMonday = (dow + 6) % 7;
  const start = new Date(todayMidnight);
  start.setDate(
    todayMidnight.getDate() - daysSinceMonday - (weeksToShow - 1) * 7,
  );

  const cells: StravaDay[] = [];
  for (let i = 0; i < weeksToShow * 7; i++) {
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

export function buildStravaSummary({
  activities,
  athlete,
  totalActivities,
  today,
  weeksToShow = 4,
}: {
  activities: StravaActivity[];
  athlete: StravaAthleteSnapshot;
  totalActivities: number;
  today: Date;
  weeksToShow?: number;
}): StravaSummary {
  const activeDays = new Set(activities.map((activity) => activity.date));

  return {
    weeks: buildRollingWeeks({ weeksToShow, activities, today }),
    streakWeeks: computeStreakWeeks(activeDays, today),
    totalActivities,
    avatarUrl: athlete.avatarUrl,
    isPremium: athlete.isPremium,
  };
}
