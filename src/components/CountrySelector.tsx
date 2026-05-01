import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X } from "lucide-react";
import { List, type RowComponentProps } from "react-window";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  COUNTRIES_UNIQUE,
  FEATURED_COUNTRIES,
  callingCode,
  flagEmoji,
  searchCountries,
  type Country,
} from "@/lib/countries";

interface Props {
  value: string; // iso2
  onChange: (iso2: string) => void;
  /** Optional id used for aria-controls / labelling. */
  id?: string;
  /** Disabled state passes through to the trigger button. */
  disabled?: boolean;
  /** Hide the dialing code on the trigger (just show flag + chevron). */
  compact?: boolean;
}

type Item =
  | { kind: "header"; label: string }
  | { kind: "country"; country: Country };

const ROW_H = 48;
const HEADER_H = 32;

export function CountrySelector({
  value,
  onChange,
  id,
  disabled,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const selected =
    COUNTRIES_UNIQUE.find((c) => c.iso2 === value) ?? FEATURED_COUNTRIES[0];

  // Detect mobile viewport for sheet vs popover.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);

  const close = () => {
    setOpen(false);
    // Return focus to trigger for accessibility.
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`País: ${selected.namePt}, código +${callingCode(selected.iso2)}`}
        className={[
          "flex h-full items-center gap-1.5 px-3.5 text-sm font-medium",
          "text-foreground transition-colors hover:bg-muted/60",
          "focus:outline-none focus-visible:bg-muted/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        <span className="text-base leading-none" aria-hidden>
          {flagEmoji(selected.iso2)}
        </span>
        {!compact && (
          <span className="tabular-nums text-muted-foreground">
            +{callingCode(selected.iso2)}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        (isMobile ? (
          <CountrySheet
            selectedIso2={selected.iso2}
            onSelect={(c) => {
              onChange(c.iso2);
              close();
            }}
            onClose={close}
          />
        ) : (
          <CountryPopover
            anchor={triggerRef.current}
            selectedIso2={selected.iso2}
            onSelect={(c) => {
              onChange(c.iso2);
              close();
            }}
            onClose={close}
          />
        ))}
    </>
  );
}

/* ──────────────── Desktop popover ──────────────── */

function CountryPopover({
  anchor,
  selectedIso2,
  onSelect,
  onClose,
}: {
  anchor: HTMLElement | null;
  selectedIso2: string;
  onSelect: (c: Country) => void;
  onClose: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX });
  }, [anchor]);

  // Click outside / esc to close
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (
        !ref.current.contains(e.target as Node) &&
        !anchor?.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Selecionar país"
      style={{ position: "absolute", top: pos.top, left: pos.left }}
      className="z-50 w-[360px] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl animate-[fadeUp_0.18s_ease-out]"
    >
      <CountryListBody
        selectedIso2={selectedIso2}
        onSelect={onSelect}
        listHeight={360}
      />
    </div>,
    document.body,
  );
}

/* ──────────────── Mobile bottom sheet ──────────────── */

function CountrySheet({
  selectedIso2,
  onSelect,
  onClose,
}: {
  selectedIso2: string;
  onSelect: (c: Country) => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        key="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar país"
        initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
        transition={
          reduceMotion ? { duration: 0.15 } : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
        }
        className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col rounded-t-3xl bg-popover text-popover-foreground shadow-2xl"
      >
        <div className="flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-1">
          <h2 className="text-base font-semibold text-foreground">Escolha o país</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <CountryListBody
            selectedIso2={selectedIso2}
            onSelect={onSelect}
            listHeight={undefined}
          />
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

/* ──────────────── Shared body (search + virtualized list) ──────────────── */

function CountryListBody({
  selectedIso2,
  onSelect,
  listHeight,
}: {
  selectedIso2: string;
  onSelect: (c: Country) => void;
  /** When undefined, fills available container height (mobile sheet). */
  listHeight: number | undefined;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Focus search input on mount, but don't scroll the page (mobile).
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const items: Item[] = useMemo(() => {
    if (query.trim()) {
      const results = searchCountries(query);
      return results.map((c) => ({ kind: "country" as const, country: c }));
    }
    const out: Item[] = [];
    out.push({ kind: "header", label: "Mais comuns" });
    for (const c of FEATURED_COUNTRIES) out.push({ kind: "country", country: c });
    out.push({ kind: "header", label: "Todos os países" });
    for (const c of COUNTRIES_UNIQUE) out.push({ kind: "country", country: c });
    return out;
  }, [query]);

  // Indexes of selectable rows for keyboard navigation.
  const selectableIndexes = useMemo(
    () =>
      items.reduce<number[]>((acc, it, i) => {
        if (it.kind === "country") acc.push(i);
        return acc;
      }, []),
    [items],
  );

  // Reset active when results change.
  useEffect(() => {
    setActiveIndex(selectableIndexes[0] ?? 0);
  }, [selectableIndexes]);

  const moveActive = (dir: 1 | -1) => {
    const pos = selectableIndexes.indexOf(activeIndex);
    const next = Math.max(
      0,
      Math.min(selectableIndexes.length - 1, (pos === -1 ? 0 : pos) + dir),
    );
    setActiveIndex(selectableIndexes[next]);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = items[activeIndex];
      if (it?.kind === "country") onSelect(it.country);
    }
  };

  return (
    <div className="flex h-full flex-col" onKeyDown={onKey}>
      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar país ou código..."
            aria-label="Buscar país"
            className="h-10 w-full rounded-xl bg-muted pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)]/40"
          />
        </div>
      </div>

      {/* List */}
      <div ref={listRef} className="min-h-0 flex-1">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum país encontrado para “{query}”.
            </p>
          </div>
        ) : (
          <List
            rowCount={items.length}
            rowHeight={(i) => (items[i].kind === "header" ? HEADER_H : ROW_H)}
            defaultHeight={listHeight ?? 480}
            rowComponent={Row}
            rowProps={{
              items,
              selectedIso2,
              activeIndex,
              onSelect,
              setActiveIndex,
            }}
            className="!overflow-x-hidden"
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────── Row component ──────────────── */

interface RowProps {
  items: Item[];
  selectedIso2: string;
  activeIndex: number;
  onSelect: (c: Country) => void;
  setActiveIndex: (i: number) => void;
}

function Row({
  index,
  style,
  items,
  selectedIso2,
  activeIndex,
  onSelect,
  setActiveIndex,
}: RowComponentProps<RowProps>) {
  const item = items[index];

  if (item.kind === "header") {
    return (
      <div
        style={style}
        className="flex items-end px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {item.label}
      </div>
    );
  }

  const c = item.country;
  const selected = c.iso2 === selectedIso2;
  const active = index === activeIndex;

  return (
    <button
      type="button"
      style={style}
      onMouseEnter={() => setActiveIndex(index)}
      onClick={() => onSelect(c)}
      className={[
        "flex w-full items-center gap-3 px-4 text-left transition-colors",
        active ? "bg-accent text-accent-foreground" : "bg-transparent hover:bg-muted",
        selected ? "font-semibold" : "",
      ].join(" ")}
    >
      <span className="text-lg leading-none" aria-hidden>
        {flagEmoji(c.iso2)}
      </span>
      <span className="flex-1 truncate text-sm text-foreground">{c.namePt}</span>
      <span className="tabular-nums text-sm text-muted-foreground">
        +{callingCode(c.iso2)}
      </span>
    </button>
  );
}
