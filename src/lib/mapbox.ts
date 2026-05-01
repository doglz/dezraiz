import type { SearchPlace } from "@/components/SearchCards";

const CATEGORY_QUERIES: Record<string, string> = {
  restaurant: "restaurante",
  real_estate: "apartamento aluguel",
  bank: "banco",
  hospital: "hospital clínica médico",
  car_rental: "aluguel de carro locadora",
  remittance: "money transfer câmbio remessa",
};

function kmBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

export async function searchNearby(
  category: string,
  coords: { lat: number; lng: number },
  token: string
): Promise<SearchPlace[]> {
  const query = CATEGORY_QUERIES[category] ?? category;
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?proximity=${coords.lng},${coords.lat}` +
    `&types=poi` +
    `&limit=5` +
    `&language=pt` +
    `&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const json = await res.json() as {
    features: Array<{
      id: string;
      text: string;
      place_name: string;
      geometry: { coordinates: [number, number] };
    }>;
  };

  return (json.features ?? []).map((f) => {
    const [lng, lat] = f.geometry.coordinates;
    return {
      id: f.id,
      name: f.text,
      address: f.place_name.replace(`${f.text}, `, ""),
      distance: kmBetween(coords.lat, coords.lng, lat, lng),
      lat,
      lng,
    };
  });
}

export async function getUserCoords(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
