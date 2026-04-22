"use client";

import NumberFlow from "@number-flow/react";
import { useSyncExternalStore } from "react";

type Time = { hour: number; minute: number; dayPeriod: string };

function getCopenhagenParts(): Time {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Copenhagen",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const parts = fmt.formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const dayPeriod = (parts.find((p) => p.type === "dayPeriod")?.value ?? "am").toLowerCase();
  return { hour, minute, dayPeriod };
}

let snapshot: Time | null = null;
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick() {
  const next = getCopenhagenParts();
  if (
    !snapshot ||
    snapshot.hour !== next.hour ||
    snapshot.minute !== next.minute ||
    snapshot.dayPeriod !== next.dayPeriod
  ) {
    snapshot = next;
    listeners.forEach((l) => l());
  }
}

function subscribe(callback: () => void) {
  if (listeners.size === 0) {
    snapshot = getCopenhagenParts();
    intervalId = setInterval(tick, 1000);
  }
  listeners.add(callback);
  queueMicrotask(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = (): Time | null => null;

export function CopenhagenTime() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!time) {
    return <span className="tabular-nums">&nbsp;</span>;
  }

  return (
    <span className="tabular-nums">
      <NumberFlow value={time.hour} />
      :
      <NumberFlow value={time.minute} format={{ minimumIntegerDigits: 2 }} />
      {time.dayPeriod}&nbsp;in Copenhagen
    </span>
  );
}
