"use client";

import NumberFlow from "@number-flow/react";
import { TextMorph } from "torph/react";
import { useEffect, useState } from "react";
import { useCity } from "./CityProvider";
import { getTimePartsInTimeZone } from "../lib/city";

type Time = { hour: number; minute: number; dayPeriod: string };

export function CopenhagenTime() {
  const { city, shuffleCity } = useCity();
  const [time, setTime] = useState<Time | null>(null);

  useEffect(() => {
    if (!city) return;

    const updateTime = () => {
      setTime(getTimePartsInTimeZone(city.timeZone));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [city]);

  if (!time || !city) {
    return <span className="tabular-nums">&nbsp;</span>;
  }

  return (
    <span className="tabular-nums">
      <NumberFlow value={time.hour} />
      :
      <NumberFlow value={time.minute} format={{ minimumIntegerDigits: 2 }} />
      {time.dayPeriod}&nbsp;in{" "}
      <button
        type="button"
        className="city-shuffle-group"
        aria-label="Shuffle city"
        onClick={shuffleCity}
      >
        <TextMorph
          as="span"
          className="city-name-morph"
          duration={260}
          ease="cubic-bezier(0.23, 1, 0.32, 1)"
          locale="en"
        >
          {city.name}
        </TextMorph>
        <span className="city-shuffle-button" aria-hidden="true">
          <ShuffleIcon />
        </span>
      </button>
    </span>
  );
}

function ShuffleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-shuffle"
    >
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}
