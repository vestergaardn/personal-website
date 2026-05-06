"use client";

import { useSyncExternalStore } from "react";
import { getSkyBandAtMinute } from "./sky";

export type CityId =
  | "copenhagen"
  | "boulder"
  | "osaka"
  | "babylon"
  | "san-francisco"
  | "kathmandu"
  | "nuuk"
  | "sparta"
  | "zurich";

export type City = {
  id: CityId;
  name: string;
  timeZone: string;
};

const STORAGE_KEY = "vestergaardn:selected-city";
const DEFAULT_CITY_ID: CityId = "copenhagen";
export const CITY_CHANGE_EVENT = "vestergaardn:city-change";

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
  "kathmandu",
  "nuuk",
  "sparta",
  "zurich",
];

type TimeParts = { hour: number; minute: number; dayPeriod: string };

let selectedCityId: CityId | null = null;
const listeners = new Set<() => void>();

function isCityId(value: string | null): value is CityId {
  return value !== null && value in CITIES;
}

function resolveInitialCityId(): CityId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isCityId(stored)) return stored;
  } catch {
    return DEFAULT_CITY_ID;
  }

  return DEFAULT_CITY_ID;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function getSelectedCityId(): CityId {
  if (selectedCityId === null) {
    selectedCityId = resolveInitialCityId();
  }

  return selectedCityId;
}

export function getSelectedCity() {
  return CITIES[getSelectedCityId()];
}

function subscribe(callback: () => void) {
  getSelectedCityId();
  listeners.add(callback);
  queueMicrotask(callback);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const next = isCityId(event.newValue) ? event.newValue : DEFAULT_CITY_ID;
    if (next === selectedCityId) return;
    selectedCityId = next;
    window.dispatchEvent(new CustomEvent(CITY_CHANGE_EVENT, { detail: next }));
    notify();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

const getSnapshot = () =>
  selectedCityId === null ? null : CITIES[selectedCityId];
const getServerSnapshot = (): City | null => null;

export function useSelectedCity() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setSelectedCity(id: CityId) {
  selectedCityId = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Selection still works for the current page if storage is unavailable.
  }
  notify();
  window.dispatchEvent(new CustomEvent(CITY_CHANGE_EVENT, { detail: id }));
}

export function shuffleSelectedCity() {
  const current = getSelectedCityId();
  const currentBand = getSkyBandAtMinute(
    getMinuteOfDayInTimeZone(CITIES[current].timeZone),
  );
  const candidates = SHUFFLE_CITY_IDS.filter((id) => id !== current);
  const differentSkyCandidates = candidates.filter((id) => {
    const candidateBand = getSkyBandAtMinute(
      getMinuteOfDayInTimeZone(CITIES[id].timeZone),
    );
    return candidateBand.name !== currentBand.name;
  });
  const pool =
    differentSkyCandidates.length > 0 ? differentSkyCandidates : candidates;
  const next = pool[Math.floor(Math.random() * pool.length)];
  setSelectedCity(next);
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
