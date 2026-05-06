"use client";

import { getSkyBandAtMinute } from "./sky";

export type CityId =
  | "copenhagen"
  | "boulder"
  | "osaka"
  | "babylon"
  | "san-francisco"
  | "sydney"
  | "auckland"
  | "buenos-aires"
  | "reykjavik"
  | "kathmandu"
  | "nuuk"
  | "sparta"
  | "zurich";

export type City = {
  id: CityId;
  name: string;
  timeZone: string;
};

export const STORAGE_KEY = "vestergaardn:selected-city";
const SHUFFLE_DECK_STORAGE_KEY = "vestergaardn:city-shuffle-deck";
export const DEFAULT_CITY_ID: CityId = "copenhagen";

export const CITIES: Record<CityId, City> = {
  copenhagen: {
    id: "copenhagen",
    name: "Copenhagen",
    timeZone: "Europe/Copenhagen",
  },
  boulder: {
    id: "boulder",
    name: "Boulder",
    timeZone: "America/Denver",
  },
  osaka: {
    id: "osaka",
    name: "Osaka",
    timeZone: "Asia/Tokyo",
  },
  babylon: {
    id: "babylon",
    name: "Babylon",
    timeZone: "Asia/Baghdad",
  },
  "san-francisco": {
    id: "san-francisco",
    name: "San Francisco",
    timeZone: "America/Los_Angeles",
  },
  sydney: {
    id: "sydney",
    name: "Sydney",
    timeZone: "Australia/Sydney",
  },
  auckland: {
    id: "auckland",
    name: "Auckland",
    timeZone: "Pacific/Auckland",
  },
  "buenos-aires": {
    id: "buenos-aires",
    name: "Buenos Aires",
    timeZone: "America/Argentina/Buenos_Aires",
  },
  reykjavik: {
    id: "reykjavik",
    name: "Reykjavik",
    timeZone: "Atlantic/Reykjavik",
  },
  kathmandu: {
    id: "kathmandu",
    name: "Kathmandu",
    timeZone: "Asia/Kathmandu",
  },
  nuuk: {
    id: "nuuk",
    name: "Nuuk",
    timeZone: "America/Nuuk",
  },
  sparta: {
    id: "sparta",
    name: "Sparta",
    timeZone: "Europe/Athens",
  },
  zurich: {
    id: "zurich",
    name: "Zurich",
    timeZone: "Europe/Zurich",
  },
};

const SHUFFLE_CITY_IDS: CityId[] = [
  "boulder",
  "osaka",
  "babylon",
  "san-francisco",
  "sydney",
  "auckland",
  "buenos-aires",
  "reykjavik",
  "kathmandu",
  "nuuk",
  "sparta",
  "zurich",
];

type TimeParts = { hour: number; minute: number; dayPeriod: string };

export function isCityId(value: unknown): value is CityId {
  return typeof value === "string" && value in CITIES;
}

export function getStoredCityId(): CityId {
  if (typeof window === "undefined") return DEFAULT_CITY_ID;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isCityId(stored)) return stored;
  } catch {
    return DEFAULT_CITY_ID;
  }

  return DEFAULT_CITY_ID;
}

export function storeCityId(id: CityId) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Selection still works for the current page if storage is unavailable.
  }
}

function getStoredShuffleDeck() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(SHUFFLE_DECK_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (id): id is CityId =>
        isCityId(id) && SHUFFLE_CITY_IDS.includes(id),
    );
  } catch {
    return [];
  }
}

function storeShuffleDeck(ids: readonly CityId[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SHUFFLE_DECK_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Shuffle still works for the current click if storage is unavailable.
  }
}

export function getShuffledCityId(current: CityId) {
  const currentBand = getSkyBandAtMinute(
    getMinuteOfDayInTimeZone(CITIES[current].timeZone),
  );
  const storedDeck = getStoredShuffleDeck().filter((id) => id !== current);
  const candidates =
    storedDeck.length > 0
      ? storedDeck
      : SHUFFLE_CITY_IDS.filter((id) => id !== current);
  const differentSkyCandidates = candidates.filter((id) => {
    const candidateBand = getSkyBandAtMinute(
      getMinuteOfDayInTimeZone(CITIES[id].timeZone),
    );
    return candidateBand.name !== currentBand.name;
  });
  const pool =
    differentSkyCandidates.length > 0 ? differentSkyCandidates : candidates;
  const nextCityId = pool[Math.floor(Math.random() * pool.length)];

  storeShuffleDeck(candidates.filter((id) => id !== nextCityId));

  return nextCityId;
}

export function getMinutesInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );

  return hour * 60 + minute;
}

export function getMinuteOfDayInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );
  const second = Number(
    parts.find((part) => part.type === "second")?.value ?? "0",
  );

  return hour * 60 + minute + second / 60;
}

export function getTimePartsInTimeZone(timeZone: string): TimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date());

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? "0"),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? "0"),
    dayPeriod: (
      parts.find((part) => part.type === "dayPeriod")?.value ?? "am"
    ).toLowerCase(),
  };
}
