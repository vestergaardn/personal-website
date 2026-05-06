"use client";

import { formatHex, interpolate } from "culori";
import { useEffect, useRef, useState } from "react";
import { useCity } from "./CityProvider";
import { getMinuteOfDayInTimeZone, type City } from "../lib/city";
import {
  buildSkyGradient,
  getSkyBandAtMinute,
  getSkySamples,
  type SkySample,
} from "../lib/sky";

type SkyBand = ReturnType<typeof getSkyBandAtMinute>;

const SKY_TRANSITION_MS = 8000;
const INITIAL_SAMPLES = getSkySamples(getSkyBandAtMinute(0));
const INITIAL_GRADIENT = buildSkyGradient(INITIAL_SAMPLES);

function easeInOut(progress: number) {
  return 0.5 - Math.cos(progress * Math.PI) / 2;
}

function interpolateSamples(
  fromSamples: readonly SkySample[],
  toSamples: readonly SkySample[],
  progress: number,
) {
  return fromSamples.map((fromSample, index) => {
    const toSample = toSamples[index];
    const mix = interpolate([fromSample.color, toSample.color], "rgb");
    return {
      position: fromSample.position,
      color: formatHex(mix(progress)),
    };
  });
}

export function SkyGradient() {
  const { city } = useCity();
  const [band, setBand] = useState<SkyBand | null>(null);
  const [gradient, setGradient] = useState(INITIAL_GRADIENT);
  const bandRef = useRef<SkyBand | null>(null);
  const cityIdRef = useRef<string | null>(null);
  const samplesRef = useRef<SkySample[]>(INITIAL_SAMPLES);
  const animationRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (!city) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = reducedMotion.matches;

    const stopAnimation = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const setTargetSky = (nextBand: SkyBand, animate: boolean) => {
      const targetSamples = getSkySamples(nextBand);

      if (!animate || reducedMotionRef.current) {
        stopAnimation();
        samplesRef.current = targetSamples;
        setGradient(buildSkyGradient(targetSamples));
        return;
      }

      stopAnimation();
      const fromSamples = samplesRef.current;
      const startTime = performance.now();

      const tick = (time: number) => {
        const rawProgress = Math.min(
          1,
          (time - startTime) / SKY_TRANSITION_MS,
        );
        const currentSamples = interpolateSamples(
          fromSamples,
          targetSamples,
          easeInOut(rawProgress),
        );

        samplesRef.current = currentSamples;
        setGradient(buildSkyGradient(currentSamples));

        if (rawProgress < 1) {
          animationRef.current = requestAnimationFrame(tick);
        } else {
          samplesRef.current = targetSamples;
          setGradient(buildSkyGradient(targetSamples));
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(tick);
    };

    const syncSky = (targetCity: City) => {
      const localMinute = getMinuteOfDayInTimeZone(targetCity.timeZone);
      const nextBand = getSkyBandAtMinute(localMinute);
      const previousBand = bandRef.current;
      const previousCityId = cityIdRef.current;
      const changedGradients =
        previousBand &&
        (previousBand.name !== nextBand.name ||
          previousCityId !== targetCity.id);

      if (changedGradients) {
        setTargetSky(nextBand, true);
      } else if (!previousBand) {
        setTargetSky(nextBand, false);
      }

      bandRef.current = nextBand;
      cityIdRef.current = targetCity.id;
      setBand(nextBand);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncSky(city);
      }
    };

    const handleReducedMotionChange = () => {
      reducedMotionRef.current = reducedMotion.matches;
      if (reducedMotion.matches && bandRef.current) {
        setTargetSky(bandRef.current, false);
      }
    };

    syncSky(city);
    const updateInterval = setInterval(() => syncSky(city), 10 * 1000);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleReducedMotionChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleReducedMotionChange);
      clearInterval(updateInterval);
      stopAnimation();
    };
  }, [city]);

  return (
    <div
      className="sky-background"
      data-sky={band?.name}
      data-sky-range={band?.range}
      aria-hidden="true"
      style={{ background: gradient }}
    />
  );
}
