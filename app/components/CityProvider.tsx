"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CITIES,
  DEFAULT_CITY_ID,
  getShuffledCityId,
  getStoredCityId,
  isCityId,
  storeCityId,
  STORAGE_KEY,
  type City,
  type CityId,
} from "../lib/city";

type CityContextValue = {
  city: City | null;
  cityId: CityId | null;
  shuffleCity: () => void;
  setCityId: (cityId: CityId) => void;
};

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cityId, setCityIdState] = useState<CityId | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setCityIdState(getStoredCityId());
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setCityIdState(isCityId(event.newValue) ? event.newValue : DEFAULT_CITY_ID);
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setCityId = useCallback((nextCityId: CityId) => {
    storeCityId(nextCityId);
    setCityIdState(nextCityId);
  }, []);

  const shuffleCity = useCallback(() => {
    setCityIdState((currentCityId) => {
      const nextCityId = getShuffledCityId(currentCityId ?? getStoredCityId());
      storeCityId(nextCityId);
      return nextCityId;
    });
  }, []);

  const value = useMemo<CityContextValue>(() => {
    return {
      city: cityId ? CITIES[cityId] : null,
      cityId,
      shuffleCity,
      setCityId,
    };
  }, [cityId, setCityId, shuffleCity]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const context = useContext(CityContext);

  if (!context) {
    throw new Error("useCity must be used within CityProvider");
  }

  return context;
}
