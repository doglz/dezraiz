/**
 * Per-route SEO helpers.
 *
 * Single source of truth for canonical site URL, default OG image and the
 * tag shape used by every shareable route. Each leaf route calls `seo({ ... })`
 * inside its `head()` so titles, descriptions and OG metadata stay unique
 * per page (don't reuse the home page values across the app).
 */

const SITE_URL = "https://dezraiz.lovable.app";
const SITE_NAME = "DEZRAIZ";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface SeoInput {
  /** Page title — will be suffixed with " · DEZRAIZ" unless `rawTitle` is true. */
  title: string;
  description: string;
  /** Absolute path (e.g. "/checklist") for canonical + og:url. */
  path?: string;
  /** Override OG image (absolute URL). Defaults to the brand card. */
  image?: string;
  /** og:type — "website" (default) or "article". */
  type?: "website" | "article";
  /** Block crawlers (used for /login, /onboarding, /esqueci-senha, etc). */
  noindex?: boolean;
  /** Set true to skip the " · DEZRAIZ" suffix (e.g. on the home page). */
  rawTitle?: boolean;
}

type Meta = Record<string, string>;

export function seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  rawTitle = false,
}: SeoInput): { meta: Meta[]; links: Meta[] } {
  const fullTitle = rawTitle ? title : `${title} · ${SITE_NAME}`;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  const meta: Meta[] = [
    { title: fullTitle },
    { name: "description", content: description },

    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:locale", content: "pt_BR" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];

  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });

  const links: Meta[] = [{ rel: "canonical", href: url }];

  return { meta, links };
}
