import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ADMIN_PAGE_SIZE = 8;

/**
 * Hook utilitário pra paginação client-side de qualquer lista.
 * - Quando a lista encolhe e a página atual deixa de existir, "safePage"
 *   já clampa pra última página válida — sem precisar de useEffect+setState
 *   (que pode causar loops de render).
 */
export function usePagination<T>(items: T[], pageSize = ADMIN_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  const from = items.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, items.length);

  // Estabiliza a referência pra evitar re-renders desnecessários em filhos.
  const setPageSafe = useCallback((p: number) => setPage(Math.max(1, p)), []);

  return {
    page: safePage,
    setPage: setPageSafe,
    totalPages,
    pageItems,
    from,
    to,
    total: items.length,
  };
}

interface PaginationProps {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onChange: (page: number) => void;
  unit?: string;
}

export function Pagination({
  page,
  totalPages,
  from,
  to,
  total,
  onChange,
  unit = "resultados",
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/5 px-4 py-3">
      <p className="text-xs text-white/50 tabular-nums">
        {total === 0 ? `0 ${unit}` : `${from}–${to} de ${total} ${unit}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 text-xs tabular-nums text-white/70">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
