import { ExternalLink } from "lucide-react";

export type SearchPlace = {
  id: string;
  name: string;
  address: string;
  distance?: string;
  imageUrl?: string;
  lat: number;
  lng: number;
};

export type SearchCardsMeta = {
  places: SearchPlace[];
  label: string;
  emoji: string;
  loading: boolean;
  noLocation?: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  "🍽️": "from-orange-500/20 to-orange-900/10",
  "🏠": "from-blue-500/20 to-blue-900/10",
  "🏦": "from-emerald-500/20 to-emerald-900/10",
  "🏥": "from-red-500/20 to-red-900/10",
  "🚗": "from-violet-500/20 to-violet-900/10",
  "💸": "from-yellow-500/20 to-yellow-900/10",
};

function mapsUrl(place: SearchPlace) {
  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
}

export function SearchCards({ places, label, emoji, loading, noLocation }: SearchCardsMeta) {
  const gradient = CATEGORY_COLORS[emoji] ?? "from-[var(--color-primary-soft)] to-[var(--color-secondary)]";

  if (loading) {
    return (
      <div className="mt-3">
        <p className="mb-2 text-[12px] font-semibold text-[var(--color-muted-foreground)]">
          {emoji} Buscando {label}…
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-48 flex-none rounded-2xl bg-[var(--color-secondary)] animate-pulse h-32"
            />
          ))}
        </div>
      </div>
    );
  }

  if (noLocation) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
        <span className="text-xl">{emoji}</span>
        <p className="text-[13px] text-[var(--color-muted-foreground)]">
          Habilite a localização no navegador para ver {label.toLowerCase()} perto de você.
        </p>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
        <span className="text-xl">{emoji}</span>
        <p className="text-[13px] text-[var(--color-muted-foreground)]">
          Não encontrei {label.toLowerCase()} próximos agora. Tente buscar por
          outro tipo de lugar.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <p className="mb-2 text-[12px] font-semibold text-[var(--color-muted-foreground)]">
        {emoji} {label} encontrados
      </p>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-none">
        {places.map((place) => (
          <a
            key={place.id}
            href={mapsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-48 flex-none overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-elev-1)] transition-transform active:scale-[0.98]"
          >
            {/* Header */}
            <div
              className={`relative flex h-20 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}
            >
              {place.imageUrl ? (
                <img
                  src={place.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl">{emoji}</span>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-[var(--color-card)]/95 px-2 py-0.5 text-sm shadow-[var(--shadow-elev-1)]">
                {emoji}
              </span>
              {place.distance && (
                <span className="absolute bottom-2 right-2 rounded-full bg-[var(--color-card)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-foreground)]">
                  {place.distance}
                </span>
              )}
            </div>
            {/* Body */}
            <div className="p-3">
              <p className="line-clamp-1 text-[13px] font-bold leading-tight text-[var(--color-foreground)]">
                {place.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-[var(--color-muted-foreground)]">
                {place.address}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[var(--color-primary)]">
                  Ver no mapa
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
