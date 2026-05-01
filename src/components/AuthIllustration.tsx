/**
 * Ilustração estilo unDraw (flat, monocromática na cor primária da marca).
 * Tema: pessoa viajando / planejando mudança — alinha com o produto DEZRAIZ.
 * Cores puxadas de CSS vars para respeitar o design system.
 */
export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ color: "var(--primary)" }}
    >
      {/* Chão */}
      <ellipse cx="300" cy="440" rx="220" ry="14" fill="currentColor" opacity="0.12" />

      {/* Mala grande */}
      <g>
        <rect x="200" y="260" width="200" height="150" rx="14" fill="currentColor" />
        <rect x="200" y="260" width="200" height="28" rx="14" fill="currentColor" opacity="0.75" />
        <rect x="280" y="244" width="40" height="20" rx="4" fill="currentColor" opacity="0.85" />
        <rect x="220" y="310" width="160" height="4" rx="2" fill="white" opacity="0.7" />
        <rect x="220" y="330" width="160" height="4" rx="2" fill="white" opacity="0.4" />
        {/* etiqueta */}
        <circle cx="355" cy="370" r="14" fill="white" />
        <circle cx="355" cy="370" r="8" fill="currentColor" opacity="0.3" />
      </g>

      {/* Pessoa */}
      <g>
        {/* pernas */}
        <rect x="130" y="340" width="14" height="70" rx="6" fill="currentColor" opacity="0.9" />
        <rect x="150" y="340" width="14" height="70" rx="6" fill="currentColor" opacity="0.7" />
        {/* corpo */}
        <path
          d="M112 230 Q110 215 125 210 L175 210 Q190 215 188 230 L180 340 L120 340 Z"
          fill="currentColor"
        />
        {/* braço segurando mala */}
        <rect x="175" y="230" width="14" height="55" rx="7" fill="currentColor" opacity="0.85" transform="rotate(20 182 257)" />
        {/* cabeça */}
        <circle cx="150" cy="185" r="26" fill="white" stroke="currentColor" strokeWidth="3" />
        {/* cabelo */}
        <path d="M126 178 Q128 160 150 158 Q172 160 174 178 L170 172 Q160 168 150 168 Q140 168 130 172 Z" fill="currentColor" />
        {/* olhos */}
        <circle cx="143" cy="186" r="2" fill="currentColor" />
        <circle cx="157" cy="186" r="2" fill="currentColor" />
        {/* sorriso */}
        <path d="M144 194 Q150 198 156 194" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Balões/elementos flutuantes (mundo, avião) */}
      <g opacity="0.9">
        {/* globo */}
        <circle cx="460" cy="160" r="44" fill="white" stroke="currentColor" strokeWidth="3" />
        <path
          d="M416 160 Q460 130 504 160 M416 160 Q460 190 504 160 M460 116 L460 204 M434 140 Q460 150 486 140 M434 180 Q460 170 486 180"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
        {/* pino */}
        <circle cx="478" cy="145" r="5" fill="currentColor" />
      </g>

      {/* Avião */}
      <g opacity="0.9">
        <path
          d="M90 110 L140 90 L150 96 L115 110 L128 122 L120 126 L105 118 L92 124 L86 120 Z"
          fill="currentColor"
        />
      </g>

      {/* Linha tracejada (rota) */}
      <path
        d="M100 130 Q250 80 440 140"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="4 8"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Pontos decorativos */}
      <circle cx="540" cy="80" r="6" fill="currentColor" opacity="0.4" />
      <circle cx="70" cy="200" r="5" fill="currentColor" opacity="0.3" />
      <circle cx="550" cy="310" r="8" fill="currentColor" opacity="0.2" />
      <circle cx="60" cy="320" r="4" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
