// Free global APIs for country/state/city data and precise geocoding.
//   - countriesnow.space  (no key, no rate auth) → countries / states / cities
//   - nominatim.openstreetmap.org (no key) → reverse-geocode lat/lng → address
//
// Per Nominatim usage policy, requests must include a descriptive User-Agent
// (browsers set this automatically; we add an Accept-Language hint instead).

import type { PreciseLocation } from "./auth";

const CN_BASE = "https://countriesnow.space/api/v0.1";
const NOMINATIM = "https://nominatim.openstreetmap.org";

export interface CountryItem {
  name: string;
  iso2: string;
  iso3: string;
  emoji: string;
}

export async function fetchCountries(): Promise<CountryItem[]> {
  const res = await fetch(`${CN_BASE}/countries/iso`);
  const json = (await res.json()) as {
    data: { name: string; Iso2: string; Iso3: string }[];
  };
  return json.data
    .map((c) => ({
      name: c.name,
      iso2: c.Iso2,
      iso3: c.Iso3,
      emoji: iso2ToFlag(c.Iso2),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchStates(country: string): Promise<string[]> {
  const res = await fetch(`${CN_BASE}/countries/states`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country }),
  });
  const json = (await res.json()) as {
    data?: { states?: { name: string }[] };
  };
  return (json.data?.states ?? []).map((s) => s.name).sort();
}

export async function fetchCities(
  country: string,
  state: string,
): Promise<string[]> {
  const res = await fetch(`${CN_BASE}/countries/state/cities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country, state }),
  });
  const json = (await res.json()) as { data?: string[] };
  return (json.data ?? []).sort();
}

export interface NominatimAddress {
  country?: string;
  country_code?: string;
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  postcode?: string;
}

export interface NominatimResult {
  display_name: string;
  address: NominatimAddress;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  lang = "pt-BR",
): Promise<NominatimResult> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${lang}&zoom=18`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return (await res.json()) as NominatimResult;
}

export function nominatimToLocation(
  r: NominatimResult,
  coords?: { latitude: number; longitude: number; accuracy?: number },
): PreciseLocation {
  const a = r.address;
  return {
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    accuracy: coords?.accuracy,
    country: a.country ?? "",
    countryCode: a.country_code?.toUpperCase(),
    state: a.state ?? a.county,
    city: a.city ?? a.town ?? a.village,
    neighbourhood: a.neighbourhood ?? a.suburb ?? a.quarter,
    postcode: a.postcode,
    formatted: r.display_name,
  };
}

export function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocalização não disponível"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

function iso2ToFlag(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return "🌎";
  const A = 0x1f1e6;
  const cc = iso2.toUpperCase();
  return String.fromCodePoint(
    A + cc.charCodeAt(0) - 65,
    A + cc.charCodeAt(1) - 65,
  );
}
