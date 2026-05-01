import type { SearchPlace } from "@/components/SearchCards";

const CATEGORY_QUERIES: Record<string, string> = {
  restaurant: "restaurante",
  supermarket: "supermercado mercado",
  real_estate: "apartamento aluguel",
  hotel: "hotel pousada hostel",
  hospital: "hospital clínica médico",
  pharmacy: "farmácia drogaria",
  dentist: "dentista",
  veterinary: "veterinário clínica pet",
  bank: "banco",
  remittance: "money transfer câmbio remessa",
  car_rental: "aluguel de carro locadora",
  gas_station: "posto de gasolina",
  transit: "estação metro trem",
  park: "parque jardim",
  gym: "academia ginásio",
  shopping: "shopping loja",
  beauty: "salão cabeleireiro",
  worship: "igreja templo",
  school: "escola colégio",
  laundry: "lavanderia",
  consulate: "consulado embaixada",
  coworking: "coworking espaço de trabalho compartilhado",
  library: "biblioteca",
  police: "delegacia polícia",
  airport: "aeroporto",
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
      imageUrl:
        `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static` +
        `/pin-s+12b76a(${lng},${lat})/${lng},${lat},15,0/384x192@2x` +
        `?access_token=${token}`,
    };
  });
}

export async function getUserCoords(): Promise<{ lat: number; lng: number; accuracy?: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }

    let best: { lat: number; lng: number; accuracy: number } | null = null;
    let watchId: number;

    const finish = () => {
      navigator.geolocation.clearWatch(watchId);
      resolve(best);
    };

    // Give up to 8 seconds; resolve early if accuracy < 50m
    const timer = setTimeout(finish, 8000);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = pos.coords.accuracy;
        if (!best || acc < best.accuracy) {
          best = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: acc };
        }
        if (acc < 50) {
          clearTimeout(timer);
          finish();
        }
      },
      () => { clearTimeout(timer); finish(); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}
