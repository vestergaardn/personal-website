"use client";

import { getSkyBandAtMinute } from "./sky";

export type CityId =
  | "copenhagen"
  | "damascus"
  | "petra"
  | "alexandria"
  | "aksum"
  | "troy"
  | "athens"
  | "olympia"
  | "pompeii"
  | "jerusalem"
  | "byzantium"
  | "samarkand"
  | "baghdad"
  | "varanasi"
  | "angkor"
  | "xian"
  | "kyoto"
  | "easter-island"
  | "timbuktu"
  | "mesa-verde"
  | "machu-picchu";

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
  damascus: {
    id: "damascus",
    name: "Damascus",
    timeZone: "Asia/Damascus",
  },
  petra: {
    id: "petra",
    name: "Petra",
    timeZone: "Asia/Amman",
  },
  alexandria: {
    id: "alexandria",
    name: "Alexandria",
    timeZone: "Africa/Cairo",
  },
  aksum: {
    id: "aksum",
    name: "Aksum",
    timeZone: "Africa/Addis_Ababa",
  },
  troy: {
    id: "troy",
    name: "Troy",
    timeZone: "Europe/Istanbul",
  },
  athens: {
    id: "athens",
    name: "Athens",
    timeZone: "Europe/Athens",
  },
  olympia: {
    id: "olympia",
    name: "Olympia",
    timeZone: "Europe/Athens",
  },
  pompeii: {
    id: "pompeii",
    name: "Pompeii",
    timeZone: "Europe/Rome",
  },
  jerusalem: {
    id: "jerusalem",
    name: "Jerusalem",
    timeZone: "Asia/Jerusalem",
  },
  byzantium: {
    id: "byzantium",
    name: "Byzantium",
    timeZone: "Europe/Istanbul",
  },
  samarkand: {
    id: "samarkand",
    name: "Samarkand",
    timeZone: "Asia/Samarkand",
  },
  baghdad: {
    id: "baghdad",
    name: "Baghdad",
    timeZone: "Asia/Baghdad",
  },
  varanasi: {
    id: "varanasi",
    name: "Varanasi",
    timeZone: "Asia/Kolkata",
  },
  angkor: {
    id: "angkor",
    name: "Angkor",
    timeZone: "Asia/Phnom_Penh",
  },
  xian: {
    id: "xian",
    name: "Xi'an",
    timeZone: "Asia/Shanghai",
  },
  kyoto: {
    id: "kyoto",
    name: "Kyoto",
    timeZone: "Asia/Tokyo",
  },
  "easter-island": {
    id: "easter-island",
    name: "Easter Island",
    timeZone: "Pacific/Easter",
  },
  timbuktu: {
    id: "timbuktu",
    name: "Timbuktu",
    timeZone: "Africa/Bamako",
  },
  "mesa-verde": {
    id: "mesa-verde",
    name: "Mesa Verde",
    timeZone: "America/Denver",
  },
  "machu-picchu": {
    id: "machu-picchu",
    name: "Machu Picchu",
    timeZone: "America/Lima",
  },
};

const SHUFFLE_CITY_IDS: CityId[] = [
  "damascus",
  "petra",
  "alexandria",
  "aksum",
  "troy",
  "athens",
  "olympia",
  "pompeii",
  "jerusalem",
  "byzantium",
  "samarkand",
  "baghdad",
  "varanasi",
  "angkor",
  "xian",
  "kyoto",
  "easter-island",
  "timbuktu",
  "mesa-verde",
  "machu-picchu",
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

  const hasDifferentSky = (id: CityId) =>
    getSkyBandAtMinute(
      getMinuteOfDayInTimeZone(CITIES[id].timeZone),
    ).name !== currentBand.name;

  const deck = getStoredShuffleDeck().filter((id) => id !== current);
  const fullPool = SHUFFLE_CITY_IDS.filter((id) => id !== current);

  const deckDifferent = deck.filter(hasDifferentSky);
  const fullDifferent = fullPool.filter(hasDifferentSky);

  const pool =
    deckDifferent.length > 0
      ? deckDifferent
      : fullDifferent.length > 0
        ? fullDifferent
        : fullPool;

  const nextCityId = pool[Math.floor(Math.random() * pool.length)];

  const baseDeck = deckDifferent.length > 0 ? deck : fullPool;
  storeShuffleDeck(baseDeck.filter((id) => id !== nextCityId));

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
