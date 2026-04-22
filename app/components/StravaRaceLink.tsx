import { getStravaSummary } from "../lib/strava";
import { StravaLink } from "./StravaLink";

const STRAVA_PROFILE_URL = "https://www.strava.com/athletes/51203029";

export async function StravaRaceLink() {
  const summary = await getStravaSummary();
  return (
    <StravaLink href={STRAVA_PROFILE_URL} summary={summary}>
      race my bike
    </StravaLink>
  );
}

export function StravaRaceLinkFallback() {
  return (
    <a
      href={STRAVA_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#000000] hover:text-[#000000] dark:text-[#ffffff] dark:hover:text-[#ffffff]"
    >
      race my bike
    </a>
  );
}
