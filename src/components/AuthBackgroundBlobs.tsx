/**
 * Blobs decorativos suaves para o fundo da tela de autenticação.
 * Usa a cor primária da marca com opacidade baixa. Puramente decorativo.
 */
export function AuthBackgroundBlobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Blob grande topo-direita */}
      <div
        className="absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      {/* Blob inferior-esquerda */}
      <div
        className="absolute -bottom-48 -left-32 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--primary-glow)" }}
      />
      {/* Círculos pequenos sólidos */}
      <div
        className="absolute left-[12%] top-[18%] h-6 w-6 rounded-full opacity-60"
        style={{ background: "var(--primary-glow)" }}
      />
      <div
        className="absolute right-[8%] top-[55%] h-4 w-4 rounded-full opacity-50"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="absolute left-[20%] bottom-[14%] h-3 w-3 rounded-full opacity-40"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="absolute right-[22%] bottom-[22%] h-8 w-8 rounded-full opacity-25"
        style={{ background: "var(--primary-glow)" }}
      />
    </div>
  );
}
