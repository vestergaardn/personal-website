import { formatHex, interpolate } from "culori";

const DAY_MINUTES = 24 * 60;

export type SkyStop = {
  position: number;
  color: string;
};

export type SkySample = {
  position: number;
  color: string;
};

export const SKY_RENDER_POSITIONS = [0, 10, 20, 35, 50, 65, 80, 90, 100];

export const SKY_BANDS = [
  {
    name: "Night",
    range: "22:00-05:00",
    start: 22 * 60,
    end: 5 * 60,
    stops: [
      { position: 0, color: "#222" },
      { position: 100, color: "#1C425D" },
    ],
  },
  {
    name: "First light",
    range: "05:00-06:30",
    start: 5 * 60,
    end: 6 * 60 + 30,
    stops: [
      { position: 0, color: "#011D2D" },
      { position: 59.71, color: "#21445E" },
      { position: 93, color: "#576A79" },
    ],
  },
  {
    name: "Sunrise",
    range: "06:30-07:30",
    start: 6 * 60 + 30,
    end: 7 * 60 + 30,
    stops: [
      { position: 0, color: "#042C4E" },
      { position: 41.83, color: "#4E72A0" },
      { position: 80.86, color: "#E9C399" },
      { position: 95, color: "#FFAB1C" },
      { position: 100, color: "#E66D00" },
    ],
  },
  {
    name: "Soft haze",
    range: "07:30-10:00",
    start: 7 * 60 + 30,
    end: 10 * 60,
    stops: [
      { position: 20, color: "#5187B4" },
      { position: 40.05, color: "#879EBC" },
      { position: 85.21, color: "#E2C7A8" },
    ],
  },
  {
    name: "Noon",
    range: "10:00-17:30",
    start: 10 * 60,
    end: 17 * 60 + 30,
    stops: [
      { position: 22.47, color: "#4289DE" },
      { position: 81.16, color: "#9ECFF7" },
    ],
  },
  {
    name: "Pink hour",
    range: "17:30-19:00",
    start: 17 * 60 + 30,
    end: 19 * 60,
    stops: [
      { position: 0, color: "#5187B4" },
      { position: 100, color: "#EBB2B1" },
    ],
  },
  {
    name: "Sunset",
    range: "19:00-20:00",
    start: 19 * 60,
    end: 20 * 60,
    stops: [
      { position: 0, color: "#004B8A" },
      { position: 56.48, color: "#8E97BB" },
      { position: 80.86, color: "#EC895C" },
      { position: 100, color: "#D86464" },
    ],
  },
  {
    name: "Nightfall",
    range: "20:00-22:00",
    start: 20 * 60,
    end: 22 * 60,
    stops: [
      { position: 0, color: "#011D2D" },
      { position: 75.62, color: "#21445E" },
      { position: 100, color: "#9C797A" },
    ],
  },
] as const;

function normalizeMinute(minute: number) {
  return ((minute % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
}

function normalizeStops(stops: readonly SkyStop[]) {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const normalized = [...sorted];

  if (first.position > 0) {
    normalized.unshift({ position: 0, color: first.color });
  }

  if (last.position < 100) {
    normalized.push({ position: 100, color: last.color });
  }

  return normalized;
}

function sampleStops(stops: readonly SkyStop[], position: number) {
  const normalized = normalizeStops(stops);
  const nextIndex = normalized.findIndex((stop) => stop.position >= position);

  if (nextIndex <= 0) {
    return normalized[0].color;
  }

  const next = normalized[nextIndex];
  const previous = normalized[nextIndex - 1];

  if (!next || position === previous.position) {
    return previous.color;
  }

  if (position === next.position) {
    return next.color;
  }

  const amount =
    (position - previous.position) / (next.position - previous.position);
  const mix = interpolate([previous.color, next.color], "rgb");

  return formatHex(mix(amount));
}

export function getSkyBandAtMinute(minute: number) {
  const normalized = normalizeMinute(minute);

  return (
    SKY_BANDS.find((band) => {
      if (band.start < band.end) {
        return normalized >= band.start && normalized < band.end;
      }

      return normalized >= band.start || normalized < band.end;
    }) ?? SKY_BANDS[0]
  );
}

export function getSkySamples(band: (typeof SKY_BANDS)[number]) {
  return SKY_RENDER_POSITIONS.map((position): SkySample => {
    return { position, color: sampleStops(band.stops, position) };
  });
}

export function buildSkyGradient(samples: readonly SkySample[]) {
  const stops = samples
    .map((sample) => `${sample.color} ${sample.position}%`)
    .join(", ");

  return `linear-gradient(180deg, ${stops})`;
}
