"use client";

import { useEffect, useRef, useState } from "react";

const DAY_MINUTES = 24 * 60;

const SKY_COLOR_PROPERTIES = [
  "--sky-1",
  "--sky-2",
  "--sky-3",
  "--sky-4",
  "--sky-5",
] as const;

const SKY_KEYFRAMES = [
  {
    time: 0,
    colors: {
      "--sky-1": "#222222",
      "--sky-2": "#222222",
      "--sky-3": "#222222",
      "--sky-4": "#222222",
      "--sky-5": "#222222",
    },
  },
  {
    time: 270,
    colors: {
      "--sky-1": "#222222",
      "--sky-2": "#222222",
      "--sky-3": "#222222",
      "--sky-4": "#222222",
      "--sky-5": "#222222",
    },
  },
  {
    time: 330,
    colors: {
      "--sky-1": "#011D2D",
      "--sky-2": "#062335",
      "--sky-3": "#15364C",
      "--sky-4": "#1D3F58",
      "--sky-5": "#21445E",
    },
  },
  {
    time: 390,
    colors: {
      "--sky-1": "#50708B",
      "--sky-2": "#778699",
      "--sky-3": "#D19C45",
      "--sky-4": "#FFA71B",
      "--sky-5": "#FF7816",
    },
  },
  {
    time: 480,
    colors: {
      "--sky-1": "#50708B",
      "--sky-2": "#778699",
      "--sky-3": "#B39379",
      "--sky-4": "#D29A69",
      "--sky-5": "#D29A69",
    },
  },
  {
    time: 600,
    colors: {
      "--sky-1": "#476C98",
      "--sky-2": "#4D77A4",
      "--sky-3": "#568BB8",
      "--sky-4": "#5A92BF",
      "--sky-5": "#5A92BF",
    },
  },
  {
    time: 720,
    colors: {
      "--sky-1": "#3772C7",
      "--sky-2": "#3E87D8",
      "--sky-3": "#4BAAF4",
      "--sky-4": "#50B7FF",
      "--sky-5": "#50B7FF",
    },
  },
  {
    time: 840,
    colors: {
      "--sky-1": "#476C98",
      "--sky-2": "#4D77A4",
      "--sky-3": "#568BB8",
      "--sky-4": "#5A92BF",
      "--sky-5": "#5A92BF",
    },
  },
  {
    time: 930,
    colors: {
      "--sky-1": "#50708B",
      "--sky-2": "#778699",
      "--sky-3": "#B39379",
      "--sky-4": "#D29A69",
      "--sky-5": "#D29A69",
    },
  },
  {
    time: 1020,
    colors: {
      "--sky-1": "#50708B",
      "--sky-2": "#778699",
      "--sky-3": "#B39379",
      "--sky-4": "#D29A69",
      "--sky-5": "#D29A69",
    },
  },
  {
    time: 1230,
    colors: {
      "--sky-1": "#50708B",
      "--sky-2": "#778699",
      "--sky-3": "#D19C45",
      "--sky-4": "#FFA71B",
      "--sky-5": "#FF7816",
    },
  },
  {
    time: 1320,
    colors: {
      "--sky-1": "#011D2D",
      "--sky-2": "#062335",
      "--sky-3": "#15364C",
      "--sky-4": "#1D3F58",
      "--sky-5": "#21445E",
    },
  },
  {
    time: 1410,
    colors: {
      "--sky-1": "#222222",
      "--sky-2": "#222222",
      "--sky-3": "#222222",
      "--sky-4": "#222222",
      "--sky-5": "#222222",
    },
  },
] as const;

function minutesSinceMidnight() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatMinute(minute: number) {
  const normalized = ((minute % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hour = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function setSkyColorsAtMinute(el: HTMLElement, minute: number) {
  const normalized = ((minute % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const active = [...SKY_KEYFRAMES]
    .reverse()
    .find((keyframe) => keyframe.time <= normalized) ?? SKY_KEYFRAMES[0];

  SKY_COLOR_PROPERTIES.forEach((property) => {
    el.style.setProperty(property, active.colors[property]);
  });
}

export function SkyGradient() {
  const skyRef = useRef<HTMLDivElement>(null);
  const [previewMinute, setPreviewMinute] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (isPreviewing) return;
    const initialSync = setTimeout(() => {
      setPreviewMinute(minutesSinceMidnight());
    }, 0);
    const interval = setInterval(() => {
      setPreviewMinute(minutesSinceMidnight());
    }, 60 * 1000);
    return () => {
      clearTimeout(initialSync);
      clearInterval(interval);
    };
  }, [isPreviewing]);

  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;

    if (isPreviewing) {
      setSkyColorsAtMinute(sky, previewMinute);
      return;
    }

    const syncToCurrentBand = () => {
      setSkyColorsAtMinute(sky, minutesSinceMidnight());
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncToCurrentBand();
      }
    };

    syncToCurrentBand();
    const updateInterval = setInterval(syncToCurrentBand, 60 * 1000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(updateInterval);
    };
  }, [isPreviewing, previewMinute]);

  return (
    <>
      <div ref={skyRef} className="sky-background" aria-hidden="true" />
      <div className="fixed left-1/2 bottom-5 z-50 flex w-[min(520px,calc(100vw-32px))] -translate-x-1/2 items-center gap-3 rounded-md bg-[rgba(0,0,0,0.32)] px-3 py-2 text-[12px] text-[#ffffff] shadow-[0_12px_32px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <label htmlFor="sky-time-preview" className="shrink-0 font-medium">
          {formatMinute(previewMinute)}
        </label>
        <input
          id="sky-time-preview"
          type="range"
          min="0"
          max={DAY_MINUTES - 1}
          step="1"
          value={previewMinute}
          aria-label="Preview sky time"
          className="h-6 min-w-0 flex-1 accent-white"
          onChange={(event) => {
            setIsPreviewing(true);
            setPreviewMinute(Number(event.currentTarget.value));
          }}
        />
        <button
          type="button"
          className="h-7 shrink-0 rounded px-2 text-[#ffffff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] active:scale-[0.96]"
          onClick={() => {
            setIsPreviewing(false);
            setPreviewMinute(minutesSinceMidnight());
          }}
        >
          Auto
        </button>
      </div>
    </>
  );
}
