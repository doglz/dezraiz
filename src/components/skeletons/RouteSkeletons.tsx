import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeletons for top-level routes.
 * Match the structure of the real screens so there's no layout shift
 * when content swaps in.
 */

export function ChatSkeleton() {
  return (
    <div
      className="flex min-h-[calc(100dvh-80px)] flex-col lg:min-h-[calc(100vh-4rem)] lg:rounded-3xl lg:border lg:border-[var(--color-zinc-200)] lg:bg-card lg:shadow-[var(--shadow-elev-1)]"
      aria-label="Carregando chat"
    >
      <header className="flex items-center gap-3 border-b border-[var(--color-zinc-200)] px-5 py-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </header>

      <div className="flex-1 space-y-4 px-4 py-5 lg:px-6">
        {/* AI bubble */}
        <div className="flex justify-start">
          <div className="w-[80%] max-w-md space-y-2 rounded-2xl bg-[var(--color-zinc-100)] p-3 lg:max-w-lg">
            <div className="h-3 w-[90%] rounded-md bg-foreground/15" />
            <div className="h-3 w-[75%] rounded-md bg-foreground/15" />
            <div className="h-3 w-[55%] rounded-md bg-foreground/15" />
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-20" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--color-zinc-200)] p-3">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function ChecklistSkeleton() {
  return (
    <div className="px-5 pt-6 lg:px-0 lg:pt-0" aria-label="Carregando checklist">
      <header className="space-y-3">
        <Skeleton className="h-8 w-56 lg:h-10 lg:w-72" />
        <Skeleton className="h-4 w-72 lg:w-96" />

        <div className="mt-5 space-y-3 rounded-2xl border border-[var(--color-zinc-200)] bg-[var(--color-zinc-50)] p-4 lg:max-w-2xl lg:p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </header>

      <ul className="mt-6 grid gap-2 pb-6 lg:grid-cols-2 lg:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-zinc-200)] bg-card p-4">
              <Skeleton className="mt-0.5 h-6 w-6 flex-none rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-[70%]" />
                <Skeleton className="h-3 w-[90%]" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8"
      aria-label="Carregando perfil"
    >
      <header className="mb-6">
        <Skeleton className="h-9 w-32" />
      </header>

      <div className="space-y-6">
        {/* Identity card */}
        <section className="rounded-2xl bg-[var(--color-zinc-50)] p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 flex-none rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-[var(--color-zinc-200)] pt-4">
            <Skeleton className="h-3.5 w-[70%]" />
            <Skeleton className="h-3 w-32" />
          </div>
        </section>

        {/* Two list sections */}
        {[4, 5].map((rows, idx) => (
          <section key={idx}>
            <Skeleton className="mb-2 ml-1 h-3 w-20" />
            <ul className="divide-y divide-[var(--color-zinc-100)] overflow-hidden rounded-2xl border border-[var(--color-zinc-200)] bg-card">
              {Array.from({ length: rows }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-4">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-3.5 flex-1 max-w-[60%]" />
                  <Skeleton className="h-[18px] w-[18px] rounded-md" />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <Skeleton className="mt-8 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
