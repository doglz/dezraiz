import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon?: LucideIcon;
  hint?: string;
  accent?: "green" | "yellow" | "default";
}

export function StatCard({ label, value, delta, icon: Icon, hint, accent = "default" }: StatCardProps) {
  const accentColor =
    accent === "green" ? "#27c166" : accent === "yellow" ? "#f5d547" : "#f0efe9";

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
          {label}
        </p>
        {Icon && (
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5">
            <Icon className="h-4 w-4" style={{ color: accentColor }} />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums" style={{ color: accentColor }}>
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {delta ? (
          <span
            className={[
              "inline-flex items-center gap-1 text-xs font-medium",
              delta.positive ? "text-[#27c166]" : "text-red-400",
            ].join(" ")}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {delta.value}
          </span>
        ) : (
          <span />
        )}
        {hint && <span className="text-[11px] text-white/40">{hint}</span>}
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-7 w-32 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-3 w-16 animate-pulse rounded bg-white/10" />
    </div>
  );
}
