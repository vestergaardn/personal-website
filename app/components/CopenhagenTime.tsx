"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

function getCopenhagenParts() {
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

export function CopenhagenTime() {
  const [time, setTime] = useState<{ hour: number; minute: number; dayPeriod: string } | null>(null);

  useEffect(() => {
    setTime(getCopenhagenParts());
    const id = setInterval(() => setTime(getCopenhagenParts()), 1000);
    return () => clearInterval(id);
  }, []);

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
