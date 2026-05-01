import { Link, useLocation } from "@tanstack/react-router";
import {
  House,
  MessageCircle,
  CheckSquare,
  User,
  Map,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { loadChecklist } from "@/lib/checklist";

/**
 * BottomNav v2 — estilo Notium.
 *
 * 4 abas fixas. Auto-hide ao rolar para baixo, reaparece ao rolar para cima.
 * Quando oculta, mostra uma alça (handle) na borda inferior para trazer de volta.
 */
type MenuItem = {
  to: "/" | "/chat" | "/checklist" | "/profile" | "/mapa";
  label: string;
  icon: typeof House;
  badgeKey?: "checklist";
};

const MENU_ITEMS: readonly MenuItem[] = [
  { to: "/",          label: "Início",  icon: House },
  { to: "/chat",      label: "Chat",    icon: MessageCircle },
  { to: "/mapa",      label: "Mapa",    icon: Map },
  { to: "/checklist", label: "Tarefas", icon: CheckSquare, badgeKey: "checklist" },
  { to: "/profile",   label: "Perfil",  icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const reduce = useReducedMotion() ?? false;
  const [pending, setPending] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const update = () => {
      loadChecklist().then((items) => setPending(items.filter((i) => !i.done).length));
    };
    update();
    window.addEventListener("dezraiz:checklist", update);
    return () => {
      window.removeEventListener("dezraiz:checklist", update);
    };
  }, [location.pathname]);

  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  // Expose nav offset as a CSS variable so other elements (e.g. chat input)
  // can dock right above the BottomNav and follow its hide/show animation.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bottom-nav-offset", expanded ? "160px" : "0px");
    return () => {
      root.style.removeProperty("--bottom-nav-offset");
    };
  }, [expanded]);

  const handleLift = () => {
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
  };

  const handleHide = () => {
    setExpanded(false);
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.nav
            key="expanded-nav"
            aria-label="Navegação principal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-50 bottom-nav-safe"
          >
            <div className="mx-auto max-w-screen-sm px-4 pb-3 pt-2">
              <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)]/95 p-3 shadow-[var(--shadow-elev-3)] backdrop-blur supports-[backdrop-filter]:bg-[var(--color-card)]/85">
                <button
                  type="button"
                  onClick={handleHide}
                  aria-label="Ocultar menu de navegação"
                  className="mx-auto mb-2 flex h-8 w-12 items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-secondary)] shadow-[var(--shadow-elev-1)]"
                >
                  <ChevronDown className="h-4 w-4 text-[var(--color-foreground)]" strokeWidth={2.4} />
                </button>

                <div className="grid grid-cols-5 gap-1.5">
                  {MENU_ITEMS.map((item) => {
                    const active =
                      location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                    const Icon = item.icon;
                    const showBadge = item.badgeKey === "checklist" && pending > 0;

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={handleCollapse}
                        aria-current={active ? "page" : undefined}
                        className="relative flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-colors focus-visible:outline-none"
                      >
                        <span
                          className={
                            "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors " +
                            (active
                              ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                              : "bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]")
                          }
                        >
                          <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                          {showBadge && (
                            <span
                              data-numeric
                              aria-label={`${pending} tarefas pendentes`}
                              className="absolute -right-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[var(--color-card)]"
                            >
                              {pending > 9 ? "9+" : pending}
                            </span>
                          )}
                        </span>
                        <span
                          className={
                            "text-[11px] font-medium leading-tight " +
                            (active
                              ? "text-[var(--color-foreground)]"
                              : "text-[var(--color-muted-foreground)]")
                          }
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.nav>
        ) : (
          <motion.button
            key="show-nav"
            type="button"
            onClick={handleLift}
            aria-label="Expandir menu de navegação"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 bottom-nav-safe"
          >
            <span className="mb-2 flex h-8 w-12 items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-foreground)] shadow-[var(--shadow-elev-3)] backdrop-blur">
              <ChevronUp className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
